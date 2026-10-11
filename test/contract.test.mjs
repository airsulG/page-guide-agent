import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCall,pageId,decodePage,tools} from '../src/contract.mjs';
const input={page_id:'p',session_id:'conversation-a',annotations:[{id:'a',target:{css:'#keyword'},text:'解释'}]};
test('tools expose annotation and page help schemas; annotation defaults are explicit',()=>{
  assert.equal(tools.length,9);const result=parseCall('page_guide_annotate',input);
  assert.deepEqual(result.annotations[0].offset,{x:0,y:0});assert.equal(result.replace,true);
});
test('invalid, duplicate, oversized or executable parameters are rejected',()=>{
  for(const annotations of [[],[input.annotations[0],input.annotations[0]],[{id:'a',target:{css:'#a',text:'a'}}],[{id:'a',target:{css:'#a'},offset:{x:1001}}],[{id:'a',target:{css:'#a'},script:'alert(1)'}]]){
    assert.throws(()=>parseCall('page_guide_annotate',{...input,annotations}));
  }
  assert.throws(()=>parseCall('page_guide_clear',{page_id:'p'}));
  assert.throws(()=>parseCall('page_guide_pages',{tab_id:1}));
});
test('page handles retain instance, tab, document and URL',()=>{
  const page={instance_id:'browser-a',tab_id:3,document_id:'doc-a',url:'https://example.com/a'};
  assert.deepEqual(decodePage(pageId(page)),page);
  assert.throws(()=>decodePage('bad'),/INVALID_PAGE_HANDLE/);
  assert.throws(()=>decodePage(pageId({...page,url:'chrome://extensions'})));
});
test('markers require an explicit number and a short single-line object name',()=>{
  const marker={id:'m',target:{css:'#a'},type:'marker',number:4,text:'被引用页面'};
  assert.equal(parseCall('page_guide_annotate',{...input,annotations:[marker]}).annotations[0].number,4);
  for(const change of [{number:undefined},{number:0},{number:100},{number:1.5},{text:''},{text:'定义\n更多'},{text:'字'.repeat(81)},{type:'combined'}]){
    assert.throws(()=>parseCall('page_guide_annotate',{...input,annotations:[{...marker,...change}]}));
  }
});
test('numbered arrows accept per-item hex colors and reject invalid names or colors',()=>{
  const arrow={id:'a',target:{css:'#a'},type:'arrow',number:1,text:'输入',color:'#facc15'};
  const result=parseCall('page_guide_annotate',{...input,annotations:[arrow,{...arrow,id:'b',number:2,color:'#7c3aed'}]});
  assert.deepEqual(result.annotations.map(a=>a.color),['#facc15','#7c3aed']);
  for(const change of [{text:''},{text:'解释\n更多'},{color:'red'},{color:'#123'},{color:'#gg0000'}])assert.throws(()=>parseCall('page_guide_annotate',{...input,annotations:[{...arrow,...change}]}));
  assert.equal(parseCall('page_guide_annotate',{...input,annotations:[{...arrow,number:undefined,text:''}]}).annotations[0].type,'arrow');
});
test('connector annotations require a number and an object name',()=>{
  const connector={id:'c',target:{css:'#a'},type:'connector',number:1,text:'输入',color:'#0f766e'};
  assert.equal(parseCall('page_guide_annotate',{...input,annotations:[connector]}).annotations[0].type,'connector');
  for(const change of [{number:undefined},{text:''},{text:'解释\n更多'}])assert.throws(()=>parseCall('page_guide_annotate',{...input,annotations:[{...connector,...change}]}));
});
