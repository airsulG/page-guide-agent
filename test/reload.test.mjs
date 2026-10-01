import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {ROOT} from '../src/state.mjs';
const source=await readFile(ROOT+'src/extension/dev-reload.js','utf8');
function worker(config,data={}){
  let extensionReloads=0,pageReloads=0;const messages=[];
  const chrome={storage:{local:{async get(key){return {[key]:data[key]};},async set(value){Object.assign(data,value);},async remove(key){delete data[key];}}},
    runtime:{reload(){extensionReloads++;}},tabs:{async get(id){return {id,url:config.test_url};},async reload(){pageReloads++;},
      async sendMessage(id,message){messages.push(message);return {result:message.command==='dev_snapshot'?{sessions:[{session_id:'one',annotations:[{id:'a',target:{css:'#a'}}]}]}:{document_id:'new',revision:config.revision}};}}};
  const context=vm.createContext({chrome,PGA_CONFIG:config,setTimeout:fn=>setTimeout(fn,0),Date});vm.runInContext(source,context);
  return {api:context.PGA_DEVELOPMENT,data,messages,counts:()=>({extensionReloads,pageReloads})};
}
test('new version reloads once, storage survives restart and only selected test page is restored',async()=>{
  const config={project:'p',revision:'old',test_url:'http://127.0.0.1:8767/fixture'};
  const old=worker(config);await old.api.capture({tab_id:1,url:config.test_url});
  await old.api.handleVersion({project:'p',revision:'new',development:true});
  await old.api.handleVersion({project:'p',revision:'new',development:true});
  assert.deepEqual(old.counts(),{extensionReloads:1,pageReloads:0});
  const next=worker({...config,revision:'new'},old.data);
  await new Promise(r=>setTimeout(r,20));await next.api.restore();
  assert.deepEqual(next.counts(),{extensionReloads:0,pageReloads:1});
  assert.ok(next.messages.some(m=>m.command==='page_guide_annotate'));
  assert.equal(next.data.pga_dev_pending_reload,undefined);
});
test('same version, wrong project and production messages never reload',async()=>{
  const workerState=worker({project:'p',revision:'old',test_url:'http://test'});
  for(const msg of [{project:'p',revision:'old',development:true},{project:'other',revision:'new',development:true},{project:'p',revision:'new',development:false}])await workerState.api.handleVersion(msg);
  assert.equal(workerState.counts().extensionReloads,0);
});
