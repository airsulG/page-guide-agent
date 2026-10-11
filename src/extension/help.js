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
      if(pinned)return;
      clearTimeout(timer);
      const path=event.composedPath();const item=staged.filter(i=>path.includes(i.element)).sort((a,b)=>path.indexOf(a.element)-path.indexOf(b.element))[0];
      if(item){if(active!==item)show(item);return;}
      if(!pinned)timer=setTimeout(hide,180);
    }
    function leave(event){if(!event.relatedTarget&&!pinned)hide();}
    function reflow(){if(!active)return;const el=resolve(active);if(!el){hide();return;}const r=el.getBoundingClientRect();if(r.bottom<=0||r.top>=innerHeight||r.right<=0||r.left>=innerWidth)hide();else position(el);}
    function key(event){if(event.key==='Escape'){hide();if(panel&&!panel.hidden){panel.hidden=true;launcher.hidden=false;launcher.focus();}}}
    let panel,launcher,picker,heading,action,expected,progress,previous,next,note;
    function button(text,fn,cls=''){const b=document.createElement('button');b.type='button';b.textContent=text;b.className=cls;b.addEventListener('click',fn);return b;}
    function current(){return args.tutorial.steps[step];}
    function render(){
      const s=current();picker.value=String(step);progress.textContent='步骤 '+(step+1)+' / '+args.tutorial.steps.length;heading.textContent=s.title;action.textContent=s.action;expected.textContent='检查结果：'+s.expected;previous.disabled=step===0;next.disabled=step===args.tutorial.steps.length-1;note.textContent='选择下一步表示你继续查看教程，完成情况以网页实际结果为准。';locateStep();
    }
    function locateStep(){
      const item=staged.find(i=>i.spec.id===current().component_id),el=resolve(item);
      if(!el){note.textContent='这个组件已改变或暂未显示。请回到 Codex 重新观察页面。';hide();return;}
      el.scrollIntoView?.({block:'center',behavior:'instant'});show(item,true);badge.textContent=String(step+1);badge.setAttribute('aria-label','教程步骤 '+(step+1));badge.hidden=false;tipTitle.textContent=(step+1)+'. '+item.spec.title;note.textContent=item.spec.title+'：'+item.spec.body;
    }
    if(args.tutorial){
      panel=document.createElement('section');panel.className='panel';panel.setAttribute('role','region');panel.setAttribute('aria-label',args.tutorial.title);
      panel.append(button('收起',()=>{panel.hidden=true;launcher.hidden=false;hide();launcher.focus();},'close'));
      const title=document.createElement('h2');title.textContent=args.tutorial.title;const goal=document.createElement('p');goal.textContent=args.tutorial.goal;
      progress=document.createElement('p');progress.className='muted';progress.setAttribute('aria-live','polite');
      picker=document.createElement('select');picker.className='picker';picker.setAttribute('aria-label','选择教程步骤');
      args.tutorial.steps.forEach((s,i)=>{const o=document.createElement('option');o.value=String(i);o.textContent=(i+1)+'. '+s.title;picker.append(o);});
      picker.addEventListener('change',()=>{step=Number(picker.value);hide();render();});
      heading=document.createElement('h3');action=document.createElement('p');expected=document.createElement('p');note=document.createElement('p');note.className='muted';note.setAttribute('role','status');
      const nav=document.createElement('div');nav.className='nav';previous=button('上一步',()=>{step--;hide();render();});next=button('下一步',()=>{step++;hide();render();},'primary');
      nav.append(previous,button('找到组件并阅读说明',locateStep),next);panel.append(title,goal,progress,picker,heading,action,expected,note,nav);root.append(panel);
      launcher=button('打开教程',()=>{launcher.hidden=true;panel.hidden=false;render();picker.focus();},'launcher');launcher.hidden=true;root.append(launcher);
    }
    document.documentElement.append(host);
    if(args.tutorial)render();
    document.addEventListener('pointerover',pointer,true);document.addEventListener('pointerout',leave,true);document.addEventListener('keydown',key,true);window.addEventListener('scroll',reflow,true);window.addEventListener('resize',reflow);
    tip.addEventListener('pointerenter',()=>clearTimeout(timer));tip.addEventListener('pointerleave',()=>{if(!pinned)timer=setTimeout(hide,180);});
    const observer=new MutationObserver(reflow);observer.observe(document.documentElement,{childList:true,subtree:true});
    function status(){return {count:staged.length,annotation_visible:!tip.hidden,active_component:active?.spec.id||null,tutorial_step:args.tutorial?step+1:null,tutorial_visible:panel?!panel.hidden:false,components:staged.map(i=>({id:i.spec.id,available:!!resolve(i)}))};}
    function dispose(){clearTimeout(timer);observer.disconnect();document.removeEventListener('pointerover',pointer,true);document.removeEventListener('pointerout',leave,true);document.removeEventListener('keydown',key,true);window.removeEventListener('scroll',reflow,true);window.removeEventListener('resize',reflow);host.remove();}
    return {ok:true,...status()};
  }
  globalThis.PGA_HELP={inventory,register,clear,status:id=>groups.get(id)?.status()||null};
})();
