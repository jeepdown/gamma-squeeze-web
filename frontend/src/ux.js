
// ---------- Print layout + motion layer ----------
const REDUCED = (()=>{ try{ return matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } })();
function edition(){ const d0=new Date(2024,0,2), d=new Date(); return Math.max(1, Math.floor((d-d0)/864e5*5/7)); }

function masthead(){
  return `<header class="pad mast">
    <div class="topbar">
      <button class="icon-btn" style="justify-content:flex-start" data-act="drawer" aria-label="菜单">${IC.menu}</button>
      <span style="display:flex"><button class="icon-btn bell" data-go="inbox" aria-label="消息提醒${unreadCount()?'，'+unreadCount()+' 条未读':''}">${IC.bell}${unreadCount()?`<span class="bell-n">${unreadCount()}</span>`:''}</button><button class="icon-btn" style="justify-content:flex-end" data-go="search" aria-label="搜索">${IC.search}</button></span>
    </div>
    <h1 class="brand mast-brand">Gamma Squeeze</h1>
    <div class="mast-sub latin">Independent Macro &amp; Derivatives Research</div>
  </header>`;
}

// 今日要点: swipeable deck
function todayDeck(){
  const rg=regime('SPX'), g=gamma('SPX'), feat=ARTICLES.find(a=>a.feature)||ARTICLES[0];
  const sn=liveSnaps()[0], op=nextOpex(), ev=upcomingEvents()[0];
  const term=GLOSSARY[edition()%GLOSSARY.length];
  const cards=[
    `<button class="deck-card dark" data-go="t-SPX"><div class="dk">市场状态 · SPX</div>
      <div class="num dk-big" data-q="SPX" data-f="px">${pxText('SPX')}</div><div class="num small ${quote('SPX').up?'up':'down'}" data-q="SPX" data-f="full">${chFull('SPX')}</div>
      <div class="dk-foot"><span class="dot ${rg}" style="background:${rg==='pos'?'#7EE2B8':'#FFB3B3'}"></span>${rg==='pos'?'正':'负'} Gamma 环境 · 净 GEX ${g.net>=0?'+':'−'}$${Math.abs(g.net).toFixed(1)}bn</div></button>`,
    `<button class="deck-card" data-go="a-${feat.id}"><div class="dk">头条 · ${feat.cat}</div><div class="dk-title serif">${esc(feat.title)}</div><div class="dk-foot muted">${feat.mins} 分钟 · 开头免费阅读</div></button>`,
    sn?`<button class="deck-card" data-act="snap" data-arg="${sn.id}"><div class="dk">最新快照 · ${sn.time} ${sn.sector}</div><div class="dk-title serif">${esc(sn.title||'')}</div><div class="dk-text">${esc(sn.text)}</div></button>`:'',
    `<button class="deck-card" data-go="calendar"><div class="dk">倒计时 · 月度 OPEX</div><div class="num dk-big" style="color:var(--accent-text)">${op.days}<span style="font-size:16px"> 天</span></div><div class="dk-foot muted">${op.label}${ev?` · 下一事件：${esc(ev.what)}`:''}</div></button>`,
    `<button class="deck-card" data-go="academy"><div class="dk">今日一词</div><div class="dk-title serif">${esc(term.k)}</div><div class="dk-text">${esc(term.d)}</div></button>`,
  ].filter(Boolean);
  return `<section class="deck-wrap" aria-label="今日要点"><div class="pad deck-head"><span class="kicker">今日要点</span><span class="xs muted">左右滑动</span></div>
    <div class="deck" data-deck>${cards.join('')}</div>
    <div class="dots" aria-hidden="true">${cards.map((_,i)=>`<i${i?'':' class="on"'}></i>`).join('')}</div></section>`;
}

// 头版 + 本期要目
function frontPage(arts){
  const feat = arts.find(a=>a.feature) || arts[0]; const rest = arts.filter(a=>a!==feat);
  return `<section class="sec" aria-label="头版"><div class="pad"><div class="sec-head"><h2 class="h2">头版</h2><span class="xs muted num">A1</span></div></div>
    <div class="pad" style="margin-top:12px">${featureCard(feat)}</div>
    <div class="pad"><div class="contents"><div class="contents-h"><span class="kicker">本期要目</span>${lockedTag()}</div>
      ${rest.map((a,i)=>`<button class="ct-row" data-go="a-${a.id}"><span class="ct-n num">${String(i+2).padStart(2,'0')}</span><span class="ct-t"><span class="xs muted">${a.cat}</span><span class="serif ct-title">${esc(a.title)}</span></span><span class="xs muted num">${a.mins}′</span></button>`).join('')}
    </div></div></section>`;
}

