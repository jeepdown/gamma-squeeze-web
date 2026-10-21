// ---------- State ----------
const STORE_KEY = 'gs_app_v5';
function freshState(){
  return {
    role:'guest', plan:null, userName:null, onboarded:false,
    interests:['期权','美股'], watchlist:['SPX','VIX','QQQ'],
    bookmarks:[], alerts:[], newsletter:null, follows:[], fontScale:0,
    notif:{snap:true, alert:true, research:true, reply:false},
    comments:JSON.parse(JSON.stringify(SEED_COMMENTS)), disc:JSON.parse(JSON.stringify(SEED_DISC)),
    liked:{}, queue:JSON.parse(JSON.stringify(SEED_QUEUE)), keywords:DEFAULT_KEYWORDS.slice(), banned:[],
    snapshots:SEED_SNAPSHOTS.map(s=>({...s, status:'sched', auto:true})), forcePub:[], polPending:[], seenSnaps:[], simTime:null,
    radar:SEED_RADAR.map(r=>({...r, used:false})), draft:null, autoPaused:false,
    artCfg:{}, pricing:{monthly:29, annual:199, eliteM:49, eliteA:399},
    referral:'GS-'+Math.random().toString(36).slice(2,8).toUpperCase(),
    events:[], purchases:[], bookCfg:{},
    notifs:JSON.parse(JSON.stringify(SEED_NOTIFS)), followThreads:['gamma-earnings'], perms:JSON.parse(JSON.stringify(MOD_DEFAULT)), team:MOD_TEAM.map(x=>x.slice()),
  };
}
let S = freshState();
try{ const raw = localStorage.getItem(STORE_KEY); if(raw){ S = Object.assign(freshState(), JSON.parse(raw)); } }catch(e){}
// Round 10 (Ed): subscription priced in USD; move saved demo prices off the old yuan defaults.
if(S.pricing && S.pricing.monthly===98 && S.pricing.annual===888) S.pricing={monthly:29, annual:199, eliteM:49, eliteA:399};
function save(){ try{ localStorage.setItem(STORE_KEY, JSON.stringify(S)); }catch(e){} }

// UI state (not persisted)
const U = { bfilter:'all', bed:'zh', bfmt:'PDF', route:'home', stack:[], chan:'今日', range:'1D', ttab:'概览', csort:'best', rtab:'全部', qfilter:'all', qsel:'q1', asec:'stats', bill:'annual', replyTo:null, search:'' };

