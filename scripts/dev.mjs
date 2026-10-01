import {watch} from 'node:fs';
import {ROOT,state} from '../src/state.mjs';
import {createBridge} from '../src/bridge.mjs';
import {build} from './build.mjs';
const connection=await state();
const development=!process.argv.includes('--production');
const first=await build({connection,development});
const bridge=await createBridge({...connection,revision:first.revision,development});
console.log('Page Guide '+(development?'开发':'正式')+'服务已启动：http://127.0.0.1:'+bridge.port+'；版本 '+first.revision);
let timer,queue=Promise.resolve();
const watcher=development?watch(ROOT+'src/extension/',()=>{
  clearTimeout(timer);timer=setTimeout(()=>{
    queue=queue.then(async()=>{
      try{const result=await build({connection});bridge.publish(result.revision);console.log('编译成功：'+result.revision);}
      catch(e){console.error('编译失败，保留上一版，不重载扩展：'+e.message);}
    });
  },180);
}):null;
let stopping=false;
async function stop(){if(stopping)return;stopping=true;watcher?.close();clearTimeout(timer);await queue;await bridge.close();process.exit(0);}
process.on('SIGINT',stop);process.on('SIGTERM',stop);