// ---------- Infinite explore feed ----------
const FEED_ROWS = [['art'],['term','ticker'],['snap'],['stat','book'],['quote'],['ticker','stat'],['video'],['snap']];
const FEED_TICKERS = ['SPX','QQQ','NVDA','SPY','VIX','WTI','GOLD','US10Y'].filter(s=>SYMS[s]);
function feedPool(){
  const quotes=[]; ARTICLES.forEach(a=>a.body.forEach(b=>{ if(b && b.t==='quote') quotes.push({text:b.text, a}); }));
  return {art:ARTICLES, snap:liveSnaps(), term:GLOSSARY, ticker:FEED_TICKERS, book:BOOKS, video:VIDEOS, quote:quotes};
}
function feedStats(){
  const out=[]; const op=nextOpex();
  ['SPX','QQQ','NVDA','SPY'].filter(s=>SYMS[s]).forEach(s=>{ const q=SYMS[s], g=gamma(s);
    out.push({big:q.zdte, cap:`${symLabel(s)} 成交中 0DTE 期权占比`, go:'t-'+s});
    out.push({big:q.iv, cap:`${symLabel(s)} 30 日隐含波动率`, go:'t-'+s});
    out.push({big:`${g.net>=0?'+':'−'}$${Math.abs(g.net).toFixed(1)}bn`, cap:`${symLabel(s)} 净 Gamma 敞口 / 1%`, go:'t-'+s, pro:true});
  });
  out.push({big:`${op.days} 天`, cap:'距离下一次月度期权到期', go:'calendar'});
  return out;
}
function sparkSVG(sym, hh){
  const r=rng(hash(sym+'spark')); const q=SYMS[sym]; const n=30; let v=q.prev; const pts=[];
  for(let i=0;i<n;i++){ v += (LIVE[sym]-v)/(n-i) + (r()-0.5)*q.px*0.002; pts.push(v); } pts[n-1]=LIVE[sym];
  const lo=Math.min(...pts), hi=Math.max(...pts)||1, W=120, H=hh||36;
  const d=pts.map((p,i)=>`${i?'L':'M'}${(i/(n-1)*W).toFixed(1)} ${(H-3-(p-lo)/((hi-lo)||1)*(H-6)).toFixed(1)}`).join(' ');
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" aria-hidden="true" preserveAspectRatio="none"><path d="${d}" fill="none" stroke="${quote(sym).up?'var(--up)':'var(--down)'}" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg>`;
}
function feedCard(type, i, r){
  const P=feedPool(); const pick = arr => arr.length ? arr[(i + Math.floor(r()*arr.length)) % arr.length] : null;
  if(type==='snap'){ const s=pick(P.snap); if(!s) return feedCard('art',i,r);
    return `<button class="fc wide" data-act="snap" data-arg="${s.id}"><div class="fc-k"><span class="num">${s.time}</span> · ${SECTOR_FULL[s.sector]} · 快照</div><div class="fc-h serif">${esc(s.title||'')}</div><div class="fc-p clamp3">${esc(s.text)}</div>
      ${s.data?`<span class="sdata">${s.data.map(d=>`<span class="sd"><span class="k">${esc(d[0])}</span><span class="num ${d[2]||''}">${esc(d[1])}</span></span>`).join('')}</span>`:''}</button>`; }
  if(type==='art'){ const a=pick(P.art); const c=articleCfg(a.id);
    return `<button class="fc wide" data-go="a-${a.id}"><div class="fc-k">${a.cat} · 深度</div><div class="fc-h serif big">${esc(a.title)}</div><div class="fc-p">${esc(a.dek)}</div><div class="fc-m">${a.mins} 分钟 · ${c.free||isPro()?'全文可读':'开头免费 · 全文订阅'}</div></button>`; }
  if(type==='term'){ const t=pick(P.term);
    return `<button class="fc" data-go="academy"><div class="fc-k">词条</div><div class="fc-h serif">${esc(t.k)}</div><div class="fc-p clamp4">${esc(t.d)}</div></button>`; }
  if(type==='ticker'){ const s=pick(P.ticker);
    return `<button class="fc" data-go="t-${s}"><div class="fc-k">${esc(SYMS[s].name)}</div><div class="latin" style="font-weight:800;font-size:20px;letter-spacing:-.02em">${symLabel(s)}</div>
      <div class="num" style="font-size:15px;font-weight:600;margin-top:2px" data-q="${s}" data-f="px">${pxText(s)}</div><div class="num xs ${quote(s).up?'up':'down'}" data-q="${s}" data-f="ch">${chText(s)}</div><div style="margin-top:8px">${sparkSVG(s)}</div></button>`; }
  if(type==='stat'){ const st=pick(feedStats()); const hide=st.pro && !isPro();
    return `<button class="fc" data-go="${st.go}"><div class="fc-k">数据点</div><div class="num stat-big">${hide?'••••':st.big}</div><div class="fc-p">${st.cap}${hide?' · Pro':''}</div></button>`; }
  if(type==='book'){ const b=pick(P.book);
    return `<button class="fc" data-act="book-open" data-arg="${b.id}|feed" style="flex-direction:row;gap:12px;align-items:flex-start">${bookCover(b,'sm')}<span style="min-width:0;display:flex;flex-direction:column;gap:4px"><span class="fc-k">期权书籍</span><span class="serif" style="font-weight:700;font-size:14px;line-height:1.4">${esc(b.zh)}</span><span class="xs num">${isPro()?yuan(memberPrice(b.price.zh))+' 会员价':yuan(b.price.zh)}</span></span></button>`; }
  if(type==='video'){ const v=pick(P.video);
    return `<button class="fc wide fc-video" data-act="video" data-arg="${v.id}"><span class="play" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg></span><span style="min-width:0"><span class="fc-k" style="color:var(--on-band-2)">${esc(v.series)} · ${v.dur}${v.free?' · 免费':''}</span><span class="fc-h serif" style="color:#fff;display:block">${esc(v.title)}</span></span></button>`; }
  if(type==='quote'){ const q=pick(P.quote); if(!q) return feedCard('art',i,r);
    return `<button class="fc wide fc-quote" data-go="a-${q.a.id}"><span class="qmark serif" aria-hidden="true">“</span><span class="serif fc-q">${esc(q.text)}</span><span class="fc-m">摘自《${esc(q.a.title)}》</span></button>`; }
  return '';
}
function feedPage(key, page){
  const r=rng(hash(key+'#'+page)); const rows=FEED_ROWS.slice();
  for(let i=rows.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [rows[i],rows[j]]=[rows[j],rows[i]]; }
  let n=page*11; const cards = rows.flat().map(t=>feedCard(t, n++, r)).join('');
  return `<div class="feed-page">${page>1?`<div class="feed-sep"><span>续 · 第 ${page} 版</span></div>`:''}<div class="feed-grid">${cards}</div></div>`;
}
const FEED_MAX = 40;
function exploreFeed(key, title){
  U.feedPages = U.feedPages || {}; const n = U.feedPages[key] || 1;
  let pages=''; for(let p=1;p<=n;p++) pages += feedPage(key,p);
  return `<section class="feed" aria-label="继续探索"><div class="pad"><div class="sec-head"><h2 class="h2">${title||'继续探索'}</h2><span class="xs muted">快照 · 深度 · 数据 · 词条</span></div></div>
    <div class="pad feed-body" data-feed="${key}">${pages}</div>
    <div class="feed-sentinel" data-feed-more="${key}"><span class="spin" aria-hidden="true"></span><span class="xs muted">正在加载更多</span></div>
    <div class="pad xs muted" style="padding-block:4px 20px;line-height:1.7">所有内容仅供一般性信息参考，不构成投资建议。行情延迟至少 15 分钟，初版数据为示例。<button data-go="method" style="text-decoration:underline">数据与方法论</button></div></section>`;
}
let FEED_OBS=null;
function wireFeed(){
  if(FEED_OBS) FEED_OBS.disconnect();
  const sen=document.querySelector('[data-feed-more]'); if(!sen || !('IntersectionObserver' in window)) return;
  FEED_OBS = new IntersectionObserver(ents=>{ ents.forEach(en=>{ if(!en.isIntersecting) return;
    const key=sen.dataset.feedMore, body=document.querySelector(`[data-feed="${key}"]`); if(!body) return;
    const n=(U.feedPages[key]||1)+1; if(n>FEED_MAX){ sen.innerHTML='<span class="xs muted">今天就看到这里 · 新快照约每 30 分钟发布</span>'; FEED_OBS.disconnect(); return; }
    U.feedPages[key]=n; body.insertAdjacentHTML('beforeend', feedPage(key,n)); track('feed_page',{key, page:n});
  }); }, {rootMargin:'600px 0px'});
  FEED_OBS.observe(sen);
}

