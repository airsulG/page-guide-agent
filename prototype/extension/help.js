(() => {
  'use strict';
  if(globalThis.PGA_HELP)return;
  const groups=new Map();
  const semantic='button,a[href],input:not([type="hidden"]),select,textarea,[role="button"],[role="tab"],[role="switch"],[role="checkbox"],[role="radio"],[aria-label],h1,h2,h3,canvas,table,th,td,[role="img"],img[alt]';
  const own=el=>el.closest('[data-page-guide-root],[data-page-guide-help]');
  function selector(el){
    const parts=[];
    while(el&&el!==document.documentElement){
      const siblings=[...el.parentElement.children].filter(n=>n.tagName===el.tagName);
      parts.unshift(el.tagName.toLowerCase()+':nth-of-type('+(siblings.indexOf(el)+1)+')');el=el.parentElement;
    }
    return 'html > '+parts.join(' > ');
  }
  function inventory(){
    const textLabels=[...document.querySelectorAll('span,p,div')].filter(el=>!el.children.length&&!el.closest('button,a,input,table')&&el.textContent.trim().length>=2&&el.textContent.trim().length<=80&&!/^[\d\s$.,%+\-KM]+$/.test(el.textContent.trim()));
    const components=[...new Set([...document.querySelectorAll(semantic),...textLabels])].filter(el=>!own(el)&&el.getBoundingClientRect().width>0&&el.getBoundingClientRect().height>0&&getComputedStyle(el).visibility!=='hidden').map((el,i)=>{
      const r=el.getBoundingClientRect();const row=el.closest('tr');const column=row&&['TD','TH'].includes(el.tagName)?[...row.children].indexOf(el):-1;return {id:'component-'+(i+1),target:{css:selector(el)},tag:el.tagName,label:(el.getAttribute('aria-label')||el.getAttribute('alt')||el.getAttribute('placeholder')||el.innerText||el.textContent||'').trim().slice(0,180),column:column<0?null:el.closest('table')?.rows[0]?.cells[column]?.textContent.trim(),in_viewport:r.bottom>0&&r.right>0&&r.top<innerHeight&&r.left<innerWidth};
    });
    return {ok:true,components,count:components.length,coverage:'语义控件、标题、图表与表格；无语义的指标和自定义控件需结合实际页面补充。跨源 iframe 未覆盖。'};
  }
  function clear(id){const g=groups.get(id);if(!g)return;g.dispose();groups.delete(id);}
  function register(args,locate){
    if([...groups.keys()].some(id=>id!==args.session_id))throw Error('HELP_SESSION_CONFLICT: 页面已有另一会话的帮助，请先由原会话清理。');
    if(args.components.some(c=>c.target.frame_path?.length))throw Error('UNSUPPORTED_SCOPE: 网页帮助暂不支持 iframe 内组件。');
    const staged=args.components.map(spec=>({spec,element:locate(spec.target).element}));
    clear(args.session_id);
    const host=document.createElement('div');host.dataset.pageGuideHelp=args.session_id;
    host.style.cssText='position:fixed;inset:0;z-index:2147483646;pointer-events:none';
    const root=host.attachShadow({mode:'open'});
    const style=document.createElement('style');style.textContent=[
      ':host{all:initial;pointer-events:none;color-scheme:dark}*{box-sizing:border-box}[hidden]{display:none!important}',
      '.component-outline{position:fixed;border:1.5px solid #ffc247;border-radius:5px;background:rgba(255,194,71,.045);box-shadow:0 0 0 1px #ffc24716;pointer-events:none}',
      '.annotation-mark{position:fixed;width:24px;height:24px;border-radius:7px;background:#ffc247;color:#201600;border:1px solid #ffe1a1;font:600 12px/22px -apple-system,sans-serif;text-align:center;pointer-events:none;box-shadow:0 2px 8px #0004}',
      '.copy-component{position:fixed;width:26px;height:26px;padding:4px;border:1px solid #ffffff26;border-radius:6px;background:rgba(24,25,28,.88);color:#ffe1a1;backdrop-filter:blur(18px);font:14px/16px -apple-system,sans-serif;cursor:pointer;pointer-events:auto}.copy-component:focus-visible{outline:2px solid #ffc247}'
    ].join('');root.append(style);
    let active=null,timer;const selectedItems=[],feedbackTimers=new Set();
    function resolve(item){const el=item?.element;if(!el?.isConnected)return null;const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(el).visibility!=='hidden'?el:null;}
    function inViewport(r){return r&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth;}
    function copyButton(getItem){
      const button=document.createElement('button');button.type='button';button.className='copy-component';button.textContent='⧉';button.setAttribute('aria-label','复制组件');button.title='复制组件';
      button.addEventListener('click',async event=>{
        event.stopPropagation();const item=getItem();if(!item)return;
        try{await navigator.clipboard.writeText(item.spec.title+'\n组件 ID：'+item.spec.id);button.textContent='✓';button.setAttribute('aria-label','已复制组件');button.title='已复制';}
        catch{button.textContent='!';button.setAttribute('aria-label','复制失败，请重试');button.title='复制失败，请重试';}
        if(!host.isConnected)return;
        const timeout=setTimeout(()=>{feedbackTimers.delete(timeout);button.textContent='⧉';button.setAttribute('aria-label','复制组件');button.title='复制组件';},1600);feedbackTimers.add(timeout);
      });return button;
    }
    function createFrame(){const frame=document.createElement('div');frame.className='component-outline';frame.hidden=true;frame.setAttribute('aria-hidden','true');root.append(frame);return frame;}
    const hoverFrame=createFrame(),hoverCopy=copyButton(()=>active);hoverCopy.hidden=true;root.append(hoverCopy);
    function paint(item,frame,mark,copy,showCopy){
      const el=resolve(item),r=el?.getBoundingClientRect(),visible=inViewport(r);
      frame.hidden=!visible;if(mark)mark.hidden=!visible;copy.hidden=!visible||!showCopy;
      if(!visible)return;
      Object.assign(frame.style,{left:(r.left-3)+'px',top:(r.top-3)+'px',width:(r.width+6)+'px',height:(r.height+6)+'px'});
      if(mark){mark.style.left=Math.max(0,Math.min(r.left-12,innerWidth-24))+'px';mark.style.top=Math.max(0,Math.min(r.top-12,innerHeight-24))+'px';}
      copy.style.left=Math.max(0,Math.min(r.right-13,innerWidth-26))+'px';copy.style.top=Math.max(0,Math.min(r.top-13,innerHeight-26))+'px';
    }
    function hideHover(){active=null;hoverFrame.hidden=true;hoverCopy.hidden=true;selectedItems.forEach(p=>{if(root.activeElement!==p.copy)p.copy.hidden=true;});}
    function layout(){
      selectedItems.forEach(p=>paint(p.item,p.frame,p.mark,p.copy,active===p.item||root.activeElement===p.copy));
      const selected=selectedItems.find(p=>p.item===active);
      if(active&&!selected)paint(active,hoverFrame,null,hoverCopy,true);
      else{hoverFrame.hidden=true;hoverCopy.hidden=true;}
    }
    function pointer(event){
      if(event.composedPath().includes(host))return;
      clearTimeout(timer);const path=event.composedPath();
      const item=staged.filter(i=>path.includes(i.element)).sort((a,b)=>path.indexOf(a.element)-path.indexOf(b.element))[0];
      if(item){active=item;layout();}else timer=setTimeout(()=>{hideHover();layout();},180);
    }
    function leave(event){if(!event.relatedTarget){hideHover();layout();}}
    function key(event){if(event.key==='Escape'){hideHover();layout();}}
    function select(ids,mode='replace'){
      const requested=ids.map(id=>{
        const item=staged.find(x=>x.spec.id===id);if(!item)throw Error('UNKNOWN_COMPONENT: 未注册组件 '+id);
        if(mode!=='remove'&&!resolve(item))throw Error('COMPONENT_UNAVAILABLE: 组件已变化，请重新观察 '+id);
        return item;
      });
      const previous=selectedItems.map(p=>p.item);
      const items=mode==='remove'?previous.filter(item=>!ids.includes(item.spec.id)):mode==='add'?[...new Set([...previous,...requested])]:requested;
      if(items.length>40)throw Error('SELECTION_LIMIT: 同时选择最多40个组件');
      clearTimeout(timer);hideHover();selectedItems.forEach(p=>{p.frame.remove();p.mark.remove();p.copy.remove();});selectedItems.length=0;
      items.forEach((item,i)=>{
        const frame=createFrame(),mark=document.createElement('div');mark.className='annotation-mark';mark.textContent=String(i+1);mark.setAttribute('aria-label','标注编号 '+(i+1));mark.hidden=true;root.append(mark);
        const copy=copyButton(()=>item);copy.hidden=true;root.append(copy);
        copy.addEventListener('pointerenter',()=>clearTimeout(timer));copy.addEventListener('pointerleave',()=>{timer=setTimeout(()=>{hideHover();layout();},180);});
        copy.addEventListener('focus',layout);copy.addEventListener('blur',layout);
        selectedItems.push({item,frame,mark,copy});
      });
      layout();return {ok:true,...status()};
    }
    const observer=new MutationObserver(layout);
    const resizeObserver=typeof ResizeObserver==='function'?new ResizeObserver(layout):null;
    function status(){
      layout();return {count:staged.length,annotation_visible:!hoverFrame.hidden||selectedItems.some(p=>!p.frame.hidden),active_component:active?.spec.id||null,selected_annotations:selectedItems.map((p,i)=>({id:p.item.spec.id,number:i+1,title:p.item.spec.title,body:p.item.spec.body,available:!!resolve(p.item),outline_visible:!p.frame.hidden,badge_visible:!p.mark.hidden})),components:staged.map(i=>({id:i.spec.id,title:i.spec.title,available:!!resolve(i)}))};
    }
    function dispose(){
      clearTimeout(timer);feedbackTimers.forEach(clearTimeout);feedbackTimers.clear();observer.disconnect();resizeObserver?.disconnect();
      document.removeEventListener('pointerover',pointer,true);document.removeEventListener('pointerout',leave,true);document.removeEventListener('keydown',key,true);window.removeEventListener('scroll',layout,true);window.removeEventListener('resize',layout);host.remove();
    }
    document.documentElement.append(host);groups.set(args.session_id,{host,staged,dispose,status,select});
    document.addEventListener('pointerover',pointer,true);document.addEventListener('pointerout',leave,true);document.addEventListener('keydown',key,true);window.addEventListener('scroll',layout,true);window.addEventListener('resize',layout);
    hoverCopy.addEventListener('pointerenter',()=>clearTimeout(timer));hoverCopy.addEventListener('pointerleave',()=>{timer=setTimeout(()=>{hideHover();layout();},180);});
    hoverCopy.addEventListener('blur',()=>{if(root.activeElement!==hoverCopy){hideHover();layout();}});
    observer.observe(document.documentElement,{childList:true,characterData:true,subtree:true});staged.forEach(item=>resizeObserver?.observe(item.element));
    return {ok:true,...status()};
  }
  globalThis.PGA_HELP={inventory,register,clear,show:args=>{const group=groups.get(args.session_id);if(!group)throw Error('HELP_NOT_REGISTERED: 请先为本会话注册组件知识');return group.select(args.component_ids,args.mode);},status:id=>groups.get(id)?.status()||null};
})();
