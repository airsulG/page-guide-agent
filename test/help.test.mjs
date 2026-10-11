import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import {parseCall} from '../src/contract.mjs';
const source=await readFile(new URL('../src/extension/help.js',import.meta.url),'utf8');
const body='这里显示输入内容。输入前先核对目标，输入后检查页面显示的结果；这个说明不会替你提交内容。';
function setup(){const dom=new JSDOM('<input id="one"><button id="two">查看</button>',{url:'https://example.com',runScripts:'outside-only',pretendToBeVisual:true});const w=dom.window;w.Element.prototype.getBoundingClientRect=()=>({x:100,y:100,right:200,bottom:130,width:100,height:30});w.eval(source);const locate=t=>{const element=w.document.querySelector(t.css);if(!element)throw Error('missing');return {element};};return {dom,w,locate};}
test('help is hidden until hover, keeps input untouched, and cleans up its session',()=>{
 const {dom,w,locate}=setup();try{const components=[{id:'one',target:{css:'#one'},title:'输入',body}];const result=w.PGA_HELP.register({session_id:'a',components},locate);assert.equal(result.annotation_visible,false);const input=w.document.querySelector('input');assert.equal(input.attributes.length,1);input.value='保留';input.dispatchEvent(new w.Event('pointerover',{bubbles:true,composed:true}));assert.equal(w.PGA_HELP.status('a').active_component,'one');assert.equal(input.value,'保留');w.document.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal(w.PGA_HELP.status('a').annotation_visible,false);w.PGA_HELP.clear('a');assert.equal(w.document.querySelector('[data-page-guide-help]'),null);}finally{dom.window.close();}
});
test('tutorial navigates explicitly and keyboard can read knowledge without hovering',()=>{
 const {dom,w,locate}=setup();try{const components=[{id:'one',target:{css:'#one'},title:'输入',body},{id:'two',target:{css:'#two'},title:'查看',body}];const tutorial={title:'核对内容',goal:'读懂两个组件',steps:components.map(c=>({component_id:c.id,title:c.title,action:'检查页面对应组件。',expected:'能读到对应内容。'}))};w.PGA_HELP.register({session_id:'a',components,tutorial},locate);const root=w.document.querySelector('[data-page-guide-help]').shadowRoot;const buttons=[...root.querySelectorAll('button')];buttons.find(b=>b.textContent==='下一步').click();assert.equal(w.PGA_HELP.status('a').tutorial_step,2);buttons.find(b=>b.textContent==='找到组件并阅读说明').click();assert.ok(root.querySelector('[role="status"]').textContent.includes(body));assert.equal(w.PGA_HELP.status('a').annotation_visible,false);w.document.querySelector('#two').remove();buttons.find(b=>b.textContent==='找到组件并阅读说明').click();assert.match(root.querySelector('[role="status"]').textContent,/暂未显示/);}finally{dom.window.close();}
});
test('knowledge contract accepts large page registrations and rejects missing tutorial references',()=>{
const components=Array.from({length:30},(_,i)=>({id:String(i),target:{css:'#a'+i},title:'对象',body}));assert.equal(parseCall('page_guide_help',{page_id:'p',session_id:'s',components}).components.length,30);assert.throws(()=>parseCall('page_guide_help',{page_id:'p',session_id:'s',components,tutorial:{title:'教程',goal:'目标',steps:[{component_id:'missing',title:'步骤',action:'动作',expected:'结果'}]}}));
});
test('help rejects unsupported iframe and oversized batches before rendering',()=>{
const component={id:'a',target:{css:'#a',frame_path:['iframe']},title:'对象',body};assert.throws(()=>parseCall('page_guide_help',{page_id:'p',session_id:'s',components:[component]}),/iframe/);
const components=Array.from({length:400},(_,i)=>({id:String(i),target:{css:'#a'+i},title:'对象',body:'知'.repeat(1800)}));assert.throws(()=>parseCall('page_guide_help',{page_id:'p',session_id:'s',components}),/1.8 MB/);
});
test('another session cannot cover existing help and a removed target does not rebind',()=>{
const {dom,w,locate}=setup();try{const components=[{id:'one',target:{css:'#one'},title:'输入',body}];w.PGA_HELP.register({session_id:'a',components},locate);assert.throws(()=>w.PGA_HELP.register({session_id:'b',components},locate),/HELP_SESSION_CONFLICT/);const input=w.document.querySelector('#one');input.remove();const replacement=w.document.createElement('input');replacement.id='one';w.document.body.append(replacement);replacement.dispatchEvent(new w.Event('pointerover',{bubbles:true,composed:true}));assert.equal(w.PGA_HELP.status('a').annotation_visible,false);assert.equal(w.PGA_HELP.status('a').components[0].available,false);}finally{dom.window.close();}
});