// ---------- Mini header, reading progress, deck dots ----------
function miniBar(){
  let el=document.getElementById('minibar'); if(!el){ el=document.createElement('div'); el.id='minibar'; document.body.appendChild(el); }
  const r=U.route; let html='';
  if(r==='home') html=`<span class="brand" style="font-size:17px;color:var(--band-ink)">Gamma Squeeze</span><button class="mb-q" data-go="t-SPX"><span class="xs" style="opacity:.75">SPX</span> <span class="num" data-q="SPX" data-f="px">${pxText('SPX')}</span> <span class="num xs ${quote('SPX').up?'up':'down'}" data-q="SPX" data-f="ch">${chText('SPX')}</span></button>`;
  else if(r.startsWith('a-')){ const a=ARTICLES.find(x=>x.id===r.slice(2)); if(a) html=`<button class="icon-btn" data-act="back" aria-label="返回" style="width:36px;height:36px">${IC.back}</button><span class="serif mb-title">${esc(a.title)}</span><i class="progress" style="transform:scaleX(0)"></i>`; }
  else if(r.startsWith('t-')){ const s=r.slice(2); if(SYMS[s]) html=`<button class="icon-btn" data-act="back" aria-label="返回" style="width:36px;height:36px">${IC.back}</button><span class="latin" style="font-weight:800">${symLabel(s)}</span><span class="mb-q"><span class="num" data-q="${s}" data-f="px">${pxText(s)}</span> <span class="num xs ${quote(s).up?'up':'down'}" data-q="${s}" data-f="ch">${chText(s)}</span></span>`; }
  el.innerHTML=html; el.hidden=!html; onScrollUX();
}
function onScrollUX(){
  const el=document.getElementById('minibar'); if(!el || el.hidden){ document.body.classList.remove('mini'); return; }
  const head=document.querySelector('#app > header, #app > section.band, #app > .tk-head'); const lim = head ? head.offsetHeight - 10 : 160;
  document.body.classList.toggle('mini', window.scrollY > lim);
  const pr=el.querySelector('.progress'); if(pr){ const body=document.querySelector('.article-body'); if(body){ const top=body.getBoundingClientRect().top+window.scrollY; const p=Math.min(1,Math.max(0,(window.scrollY+innerHeight*0.4-top)/body.offsetHeight)); pr.style.transform=`scaleX(${p.toFixed(3)})`; } }
}
window.addEventListener('scroll', onScrollUX, {passive:true});
document.addEventListener('scroll', e=>{
  const d=e.target; if(!d.matches || !d.matches('[data-deck]')) return;
  const w=d.firstElementChild ? d.firstElementChild.offsetWidth+12 : 1; const i=Math.round(d.scrollLeft/w);
  d.parentElement.querySelectorAll('.dots i').forEach((x,k)=>x.classList.toggle('on',k===i));
}, {capture:true, passive:true});

