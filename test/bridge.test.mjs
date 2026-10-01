import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {WebSocket} from 'ws';
import {createBridge} from '../src/bridge.mjs';
const token='a'.repeat(64);
async function peer(bridge){
  const ws=new WebSocket('ws://127.0.0.1:'+bridge.port+'/bridge?token='+token,{origin:'chrome-extension://test-extension'});
  await once(ws,'open');
  ws.send(JSON.stringify({type:'hello',project:'page-guide-agent',instance_id:'test',revision:'one',development:true}));
  await once(ws,'message');return ws;
}
test('authenticated bridge correlates replies, rejects origin and validates arguments',async t=>{
  const bridge=await createBridge({port:0,token,development:true,revision:'one',timeout:100});t.after(()=>bridge.close());
  const ws=await peer(bridge);t.after(()=>ws.close());
  ws.on('message',raw=>{const msg=JSON.parse(raw);if(msg.type==='request')ws.send(JSON.stringify({type:'result',request_id:msg.request_id,result:{pages:[{tab_id:1,url:'https://example.com',document_id:'d'}]}}));});
  const result=await bridge.call('page_guide_pages',{});
  assert.equal(result.connected,1);assert.ok(result.instances[0].pages[0].page_id);
  await assert.rejects(bridge.call('page_guide_clear',{}));
  const unauthorized=await fetch('http://127.0.0.1:'+bridge.port+'/rpc',{method:'POST',headers:{Authorization:'Bearer '+token,Origin:'https://example.com'},body:'{}'});
  assert.equal(unauthorized.status,403);
  const unicode=await fetch('http://127.0.0.1:'+bridge.port+'/rpc',{method:'POST',headers:{Authorization:'Bearer '+'é'.repeat(64)},body:'{}'});
  assert.equal(unicode.status,403);
  const updates=[];ws.on('message',raw=>{const msg=JSON.parse(raw);if(msg.type==='build-ready')updates.push(msg.revision);});
  bridge.publish('two');bridge.publish('two');await new Promise(r=>setTimeout(r,20));assert.deepEqual(updates,['two']);
});
test('disconnect and timeout produce errors rather than silently replaying requests',async t=>{
  const bridge=await createBridge({port:0,token,timeout:30});t.after(()=>bridge.close());
  const ws=await peer(bridge);
  const timed=await bridge.call('page_guide_pages',{});assert.match(timed.instances[0].error,/TIMEOUT/);
  const pending=bridge.call('page_guide_pages',{});ws.close();const result=await pending;
  assert.match(result.instances[0].error,/DISCONNECTED/);
});
