import http from 'node:http';
import {randomUUID,timingSafeEqual} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {WebSocketServer,WebSocket} from 'ws';
import {decodePage,pageId,parseCall} from './contract.mjs';
import {ROOT} from './state.mjs';
export async function createBridge({port=8767,token,project='page-guide-agent',revision='',development=false,timeout=12000}){
  const peers=new Map(),pending=new Map(); let currentRevision=revision;
  const secretOK=s=>typeof s==='string'&&Buffer.byteLength(s)===Buffer.byteLength(token)&&timingSafeEqual(Buffer.from(s),Buffer.from(token));
  const sendJSON=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
  function request(peer,command,args){
    if(peer.socket.readyState!==WebSocket.OPEN) return Promise.reject(new Error('EXTENSION_DISCONNECTED'));
    const request_id=randomUUID();
    return new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{pending.delete(request_id);reject(new Error('EXTENSION_TIMEOUT'));},timeout);
      pending.set(request_id,{peer,resolve,reject,timer});
      peer.socket.send(JSON.stringify({type:'request',request_id,command,args}));
    });
  }
  async function call(name,input){
    const args=parseCall(name,input);
    if(name==='page_guide_pages'){
      const result=await Promise.all([...peers.values()].map(async peer=>{
        try {
          const data=await request(peer,'pages',{});
          return {instance_id:peer.id,revision:peer.revision,development:peer.development,pages:data.pages.map(p=>({
            ...p,page_id:p.document_id?pageId({instance_id:peer.id,tab_id:p.tab_id,document_id:p.document_id,url:p.url}):null
          }))};
        }catch(e){return {instance_id:peer.id,error:e.message,pages:[]};}
      }));
      return {ok:true,instances:result,connected:peers.size,...(!peers.size?{message:'扩展尚未连接，请在内置浏览器确认已加载 0.2.0，并首次重载一次'}:{})};
    }
    const page=decodePage(args.page_id),peer=peers.get(page.instance_id);
    if(!peer) throw new Error('EXTENSION_NOT_CONNECTED: 请启动开发服务并在内置浏览器重载扩展一次');
    return request(peer,name,{...args,page});
  }
  const server=http.createServer(async(req,res)=>{
    const expected='127.0.0.1:'+server.address().port;
    if(req.headers.host!==expected) return sendJSON(res,403,{error:'INVALID_HOST'});
    if(req.url==='/health'&&req.method==='GET') return sendJSON(res,200,{project,development,revision:currentRevision,connected:peers.size});
    if(req.url?.split('?')[0]==='/fixture'&&req.method==='GET'){
      res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
      return res.end(await readFile(ROOT+'test/fixture.html'));
    }
    if(req.headers.origin||!secretOK(req.headers.authorization?.replace(/^Bearer /,''))) return sendJSON(res,403,{error:'UNAUTHORIZED'});
    if(req.url==='/rpc'&&req.method==='POST'){
      try {
        let body='';for await(const chunk of req){body+=chunk;if(body.length>128000) throw new Error('REQUEST_TOO_LARGE');}
        const {name,args}=JSON.parse(body);return sendJSON(res,200,await call(name,args));
      } catch(e){return sendJSON(res,400,{ok:false,error:e.message});}
    }
    return sendJSON(res,404,{error:'NOT_FOUND'});
  });
  const ws=new WebSocketServer({noServer:true,maxPayload:128000});
  server.on('upgrade',(req,socket,head)=>{
    let url;try{url=new URL(req.url,'http://127.0.0.1');}catch{socket.destroy();return;}
    if(req.headers.host!=='127.0.0.1:'+server.address().port||url.pathname!=='/bridge'||!secretOK(url.searchParams.get('token'))||
       !/^chrome-extension:\/\/[a-z0-9_-]+$/.test(req.headers.origin||'')){socket.destroy();return;}
    ws.handleUpgrade(req,socket,head,client=>ws.emit('connection',client,req));
  });
  ws.on('connection',socket=>{
    let peer;const helloTimeout=setTimeout(()=>socket.close(),5000);
    socket.on('message',raw=>{
      let msg;try{msg=JSON.parse(raw);}catch{socket.close();return;}
      if(msg.type==='hello'){
        if(peer||msg.project!==project||typeof msg.instance_id!=='string'||msg.instance_id.length>200){socket.close();return;}
        clearTimeout(helloTimeout);
        peer={id:msg.instance_id,socket,revision:msg.revision,development:!!msg.development};
        peers.get(peer.id)?.socket.close();peers.set(peer.id,peer);
        socket.send(JSON.stringify({type:'ready',project,revision:currentRevision,development}));
      }else if(msg.type==='result'&&peer){
        const item=pending.get(msg.request_id);if(!item||item.peer!==peer)return;
        clearTimeout(item.timer);pending.delete(msg.request_id);
        msg.error?item.reject(new Error(msg.error)):item.resolve(msg.result);
      }else if(msg.type==='ping')socket.send(JSON.stringify({type:'pong'}));
    });
    socket.on('close',()=>{
      clearTimeout(helloTimeout);if(peer&&peers.get(peer.id)===peer)peers.delete(peer.id);
      for(const [id,item] of pending){if(item.peer===peer){clearTimeout(item.timer);pending.delete(id);item.reject(new Error('EXTENSION_DISCONNECTED'));}}
    });
    socket.on('error',()=>socket.close());
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});
  return {
    port:server.address().port,call,
    publish(next){if(next===currentRevision)return;currentRevision=next;if(development)for(const peer of peers.values())if(peer.socket.readyState===WebSocket.OPEN)peer.socket.send(JSON.stringify({type:'build-ready',project,revision:next,development:true}));},
    async close(){for(const p of peers.values())p.socket.close();for(const item of pending.values()){clearTimeout(item.timer);item.reject(new Error('BRIDGE_STOPPED'));}pending.clear();ws.close();await new Promise(r=>server.close(r));}
  };
}
