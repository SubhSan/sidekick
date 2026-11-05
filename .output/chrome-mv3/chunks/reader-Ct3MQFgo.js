import{a as e,c as t,n,o as r,r as i,t as a}from"./tailwind-CyKhXyxI.js";import{t as o}from"./clock-CnAEHHhU.js";import{t as s}from"./plus-1UUgo5BX.js";var c=n(`arrow-left`,[[`path`,{d:`m12 19-7-7 7-7`,key:`1l729n`}],[`path`,{d:`M19 12H5`,key:`x3x0zl`}]]),l=n(`book-open`,[[`path`,{d:`M12 7v14`,key:`1akyts`}],[`path`,{d:`M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z`,key:`ruj8y`}]]),u=n(`minus`,[[`path`,{d:`M5 12h14`,key:`1ays0h`}]]),d=n(`type`,[[`path`,{d:`M12 4v16`,key:`1654pz`}],[`path`,{d:`M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2`,key:`e0r10z`}],[`path`,{d:`M9 20h6`,key:`s66wpe`}]]),f=t(e()),p=t(r()),m=i();function h(){let[e,t]=(0,p.useState)(null),[n,r]=(0,p.useState)(`serif`),[i,a]=(0,p.useState)(18),[f,h]=(0,p.useState)(!0),[g,_]=(0,p.useState)(``);(0,p.useEffect)(()=>{let e=new URLSearchParams(location.search).get(`slot`);if(!e){_(`No article slot specified`),h(!1);return}chrome.storage.local.get(e,n=>{let r=n[e];r?t(r):_(`Article not found. It may have been cleared.`),h(!1)})},[]);let v=(0,p.useMemo)(()=>{if(!e)return 0;let t=e.textContent.split(/\s+/).length;return Math.max(1,Math.ceil(t/200))},[e]),y=(0,p.useMemo)(()=>e?e.textContent.split(/\s+/).length:0,[e]);return f?(0,m.jsx)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`center`,minHeight:`100vh`,background:`var(--bg, #0f111a)`,color:`var(--fg, #e2e8f0)`,fontFamily:`system-ui, sans-serif`},children:(0,m.jsxs)(`div`,{style:{textAlign:`center`},children:[(0,m.jsx)(l,{size:32,style:{opacity:.4,marginBottom:12}}),(0,m.jsx)(`p`,{style:{opacity:.5,fontSize:14},children:`Loading article...`})]})}):g||!e?(0,m.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,minHeight:`100vh`,background:`var(--bg, #0f111a)`,color:`var(--fg, #e2e8f0)`,fontFamily:`system-ui, sans-serif`,gap:16},children:[(0,m.jsx)(l,{size:32,style:{opacity:.4}}),(0,m.jsx)(`p`,{style:{opacity:.6,fontSize:14},children:g||`No article found`}),(0,m.jsxs)(`button`,{onClick:()=>history.back(),style:{display:`flex`,alignItems:`center`,gap:6,background:`rgba(99,102,241,0.2)`,border:`1px solid rgba(99,102,241,0.3)`,borderRadius:8,padding:`8px 16px`,color:`#a5b4fc`,cursor:`pointer`,fontSize:13,fontWeight:500},children:[(0,m.jsx)(c,{size:14}),` Go Back`]})]}):(0,m.jsxs)(`div`,{style:{minHeight:`100vh`,background:`var(--bg, #0f111a)`,color:`var(--fg, #e2e8f0)`,fontFamily:`system-ui, sans-serif`},children:[(0,m.jsxs)(`div`,{style:{position:`sticky`,top:0,zIndex:10,display:`flex`,alignItems:`center`,gap:12,padding:`10px 24px`,background:`rgba(15,17,26,0.85)`,backdropFilter:`blur(12px)`,WebkitBackdropFilter:`blur(12px)`,borderBottom:`1px solid rgba(255,255,255,0.05)`},children:[(0,m.jsxs)(`button`,{onClick:()=>{e.sourceUrl?location.href=e.sourceUrl:history.back()},style:{display:`flex`,alignItems:`center`,gap:4,background:`none`,border:`none`,color:`rgba(255,255,255,0.6)`,cursor:`pointer`,fontSize:12,fontWeight:500,padding:`4px 8px`,borderRadius:6,transition:`background 200ms`},onMouseEnter:e=>e.currentTarget.style.background=`rgba(255,255,255,0.05)`,onMouseLeave:e=>e.currentTarget.style.background=`none`,children:[(0,m.jsx)(c,{size:14}),`Return to page`]}),(0,m.jsx)(`div`,{style:{flex:1}}),(0,m.jsxs)(`button`,{onClick:()=>r(e=>e===`serif`?`sans-serif`:`serif`),style:{display:`flex`,alignItems:`center`,gap:4,background:`rgba(255,255,255,0.05)`,border:`1px solid rgba(255,255,255,0.08)`,borderRadius:6,padding:`4px 10px`,color:`rgba(255,255,255,0.7)`,cursor:`pointer`,fontSize:11,fontWeight:500},children:[(0,m.jsx)(d,{size:13}),n===`serif`?`Serif`:`Sans`]}),(0,m.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:4},children:[(0,m.jsx)(`button`,{onClick:()=>a(e=>Math.max(14,e-1)),style:{display:`flex`,alignItems:`center`,justifyContent:`center`,width:26,height:26,borderRadius:6,background:`rgba(255,255,255,0.05)`,border:`1px solid rgba(255,255,255,0.08)`,color:`rgba(255,255,255,0.6)`,cursor:`pointer`},children:(0,m.jsx)(u,{size:12})}),(0,m.jsx)(`span`,{style:{fontSize:11,opacity:.5,width:28,textAlign:`center`},children:i}),(0,m.jsx)(`button`,{onClick:()=>a(e=>Math.min(28,e+1)),style:{display:`flex`,alignItems:`center`,justifyContent:`center`,width:26,height:26,borderRadius:6,background:`rgba(255,255,255,0.05)`,border:`1px solid rgba(255,255,255,0.08)`,color:`rgba(255,255,255,0.6)`,cursor:`pointer`},children:(0,m.jsx)(s,{size:12})})]})]}),(0,m.jsxs)(`article`,{style:{maxWidth:680,margin:`0 auto`,padding:`48px 24px 80px`},children:[(0,m.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:12,marginBottom:24,fontSize:12,opacity:.45},children:[(0,m.jsxs)(`span`,{style:{display:`flex`,alignItems:`center`,gap:4},children:[(0,m.jsx)(o,{size:12}),` `,v,` min read`]}),(0,m.jsx)(`span`,{children:`•`}),(0,m.jsxs)(`span`,{children:[y.toLocaleString(),` words`]}),e.sourceUrl&&(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(`span`,{children:`•`}),(0,m.jsx)(`a`,{href:e.sourceUrl,style:{color:`#a5b4fc`,textDecoration:`none`},target:`_blank`,rel:`noreferrer`,children:new URL(e.sourceUrl).hostname})]})]}),(0,m.jsx)(`h1`,{style:{fontSize:Math.round(i*1.8),fontWeight:700,lineHeight:1.2,marginBottom:32,fontFamily:n===`serif`?`Georgia, "Times New Roman", serif`:`system-ui, sans-serif`},children:e.title}),(0,m.jsx)(`div`,{dangerouslySetInnerHTML:{__html:e.content},style:{fontSize:i,lineHeight:1.75,fontFamily:n===`serif`?`Georgia, "Times New Roman", serif`:`system-ui, sans-serif`,color:`rgba(255,255,255,0.82)`,wordWrap:`break-word`,overflowWrap:`break-word`},className:`sk-reader-content`})]}),(0,m.jsx)(`style`,{children:`
        .sk-reader-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 16px 0;
        }
        .sk-reader-content a {
          color: #818cf8;
          text-decoration: underline;
          text-decoration-color: rgba(129,140,248,0.3);
          text-underline-offset: 2px;
        }
        .sk-reader-content a:hover {
          text-decoration-color: rgba(129,140,248,0.7);
        }
        .sk-reader-content h2, .sk-reader-content h3, .sk-reader-content h4 {
          margin-top: 32px;
          margin-bottom: 12px;
          font-weight: 600;
          color: rgba(255,255,255,0.9);
        }
        .sk-reader-content h2 { font-size: 1.5em; }
        .sk-reader-content h3 { font-size: 1.25em; }
        .sk-reader-content p {
          margin-bottom: 16px;
        }
        .sk-reader-content blockquote {
          border-left: 3px solid rgba(99,102,241,0.4);
          padding-left: 16px;
          margin: 16px 0;
          color: rgba(255,255,255,0.65);
          font-style: italic;
        }
        .sk-reader-content pre, .sk-reader-content code {
          background: rgba(255,255,255,0.05);
          border-radius: 6px;
          font-size: 0.9em;
        }
        .sk-reader-content pre {
          padding: 16px;
          overflow-x: auto;
          margin: 16px 0;
        }
        .sk-reader-content code {
          padding: 2px 6px;
        }
        .sk-reader-content ul, .sk-reader-content ol {
          padding-left: 24px;
          margin-bottom: 16px;
        }
        .sk-reader-content li {
          margin-bottom: 6px;
        }
        .sk-reader-content figure {
          margin: 24px 0;
          text-align: center;
        }
        .sk-reader-content figcaption {
          font-size: 0.85em;
          color: rgba(255,255,255,0.4);
          margin-top: 8px;
        }
        .sk-reader-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
        }
        .sk-reader-content th, .sk-reader-content td {
          border: 1px solid rgba(255,255,255,0.1);
          padding: 8px 12px;
          text-align: left;
        }
        .sk-reader-content th {
          background: rgba(255,255,255,0.05);
          font-weight: 600;
        }
      `})]})}f.createRoot(document.getElementById(`root`)).render((0,m.jsx)(p.StrictMode,{children:(0,m.jsx)(a,{children:(0,m.jsx)(h,{})})}));