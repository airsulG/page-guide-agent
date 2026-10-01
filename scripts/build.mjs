import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {ROOT,state} from '../src/state.mjs';

export async function build({development=true,output,connection,sourceRoot=ROOT+'src/extension/'}={}){
  connection ||= await state();
  output ||= ROOT+(development?'prototype/extension/':'build/extension/');
  const names=['background.js','content.js',...(development?['dev-reload.js']:[])];
  const sources=Object.fromEntries(await Promise.all(names.map(async name=>[name,await readFile(sourceRoot+name,'utf8')])));
  if(!development)sources['content.js']=sources['content.js'].replace(/\/\* DEVELOPMENT_ONLY_START \*\/[\s\S]*?\/\* DEVELOPMENT_ONLY_END \*\//g,'');
  // Validate all sources before writing the first output file.
  for(const [name,code]of Object.entries(sources))new vm.Script(code,{filename:name});
  const revision=createHash('sha256').update(JSON.stringify({sources,development,port:connection.port,project:connection.project})).digest('hex').slice(0,16);
  const icons=Object.fromEntries([16,32,48,128].map(size=>[size,'icons/page-guide-agent-'+size+'.png']));
  const manifest={manifest_version:3,name:development?'Page Guide Agent (开发版)':'Page Guide Agent',version:'0.2.0',minimum_chrome_version:'116',
    description:'由 Codex 对话调用 MCP，在网页上定位元素并显示标注。',icons,
    permissions:['storage','tabs','alarms'],host_permissions:['http://127.0.0.1:'+connection.port+'/*'],
    action:{default_title:'在 Codex 对话中使用 Page Guide Agent',default_icon:icons},background:{service_worker:'background.js'},
    content_scripts:[{matches:['http://*/*','https://*/*'],js:['content.js'],run_at:'document_idle'}]};
  const config={endpoint:'ws://127.0.0.1:'+connection.port+'/bridge',token:connection.token,project:connection.project,revision,development,
    ...(development?{test_url:'http://127.0.0.1:'+connection.port+'/fixture'}:{})};
  await mkdir(output+'icons/',{recursive:true});
  for(const file of Object.values(icons))if(output!==ROOT+'prototype/extension/')await copyFile(ROOT+'prototype/extension/'+file,output+file);
  const files={...sources,'manifest.json':JSON.stringify(manifest,null,2)+'\n',
    'content.js':'globalThis.PGA_VERSION='+JSON.stringify({revision})+';\n'+sources['content.js'],
    'background.js':sources['background.js']+(development?"\nimportScripts('dev-reload.js');\n":'')};
  for(const [name,code]of Object.entries(files))await writeFile(output+name,code);
  await writeFile(output+'config.js','globalThis.PGA_CONFIG='+JSON.stringify(config)+';\n',{mode:0o600});
  return {revision,output,development};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const result=await build({development:!process.argv.includes('--production')});
  process.stdout.write(JSON.stringify(result)+'\n');
}
