import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {ROOT} from '../src/state.mjs';
const client=new Client({name:'page-guide-check',version:'0.2.0'});
const transport=new StdioClientTransport({command:process.execPath,args:[ROOT+'src/mcp.mjs'],cwd:ROOT,stderr:'inherit'});
try {
  await client.connect(transport);
  const name=process.argv[2];
  const result=!name||name==='list'?await client.listTools():await client.callTool({name,arguments:JSON.parse(process.argv[3]||'{}')});
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(result.isError)process.exitCode=1;
}finally{await client.close();}