// ---------- Scrubbable price chart ----------
let SCRUB=null; // {sym, range, pts, n}
function scrubLabel(range, i, n){
  if(range==='1D'){ const m=570+Math.round(i/(n-1)*390); return `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')} 美东`; }
  const days={'5D':5,'1M':30,'YTD':Math.max(30,Math.floor((Date.now()-new Date(new Date().getFullYear(),0,1))/864e5)),'1Y':365}[range]||5;
  const d=new Date(Date.now()-(1-i/(n-1))*days*864e5); return `${d.getMonth()+1}月${d.getDate()}日`;
}
function scrubAt(wrap, clientX){
  if(!SCRUB) return; const svg=wrap.querySelector('svg'); const rc=svg.getBoundingClientRect();
  const t=Math.min(1,Math.max(0,(clientX-rc.left)/rc.width)); const i=Math.round(t*(SCRUB.n-1));
  if(i===SCRUB.i) return; SCRUB.i=i;
  const {sym,range,pts,W,Y}=SCRUB; const x=i/(SCRUB.n-1)*W, y=Y(pts[i]);
  const ln=svg.querySelector('.cx-line'), dt=svg.querySelector('.cx-dot');
  ln.setAttribute('x1',x); ln.setAttribute('x2',x); ln.style.display=''; dt.setAttribute('cx',x); dt.setAttribute('cy',y); dt.style.display='';
  const q=SYMS[sym], base = range==='1D'? q.prev : pts[0]; const ch=pts[i]-base, pct=ch/base*100;
  const px=$('#tk-px'), cf=$('#tk-ch'), tm=$('#tk-time');
  if(px) px.textContent = q.yield ? pts[i].toFixed(2)+'%' : fmtNum(pts[i], q.dec);
  if(cf){ cf.textContent = `${ch>=0?'▲':'▼'} ${ch>=0?'+':'−'}${fmtNum(Math.abs(ch),q.dec)} (${pct>=0?'+':'−'}${Math.abs(pct).toFixed(2)}%)`; cf.classList.toggle('up',ch>=0); cf.classList.toggle('down',ch<0); }
  if(tm) tm.textContent = scrubLabel(range,i,SCRUB.n) + (range==='1D'?'':' · 区间涨跌');
  try{ if(i%6===0 && navigator.vibrate) navigator.vibrate(3); }catch(e){}
}
function scrubEnd(wrap){
  if(!SCRUB) return; SCRUB.i=-1; const svg=wrap.querySelector('svg');
  svg.querySelectorAll('.cx-line,.cx-dot').forEach(x=>x.style.display='none');
  wrap.closest('.band')?.classList.remove('scrubbing');
  const sym=SCRUB.sym; const px=$('#tk-px'), cf=$('#tk-ch'), tm=$('#tk-time');
  if(px) px.textContent=pxText(sym); if(cf){ cf.textContent=chFull(sym); cf.classList.toggle('up',quote(sym).up); cf.classList.toggle('down',!quote(sym).up); } if(tm) tm.textContent='示例数据 · 延迟 15 分钟 · 按住图表查看历史';
}
document.addEventListener('pointerdown', e=>{ const w=e.target.closest('.scrub'); if(!w) return; w.closest('.band')?.classList.add('scrubbing'); scrubAt(w,e.clientX); });
document.addEventListener('pointermove', e=>{
  const w=e.target.closest('.scrub');
  if(w){ if(e.pointerType==='mouse' || w.closest('.scrubbing')){ w.closest('.band')?.classList.add('scrubbing'); scrubAt(w,e.clientX); } }
  const gs=e.target.closest('svg[data-gsym]'); if(gs) gammaTip(gs, e.clientX);
});
document.addEventListener('pointerup', e=>{ const w=e.target.closest('.scrub'); if(w && e.pointerType!=='mouse') scrubEnd(w); });
document.addEventListener('pointercancel', ()=>{ const w=$('.scrub'); if(w) scrubEnd(w); });
document.addEventListener('pointerout', e=>{
  const w=e.target.closest('.scrub'); if(w && !w.contains(e.relatedTarget)) scrubEnd(w);
  const gs=e.target.closest('svg[data-gsym]'); if(gs && !gs.contains(e.relatedTarget)) gs.querySelector('.gt')?.setAttribute('display','none');
});

