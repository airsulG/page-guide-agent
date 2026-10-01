(() => {
  const config=globalThis.PGA_CONFIG;
  const TEST='pga_dev_test_page',PENDING='pga_dev_pending_reload';
  let reloading=false,restoring=false;
  async function capture(page){
    if(page.url!==config.test_url)return;
    const stored=await chrome.storage.local.get(TEST);
    if(stored[TEST]&&stored[TEST].tab_id!==page.tab_id){
      try{const previous=await chrome.tabs.get(stored[TEST].tab_id);if(previous.url===config.test_url)return;}catch{}
    }
    const snapshot=await chrome.tabs.sendMessage(page.tab_id,{type:'PGA_COMMAND',command:'dev_snapshot'});
    await chrome.storage.local.set({[TEST]:{tab_id:page.tab_id,url:page.url,project:config.project,sessions:snapshot.result.sessions}});
  }
  async function handleVersion(msg){
    if(!msg.development||msg.project!==config.project||!msg.revision||msg.revision===config.revision||reloading)return;
    reloading=true;
    const stored=await chrome.storage.local.get(TEST);
    await chrome.storage.local.set({[PENDING]:{project:config.project,revision:msg.revision,page:stored[TEST]||null,created:Date.now()}});
    chrome.runtime.reload();
  }
  async function restore(){
    if(restoring)return;restoring=true;
    try{
      const stored=await chrome.storage.local.get(PENDING),pending=stored[PENDING];
      if(!pending)return;
      if(pending.project!==config.project||pending.revision!==config.revision||Date.now()-pending.created>120000){await chrome.storage.local.remove(PENDING);return;}
      // Consume before reload so duplicate startup events cannot refresh twice.
      await chrome.storage.local.remove(PENDING);
      if(!pending.page)return;
      try{
        const tab=await chrome.tabs.get(pending.page.tab_id);
        if(tab.url!==pending.page.url||tab.url!==config.test_url)return;
        await chrome.tabs.reload(tab.id);
        // Only the disposable development page regains its annotations after navigation.
        for(let attempt=0;attempt<40;attempt++){
          await new Promise(r=>setTimeout(r,250));
          try{
            const current=await chrome.tabs.get(tab.id);if(current.url!==config.test_url)return;
            const response=await chrome.tabs.sendMessage(tab.id,{type:'PGA_COMMAND',command:'status'});
            if(response.result?.revision!==config.revision)continue;
            for(const group of pending.page.sessions||[])await chrome.tabs.sendMessage(tab.id,{type:'PGA_COMMAND',command:'page_guide_annotate',args:{...group,replace:true,page:{document_id:response.result.document_id,url:config.test_url}}});
            break;
          }catch{}
        }
      }catch{/* Closed or navigated test page must not be replaced. */}
    }finally{restoring=false;}
  }
  globalThis.PGA_DEVELOPMENT={capture,handleVersion,restore};
  void restore();
})();
