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
    const style=document.createElement('style');style.textContent=`
      :host{all:initial;pointer-events:none;color-scheme:dark}*{box-sizing:border-box}[hidden]{display:none!important}
      .tip,.annotation-card{color:#f2f2f4;background:rgba(24,25,28,.84);border:1px solid rgba(255,255,255,.13);backdrop-filter:blur(18px) saturate(120%);-webkit-backdrop-filter:blur(18px) saturate(120%);border-radius:12px;box-shadow:0 8px 28px #0005;font:13px/1.55 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;pointer-events:auto}
      .tip{position:fixed;z-index:3;width:min(360px,calc(100vw - 24px));padding:18px;max-height:60vh;overflow:auto}.tip p,.annotation-card p{white-space:pre-wrap;margin:0 0 8px}.tip h3,.annotation-card h3{color:#ffe1a1;font-size:15px;margin:0 0 8px}
      .annotation-rail{position:fixed;left:72px;right:16px;bottom:64px;max-height:40vh;pointer-events:auto;display:grid;grid-auto-flow:column;grid-auto-columns:max(300px,calc((100vw - 108px)/3));gap:10px;overflow-x:auto;overscroll-behavior-x:contain;padding-bottom:6px}
      .annotation-card{cursor:pointer;max-height:40vh;overflow:auto;padding:14px}.annotation-card:focus-visible{outline:2px solid #ffc247;outline-offset:-2px}
      .copy-component{float:right;margin:0 0 6px 10px;padding:4px 8px;border:1px solid #ffffff26;border-radius:6px;background:#ffffff0a;color:#ffe1a1;font:12px/1.5 -apple-system,sans-serif;cursor:pointer}.annotation-card .copy-component{opacity:0}.annotation-card:hover .copy-component,.annotation-card:focus-within .copy-component{opacity:1}.copy-component:focus-visible{outline:2px solid #ffc247}
      .annotation-mark{position:fixed;z-index:2;transform:translateZ(0);background:#ffc247;color:#201600;border:1px solid rgba(255,224,153,.9);border-radius:50%;width:28px;height:28px;text-align:center;font:600 14px/24px -apple-system,sans-serif;pointer-events:none;box-shadow:0 2px 8px #0003}
    `;root.append(style);
    const tip=document.createElement('aside');tip.className='tip';tip.hidden=true;tip.setAttribute('role','note');
    const tipTitle=document.createElement('h3'),tipBody=document.createElement('p');tip.append(tipTitle,tipBody);root.append(tip);
    let active=null,timer;
    function copyButton(getItem){
      const button=document.createElement('button');button.type='button';button.className='copy-component';button.textContent='复制组件';
      button.addEventListener('keydown',event=>event.stopPropagation());
      button.addEventListener('click',async event=>{
        event.stopPropagation();const item=getItem();if(!item)return;
        try{await navigator.clipboard.writeText(item.spec.title+'\n组件 ID：'+item.spec.id);button.textContent='已复制';}
        catch{button.textContent='复制失败，请重试';}
        setTimeout(()=>{button.textContent='复制组件';},1600);
      });return button;
    }
    tip.prepend(copyButton(()=>active));
    const g={host,staged,dispose,status,select};groups.set(args.session_id,g);
    function resolve(item){const el=item?.element;if(!el?.isConnected)return null;const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(el).visibility!=='hidden'?el:null;}
    function hide(){tip.hidden=true;active=null;}
    function position(el){
      const b=el.getBoundingClientRect();const size=tip.getBoundingClientRect();
      const x=Math.max(12,Math.min(b.right+12,innerWidth-size.width-12));
      let y=b.top;if(x<b.right&&x+size.width>b.left)y=b.bottom+12;
      if(y+size.height>innerHeight-12)y=Math.max(12,b.top-size.height-12);
      tip.style.left=x+'px';tip.style.top=Math.max(12,y)+'px';
    }
    function hover(item){const el=resolve(item);if(!el){hide();return false;}active=item;tipTitle.textContent=item.spec.title;tipBody.textContent=item.spec.body;tip.hidden=false;position(el);return true;}
    function pointer(event){
      if(event.composedPath().includes(host))return;
      clearTimeout(timer);
      const path=event.composedPath();const item=staged.filter(i=>path.includes(i.element)).sort((a,b)=>path.indexOf(a.element)-path.indexOf(b.element))[0];
      if(item){if(active!==item)hover(item);return;}
      timer=setTimeout(hide,180);
    }
    function leave(event){if(!event.relatedTarget)hide();}
    function reflow(){layoutSelection();if(!active)return;const el=resolve(active);if(!el){hide();return;}const r=el.getBoundingClientRect();if(r.bottom<=0||r.top>=innerHeight||r.right<=0||r.left>=innerWidth)hide();else position(el);}
    function key(event){if(event.key==='Escape')hide();}
    let selectionActive=false;const selectedItems=[];
    function layoutSelection(){
      selectedItems.forEach(({item,mark,card,line},i)=>{const el=resolve(item);const b=el?.getBoundingClientRect();const inViewport=b&&b.bottom>0&&b.top<innerHeight&&b.right>0&&b.left<innerWidth;const badgeBox=b?{left:Math.max(0,Math.min(b.left-14,innerWidth-28)),top:Math.max(0,Math.min(b.top-14,innerHeight-28))}:null;if(badgeBox){badgeBox.right=badgeBox.left+28;badgeBox.bottom=badgeBox.top+28;}const overlaps=(a,c)=>a&&a.left<c.right&&a.right>c.left&&a.top<c.bottom&&a.bottom>c.top;const covered=selectionActive&&selectedItems.some(p=>{const r=p.card.getBoundingClientRect(),rail=annotationRail.getBoundingClientRect();const clipped={left:Math.max(r.left,rail.left),right:Math.min(r.right,rail.right),top:Math.max(r.top,rail.top),bottom:Math.min(r.bottom,rail.bottom)};return clipped.right>clipped.left&&clipped.bottom>clipped.top&&(overlaps(b,clipped)||overlaps(badgeBox,clipped));});const visible=inViewport&&!covered;mark.hidden=!selectionActive||!visible;if(visible){mark.style.left=Math.max(0,Math.min(b.left-14,innerWidth-28))+'px';mark.style.top=Math.max(0,Math.min(b.top-14,innerHeight-28))+'px';}const c=card.getBoundingClientRect(),rail=annotationRail.getBoundingClientRect();const cardVisible=c.left>=rail.left-1&&c.right<=rail.right+1;line.style.display=selectionActive&&visible&&cardVisible?'':'none';if(visible&&cardVisible){const m=mark.getBoundingClientRect();const x=m.left+14,y=m.top+14,end=c.left+c.width/2;const turn=c.top-18,dx=Math.sign(end-x),dy=Math.sign(turn-y),radius=Math.min(10,Math.abs(end-x)/2,Math.abs(turn-y)/2);line.setAttribute('d',`M ${x} ${y} L ${x} ${turn-dy*radius} Q ${x} ${turn} ${x+dx*radius} ${turn} L ${end-dx*radius} ${turn} Q ${end} ${turn} ${end} ${turn+radius} L ${end} ${c.top}`);}card.setAttribute('aria-description',!el?'组件已变化，请重新观察':covered?'组件被说明遮挡，滚动页面或点击卡片定位':visible?'对应页面编号 '+(i+1):'组件在视口外，点击卡片定位');});
    }
    const links=document.createElementNS('http://www.w3.org/2000/svg','svg');
    links.style.cssText='position:fixed;inset:0;width:100%;height:100%;pointer-events:none;overflow:hidden';root.append(links);
    const annotationRail=document.createElement('section');annotationRail.className='annotation-rail';
    annotationRail.setAttribute('aria-label','对话选中的标注');annotationRail.hidden=true;root.append(annotationRail);
    annotationRail.addEventListener('scroll',layoutSelection);
    function select(ids){
      const items=ids.map(id=>{
        const item=staged.find(x=>x.spec.id===id);
        if(!item)throw Error('UNKNOWN_COMPONENT: 未注册组件 '+id);
        if(!resolve(item))throw Error('COMPONENT_UNAVAILABLE: 组件已变化，请重新观察 '+id);
        return item;
      });
      clearTimeout(timer);hide();
      selectedItems.forEach(p=>{p.card.remove();p.mark.remove();p.line.remove();});selectedItems.length=0;
      selectionActive=items.length>0;annotationRail.hidden=!selectionActive;annotationRail.scrollLeft=0;
      items.forEach((item,i)=>{
        const card=document.createElement('article');card.className='annotation-card';
        const heading=document.createElement('h3');heading.textContent=(i+1)+'. '+item.spec.title;
        const body=document.createElement('p');body.textContent=item.spec.body;
        card.setAttribute('role','button');card.tabIndex=0;card.setAttribute('aria-label',heading.textContent);
        const locateCard=()=>{const el=resolve(item);if(el){el.scrollIntoView?.({block:'center',behavior:'instant'});layoutSelection();}else card.setAttribute('aria-description','组件已变化，请重新观察');};
        card.addEventListener('click',locateCard);
        card.addEventListener('keydown',event=>{if(event.target===card&&(event.key==='Enter'||event.key===' ')){event.preventDefault();locateCard();}});
        card.append(copyButton(()=>item),heading,body);annotationRail.append(card);
        const mark=document.createElement('div');mark.className='annotation-mark';mark.textContent=String(i+1);
        mark.setAttribute('aria-label','标注编号 '+(i+1));mark.hidden=true;root.append(mark);
        const line=document.createElementNS('http://www.w3.org/2000/svg','path');
        line.setAttribute('fill','none');line.setAttribute('stroke-linecap','round');line.setAttribute('stroke','#ffc247');
        line.setAttribute('stroke-width','1.5');line.setAttribute('opacity','0.6');line.style.display='none';links.append(line);
        selectedItems.push({item,card,mark,line});
      });
      layoutSelection();return {ok:true,...status()};
    }
    document.documentElement.append(host);
    document.addEventListener('pointerover',pointer,true);document.addEventListener('pointerout',leave,true);document.addEventListener('keydown',key,true);window.addEventListener('scroll',reflow,true);window.addEventListener('resize',reflow);
    tip.addEventListener('pointerenter',()=>clearTimeout(timer));tip.addEventListener('pointerleave',()=>{timer=setTimeout(hide,180);});
    const observer=new MutationObserver(reflow);observer.observe(document.documentElement,{childList:true,subtree:true});
    function status(){layoutSelection();return {count:staged.length,annotation_visible:!tip.hidden||selectionActive,active_component:active?.spec.id||null,selected_annotations:selectedItems.map((p,i)=>({id:p.item.spec.id,number:i+1,available:!!resolve(p.item),marker_visible:!p.mark.hidden,connector_visible:p.line.style.display!=='none'})),components:staged.map(i=>({id:i.spec.id,title:i.spec.title,available:!!resolve(i)}))};}
    function dispose(){clearTimeout(timer);observer.disconnect();document.removeEventListener('pointerover',pointer,true);document.removeEventListener('pointerout',leave,true);document.removeEventListener('keydown',key,true);window.removeEventListener('scroll',reflow,true);window.removeEventListener('resize',reflow);host.remove();}
    return {ok:true,...status()};
  }
  globalThis.PGA_HELP={inventory,register,clear,show:args=>{const group=groups.get(args.session_id);if(!group)throw Error('HELP_NOT_REGISTERED: 请先为本会话注册组件知识');return group.select(args.component_ids);},status:id=>groups.get(id)?.status()||null};
})();