// ---------- Utils ----------
const $ = (s,el=document)=>el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isPro = ()=> S.role==='pro' || S.role==='elite' || S.role==='admin';
const isElite = ()=> S.role==='elite' || S.role==='admin';
const isUser = ()=> S.role!=='guest';
const uname = ()=> S.userName || (S.role==='admin'?'编辑部':'我');
function track(name, meta={}){ S.events.push({n:name, m:meta, t:Date.now()}); if(S.events.length>800) S.events.splice(0, S.events.length-800); save(); }
function cnt(name, pred){ return S.events.filter(e=>e.n===name && (!pred || pred(e))).length; }
function fmtNum(v, dec=2){ return v.toLocaleString('en-US',{minimumFractionDigits:dec, maximumFractionDigits:dec}); }
function quote(sym){ const q = SYMS[sym]; const px = LIVE[sym]; const ch = px - q.prev; const pct = ch/q.prev*100; return {px, ch, pct, up: ch>=0}; }
function pxText(sym){ const q=SYMS[sym], v=quote(sym); return q.yield ? v.px.toFixed(2)+'%' : fmtNum(v.px, q.dec); }
function chText(sym){ const q=SYMS[sym], v=quote(sym); const a = v.up?'▲':'▼'; if(q.yield){ const bp=Math.round(v.ch*100); return `${a} ${bp>=0?'+':'−'}${Math.abs(bp)}bp`; } return `${a} ${v.pct>=0?'+':'−'}${Math.abs(v.pct).toFixed(2)}%`; }
function chFull(sym){ const q=SYMS[sym], v=quote(sym); const a=v.up?'▲':'▼'; if(q.yield) return chText(sym); return `${a} ${v.ch>=0?'+':'−'}${fmtNum(Math.abs(v.ch),q.dec)} (${v.pct>=0?'+':'−'}${Math.abs(v.pct).toFixed(2)}%)`; }
const symLabel = s => SYMS[s].label || s;
function etParts(){ try{ const p = new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date()); const h=p.find(x=>x.type==='hour').value, m=p.find(x=>x.type==='minute').value; return (h==='24'?'00':h)+':'+m; }catch(e){ return '10:00'; } }
function nextSlot(){ return nextSnap(); }
function todayCN(){ const d=new Date(); const w='日一二三四五六'[d.getDay()]; return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 星期${w}`; }
function rng(seed){ let a = seed>>>0; return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function hash(s){ let h=2166136261; for(const c of s){ h^=c.charCodeAt(0); h=Math.imul(h,16777619); } return h>>>0; }
function articleCfg(id){ const a=ARTICLES.find(x=>x.id===id); const c=S.artCfg[id]||{}; return {free: c.free ?? a.free, comments: c.comments ?? true}; }
function annualSave(){ const m=S.pricing.monthly*12; return Math.round((1 - S.pricing.annual/m)*100); }

// ---------- Live (simulated) prices ----------
const LIVE = {}; Object.keys(SYMS).forEach(k=> LIVE[k]=SYMS[k].px);
function tick(){
  const r = Math.random;
  const before = {...LIVE};
  Object.keys(SYMS).forEach(k=>{ const q=SYMS[k]; const vol = q.yield?0.0004:(k==='VIX'?0.0018:0.00035); LIVE[k] = +(LIVE[k]*(1+(r()-0.5)*2*vol)).toFixed(q.yield?3:2); });
  document.querySelectorAll('[data-q]').forEach(el=>{
    const sym = el.dataset.q, f = el.dataset.f; if(!SYMS[sym] || el.closest('.scrubbing')) return;
    const v = quote(sym);
    if(f==='px'){ const t=pxText(sym); if(el.textContent!==t){ el.textContent=t; flashEl(el, LIVE[sym]>=before[sym]); } }
    else { el.textContent = f==='full'? chFull(sym) : chText(sym); el.classList.toggle('up', v.up); el.classList.toggle('down', !v.up); }
  });
  document.querySelectorAll('[data-clock]').forEach(c=>c.textContent=etParts());
  checkAlerts();
}
setInterval(tick, 5000);

// ---------- Gamma model (synthetic open interest) ----------
const GCACHE = {};
function gamma(sym){
  if(GCACHE[sym]) return GCACHE[sym];
  const q = SYMS[sym]; const spot=q.px, st=q.step; const n = 28;
  const k0 = Math.round(spot/st)*st - st*Math.floor(n/2);
  const rows=[];
  for(let i=0;i<n;i++){
    const k = +(k0+i*st).toFixed(2);
    const call = q.A*Math.exp(-Math.pow((k-(spot+q.cc))/q.w,2))*(1+0.28*Math.sin(i*1.7));
    const put  = q.B*Math.exp(-Math.pow((k-(spot+q.pc))/(q.w*1.1),2))*(1+0.22*Math.cos(i*1.3));
    rows.push({k, g:+(call-put).toFixed(4)});
  }
  let flip=null;
  for(let i=1;i<rows.length;i++){ const a=rows[i-1], b=rows[i]; if(a.g<0 && b.g>=0){ flip = a.k + (b.k-a.k)*(-a.g)/(b.g-a.g); } }
  if(flip===null) flip = spot - q.step*2;
  const cw = rows.reduce((m,r)=> r.g>m.g?r:m, rows[0]).k;
  const pw = rows.reduce((m,r)=> r.g<m.g?r:m, rows[0]).k;
  const net = rows.reduce((s,r)=>s+r.g,0);
  const res = {rows, flip:+flip.toFixed(q.step<5?2:0), cw, pw, net:+(net/rows.length*q.bn*6).toFixed(1)};
  GCACHE[sym]=res; return res;
}
function regime(sym){ const g=gamma(sym); return LIVE[sym] >= g.flip ? 'pos' : 'neg'; }
function lv(sym, v){ const st=SYMS[sym].step; return st<5 ? fmtNum(v,2) : fmtNum(v,0); }

// ---------- SVG charts ----------
function gammaSVG(sym, opts={}){
  const g = gamma(sym); const W=360, H=opts.h||190, L=6, R=6, T=22, B=30;
  const n=g.rows.length, bw=(W-L-R)/n; const max = Math.max(...g.rows.map(r=>Math.abs(r.g)));
  const y0 = T + (H-T-B)/2; const sc = (H-T-B)/2/max;
  const X = k => L + (k - g.rows[0].k)/(SYMS[sym].step) * bw + bw/2;
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" data-gsym="${sym}" aria-label="${esc(symLabel(sym))} 按行权价的 Gamma 敞口">`;
  s += `<line x1="0" x2="${W}" y1="${y0}" y2="${y0}" stroke="var(--muted)" stroke-width="0.6"/>`;
  g.rows.forEach(r=>{ const h=Math.abs(r.g)*sc; const y = r.g>=0? y0-h : y0; s += `<rect x="${(X(r.k)-bw/2+1).toFixed(1)}" y="${y.toFixed(1)}" width="${(bw-2).toFixed(1)}" height="${Math.max(h,0.5).toFixed(1)}" fill="${r.g>=0?'var(--pos)':'var(--neg)'}"/>`; });
  const xf = X(g.flip), xs = X(LIVE[sym]);
  s += `<line x1="${xf}" x2="${xf}" y1="${T-6}" y2="${H-B+4}" stroke="var(--ink)" stroke-dasharray="3 3"/>`;
  s += `<text x="${xf+3}" y="${H-B+16}" font-size="10" fill="var(--ink2)" font-family="IBM Plex Mono, monospace">翻转 ${lv(sym,g.flip)}</text>`;
  s += `<line x1="${xs}" x2="${xs}" y1="${T-6}" y2="${H-B+4}" stroke="var(--accent-text)" stroke-width="1.5"/>`;
  s += `<text x="${Math.min(xs+3,W-70)}" y="${T-10}" font-size="10" fill="var(--accent-text)" font-family="IBM Plex Mono, monospace">现价 ${pxText(sym)}</text>`;
  const xc = X(g.cw); s += `<text x="${Math.min(xc,W-60)}" y="${H-6}" font-size="10" fill="var(--pos)" text-anchor="middle" font-family="IBM Plex Mono, monospace">Call Wall</text>`;
  const xp = X(g.pw); s += `<text x="${Math.max(xp,34)}" y="${H-6}" font-size="10" fill="var(--neg)" text-anchor="middle" font-family="IBM Plex Mono, monospace">Put Wall</text>`;
  s += `<g class="gt" display="none" pointer-events="none"><line y1="${T-4}" y2="${H-B}" stroke="var(--ink)" stroke-width="1"/><rect y="0" width="124" height="18" fill="var(--ink)"/><text y="13" font-size="10.5" fill="var(--bg)" text-anchor="middle" font-family="IBM Plex Mono, monospace"></text></g>`;
  return s+'</svg>';
}
function priceSVG(sym, range){
  const q=SYMS[sym]; const n = {'1D':78,'5D':90,'1M':66,'YTD':120,'1Y':150}[range]||78;
  const rnd = rng(hash(sym+range)); const span = {'1D':0.006,'5D':0.012,'1M':0.03,'YTD':0.09,'1Y':0.14}[range]||0.006;
  const end = LIVE[sym]; const start = range==='1D'? q.prev : q.px*(1 - span*(0.4+rnd()*0.6)*(rnd()>0.3?1:-1));
  const pts=[]; let v=start;
  for(let i=0;i<n;i++){ const t=i/(n-1); const drift = start+(end-start)*t; v = drift + (rnd()-0.5)*q.px*span*0.35*Math.sin(t*Math.PI); pts.push(v); }
  pts[n-1]=end;
  const W=358,H=120, lo=Math.min(...pts, q.prev), hi=Math.max(...pts, q.prev); const pad=(hi-lo)*0.12||1;
  const Y = v => H - 8 - (v-(lo-pad))/((hi+pad)-(lo-pad))*(H-16);
  const d = pts.map((p,i)=>`${i?'L':'M'}${(i/(n-1)*W).toFixed(1)} ${Y(p).toFixed(1)}`).join(' ');
  const yp = Y(q.prev);
  SCRUB = {sym, range, pts, n, W, Y, i:-1};
  const col = end >= pts[0] ? 'var(--up)' : 'var(--down)';
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${esc(symLabel(sym))} ${range} 走势示意图，按住拖动查看历史价格">
    ${range==='1D'?`<line x1="0" y1="${yp}" x2="${W}" y2="${yp}" stroke="var(--muted)" stroke-dasharray="2 4"/><text x="2" y="${yp-4}" font-family="IBM Plex Mono, monospace" font-size="10" fill="var(--muted)">昨收</text>`:''}
    <path d="${d} L${W} ${H} L0 ${H} Z" fill="${col}" opacity="0.07"/>
    <path d="${d}" fill="none" stroke="${col}" stroke-width="2" stroke-linejoin="round"/><circle class="live-end" cx="${W-2}" cy="${Y(end)}" r="3.5" fill="${col}"/>
    <line class="cx-line" y1="0" y2="${H}" stroke="var(--muted)" stroke-width="1" style="display:none"/><circle class="cx-dot" r="5" fill="var(--bg)" stroke="${col}" stroke-width="2.5" style="display:none"/></svg>`;
}
const IC = {
  back:'<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  menu:'<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  search:'<svg aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
  lock:'<svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="5" y="11" width="14" height="10"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  check:'<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12l5 5 9-10"/></svg>',
  plus:'<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  x:'<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  bookmark:'<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M6 3h12v18l-6-4-6 4z"/></svg>',
  bookmarkOn:'<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M6 3h12v18l-6-4-6 4z"/></svg>',
  share:'<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v13M7 8l5-5 5 5"/><path d="M5 13v8h14v-8"/></svg>',
  like:'<svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M7 10v10H4V10zM7 10l4-7c1.5 0 2.5 1 2.5 2.5V9h5.5a2 2 0 0 1 2 2.3l-1.2 6.5a2 2 0 0 1-2 1.7H7"/></svg>',
  flag:'<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M5 21V4h11l-2 4 2 4H5"/></svg>',
  bell:'<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>',
  play:'<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="#00098F"><path d="M8 5l11 7-11 7z"/></svg>',
  chev:'<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>',
  nav_today:'<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="4" y="4" width="16" height="16"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>',
  nav_watch:'<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 17l5-6 4 3 8-9"/><path d="M3 21h18"/></svg>',
  nav_research:'<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 4h14v16H5zM9 8h6M9 12h6M9 16h3"/></svg>',
  nav_video:'<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="18" height="14"/><path d="M10 9l5 3-5 3z"/></svg>',
  nav_me:'<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
};

// ---------- Overlays ----------
function toast(msg){ let t=$('#toast'); if(!t){ t=document.createElement('div'); t.id='toast'; t.setAttribute('role','status'); document.body.appendChild(t); } t.textContent=msg; t.hidden=false; clearTimeout(toast._t); toast._t=setTimeout(()=>{t.hidden=true;}, 2600); }
function openSheet(html, label='对话框'){
  closeSheet();
  const d=document.createElement('div'); d.className='scrim'; d.id='sheet';
  d.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(label)}"><button class="icon-btn x" data-act="close-sheet" aria-label="关闭">${IC.x}</button>${html}</div>`;
  d.addEventListener('click', e=>{ if(e.target===d) closeSheet(); });
  document.body.appendChild(d);
  const f = d.querySelector('input,textarea,button:not(.x)'); if(f) f.focus({preventScroll:true});
}
function closeSheet(){ const d=$('#sheet'); if(d) d.remove(); const dr=$('#drawer'); if(dr) dr.remove(); }
async function copyText(text, okMsg){ try{ await navigator.clipboard.writeText(text); toast(okMsg||'已复制'); }catch(e){ openSheet(`<h2>复制内容</h2><p class="muted small">长按或全选下面的文字进行复制。</p><textarea class="input" id="copy-box" readonly>${esc(text)}</textarea>`,'复制'); const b=$('#copy-box'); if(b){ b.select(); } } }

// ---------- Alerts ----------
function alertLevel(a){ if(a.type==='price') return a.level; const g=gamma(a.sym); return a.type==='flip'?g.flip: a.type==='cw'?g.cw:g.pw; }
const ALERT_NAME = {flip:'Gamma 翻转点', cw:'Call Wall', pw:'Put Wall', price:'自定义价格'};
function checkAlerts(){
  let fired=false;
  S.alerts.forEach(a=>{ if(!a.on || a.fired) return; const lvl=alertLevel(a); const px=LIVE[a.sym];
    if((a.dir==='above' && px>=lvl) || (a.dir==='below' && px<=lvl)){ a.fired=true; fired=true; toast(`提醒：${symLabel(a.sym)} ${a.dir==='above'?'上穿':'下穿'}${ALERT_NAME[a.type]} ${lv(a.sym,lvl)}`); } });
  if(fired){ save(); if(U.route==='watch') render(); }
}
