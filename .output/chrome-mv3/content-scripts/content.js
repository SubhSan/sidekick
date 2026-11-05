var content=(function(){function e(e){return e}function t(e){return new Promise(t=>{chrome.runtime.sendMessage(e,e=>{chrome.runtime.lastError?t({ok:!1,error:{code:`RUNTIME_ERROR`,message:chrome.runtime.lastError.message??`Unknown error`}}):t(e??{ok:!1,error:{code:`NO_RESPONSE`,message:`No response from background`}})})})}var n=new Set(`the.be.to.of.and.a.in.that.have.i.it.for.not.on.with.he.as.you.do.at.this.but.his.by.from.they.we.say.her.she.or.an.will.my.one.all.would.there.their.what.so.up.out.if.about.who.get.which.go.me.when.make.can.like.time.no.just.him.know.take.people.into.year.your.good.some.could.them.see.other.than.then.now.look.only.come.its.over.think.also.back.after.use.two.how.our.work.first.well.way.even.new.want.because.any.these.give.day.most.us.is.was.are.been.has.had.were.did.does.may.might.shall.should.must.need.am.being.each.every.both.few.more.many.such.here.where.very.much.own.same.still.while.too.before.between.never.under.last.long.great.little.old.right.big.high.small.large.next.early.young.important.public.bad.thing.place.case.point.fact.part.group.number.world.area.question`.split(`.`)),r=null,i=null,a=null,o=null,s=null,c=null,l=null,u=null,d=!1,f=50,p=`right`,m=`
  .sk-floating-tab {
    position: fixed;
    width: 20px;
    height: 52px;
    z-index: 2147483646;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: grab;
    user-select: none;
    transition: opacity 200ms ease;
    font-size: 14px;
    font-weight: bold;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }
  .sk-floating-tab:active {
    cursor: grabbing;
  }
  .sk-tab-left {
    left: 0;
    border-radius: 0 8px 8px 0;
  }
  .sk-tab-right {
    right: 0;
    border-radius: 8px 0 0 8px;
  }
  .sk-floating-panel {
    position: fixed;
    z-index: 2147483646;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 6px;
    width: 182px;
    box-sizing: border-box;
    border-radius: 14px;
    background: rgba(15, 17, 28, 0.92);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    opacity: 0;
    transition: opacity 250ms ease, transform 250ms ease;
    font-family: system-ui, -apple-system, sans-serif;
  }
  .sk-floating-panel.sk-visible {
    opacity: 1;
  }
  .sk-panel-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    height: 34px;
    padding: 0 10px;
    border-radius: 10px;
    border: none;
    background: transparent;
    color: rgba(255,255,255,0.75);
    cursor: pointer;
    transition: background 200ms, color 200ms, transform 150ms;
    box-sizing: border-box;
  }
  .sk-panel-btn:hover {
    background: rgba(99,102,241,0.25);
    color: #a5b4fc;
    transform: scale(1.02);
  }
  .sk-panel-btn:hover .sk-btn-label {
    color: #a5b4fc;
  }
  .sk-panel-btn:active {
    transform: scale(0.98);
  }
  .sk-btn-label {
    font-size: 12px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.85);
  }
  .sk-panel-btn.sk-success {
    color: #34d399 !important;
  }
  .sk-panel-btn.sk-success .sk-btn-label {
    color: #34d399 !important;
  }
  .sk-sel-tooltip {
    position: fixed;
    z-index: 2147483647;
    padding: 5px 10px;
    border-radius: 8px;
    background: rgba(15,17,28,0.94);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(99,102,241,0.3);
    box-shadow: 0 4px 16px rgba(0,0,0,0.4);
    color: rgba(255,255,255,0.85);
    font-size: 12px;
    font-family: system-ui, -apple-system, sans-serif;
    cursor: pointer;
    transition: opacity 200ms, transform 200ms;
    opacity: 0;
    user-select: none;
  }
  .sk-sel-tooltip.sk-visible {
    opacity: 1;
  }
  .sk-sel-tooltip:hover {
    background: rgba(99,102,241,0.3);
    border-color: rgba(99,102,241,0.5);
  }
  .sk-jargon-tooltip {
    position: fixed;
    z-index: 2147483647;
    max-width: 280px;
    padding: 8px 12px;
    border-radius: 10px;
    background: rgba(15,17,28,0.95);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(99,102,241,0.2);
    box-shadow: 0 6px 24px rgba(0,0,0,0.5);
    color: rgba(255,255,255,0.8);
    font-size: 12px;
    font-family: system-ui, -apple-system, sans-serif;
    line-height: 1.5;
    opacity: 0;
    transition: opacity 250ms;
    pointer-events: none;
  }
  .sk-jargon-tooltip.sk-visible {
    opacity: 1;
  }
  .sk-jargon-title {
    font-weight: 600;
    color: #a5b4fc;
    margin-bottom: 2px;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .sk-toast {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2147483647;
    padding: 8px 18px;
    border-radius: 10px;
    background: rgba(99,102,241,0.9);
    color: white;
    font-size: 13px;
    font-weight: 500;
    font-family: system-ui, sans-serif;
    box-shadow: 0 4px 16px rgba(0,0,0,0.4);
    opacity: 0;
    transition: opacity 300ms;
  }
  .sk-toast.sk-visible { opacity: 1; }
`,h={readLater:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,reader:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,bookmark:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/><line x1="12" y1="8" x2="12" y2="14"/><line x1="9" y1="11" x2="15" y2="11"/></svg>`,group:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,dedupe:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="13" height="13" rx="2"/><path d="M4 8a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2"/><line x1="8" y1="8.5" x2="17" y2="8.5"/></svg>`,screenshot:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,sparkle:`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>`,sidekick:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`};function g(e){if(!s)return;let t=document.createElement(`div`);t.className=`sk-toast`,t.textContent=e,s.appendChild(t),requestAnimationFrame(()=>t.classList.add(`sk-visible`)),setTimeout(()=>{t.classList.remove(`sk-visible`),setTimeout(()=>t.remove(),300)},2500)}function _(e){e.classList.add(`sk-success`),setTimeout(()=>e.classList.remove(`sk-success`),1500)}function v(e,t,n){let r=document.createElement(`button`);return r.className=`sk-panel-btn`,r.innerHTML=`${e}<span class="sk-btn-label">${t}</span>`,r.addEventListener(`click`,e=>{e.stopPropagation(),y(),n(r)}),r}function y(){c&&clearTimeout(c),c=setTimeout(()=>{D()},4e3)}function b(){return(document.body?.innerText||``).split(/\s+/).slice(0,40).join(` `)}function x(){let e=document.createElement(`div`);return e.className=`sk-floating-panel`,e.appendChild(v(h.readLater,`Read Later`,async e=>{let n=b();(await t({type:`READ_LATER_SAVE`,payload:{url:location.href,title:document.title||location.href,excerpt:n,favicon:``}})).ok?(_(e),g(`Saved to Read Later`)):g(`Failed to save`)})),e.appendChild(v(h.reader,`Reading Mode`,async e=>{(await t({type:`OPEN_READER`,payload:{url:location.href}})).ok?_(e):g(`Could not extract article`)})),e.appendChild(v(h.bookmark,`Bookmark`,async e=>{let n=await t({type:`BOOKMARK_PAGE`,payload:{url:location.href,title:document.title}});n.ok?(_(e),g(`Bookmarked!`)):g(n.error?.message||`Already bookmarked`)})),e.appendChild(v(h.group,`Group Tabs`,async e=>{(await t({type:`TABS_GROUP`})).ok&&(_(e),g(`Tabs grouped`))})),e.appendChild(v(h.dedupe,`Dedupe Tabs`,async e=>{(await t({type:`TABS_DEDUPE`})).ok&&(_(e),g(`Duplicates closed`))})),e.appendChild(v(h.screenshot,`Screenshot`,async e=>{(await t({type:`SCREENSHOT`})).ok?(_(e),g(`Screenshot saved`)):g(`Screenshot failed`)})),e}function S(){!i||!r||(i.style.top=`${f}%`,i.style.transform=`translateY(-50%)`,p===`left`?(i.className=`sk-floating-tab sk-tab-left`,i.textContent=`›`,i.style.left=`0`,i.style.right=`auto`):(i.className=`sk-floating-tab sk-tab-right`,i.textContent=`‹`,i.style.right=`0`,i.style.left=`auto`),r.style.top=`${f}%`,p===`left`?(r.style.left=`8px`,r.style.right=`auto`,r.style.transform=`translateY(-50%)`):(r.style.right=`8px`,r.style.left=`auto`,r.style.transform=`translateY(-50%)`))}function C(e){d=!0,document.addEventListener(`mousemove`,w),document.addEventListener(`mouseup`,T),e.preventDefault()}function w(e){if(!d)return;let t=e.clientY/window.innerHeight*100,n=Math.min(Math.max(t,5),95);i&&(i.style.top=`${n}%`,i.style.transform=`translateY(-50%)`)}function T(e){if(!d)return;d=!1,document.removeEventListener(`mousemove`,w),document.removeEventListener(`mouseup`,T);let t=e.clientX<window.innerWidth/2?`left`:`right`,n=e.clientY/window.innerHeight*100,r=Math.min(Math.max(n,5),95);p=t,f=r,localStorage.setItem(`sk-assistant-edge`,t),localStorage.setItem(`sk-assistant-y`,String(r)),S()}function E(){d||(i&&(i.style.display=`none`),r&&(r.style.display=`flex`,requestAnimationFrame(()=>{r.classList.add(`sk-visible`)})),y())}function D(){r&&(r.classList.remove(`sk-visible`),setTimeout(()=>{r&&!r.classList.contains(`sk-visible`)&&(r.style.display=`none`,i&&(i.style.display=`flex`))},250))}function O(){E()}function k(){o=document.createElement(`div`),o.id=`sidekick-host`,o.style.cssText=`all: initial; position: fixed; top: 0; left: 0; width: 0; height: 0; z-index: 2147483646; pointer-events: none;`,document.documentElement.appendChild(o),s=o.attachShadow({mode:`open`});let e=document.createElement(`style`);e.textContent=m,s.appendChild(e),i=document.createElement(`div`),i.style.pointerEvents=`auto`,s.appendChild(i),r=x(),r.style.pointerEvents=`auto`,r.style.display=`none`,s.appendChild(r);let t=localStorage.getItem(`sk-assistant-edge`),n=localStorage.getItem(`sk-assistant-y`);if((t===`left`||t===`right`)&&(p=t),n){let e=parseFloat(n);isNaN(e)||(f=e)}S(),i.addEventListener(`mouseenter`,E),i.addEventListener(`click`,E),i.addEventListener(`mousedown`,C),r.addEventListener(`mouseenter`,()=>{c&&clearTimeout(c)}),r.addEventListener(`mouseleave`,y)}function A(e){s&&setTimeout(()=>{let n=window.getSelection()?.toString().trim()||``;if(a&&=(a.remove(),null),n.length<5||n.length>2e3){n.length>=5&&O();return}O(),a=document.createElement(`div`),a.className=`sk-sel-tooltip`,a.innerHTML=`${h.sparkle} Explain Selection`,a.style.left=`${Math.min(e.clientX+8,window.innerWidth-160)}px`,a.style.top=`${Math.max(e.clientY-40,8)}px`,a.style.pointerEvents=`auto`,a.style.display=`flex`,a.style.alignItems=`center`,a.style.gap=`5px`,a.addEventListener(`click`,async()=>{let r=await t({type:`AI_EXPLAIN`,payload:{text:n,pageTitle:document.title,url:location.href}});r.ok&&r.data?j(e.clientX,e.clientY,`Explanation`,String(r.data)):j(e.clientX,e.clientY,`AI Mode Required`,`Enable AI Mode in Settings and add your Groq API key to use this feature.`),a?.remove(),a=null}),s.appendChild(a),requestAnimationFrame(()=>a?.classList.add(`sk-visible`)),setTimeout(()=>{a&&(a.classList.remove(`sk-visible`),setTimeout(()=>{a?.remove(),a=null},200))},5e3)},10)}function j(e,t,n,r){s&&(u&&=(u.remove(),null),u=document.createElement(`div`),u.className=`sk-jargon-tooltip`,u.style.left=`${Math.min(e+12,window.innerWidth-300)}px`,u.style.top=`${Math.max(t-10,8)}px`,u.style.pointerEvents=`auto`,u.innerHTML=`<div class="sk-jargon-title">${n}</div><div>${r}</div>`,s.appendChild(u),requestAnimationFrame(()=>u?.classList.add(`sk-visible`)),setTimeout(()=>{u&&(u.classList.remove(`sk-visible`),setTimeout(()=>{u?.remove(),u=null},250))},8e3))}function M(e){if(!e.altKey){l&&=(clearTimeout(l),null);return}l&&clearTimeout(l),l=setTimeout(()=>{let r=document.elementFromPoint(e.clientX,e.clientY);if(!r||!r.textContent)return;let i=``,a=``,o=document.caretRangeFromPoint?.(e.clientX,e.clientY);if(o){let e=o.startContainer;if(e.nodeType===Node.TEXT_NODE){let t=e.textContent||``,n=o.startOffset,r=n,s=n;for(;r>0&&/\w/.test(t[r-1]);)r--;for(;s<t.length&&/\w/.test(t[s]);)s++;i=t.slice(r,s).toLowerCase();let c=Math.max(0,t.lastIndexOf(`.`,r)+1),l=t.indexOf(`.`,s);a=t.slice(c,l>0?l+1:t.length).trim().slice(0,200)}}!i||i.length<3||n.has(i)||t({type:`AI_JARGON`,payload:{term:i,sentenceContext:a}}).then(t=>{t.ok&&t.data?j(e.clientX,e.clientY,i,String(t.data)):j(e.clientX,e.clientY,`AI Mode Required`,`Enable AI Mode in Settings and add your Groq API key to use this feature.`)})},600)}function N(e){e.key===`Alt`&&(l&&=(clearTimeout(l),null),u&&(u.classList.remove(`sk-visible`),setTimeout(()=>{u?.remove(),u=null},250)))}function P(){chrome.runtime.onMessage.addListener((e,t,n)=>{if(e.type===`EXTRACT_ARTICLE`){try{if(typeof Readability<`u`){let e=document.cloneNode(!0);n(new Readability(e).parse())}else n(F())}catch{n(null)}return!0}if(e.type===`EXTRACT_TEXT`)return n({text:document.body?.innerText||``}),!0;if(e.type===`GET_EXCERPT`)return n({excerpt:b(),title:document.title,url:location.href}),!0})}function F(){let e=document.querySelectorAll(`article, [role="main"], main, .post-content, .entry-content, .article-body`),t=null,n=0;for(let r of e){let e=(r.textContent||``).length;e>n&&(t=r,n=e)}if(!t||n<500){let e=document.body?.innerText||``;return e.length<500?null:{title:document.title,content:document.body.innerHTML,textContent:e,length:e.length}}return{title:document.title,content:t.innerHTML,textContent:t.textContent||``,length:n}}var I=e({matches:[`<all_urls>`],main(){location.protocol===`chrome-extension:`||location.protocol===`chrome:`||(console.log(`Sidekick content script loaded.`),k(),L(),document.addEventListener(`mouseup`,A),document.addEventListener(`mousemove`,M),document.addEventListener(`keyup`,N),P(),document.addEventListener(`mousedown`,e=>{a&&(a.classList.remove(`sk-visible`),setTimeout(()=>{a?.remove(),a=null},200))}))}});async function L(){let e=await t({type:`GET_PASS_STATE`});if(!e.ok||!e.data||!e.data.active)return;let{expiresAt:n}=e.data;if(Date.now()>=n)return;let r=300*1e3,i=s||document.body,a=document.createElement(`div`);a.style.cssText=`
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 2147483645;
    background: rgba(15,15,20,0.92); color: white; font-family: system-ui, sans-serif;
    display: flex; flex-direction: column; pointer-events: auto;
  `;let o=document.createElement(`div`);o.style.cssText=`
    display: flex; justify-content: space-between; align-items: center;
    padding: 6px 16px; font-size: 13px; font-weight: 500;
  `;let c=document.createElement(`span`);c.textContent=`Focus pass active`;let l=document.createElement(`span`);l.style.cssText=`font-family: monospace; color: #60a5fa; font-size: 14px;`;let u=document.createElement(`div`);u.style.cssText=`width: 100%; height: 3px; background: rgba(255,255,255,0.1); position: relative;`;let d=document.createElement(`div`);d.style.cssText=`
    position: absolute; top: 0; left: 0; height: 100%; background: #2563eb;
    transition: width 1s linear; width: 0%;
  `,o.appendChild(c),o.appendChild(l),u.appendChild(d),a.appendChild(o),a.appendChild(u),i.appendChild(a);function f(){let e=n-Date.now();if(e<=0){a.remove(),clearInterval(p);return}let t=Math.floor(e/6e4),i=Math.floor(e%6e4/1e3);l.textContent=`${t.toString().padStart(2,`0`)}:${i.toString().padStart(2,`0`)}`;let o=(r-e)/r*100;d.style.width=`${Math.min(100,Math.max(0,o))}%`}f();let p=setInterval(f,1e3)}var R={debug:(...e)=>([...e],void 0),log:(...e)=>([...e],void 0),warn:(...e)=>([...e],void 0),error:(...e)=>([...e],void 0)},z=globalThis.browser?.runtime?.id?globalThis.browser:globalThis.chrome,B=class e extends Event{static EVENT_NAME=V(`wxt:locationchange`);constructor(t,n){super(e.EVENT_NAME,{}),this.newUrl=t,this.oldUrl=n}};function V(e){return`${z?.runtime?.id}:content:${e}`}var H=typeof globalThis.navigation?.addEventListener==`function`;function U(e){let t,n=!1;return{run(){n||(n=!0,t=new URL(location.href),H?globalThis.navigation.addEventListener(`navigate`,e=>{let n=new URL(e.destination.url);n.href!==t.href&&(window.dispatchEvent(new B(n,t)),t=n)},{signal:e.signal}):e.setInterval(()=>{let e=new URL(location.href);e.href!==t.href&&(window.dispatchEvent(new B(e,t)),t=e)},1e3))}}}var W=class e{static SCRIPT_STARTED_MESSAGE_TYPE=V(`wxt:content-script-started`);id;abortController;locationWatcher=U(this);constructor(e,t){this.contentScriptName=e,this.options=t,this.id=Math.random().toString(36).slice(2),this.abortController=new AbortController,this.stopOldScripts(),this.listenForNewerScripts()}get signal(){return this.abortController.signal}abort(e){return this.abortController.abort(e)}get isInvalid(){return z.runtime?.id??this.notifyInvalidated(),this.signal.aborted}get isValid(){return!this.isInvalid}onInvalidated(e){return this.signal.addEventListener(`abort`,e),()=>this.signal.removeEventListener(`abort`,e)}block(){return new Promise(()=>{})}setInterval(e,t){let n=setInterval(()=>{this.isValid&&e()},t);return this.onInvalidated(()=>clearInterval(n)),n}setTimeout(e,t){let n=setTimeout(()=>{this.isValid&&e()},t);return this.onInvalidated(()=>clearTimeout(n)),n}requestAnimationFrame(e){let t=requestAnimationFrame((...t)=>{this.isValid&&e(...t)});return this.onInvalidated(()=>cancelAnimationFrame(t)),t}requestIdleCallback(e,t){let n=requestIdleCallback((...t)=>{this.signal.aborted||e(...t)},t);return this.onInvalidated(()=>cancelIdleCallback(n)),n}addEventListener(e,t,n,r){t===`wxt:locationchange`&&this.isValid&&this.locationWatcher.run(),e.addEventListener?.(t.startsWith(`wxt:`)?V(t):t,n,{...r,signal:this.signal})}notifyInvalidated(){this.abort(`Content script context invalidated`),R.debug(`Content script "${this.contentScriptName}" context invalidated`)}stopOldScripts(){document.dispatchEvent(new CustomEvent(e.SCRIPT_STARTED_MESSAGE_TYPE,{detail:{contentScriptName:this.contentScriptName,messageId:this.id}})),this.options?.noScriptStartedPostMessage||window.postMessage({type:e.SCRIPT_STARTED_MESSAGE_TYPE,contentScriptName:this.contentScriptName,messageId:this.id},`*`)}verifyScriptStartedEvent(e){let t=e.detail?.contentScriptName===this.contentScriptName,n=e.detail?.messageId===this.id;return t&&!n}listenForNewerScripts(){let t=e=>{!(e instanceof CustomEvent)||!this.verifyScriptStartedEvent(e)||this.notifyInvalidated()};document.addEventListener(e.SCRIPT_STARTED_MESSAGE_TYPE,t),this.onInvalidated(()=>document.removeEventListener(e.SCRIPT_STARTED_MESSAGE_TYPE,t))}},G={debug:(...e)=>([...e],void 0),log:(...e)=>([...e],void 0),warn:(...e)=>([...e],void 0),error:(...e)=>([...e],void 0)};return(async()=>{try{let{main:e,...t}=I;return await e(new W(`content`,t))}catch(e){throw G.error(`The content script "content" crashed on startup!`,e),e}})()})();
content;