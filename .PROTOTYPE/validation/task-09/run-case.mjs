import {execFileSync} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {compose} from './pump-help-content.mjs';
const call=(name,args)=>{const reply=JSON.parse(execFileSync(process.execPath,['scripts/call.mjs',name,JSON.stringify(args)],{encoding:'utf8',maxBuffer:4000000}));if(reply.isError)throw Error(reply.content[0].text);return reply.structuredContent;};
const url='https://pump.fun/coin/6hTLdzZaaCjmqtn7RtaEMQsCbXT5Pg8q76tRViEGpump';
const pages=call('page_guide_pages',{});const page=pages.instances.flatMap(i=>i.pages).find(p=>p.url===url&&p.page_id);
if(!page)throw Error('内置浏览器指定测试页面尚未连接。');
if(process.argv.includes('--status')||process.argv.includes('--clear')){
 const result=call(process.argv.includes('--clear')?'page_guide_clear':'page_guide_status',{page_id:page.page_id,session_id:'pump-help-task-09'});
 if(process.argv.includes('--status')){
  await writeFile(new URL('status.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({ok:result.ok,count:result.help?.count,annotation_visible:result.help?.annotation_visible,tutorial_step:result.help?.tutorial_step,tutorial_visible:result.help?.tutorial_visible,unavailable:result.help?.components?.filter(c=>!c.available).length}));
 }else console.log(JSON.stringify(result));process.exit(0);
}
const inventory=call('page_guide_inventory',{page_id:page.page_id});
const payload=compose(inventory,page.page_id);
const result=call('page_guide_help',payload);
await writeFile(new URL('inventory.json',import.meta.url),JSON.stringify(inventory,null,2)+'\n');
await writeFile(new URL('help-payload.json',import.meta.url),JSON.stringify(payload,null,2)+'\n');
await writeFile(new URL('registration.json',import.meta.url),JSON.stringify({page, count:inventory.count,result},null,2)+'\n');
console.log(JSON.stringify({revision:page.revision,count:inventory.count,registered:result.count,hidden:!result.annotation_visible,tutorial_step:result.tutorial_step,unavailable:result.components.filter(c=>!c.available).length}));
