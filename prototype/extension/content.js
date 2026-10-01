globalThis.PGA_VERSION={"revision":"fce576ac325ef9d7"};
(() => {
  'use strict';
  if(globalThis.PGA_RENDERER) return;
  const documentId=crypto.randomUUID();
  const sessions=new Map();
  const DEFAULT_COLOR='#8b5cf6';
  let host,shadow,raf=0,observer,resize;
  const observed=new Set(),scopes=new Map();
  function watchScope(scope){
    if(!host||scopes.has(scope)||scope===document)return;
    const mutation=new MutationObserver(schedule);
    mutation.observe(scope,{subtree:true,childList:true,attributes:true,characterData:true});
    scope.addEventListener('scroll',schedule,true);scopes.set(scope,mutation);
  }
  const error=(code,detail)=>Object.assign(new Error(code+': '+detail),{code});
  const rect=r=>({x:r.x,y:r.y,width:r.width,height:r.height});
  function unique(scope,css){
    const found=[...scope.querySelectorAll(css)].filter(el=>!el.closest('[data-page-guide-root]'));
    if(found.length!==1)throw error(found.length?'TARGET_AMBIGUOUS':'TARGET_NOT_FOUND',css+' 匹配 '+found.length+' 个元素');
    return found[0];
  }
  function locate(target){
    let scope=document,dx=0,dy=0;
    const frameClips=[];
    try{
      for(const selector of target.frame_path||[]){
        const frame=unique(scope,selector);
        if(frame.tagName!=='IFRAME')throw error('INVALID_SCOPE','frame_path 必须指向 iframe');
        for(let ancestor=frame;ancestor;ancestor=ancestor.parentElement){
          const style=ancestor.ownerDocument.defaultView.getComputedStyle(ancestor);
          if(['transform','translate','rotate','scale'].some(key=>style[key]&&style[key]!=='none')||(style.zoom&&!['1','normal'].includes(style.zoom)))throw error('UNSUPPORTED_SCOPE','iframe 或其祖先有变换，暂不支持');
        }
        const box=frame.getBoundingClientRect();
        if(box.width<=0||box.height<=0||frame.checkVisibility?.()===false)throw error('TARGET_NOT_VISIBLE','iframe 隐藏');
        dx+=box.x+frame.clientLeft;dy+=box.y+frame.clientTop;
        frameClips.push({x:dx,y:dy,width:frame.clientWidth,height:frame.clientHeight});
        try{scope=frame.contentDocument;if(!scope)throw new Error();}catch{throw error('UNSUPPORTED_SCOPE','跨源 iframe 暂不支持');}
        watchScope(scope);
      }
      for(const selector of target.shadow_path||[]){
        const element=unique(scope,selector);
        if(!element.shadowRoot)throw error('UNSUPPORTED_SCOPE','目标没有开放 Shadow DOM');
        scope=element.shadowRoot;
        watchScope(scope);
      }
      let candidates;
      if(target.css)candidates=[...scope.querySelectorAll(target.css)];
      else if(target.label){
        candidates=[...scope.querySelectorAll('label')].filter(e=>e.textContent.trim()===target.label).map(e=>e.control||e.querySelector('input,select,textarea')).filter(Boolean);
        candidates.push(...[...scope.querySelectorAll('[aria-label]')].filter(e=>e.getAttribute('aria-label')===target.label));
        candidates=[...new Set(candidates)];
      }else{
        const elements=[...scope.querySelectorAll('*')].filter(e=>!e.closest('[data-page-guide-root]'));
        candidates=elements.filter(e=>e.textContent.trim()===target.text&&![...e.children].some(c=>c.textContent.trim()===target.text));
      }
      candidates=candidates.filter(e=>!e.closest('[data-page-guide-root]'));
      if(candidates.length!==1)throw error(candidates.length?'TARGET_AMBIGUOUS':'TARGET_NOT_FOUND','匹配 '+candidates.length+' 个元素');
      const element=candidates[0],r=element.getBoundingClientRect(),style=element.ownerDocument.defaultView.getComputedStyle(element);
      const box={x:r.x+dx,y:r.y+dy,width:r.width,height:r.height};
      if(!element.checkVisibility?.({checkOpacity:true,checkVisibilityCSS:true})&&element.checkVisibility)throw error('TARGET_NOT_VISIBLE','目标隐藏');
      if(style.visibility==='hidden'||style.display==='none'||r.width<=0||r.height<=0)throw error('TARGET_NOT_VISIBLE','目标没有可见边界');
      if(frameClips.some(clip=>box.x<clip.x-1||box.y<clip.y-1||box.x+box.width>clip.x+clip.width+1||box.y+box.height>clip.y+clip.height+1))throw error('TARGET_NOT_VISIBLE','目标被 iframe 边界裁切，请先在 frame 内滚动到完整目标');
      if(box.x+box.width<=0||box.y+box.height<=0||box.x>=innerWidth||box.y>=innerHeight)throw error('TARGET_OUTSIDE_VIEWPORT','请先观察或滚动到目标');
      return {element,box,match_count:1,visible:true};
    }catch(e){if(e.code)throw e;throw error('INVALID_TARGET',e.message);}
  }
  function ensureRoot(){
    if(host)return;
    host=document.createElement('div');host.dataset.pageGuideRoot='0.2.0';
    host.style.cssText='position:fixed;inset:0;z-index:2147483647;pointer-events:none;';
    shadow=host.attachShadow({mode:'open'});
    const style=document.createElement('style');
    style.textContent=':host{all:initial;pointer-events:none}.ring{position:fixed;box-sizing:border-box;border:2px solid var(--color);border-radius:8px;pointer-events:none}.callout{position:fixed;box-sizing:border-box;max-width:300px;padding:10px 14px;background:var(--color);color:white;border-radius:9px;box-shadow:0 4px 18px #0003;font:14px/1.5 system-ui,"PingFang SC",sans-serif;white-space:pre-wrap;overflow-wrap:anywhere;pointer-events:none}svg{position:fixed;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}';
    shadow.append(style);document.documentElement.append(host);
    window.addEventListener('scroll',schedule,true);window.addEventListener('resize',schedule);
    observer=new MutationObserver(schedule);observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,characterData:true});
    resize=new ResizeObserver(schedule);
  }
  function schedule(){
    if(!raf&&host)raf=requestAnimationFrame(()=>{raf=0;refresh();});
  }
  function stopIfEmpty(){
    if([...sessions.values()].some(s=>s.size))return;
    if(raf)cancelAnimationFrame(raf);raf=0;
    observer?.disconnect();resize?.disconnect();window.removeEventListener('scroll',schedule,true);window.removeEventListener('resize',schedule);
    observed.clear();for(const [scope,mutation]of scopes){mutation.disconnect();scope.removeEventListener('scroll',schedule,true);}scopes.clear();
    host?.remove();host=null;shadow=null;
  }
  function createNode(tag,cls,item){
    const node=document.createElement(tag);node.className=cls;node.dataset.annotationId=item.spec.id;
    node.style.setProperty('--color',item.spec.color||DEFAULT_COLOR);
    shadow.append(node);item.nodes.push(node);return node;
  }
  function draw(item,located){
    item.nodes.forEach(n=>n.remove());item.nodes=[];
    const a=item.spec,b=located.box,color=a.color||DEFAULT_COLOR;
    if(a.type==='highlight'||a.type==='combined'){
      const ring=createNode('div','ring',item);
      Object.assign(ring.style,{left:b.x-4+'px',top:b.y-4+'px',width:b.width+8+'px',height:b.height+8+'px'});
    }
    let bubbleBox;
    if(a.type==='callout'||a.type==='combined'||(a.type==='arrow'&&a.text)){
      const bubble=createNode('div','callout',item);bubble.textContent=a.text;bubble.setAttribute('role','note');
      const size=bubble.getBoundingClientRect(),gap=14;
      let x=b.x,y=b.y+b.height+gap;
      if(a.placement==='top')y=b.y-size.height-gap;
      if(a.placement==='right'){x=b.x+b.width+gap;y=b.y+(b.height-size.height)/2;}
      if(a.placement==='left'){x=b.x-size.width-gap;y=b.y+(b.height-size.height)/2;}
      x+=a.offset?.x||0;y+=a.offset?.y||0;
      x=Math.max(8,Math.min(x,innerWidth-size.width-8));y=Math.max(8,Math.min(y,innerHeight-size.height-8));
      Object.assign(bubble.style,{left:x+'px',top:y+'px'});
      bubbleBox={x,y,width:size.width,height:size.height};
    }
    if(a.type==='arrow'||a.type==='combined'){
      const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),line=document.createElementNS(ns,'line'),head=document.createElementNS(ns,'path');
      let end={x:b.x+b.width/2,y:b.y};
      if(a.placement==='bottom')end.y=b.y+b.height;
      if(a.placement==='right')end={x:b.x+b.width,y:b.y+b.height/2};
      if(a.placement==='left')end={x:b.x,y:b.y+b.height/2};
      const start=bubbleBox?{x:bubbleBox.x+bubbleBox.width/2,y:bubbleBox.y+bubbleBox.height/2}:{x:end.x+(a.offset?.x||0),y:end.y+(a.offset?.y||-55)};
      const angle=Math.atan2(end.y-start.y,end.x-start.x),length=9;
      line.setAttribute('x1',start.x);line.setAttribute('y1',start.y);line.setAttribute('x2',end.x);line.setAttribute('y2',end.y);line.setAttribute('stroke',color);line.setAttribute('stroke-width','2');
      const p1={x:end.x-length*Math.cos(angle-.5),y:end.y-length*Math.sin(angle-.5)},p2={x:end.x-length*Math.cos(angle+.5),y:end.y-length*Math.sin(angle+.5)};
      head.setAttribute('d','M'+p1.x+' '+p1.y+' L'+end.x+' '+end.y+' L'+p2.x+' '+p2.y);head.setAttribute('fill','none');head.setAttribute('stroke',color);head.setAttribute('stroke-width','2');
      svg.dataset.annotationId=a.id;svg.append(line,head);shadow.prepend(svg);item.nodes.push(svg);
    }
    item.result={id:a.id,ok:true,match_count:1,target_box:b,callout_box:bubbleBox||null,color};
  }
  function refresh(){
    const current=new Set();
    for(const group of sessions.values())for(const item of group.values()){
      try{const located=locate(item.spec.target);draw(item,located);current.add(located.element);if(!observed.has(located.element)){resize?.observe(located.element);observed.add(located.element);}}
      catch(e){item.nodes.forEach(n=>n.remove());item.nodes=[];item.result={id:item.spec.id,ok:false,error:e.message};}
    }
    for(const element of observed)if(!current.has(element)){resize?.unobserve(element);observed.delete(element);}
  }
  function execute(command,args={}){
    if(args.page&&(args.page.document_id!==documentId||args.page.url!==location.href))throw error('STALE_PAGE','文档或 URL 已改变，请重新观察');
    if(command==='status')return {document_id:documentId,url:location.href,revision:globalThis.PGA_VERSION?.revision};
    /* DEVELOPMENT_ONLY_START */
    if(command==='dev_snapshot')return {sessions:[...sessions].map(([session_id,group])=>({session_id,annotations:[...group.values()].map(i=>i.spec)}))};
    /* DEVELOPMENT_ONLY_END */
    if(command==='page_guide_inspect'){const located=locate(args.target);return {ok:true,match_count:1,visible:true,target_box:located.box,document_id:documentId};}
    const group=sessions.get(args.session_id)||new Map();
    if(command==='page_guide_status'){refresh();return {ok:true,annotations:[...group.values()].map(i=>i.result),document_id:documentId};}
    if(command==='page_guide_clear'){
      const ids=args.ids||[...group.keys()],cleared=[];
      for(const id of ids){const item=group.get(id);if(item){item.nodes.forEach(n=>n.remove());group.delete(id);cleared.push(id);}}
      if(!group.size)sessions.delete(args.session_id);stopIfEmpty();return {ok:true,cleared,remaining:group.size};
    }
    if(!['page_guide_annotate','page_guide_update'].includes(command))throw error('UNKNOWN_COMMAND',command);
    if(command==='page_guide_update'&&args.annotations.some(a=>!group.has(a.id)))throw error('ANNOTATION_NOT_FOUND','更新 ID 必须已经存在');
    const staged=args.annotations.map(spec=>({spec,located:locate(spec.target)})); // Validate the entire batch before changing the old group.
    ensureRoot();
    if(command==='page_guide_annotate'&&args.replace)for(const item of group.values())item.nodes.forEach(n=>n.remove());
    if(command==='page_guide_annotate'&&args.replace)group.clear();
    for(const {spec,located} of staged){group.get(spec.id)?.nodes.forEach(n=>n.remove());const item={spec,nodes:[],result:null};group.set(spec.id,item);draw(item,located);}
    sessions.set(args.session_id,group);refresh();
    return {ok:true,annotations:staged.map(({spec})=>group.get(spec.id).result),document_id:documentId,revision:globalThis.PGA_VERSION?.revision};
  }
  globalThis.PGA_RENDERER={execute,documentId};
  chrome.runtime.onMessage.addListener((msg,sender,reply)=>{
    if(msg.type!=='PGA_COMMAND')return;
    try{reply({result:execute(msg.command,msg.args)});}catch(e){reply({error:e.message});}
  });
})();
