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
      :host{all:initial;pointer-events:none;color-scheme:light}*{box-sizing:border-box} [hidden]{display:none!important}
      .tip,.panel{position:fixed;color:#1d1d1f;background:#fff;border:1px solid #d2d2d7;border-radius:16px;box-shadow:0 12px 44px #0003;font:14px/1.6 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;pointer-events:auto}
      .tip{width:min(360px,calc(100vw - 24px));padding:18px;max-height:60vh;overflow:auto}.tip p{white-space:pre-wrap;margin:8px 0 0}.tip h3{font-size:16px;margin:0}
      .panel{right:16px;bottom:16px;width:min(360px,calc(100vw - 32px));max-height:70vh;overflow:auto;padding:20px}.panel h2{font-size:18px;line-height:1.35;margin:0 0 12px}.panel h3{font-size:16px;margin:12px 0 8px}.panel p{margin:8px 0}.muted{color:#6e6e73;font-size:12px}
      button,select{font:inherit}button{border:0;border-radius:9px;background:#f5f5f7;color:#1d1d1f;padding:7px 12px;cursor:pointer}button:focus-visible,select:focus-visible{outline:3px solid #0071e3;outline-offset:3px}button:disabled{opacity:.4;cursor:default}.primary{background:#0071e3;color:#fff}.nav{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}.close{float:right}.picker{width:100%;margin:10px 0;padding:7px;border:1px solid #d2d2d7;border-radius:8px}.launcher{position:fixed;right:16px;bottom:16px;pointer-events:auto;border:1px solid #d2d2d7;box-shadow:0 4px 14px #0002}.status{color:#6e6e73}
    `;root.append(style);
    const tip=document.createElement('aside');tip.className='tip';tip.hidden=true;tip.setAttribute('role','note');
    const tipTitle=document.createElement('h3'),tipBody=document.createElement('p');tip.append(tipTitle,tipBody);root.append(tip);
    const badge=document.createElement('div');badge.hidden=true;badge.style.cssText='position:fixed;background:#0071e3;color:white;border:2px solid white;border-radius:50%;width:28px;height:28px;text-align:center;font:600 14px/24px -apple-system,sans-serif;box-shadow:0 2px 8px #0003;pointer-events:none';root.append(badge);
    let active=null,pinned=false,step=0,timer;
    const g={host,staged,dispose,status};groups.set(args.session_id,g);
    function resolve(item){const el=item?.element;if(!el?.isConnected)return null;const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(el).visibility!=='hidden'?el:null;}
    function hide(){tip.hidden=true;badge.hidden=true;active=null;pinned=false;}
    function position(el){
      const b=el.getBoundingClientRect();const size=tip.getBoundingClientRect();
      const x=Math.max(12,Math.min(b.right+12,innerWidth-size.width-12));
      let y=b.top;if(x<b.right&&x+size.width>b.left)y=b.bottom+12;
      if(y+size.height>innerHeight-12)y=Math.max(12,b.top-size.height-12);
      tip.style.left=x+'px';tip.style.top=Math.max(12,y)+'px';
      if(pinned){badge.style.left=Math.max(0,Math.min(b.left-14,innerWidth-28))+'px';badge.style.top=Math.max(0,Math.min(b.top-14,innerHeight-28))+'px';}
    }
    function show(item,pin=false){const el=resolve(item);if(!el){hide();return false;}active=item;pinned=pin;tipTitle.textContent=item.spec.title;tipBody.textContent=item.spec.body;tip.hidden=false;position(el);return true;}
    function pointer(event){
      if(event.composedPath().includes(host))return;
      if(pathActive||pinned)return;
      clearTimeout(timer);
      const path=event.composedPath();const item=staged.filter(i=>path.includes(i.element)).sort((a,b)=>path.indexOf(a.element)-path.indexOf(b.element))[0];
      if(item){if(active!==item)show(item);return;}
      if(!pinned)timer=setTimeout(hide,180);
    }
    function leave(event){if(!event.relatedTarget&&!pinned)hide();}
    function reflow(){if(pathActive){layoutPath();return;}if(!active)return;const el=resolve(active);if(!el){hide();return;}const r=el.getBoundingClientRect();if(r.bottom<=0||r.top>=innerHeight||r.right<=0||r.left>=innerWidth)hide();else position(el);}
    function key(event){if(event.key==='Escape'){if(!pathActive)hide();if(panel&&!panel.hidden){panel.hidden=true;launcher.hidden=false;launcher.focus();}}}
    let panel,launcher,picker,heading,action,expected,progress,previous,next,note;
    let pathActive=false;const pathItems=[];
    function button(text,fn,cls=''){const b=document.createElement('button');b.type='button';b.textContent=text;b.className=cls;b.addEventListener('click',fn);return b;}
    function layoutPath(){
      positionControls();
      pathItems.forEach(({item,mark,card,line},i)=>{const el=resolve(item);const b=el?.getBoundingClientRect();const inViewport=b&&b.bottom>0&&b.top<innerHeight&&b.right>0&&b.left<innerWidth;const badgeBox=b?{left:Math.max(0,Math.min(b.left-14,innerWidth-28)),top:Math.max(0,Math.min(b.top-14,innerHeight-28))}:null;if(badgeBox){badgeBox.right=badgeBox.left+28;badgeBox.bottom=badgeBox.top+28;}const overlaps=(a,c)=>a&&a.left<c.right&&a.right>c.left&&a.top<c.bottom&&a.bottom>c.top;const covered=pathActive&&pathItems.some(p=>{const r=p.card.getBoundingClientRect(),rail=pathRail.getBoundingClientRect();const clipped={left:Math.max(r.left,rail.left),right:Math.min(r.right,rail.right),top:Math.max(r.top,rail.top),bottom:Math.min(r.bottom,rail.bottom)};return clipped.right>clipped.left&&clipped.bottom>clipped.top&&(overlaps(b,clipped)||overlaps(badgeBox,clipped));});const visible=inViewport&&!covered;mark.hidden=!pathActive||!visible;if(visible){mark.style.left=Math.max(0,Math.min(b.left-14,innerWidth-28))+'px';mark.style.top=Math.max(0,Math.min(b.top-14,innerHeight-28))+'px';}const c=card.getBoundingClientRect(),rail=pathRail.getBoundingClientRect();const cardVisible=c.left>=rail.left-1&&c.right<=rail.right+1;line.style.display=pathActive&&visible&&cardVisible?'':'none';if(visible&&cardVisible){const m=mark.getBoundingClientRect();const x=m.left+14,y=m.top+14,end=c.left+c.width/2;const turn=c.top-18,dx=Math.sign(end-x),dy=Math.sign(turn-y),radius=Math.min(10,Math.abs(end-x)/2,Math.abs(turn-y)/2);line.setAttribute('d',`M ${x} ${y} L ${x} ${turn-dy*radius} Q ${x} ${turn} ${x+dx*radius} ${turn} L ${end-dx*radius} ${turn} Q ${end} ${turn} ${end} ${turn+radius} L ${end} ${c.top}`);}card.setAttribute('aria-description',!el?'组件已变化，请重新观察':covered?'组件被说明遮挡，滚动页面或点击卡片定位':visible?'对应页面编号 '+(i+1):'组件在视口外，点击卡片定位');});
    }
    function positionControls(){if(!launcher||!panel)return;const anchor=pathActive?pathRail.getBoundingClientRect().top:innerHeight-100;launcher.style.top=Math.max(12,anchor-40)+'px';panel.style.top=Math.max(12,anchor-48-panel.getBoundingClientRect().height)+'px';}
    function selectPath(enabled){hide();pathActive=enabled;pinned=enabled;pathRail.hidden=!enabled;pathItems.forEach(p=>p.mark.hidden=!enabled);layoutPath();panel.hidden=true;launcher.hidden=false;launcher.textContent=enabled?'切换路径':'选择路径';launcher.focus();}
    let pathRail;
    const links=document.createElementNS('http://www.w3.org/2000/svg','svg');links.style.cssText='position:fixed;inset:0;width:100%;height:100%;pointer-events:none;overflow:hidden';root.append(links);
    if(args.tutorial){
      const extra=document.createElement('style');extra.textContent='.path-rail{position:fixed;left:72px;right:16px;bottom:64px;max-height:40vh;pointer-events:auto;display:grid;grid-auto-flow:column;grid-auto-columns:max(300px,calc((100vw - 108px)/3));gap:10px;overflow-x:auto;overscroll-behavior-x:contain;padding-bottom:6px}.path-card{cursor:pointer;max-height:40vh;overflow:auto;pointer-events:auto;background:rgba(24,25,28,.84);color:#f2f2f4;border:1px solid rgba(255,255,255,.13);backdrop-filter:blur(18px) saturate(120%);-webkit-backdrop-filter:blur(18px) saturate(120%);border-radius:12px;padding:14px;font:13px/1.55 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;box-shadow:0 8px 28px #0005}.path-card:focus-visible{outline:2px solid #ffc247;outline-offset:-2px}.path-card h3{font-size:15px;margin:0 0 8px}.path-card p{white-space:pre-wrap;margin:0 0 8px}.path-card .muted{color:#b4b5bd}.path-card button{font-size:12px;padding:4px 8px;background:rgba(255,255,255,.08);color:#e3e3e8;border:1px solid rgba(255,255,255,.08)}.path-card button:hover{background:rgba(255,194,71,.15);color:#ffd782}.path-card h3{color:#ffe1a1}.path-mark{position:fixed;z-index:2;transform:translateZ(0);background:#ffc247;color:#201600;border:1px solid rgba(255,224,153,.9);border-radius:50%;width:28px;height:28px;text-align:center;font:600 14px/24px -apple-system,sans-serif;pointer-events:none;box-shadow:0 2px 8px #0003}';root.append(extra);
      pathRail=document.createElement('section');pathRail.className='path-rail';pathRail.setAttribute('aria-label',args.tutorial.title+'的全部标注');pathRail.hidden=true;root.append(pathRail);
      pathRail.addEventListener('scroll',layoutPath);
      args.tutorial.steps.forEach((s,i)=>{const item=staged.find(x=>x.spec.id===s.component_id);const card=document.createElement('article');card.className='path-card';const h=document.createElement('h3');h.textContent=(i+1)+'. '+item.spec.title;const p=document.createElement('p');p.textContent=item.spec.body;card.setAttribute("role","button");card.tabIndex=0;card.setAttribute("aria-label",(i+1)+". "+item.spec.title);const locateCard=()=>{const el=resolve(item);if(el){el.scrollIntoView?.({block:"center",behavior:"instant"});layoutPath();}else card.setAttribute("aria-description","组件已变化，请重新观察");};card.addEventListener("click",locateCard);card.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();locateCard();}});card.append(h,p);pathRail.append(card);const mark=document.createElement('div');mark.className='path-mark';mark.textContent=String(i+1);mark.setAttribute('aria-label','路径编号 '+(i+1));mark.hidden=true;root.append(mark);const line=document.createElementNS("http://www.w3.org/2000/svg","path");line.setAttribute("fill","none");line.setAttribute("stroke-linecap","round");line.setAttribute("stroke","#ffc247");line.setAttribute("stroke-width","1.5");line.setAttribute("opacity","0.6");line.style.display="none";links.append(line);pathItems.push({item,card,mark,line});});
      panel=document.createElement('section');panel.className='panel';panel.setAttribute('role','region');panel.setAttribute('aria-label',args.tutorial.title);
      panel.append(button('收起',()=>{panel.hidden=true;launcher.hidden=false;launcher.focus();},'close'));
      const title=document.createElement('h2');title.textContent='选择路径';const list=document.createElement('ul');list.className='path-list';const row=document.createElement('li');const choose=button('',()=>selectPath(true),'path-choice');choose.setAttribute('aria-label','查看这条路径');const name=document.createElement('strong');name.textContent=args.tutorial.title;const annotations=document.createElement('span');annotations.textContent=args.tutorial.steps.map(s=>{const spec=staged.find(x=>x.spec.id===s.component_id).spec;return spec.title+'：'+spec.body;}).join('\n\n');choose.append(name,annotations);row.append(choose);list.append(row);const normal=document.createElement('li');normal.append(button('退出路径',()=>selectPath(false),'path-choice'));list.append(normal);panel.append(title,list);root.append(panel);
      const theme=document.createElement('style');theme.textContent='.launcher,.panel{left:72px;right:auto;bottom:auto;background:rgba(24,25,28,.9);color:#f2f2f4;border:1px solid rgba(255,255,255,.13);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}.launcher{color:#ffe1a1}.panel{width:min(480px,calc(100vw - 88px));max-height:55vh;padding:16px}.panel button{background:rgba(255,255,255,.06);color:#ededf1}.panel button:focus-visible,.launcher:focus-visible{outline-color:#ffc247}.path-list{list-style:none;padding:0;margin:0;display:grid;gap:8px}.path-choice{display:block;width:100%;text-align:left;padding:12px;border:1px solid rgba(255,255,255,.08)}.path-choice strong{display:block;color:#ffe1a1;margin-bottom:8px}.path-choice span{display:block;white-space:pre-wrap;font-size:12px;line-height:1.6;color:#c7c7ce}.path-choice:hover{background:rgba(255,194,71,.1)}';root.append(theme);
      launcher=button('选择路径',()=>{launcher.hidden=true;panel.hidden=false;positionControls();choose.focus();},'launcher');launcher.hidden=true;root.append(launcher);
    }
    document.documentElement.append(host);
    positionControls();
    document.addEventListener('pointerover',pointer,true);document.addEventListener('pointerout',leave,true);document.addEventListener('keydown',key,true);window.addEventListener('scroll',reflow,true);window.addEventListener('resize',reflow);
    tip.addEventListener('pointerenter',()=>clearTimeout(timer));tip.addEventListener('pointerleave',()=>{if(!pinned)timer=setTimeout(hide,180);});
    const observer=new MutationObserver(reflow);observer.observe(document.documentElement,{childList:true,subtree:true});
    function status(){return {count:staged.length,annotation_visible:!tip.hidden||pathActive,active_component:active?.spec.id||null,tutorial_step:null,tutorial_visible:panel?!panel.hidden:false,path_active:pathActive,path_annotations:pathActive?pathItems.map((p,i)=>({id:p.item.spec.id,number:i+1,available:!!resolve(p.item)})):[],components:staged.map(i=>({id:i.spec.id,available:!!resolve(i)}))};}
    function dispose(){clearTimeout(timer);observer.disconnect();document.removeEventListener('pointerover',pointer,true);document.removeEventListener('pointerout',leave,true);document.removeEventListener('keydown',key,true);window.removeEventListener('scroll',reflow,true);window.removeEventListener('resize',reflow);host.remove();}
    return {ok:true,...status()};
  }
  globalThis.PGA_HELP={inventory,register,clear,status:id=>groups.get(id)?.status()||null};
})();
