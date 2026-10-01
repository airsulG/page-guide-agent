import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import {parseCall} from '../src/contract.mjs';
import {ROOT} from '../src/state.mjs';
const source=await readFile(ROOT+'src/extension/content.js','utf8');
function renderer(){
  const dom=new JSDOM('<label for="a">参数</label><input id="a"><button class="duplicate">相同</button><button class="duplicate">相同</button>',{url:'https://example.com',runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window;w.chrome={runtime:{onMessage:{addListener(){}}}};
  w.ResizeObserver=class{observe(){}unobserve(){}disconnect(){}};
  w.Element.prototype.getBoundingClientRect=function(){return {x:100,y:100,width:150,height:40};};
  w.eval(source);return {dom,run:w.PGA_RENDERER.execute};
}
function annotation(id='a',target={css:'#a'},text='说明'){return {id,target,text};}
test('connectors keep badges beside targets and join names with a line without an arrowhead',()=>{
  const {dom,run}=renderer();try{
    const spec={id:'c',target:{css:'#a'},type:'connector',number:1,text:'参数',placement:'right',color:'#0f766e',offset:{x:30,y:20}};
    const args=parseCall('page_guide_annotate',{page_id:'p',session_id:'one',annotations:[spec]});
    const result=run('page_guide_annotate',args).annotations[0];
    const shadow=dom.window.document.querySelector('[data-page-guide-root]').shadowRoot;
    assert.equal(result.marker_box.x,result.target_box.x+result.target_box.width+6);
    assert.equal(result.marker_box.y,result.target_box.y+(result.target_box.height-32)/2);
    assert.equal(shadow.querySelector('.target-badge').textContent,'1');
    assert.equal(shadow.querySelector('path,.corner,.ring,.wash'),null);
    assert.equal(shadow.querySelector('line').getAttribute('stroke'),'#0f766e');
    const before=result.marker_box;
    const updated=run('page_guide_update',parseCall('page_guide_update',{page_id:'p',session_id:'one',annotations:[{...spec,offset:{x:50,y:-30},color:'#facc15'}]})).annotations[0];
    assert.deepEqual(updated.marker_box,before);
    assert.notDeepEqual(updated.connector,result.connector);
    assert.equal(shadow.querySelector('.target-badge').style.getPropertyValue('--color'),'#facc15');
    dom.window.document.querySelector('#a').getBoundingClientRect=()=>({x:300,y:200,width:160,height:40});
    const moved=run('page_guide_status',{session_id:'one'}).annotations[0];
    assert.equal(moved.marker_box.x,466);
    run('page_guide_clear',{session_id:'one'});assert.equal(dom.window.document.querySelector('[data-page-guide-root]'),null);
  }finally{dom.window.close();}
});
test('numbered arrows attach badges to labels, color each item, update and preserve input',()=>{
  const {dom,run}=renderer();try{
    const w=dom.window,input=w.document.querySelector('#a');
    const spec={id:'arrow',target:{css:'#a'},type:'arrow',number:3,text:'参数名称',color:'#facc15',placement:'bottom'};
    const args=parseCall('page_guide_annotate',{page_id:'p',session_id:'one',annotations:[spec]});
    const result=run('page_guide_annotate',args).annotations[0];
    const root=w.document.querySelector('[data-page-guide-root]'),shadow=root.shadowRoot;
    assert.equal(shadow.querySelector('.corner').textContent,'3');
    assert.equal(shadow.querySelector('.callout').textContent,'参数名称');
    assert.equal(shadow.querySelector('.ring,.wash,.name'),null);
    assert.equal(result.marker_box.x,result.callout_box.x+result.callout_box.width-16);
    assert.equal(result.marker_box.y,result.callout_box.y-16);
    assert.equal(result.arrow.start.y,result.callout_box.y);
    assert.equal(result.arrow.end.y,result.target_box.y+result.target_box.height);
    assert.equal(shadow.querySelector('line').getAttribute('stroke'),'#facc15');
    assert.equal(shadow.querySelector('.callout').style.getPropertyValue('--foreground'),'#000000');
    assert.equal(root.style.pointerEvents,'none');
    input.focus();input.value='输入保持';
    const update=parseCall('page_guide_update',{page_id:'p',session_id:'one',annotations:[{...spec,color:'#4c1d95'}]});
    run('page_guide_update',update);
    assert.equal(shadow.querySelector('line').getAttribute('stroke'),'#4c1d95');
    assert.equal(shadow.querySelector('.corner').style.getPropertyValue('--color'),'#4c1d95');
    assert.equal(shadow.querySelector('.callout').style.getPropertyValue('--foreground'),'#ffffff');
    run('page_guide_update',parseCall('page_guide_update',{page_id:'p',session_id:'one',annotations:[{...spec,color:undefined}]}));
    assert.equal(shadow.querySelector('.callout').style.getPropertyValue('--color'),'#8b5cf6');
    assert.equal(shadow.querySelector('.callout').style.getPropertyValue('--foreground'),'#000000');
    assert.equal(w.document.activeElement,input);assert.equal(input.value,'输入保持');
    input.getBoundingClientRect=()=>({x:300,y:200,width:160,height:40});
    assert.equal(run('page_guide_status',{session_id:'one'}).annotations[0].target_box.x,300);
    input.remove();assert.equal(run('page_guide_status',{session_id:'one'}).annotations[0].ok,false);
    assert.equal(shadow.querySelector('.corner,svg,.callout'),null);
    run('page_guide_clear',{session_id:'one'});assert.equal(w.document.querySelector('[data-page-guide-root]'),null);
  }finally{dom.window.close();}
});
test('all targets validated before modification, owners isolated and content rendered literally',()=>{
  const {dom,run}=renderer();try{
    const create=(session,annotations)=>run('page_guide_annotate',parseCall('page_guide_annotate',{page_id:'p',session_id:session,annotations}));
    create('one',[annotation('old',undefined,'<img src=x onerror=alert(1)>')]);
    assert.throws(()=>create('one',[annotation('new'),annotation('bad',{css:'.duplicate'})]),/AMBIGUOUS/);
    assert.equal(run('page_guide_status',{session_id:'one'}).annotations[0].id,'old');
    create('two',[annotation('other',{label:'参数'})]);
    run('page_guide_clear',{session_id:'two'});assert.equal(run('page_guide_status',{session_id:'one'}).annotations.length,1);
    const root=dom.window.document.querySelector('[data-page-guide-root]').shadowRoot;
    assert.equal(root.querySelector('.callout').textContent,'<img src=x onerror=alert(1)>');assert.equal(root.querySelector('img'),null);
    run('page_guide_clear',{session_id:'one'});assert.equal(dom.window.document.querySelector('[data-page-guide-root]'),null);
  }finally{dom.window.close();}
});
test('stale documents rejected and removed target is withdrawn with error status',()=>{
  const {dom,run}=renderer();try{
    assert.throws(()=>run('page_guide_inspect',{page:{document_id:'old',url:'https://example.com'},target:{css:'#a'}}),/STALE_PAGE/);
    run('page_guide_annotate',parseCall('page_guide_annotate',{page_id:'p',session_id:'one',annotations:[annotation()]}));
    dom.window.document.querySelector('#a').remove();
    assert.equal(run('page_guide_status',{session_id:'one'}).annotations[0].ok,false);
    assert.equal(dom.window.document.querySelector('[data-page-guide-root]').shadowRoot.querySelector('.ring'),null);
  }finally{dom.window.close();}
});
test('iframe target is rejected when transformed by an ancestor or clipped by its viewport',()=>{
  const {dom,run}=renderer();try{
    const container=dom.window.document.createElement('div'),frame=dom.window.document.createElement('iframe');
    container.append(frame);dom.window.document.body.append(container);
    frame.id='frame';frame.contentDocument.body.innerHTML='<input id="inside">';
    for(const key of ['clientWidth','clientHeight'])Object.defineProperty(frame,key,{value:300});
    const input=frame.contentDocument.querySelector('#inside');
    input.getBoundingClientRect=()=>({x:20,y:20,width:150,height:40});
    const inspect=()=>run('page_guide_inspect',{target:{frame_path:['#frame'],css:'#inside'}});
    assert.equal(inspect().ok,true);
    container.style.transform='scale(2)';assert.throws(inspect,/UNSUPPORTED_SCOPE/);
    container.style.transform='none';input.getBoundingClientRect=()=>({x:280,y:20,width:150,height:40});
    assert.throws(inspect,/TARGET_NOT_VISIBLE/);
  }finally{dom.window.close();}
});
test('marker names stay visible without interaction listeners and preserve website hover and input',()=>{
  const {dom,run}=renderer();try{
    const w=dom.window,input=w.document.querySelector('#a');
    let websiteHovers=0;input.addEventListener('pointerenter',()=>websiteHovers++);
    const addedEvents=[],add=input.addEventListener.bind(input);
    input.addEventListener=(event,...rest)=>{addedEvents.push(event);return add(event,...rest);};
    const args=parseCall('page_guide_annotate',{page_id:'p',session_id:'one',annotations:[{id:'m',target:{css:'#a'},type:'marker',number:4,text:'参数名称'}]});
    run('page_guide_annotate',args);
    const root=w.document.querySelector('[data-page-guide-root]'),shadow=root.shadowRoot;
    assert.equal(shadow.querySelector('.badge').textContent,'4');
    assert.equal(shadow.querySelector('.name').textContent,'参数名称');
    assert.equal(run('page_guide_status',{session_id:'one'}).annotations[0].name_visible,true);
    assert.deepEqual(addedEvents,[]);
    assert.equal(shadow.querySelector('svg,.ring'),null);
    assert.equal(root.style.pointerEvents,'none');
    input.dispatchEvent(new w.Event('pointerenter'));
    assert.equal(websiteHovers,1);
    input.getBoundingClientRect=()=>({x:300,y:200,width:160,height:40});
    const state=run('page_guide_status',{session_id:'one'}).annotations[0];
    assert.equal(state.target_box.x,300);assert.equal(state.name_visible,true);
    assert.equal(shadow.querySelector('.name').textContent,'参数名称');
    input.dispatchEvent(new w.Event('pointerleave'));
    assert.equal(run('page_guide_status',{session_id:'one'}).annotations[0].name_visible,true);
    input.focus();input.value='仍然可以输入';input.dispatchEvent(new w.Event('input',{bubbles:true}));
    assert.equal(w.document.activeElement,input);assert.equal(input.value,'仍然可以输入');
    input.blur();assert.equal(run('page_guide_status',{session_id:'one'}).annotations[0].name_visible,true);
    run('page_guide_clear',{session_id:'one'});
    input.dispatchEvent(new w.Event('pointerenter'));assert.equal(w.document.querySelector('[data-page-guide-root]'),null);
  }finally{dom.window.close();}
});
test('marker update follows the new target and removal withdraws badge and name',()=>{
  const {dom,run}=renderer();try{
    const w=dom.window,old=w.document.querySelector('#a');
    const make=target=>parseCall('page_guide_annotate',{page_id:'p',session_id:'one',annotations:[{id:'m',target,type:'marker',number:2,text:'名称'}]});
    run('page_guide_annotate',make({css:'#a'}));
    const button=w.document.querySelector('.duplicate');button.id='next';
    run('page_guide_update',make({css:'#next'}));
    const shadow=w.document.querySelector('[data-page-guide-root]').shadowRoot;
    old.dispatchEvent(new w.Event('pointerenter'));
    button.dispatchEvent(new w.Event('pointerenter'));
    assert.equal(run('page_guide_status',{session_id:'one'}).annotations[0].name_visible,true);
    button.remove();assert.equal(run('page_guide_status',{session_id:'one'}).annotations[0].ok,false);
    assert.equal(shadow.querySelector('.badge,.name,.wash'),null);
  }finally{dom.window.close();}
});
