import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCall,pageId,decodePage,tools} from '../src/contract.mjs';
const input={page_id:'p',session_id:'conversation-a',annotations:[{id:'a',target:{css:'#keyword'},text:'解释'}]};
test('tools expose six schemas; annotation defaults are explicit',()=>{
  assert.equal(tools.length,6);const result=parseCall('page_guide_annotate',input);
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
  for(const change of [{number:undefined},{number:0},{number:100},{number:1.5},{text:''},{text:'定义\n更多'},{text:'字'.repeat(81)},{type:'arrow'}]){
    assert.throws(()=>parseCall('page_guide_annotate',{...input,annotations:[{...marker,...change}]}));
  }
});