// ---------- Gamma bar tooltip (Pro) ----------
function gammaTip(svg, clientX){
  if(!isPro() || svg.closest('.blurred')) return;
  const sym=svg.dataset.gsym, g=gamma(sym), q=SYMS[sym]; const rc=svg.getBoundingClientRect();
  const W=360, L=6, R=6, n=g.rows.length, bw=(W-L-R)/n; const x=(clientX-rc.left)/rc.width*W;
  const i=Math.min(n-1,Math.max(0,Math.floor((x-L)/bw))); const row=g.rows[i]; const max=Math.max(...g.rows.map(r=>Math.abs(r.g)));
  const val=row.g/max*q.bn*120; const cx=L+i*bw+bw/2;
  const tip=svg.querySelector('.gt'); if(!tip) return; tip.setAttribute('display','');
  const bx=Math.min(Math.max(cx-62,0),W-124);
  tip.querySelector('line').setAttribute('x1',cx); tip.querySelector('line').setAttribute('x2',cx);
  tip.querySelector('rect').setAttribute('x',bx); const t=tip.querySelector('text'); t.setAttribute('x',bx+62);
  t.textContent=`${lv(sym,row.k)} · ${val>=0?'+':'−'}$${Math.abs(val).toFixed(0)}mn`;
}

// ---------- 财报 / 宏观事件滚动栏 ----------
function evDay(d){ const t=new Date(); const k=`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
  if(d===k) return '今天'; const n=new Date(t); n.setDate(n.getDate()+1); const k2=`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
  if(d===k2) return '明天'; return `${+d.slice(5,7)}/${+d.slice(8)} 周${'日一二三四五六'[new Date(d+'T12:00:00').getDay()]}`; }
