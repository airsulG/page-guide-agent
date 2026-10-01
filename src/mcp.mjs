import {Server} from '@modelcontextprotocol/sdk/server/index.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {ListToolsRequestSchema,CallToolRequestSchema} from '@modelcontextprotocol/sdk/types.js';
import {tools,parseCall} from './contract.mjs';
import {state} from './state.mjs';
const connection=await state();
const server=new Server({name:'page-guide-agent',version:'0.2.0'},{capabilities:{tools:{}}});
server.setRequestHandler(ListToolsRequestSchema,async()=>({tools}));
server.setRequestHandler(CallToolRequestSchema,async request=>{
  try {
    const args=parseCall(request.params.name,request.params.arguments??{});
    const response=await fetch('http://127.0.0.1:'+connection.port+'/rpc',{
      method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+connection.token},
      body:JSON.stringify({name:request.params.name,args}),signal:AbortSignal.timeout(15000)
    });
    const result=await response.json();if(!response.ok)throw new Error(result.error);
    return {content:[{type:'text',text:JSON.stringify(result)}],structuredContent:result,isError:result.ok===false};
  }catch(e){
    const message=e.name==='TimeoutError'?'BRIDGE_TIMEOUT: 本机服务超时，请检查开发服务与扩展连接':
      e instanceof TypeError&&e.message==='fetch failed'?'BRIDGE_UNAVAILABLE: 本机服务未连接，请运行 npm run guide:dev':e.message;
    return {isError:true,content:[{type:'text',text:message}]};
  }
});
await server.connect(new StdioServerTransport());
