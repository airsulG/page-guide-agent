importScripts('config.js');
(() => {
  const config=globalThis.PGA_CONFIG;
  let socket,connecting=false,retryTimer,pingTimer,instanceId;
  let delay=1000;
  const ALARM='pga-bridge-reconnect';
  function send(data){if(socket?.readyState===WebSocket.OPEN)socket.send(JSON.stringify(data));}
  async function pages(){
    const tabs=await chrome.tabs.query({});
    return Promise.all(tabs.filter(t=>/^https?:\/\//.test(t.url||'')).map(async t=>{
      try{
        const response=await chrome.tabs.sendMessage(t.id,{type:'PGA_COMMAND',command:'status'});
        if(response.error)throw new Error(response.error);
        return {tab_id:t.id,url:t.url,title:t.title,document_id:response.result.document_id,revision:response.result.revision};
      }catch{return {tab_id:t.id,url:t.url,title:t.title,document_id:null,available:false};}
    }));
  }
  async function handle(request,client){
    try{
      if(request.command==='pages'){const result={pages:await pages()};client.send(JSON.stringify({type:'result',request_id:request.request_id,result}));return;}
      const page=request.args.page;
      if(page.instance_id!==instanceId)throw new Error('WRONG_BROWSER_INSTANCE');
      const tab=await chrome.tabs.get(page.tab_id);
      if(tab.url!==page.url)throw new Error('STALE_PAGE: URL 已改变');
      const response=await chrome.tabs.sendMessage(page.tab_id,{type:'PGA_COMMAND',command:request.command,args:request.args});
      if(response.error)throw new Error(response.error);
      if(['page_guide_annotate','page_guide_update','page_guide_clear'].includes(request.command))await globalThis.PGA_DEVELOPMENT?.capture(page).catch(()=>{});
      if(client.readyState===WebSocket.OPEN)client.send(JSON.stringify({type:'result',request_id:request.request_id,result:response.result}));
    }catch(e){if(client.readyState===WebSocket.OPEN)client.send(JSON.stringify({type:'result',request_id:request.request_id,error:e.message}));}
  }
  async function connect(){
    if(connecting||socket?.readyState===WebSocket.OPEN||socket?.readyState===WebSocket.CONNECTING)return;
    connecting=true;
    try{
      if(!instanceId){const value=await chrome.storage.local.get('pga_instance_id');instanceId=value.pga_instance_id||crypto.randomUUID();if(!value.pga_instance_id)await chrome.storage.local.set({pga_instance_id:instanceId});}
      const client=new WebSocket(config.endpoint+'?token='+encodeURIComponent(config.token));socket=client;
      client.onopen=()=>{delay=1000;connecting=false;send({type:'hello',project:config.project,instance_id:instanceId,revision:config.revision,development:config.development});clearInterval(pingTimer);pingTimer=setInterval(()=>send({type:'ping'}),20000);};
      client.onmessage=event=>{
        let msg;try{msg=JSON.parse(event.data);}catch{return;}
        if(msg.type==='request')void handle(msg,client);
        else if(msg.type==='ready'||msg.type==='build-ready')void globalThis.PGA_DEVELOPMENT?.handleVersion(msg);
      };
      client.onclose=()=>{connecting=false;clearInterval(pingTimer);clearTimeout(retryTimer);retryTimer=setTimeout(connect,delay);delay=Math.min(delay*2,30000);};
      client.onerror=()=>client.close();
    }catch{connecting=false;retryTimer=setTimeout(connect,delay);}
  }
  chrome.alarms.onAlarm.addListener(alarm=>{if(alarm.name===ALARM)void connect();});
  chrome.runtime.onInstalled.addListener(()=>{void ensureAlarm();void globalThis.PGA_DEVELOPMENT?.restore();void connect();});
  chrome.runtime.onStartup.addListener(()=>{void ensureAlarm();void connect();});
  async function ensureAlarm(){if(!await chrome.alarms.get(ALARM))await chrome.alarms.create(ALARM,{periodInMinutes:1});}
  globalThis.PGA_BRIDGE={config,connect,send};
  void ensureAlarm();void connect();
})();