function evItem(e){
  return `<button class="ev" ${e.er?`data-go="earn-${e.er}"`:e.sym?`data-go="t-${e.sym}"`:`data-act="cal-open" data-arg="${e.type==='财报'?'财报':'宏观'}"`}><span class="ev-d num">${evDay(e.d)} ${e.t||''}</span>${e.type==='央行'?'<span class="ev-k">央行</span>':''}<span class="ev-w${e.hi?' hi':''}">${esc(e.what)}</span>${e.est?`<span class="ev-e">${esc(e.est)}</span>`:''}</button>`;
}
function tapeRow(kind, label, sub){
  const ev=upcomingEvents().filter(e=> kind==='财报' ? e.type==='财报' : e.type!=='财报').slice(0,12); if(!ev.length) return '';
  const items=ev.map(evItem).join('<i class="ev-sep" aria-hidden="true"></i>') + '<i class="ev-sep" aria-hidden="true"></i>';
  return `<div class="tape ${kind==='财报'?'earn':'macro'}" aria-label="${label}时间表"><button class="tape-l" data-act="cal-open" data-arg="${kind}">${label}<span class="xs">${sub}</span></button>
    <div class="tape-track" data-tape><div class="tape-row">${items}</div><div class="tape-row" aria-hidden="true">${items}</div></div></div>`;
}
function eventTape(){ return tapeRow('财报','美股财报','盘前 · 盘后') + tapeRow('宏观','宏观数据','美东时间'); }
let TAPE_RAF=null; const TAPE_HOLD=new WeakMap();
function runTape(){
  cancelAnimationFrame(TAPE_RAF); const els=[...document.querySelectorAll('[data-tape]')]; if(!els.length || REDUCED) return;
  let last=performance.now(); const acc=els.map(()=>0); const speed=[0.034,0.026];
  const step=now=>{ if(!els[0].isConnected) return; const dt=Math.min(64,now-last); last=now;
    els.forEach((el,k)=>{ if(now<(TAPE_HOLD.get(el)||0)) return; acc[k]+=dt*(speed[k]||0.03); if(acc[k]>=1){ const px=Math.floor(acc[k]); acc[k]-=px; el.scrollLeft+=px; const half=el.firstElementChild.offsetWidth; if(el.scrollLeft>=half) el.scrollLeft-=half; } });
    TAPE_RAF=requestAnimationFrame(step); };
  TAPE_RAF=requestAnimationFrame(step);
}
['pointerdown','wheel','touchstart'].forEach(t=>document.addEventListener(t, e=>{ const el=e.target.closest && e.target.closest('[data-tape]'); if(el) TAPE_HOLD.set(el, performance.now()+4000); }, {passive:true}));
document.addEventListener('pointerover', e=>{ const el=e.pointerType==='mouse' && e.target.closest('[data-tape]'); if(el) TAPE_HOLD.set(el, performance.now()+1500); });

// ---------- Hooks ----------
function uxAfterRender(){ wireFeed(); miniBar(); runTape(); document.querySelectorAll('[data-clock]').forEach(c=>c.textContent=etParts()); }
function enterAnim(){ if(REDUCED) return; const a=$('#app'); a.classList.remove('enter'); void a.offsetWidth; a.classList.add('enter'); }
function flashEl(el, up){ if(REDUCED) return; el.classList.remove('flash-up','flash-down'); void el.offsetWidth; el.classList.add(up?'flash-up':'flash-down'); }
