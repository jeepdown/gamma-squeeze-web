// ---------- Shared pieces ----------
function header(){
  return `<header class="band pad" style="padding-block:4px 18px">
    <div class="topbar">
      <button class="icon-btn" style="justify-content:flex-start" data-act="drawer" aria-label="菜单">${IC.menu}</button>
      <span class="xs sub" style="letter-spacing:.04em">${todayCN()}</span>
      <button class="icon-btn" style="justify-content:flex-end" data-go="search" aria-label="搜索">${IC.search}</button>
    </div>
    <div class="brand" style="font-size:40px;margin-top:6px">Gamma<br>Squeeze</div>
    <div class="latin sub" style="font-weight:500;font-size:12px;margin-top:10px">Research across derivatives, volatility, and index structure</div>
  </header>`;
}
function strip(){
  return `<div class="strip pad" aria-label="行情">
    ${STRIP.map(s=>`<button class="q" data-go="t-${s}"><span class="k">${symLabel(s)}</span><span style="font-weight:600" data-q="${s}" data-f="px">${pxText(s)}</span><span class="${quote(s).up?'up':'down'}" style="font-size:11px" data-q="${s}" data-f="ch">${chText(s)}</span></button>`).join('')}
    <div class="q" style="font-family:var(--f-sans)"><span class="k">示例数据</span><span class="k">延迟 15 分钟</span></div>
  </div>`;
}
function subHeader(title, opts={}){
  return `<header class="band paper pad" style="padding-block:4px 16px">
    <div class="topbar">
      <button class="icon-btn" style="justify-content:flex-start" data-act="back" aria-label="返回">${IC.back}</button>
      <span class="latin" style="font-weight:800;font-size:17px;letter-spacing:-0.03em">Gamma Squeeze</span>
      ${opts.right || '<span style="width:44px"></span>'}
    </div>
    ${title?`<h1 class="serif" style="margin:6px 0 0;font-weight:900;font-size:26px;line-height:1.3">${title}</h1>`:''}
    ${opts.sub?`<div class="small sub" style="margin-top:6px">${opts.sub}</div>`:''}
  </header>`;
}
function footer(){
  return `<footer class="pad page-foot">
    <div class="brand" style="font-size:26px;color:var(--band-ink)">Gamma Squeeze</div>
    <div class="num" style="font-weight:600;font-size:12px;margin-top:8px">SPX | VIX | QQQ</div>
    <p class="occ latin">Options involve risk and are not suitable for all investors. Prior to buying or selling an option, a person must receive a copy of <em>Characteristics and Risks of Standardized Options</em>, available from your broker or from The Options Clearing Corporation at theocc.com. Content is for informational purposes only and is not investment advice.</p>
    <div style="margin-top:10px;display:flex;gap:16px;flex-wrap:wrap"><button data-go="method">数据与方法论</button><button data-go="academy">Gamma 学院</button><button data-go="pricing">订阅方案</button></div>
  </footer>`;
}
function bnav(){
  const items=[['home','首页','nav_today'],['research','研究','nav_research'],['community','社区','nav_comm'],['video','视频','nav_video'],['me','我的','nav_me']];
  const active = {home:'home',research:'research',community:'community',inbox:'community',video:'video',me:'me'}[U.route] || (U.route.startsWith('a-')||U.route.startsWith('earn-')?'research': ['saved','alerts','pricing','books','shelf','watch'].includes(U.route)||U.route.startsWith('b-')||U.route.startsWith('t-')?'me':'');
  return `<nav class="bnav" aria-label="主导航">${items.map(([r,l,i])=>`<button data-go="${r}" ${active===r?'aria-current="page"':''}>${IC[i]}${l}</button>`).join('')}</nav>`;
}
function lockedTag(){ return `<span class="lockmark">${IC.lock}订阅专享</span>`; }
function artMeta(a){ const c=articleCfg(a.id); return `${AUTHOR} · ${a.mins} 分钟 · 评论 ${commentCount(a.id)}${c.free?' · <span class="tag good" style="padding:0 5px">免费阅读</span>':''}`; }
function artRow(a){
  return `<button class="art-row" data-go="a-${a.id}"><div style="flex:1;min-width:0"><div class="kicker">${a.cat}</div><h3 class="h3" style="margin-top:5px">${esc(a.title)}</h3><div class="meta">${artMeta(a)}</div></div>
  ${artImg(a,'thumb-img')}</button>`;
}
function featureCard(a){
  return `<button class="card-feature" data-go="a-${a.id}">
    <div class="art">${gammaArtwork()}<span class="art-cap">图 · SPX 按行权价 Gamma 敞口</span></div>
    <div class="kicker" style="padding:14px 0 0">${a.cat}</div>
    <div class="body"><h3>${esc(a.title)}</h3><p>${esc(a.dek)}</p><div class="meta"><span>${AUTHOR} · ${a.mins} 分钟</span><span style="margin-left:auto">评论 ${commentCount(a.id)}</span></div></div></button>`;
}
function gammaArtwork(){
  const g=gamma('SPX'); const max=Math.max(...g.rows.map(r=>Math.abs(r.g)));
  return `<svg aria-hidden="true" viewBox="0 0 400 170" width="100%" height="100%" preserveAspectRatio="none">${g.rows.map((r,i)=>{ const h=Math.abs(r.g)/max*70; return `<rect x="${i*14.3+2}" y="${r.g>=0?85-h:85}" width="10" height="${h}" fill="${r.g>=0?'var(--pos)':'var(--neg)'}" opacity="${r.g>=0?0.85:0.6}"/>`; }).join('')}<line x1="0" x2="400" y1="85" y2="85" stroke="var(--ink)" stroke-width="0.6"/></svg>`;
}
function artThumb(a){
  const s=a.syms[0]||'SPX';
  return `<div class="thumb" aria-hidden="true"><span class="thumb-k">${symLabel(s)}</span>${SYMS[s].opt?gammaMini(s):sparkSVG(s,44)}</div>`;
}
function gammaMini(sym){
  const g=gamma(sym), rows=g.rows.filter((_,i)=>i%2===0), max=Math.max(...rows.map(r=>Math.abs(r.g)));
  return `<svg viewBox="0 0 70 44" width="100%" height="44" preserveAspectRatio="none">${rows.map((r,i)=>{ const h=Math.abs(r.g)/max*18; return `<rect x="${i*5+1}" y="${r.g>=0?22-h:22}" width="3.4" height="${Math.max(h,.5)}" fill="${r.g>=0?'var(--pos)':'var(--neg)'}"/>`; }).join('')}</svg>`;
}
function commentCount(id){ const a=ARTICLES.find(x=>x.id===id); const local=(S.comments[id]||[]).filter(c=>c.mine && c.status==='live').length; return a.base + local; }

function gammaCard(sym, compact){
  const g=gamma(sym); const rg=regime(sym);
  const inner = `<div class="kv3" style="margin-top:12px"><div><div class="k">Call Wall</div><div class="v">${lv(sym,g.cw)}</div></div><div><div class="k">翻转点</div><div class="v">${lv(sym,g.flip)}</div></div><div><div class="k">Put Wall</div><div class="v">${lv(sym,g.pw)}</div></div></div>
    <div style="margin-top:12px;background:var(--tint);padding:6px 4px 2px">${gammaSVG(sym)}</div>
    <div class="xs muted" style="margin-top:8px">净 GEX ${g.net>=0?'+':'−'}$${Math.abs(g.net).toFixed(1)}bn / 1% · 蓝色为正 Gamma，酒红为负 Gamma · 示例数据</div>`;
  return `<section class="box" aria-label="Gamma Map">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><div class="latin" style="font-weight:800;font-size:18px;letter-spacing:-0.02em">Gamma Map · ${symLabel(sym)}</div><span class="tag pro">PRO</span></div>
    <div class="small muted" style="margin-top:4px">按行权价的做市商 Gamma 敞口 · 每 15 分钟刷新</div>
    <div class="regime" style="margin-top:12px"><span class="dot ${rg}"></span><span style="font-size:14px"><strong>${rg==='pos'?'正 Gamma 环境':'负 Gamma 环境'}</strong><span class="muted small"> · ${rg==='pos'?'做市商对冲倾向抑制波动':'做市商对冲倾向放大波动'}</span></span></div>
    ${isPro()? inner : `<div class="lockwrap" style="margin-top:4px"><div class="blurred">${inner.replace(/<div class="v">[^<]+<\/div>/g,'<div class="v">••••</div>')}</div>
      <div class="lockveil"><span style="font-size:13px;font-weight:500">Pro 会员可查看关键价位与完整 Gamma 地形</span><button class="btn primary" data-act="paywall" data-arg="gammamap">订阅 Pro</button></div></div>`}
  </section>`;
}

// ---------- Home ----------
// Watermark words dropped in round 9 (Ed: no column names); the mark argument is kept for call sites.
function zone(kind, html, mark){ return `<div class="zone z-${kind}">${html}</div>`; }
function pageHome(){
  const ch = U.chan;
  let h = masthead() + strip() + eventTape();
  h += `<nav class="chan pad" aria-label="频道" role="tablist">${CHANNELS.map(c=>`<button role="tab" aria-selected="${c===ch}" data-act="chan" data-arg="${c}">${c}</button>`).join('')}</nav>`;
  if(ch==='GEX 热力图'){ heatPlay(); return h + zone('heat', heatView(), 'GEX') + zone('snap', `<section class="pad"><div class="sec-head"><h2 class="h2">期权 · Gamma 快照</h2><span class="tag">免费</span></div>${liveSnaps(s=>s.sector==='期权').slice(0,5).map(snapRow).join('')}</section>`, 'Snapshot') + zone('feed', exploreFeed('home-GEX')); }
  if(ch==='机构持仓') return h + flowsPage('inst');
  if(ch==='国会交易') return h + flowsPage('cg');
  if(ch==='视频') return h + zone('video', `<div class="series-rail">${VIDEO_SERIES.map(seriesCard).join('')}</div>`, '') + footer();
  const sector = CHAN_SECTOR[ch];
  if(ch==='今日') return homeToday(h);
  if(ch==='__old'){
    h += zone('lead', todayDeck() + `<section class="pad" style="padding-top:22px" aria-label="我的自选"><div class="sec-head plain"><h2 class="h2" style="font-size:17px">我的自选</h2><button class="link" data-go="watch">编辑</button></div>
      <div class="grid3" style="margin-top:10px">${S.watchlist.slice(0,6).map(s=>`<button class="tile" data-go="t-${s}"><span class="sym">${symLabel(s)}</span><span class="px" data-q="${s}" data-f="px">${pxText(s)}</span><span class="ch ${quote(s).up?'up':'down'}" data-q="${s}" data-f="ch">${chText(s)}</span></button>`).join('')}
      ${S.watchlist.length<3?`<button class="tile" data-go="watch" style="align-items:center;justify-content:center;color:var(--muted)">${IC.plus}<span class="xs">添加</span></button>`:''}</div></section>`, 'Today');
  }
  if(ch==='期权' || ch==='美股'){
    const rg=regime('SPX');
    h += zone('lead', `<section class="pad"><div class="tintbox" style="display:flex;gap:12px;align-items:center">
      <span class="dot ${rg}" style="width:12px;height:12px"></span>
      <div style="flex:1;min-width:0"><div style="font-size:13px"><strong>SPX 今日处于${rg==='pos'?'正':'负'} Gamma 环境</strong></div><div class="xs muted" style="margin-top:2px">${rg==='pos'?'做市商对冲倾向抑制波动，价格易被钉在大额行权价附近':'做市商对冲倾向放大波动，留意加速行情'}</div></div>
      <button class="btn xs ghost" data-go="t-SPX">${isPro()?'查看价位':'关键价位'}</button></div></section>`);
  }
  if(ch==='债券') h += zone('bond', bondBoard(), 'Bonds');
  if(ch==='期货') h += zone('fut', futBoard(), 'Futures');
  const snaps = liveSnaps(s=>!sector || s.sector===sector);
  const nNew = (U.newSnaps||[]).filter(id=>snaps.some(s=>s.id===id)).length;
  h += zone('snap', `<section class="pad" aria-label="今日快照">
    ${nNew?`<div class="small" style="margin-top:8px;color:var(--amber);font-weight:700">自你上次查看后新增 ${nNew} 条</div>`:''}
    <div style="margin-top:6px">${snaps.slice(0, ch==='今日'?6:10).map(snapRow).join('') || '<p class="muted small">本板块今日首条快照即将发布。</p>'}</div>
    ${ch==='今日' && snaps.length>6?`<button class="more" data-act="all-snaps">查看全部快照 ›</button>`:''}</section>`, 'Snapshot');
  const arts = ARTICLES.filter(a=> ch==='今日' || a.chan===ch);
  if(arts.length && ch==='今日') h += zone('front', frontPage(arts), 'A1');
  else if(arts.length){
    h += zone('front', `<section class="pad" aria-label="深度">${arts.slice(0,1).map(bigCard).join('')}${arts.slice(1,6).map(artRow).join('')}</section>`, 'Research');
  }
  if(ch==='今日' || ch==='宏观' || ch==='美国政治') h += zone('official', officialZone(), 'Data');
  if(ch==='今日' || ch==='期权'){ h += zone('gamma', `<div class="pad">${gammaCard('SPX')}</div>`, 'Gamma'); }
  if(ch==='今日' || ch==='宏观' || ch==='美股'){ h += zone('cal', calendarMini(), 'Calendar'); }
  if(ch==='今日'){
    h += zone('video', `<section aria-label="视频"><div class="pad"><div class="sec-head"><h2 class="h2">视频</h2><button class="link" data-go="video">全部 ›</button></div></div>
      <div style="display:flex;gap:12px;overflow-x:auto;padding:14px max(16px,env(safe-area-inset-right,0px)) 4px max(16px,env(safe-area-inset-left,0px))">${VIDEOS.slice(0,3).map(videoCard).join('')}</div></section>`, 'Video');
    h += zone('book', `<section aria-label="期权书籍"><div class="pad"><div class="sec-head"><h2 class="h2">期权书籍</h2><button class="link" data-go="books">全部 ›</button></div><div class="small muted" style="margin-top:4px">中英文电子书 · Pro 会员 ${10-bookCfg().discount/10} 折</div></div>
      <div style="display:flex;gap:14px;overflow-x:auto;padding:14px max(16px,env(safe-area-inset-right,0px)) 4px max(16px,env(safe-area-inset-left,0px))">${BOOKS.map(b=>`<button data-act="book-open" data-arg="${b.id}|home" style="width:96px;flex-shrink:0;text-align:left">${bookCover(b)}<div style="font-size:12px;font-weight:700;margin-top:6px;line-height:1.4">${esc(b.zh)}</div><div class="xs num" style="margin-top:2px">${isPro()?yuan(memberPrice(b.price.zh)):yuan(b.price.zh)}</div></button>`).join('')}</div></section>`, 'Books');
    if(!S.newsletter && !isPro()) h += zone('news', newsletterBox());
  }
  return h + footer();
}
function calendarMini(){
  const ev = upcomingEvents().slice(0,3);
  const op = nextOpex();
  return `<section class="pad sec" aria-label="事件日历">
    <div class="tintbox" style="display:flex;justify-content:space-between;align-items:center;gap:12px"><div><div class="xs muted">下一个月度期权到期（OPEX）</div><div class="num" style="font-weight:600;font-size:15px;margin-top:2px">${op.label}</div></div><div style="text-align:right"><div class="num" style="font-size:24px;font-weight:600;color:var(--accent-text)">${op.days}</div><div class="xs muted">天后</div></div></div>
    ${ev.map(e=>`<div class="list-item"><div class="num small" style="width:52px;font-weight:600">${e.d.slice(5).replace('-','/')}</div><div class="grow" style="font-size:14px">${e.what}</div><span class="tag ${e.hi?'':'gray'}">${e.type}</span></div>`).join('')}
</section>`;
}
function nextOpex(){
  const now=new Date(); let y=now.getFullYear(), m=now.getMonth();
  for(let i=0;i<3;i++){ const d=new Date(y,m,1); const add=(5-d.getDay()+7)%7; const third=new Date(y,m,1+add+14); third.setHours(16); if(third>now){ return {label:`${third.getMonth()+1}月${third.getDate()}日 周五`, days:Math.ceil((third-now)/864e5)}; } m++; if(m>11){m=0;y++;} }
  return {label:'—', days:'—'};
}
function upcomingEvents(){ const t=new Date(); t.setHours(0,0,0,0); return CAL.filter(e=> new Date(e.d+'T23:59:00') >= t); }
function newsletterBox(){
  return `<section class="pad sec"><div class="box"><div class="kicker">每个交易日 06:30（美东）</div><h2 class="h2" style="margin-top:4px">订阅盘前简报</h2>
    <p class="small muted" style="margin:6px 0 12px">当天的 Gamma 环境、关键事件和隔夜要闻，3 分钟读完。免费。</p>
    <form data-form="newsletter" style="display:flex;gap:8px"><label for="nl-email" class="sr">邮箱</label><input id="nl-email" class="input" type="email" required placeholder="你的邮箱" autocomplete="email"><button class="btn primary" type="submit">订阅</button></form></div></section>`;
}
function videoCard(v){
  return `<button style="width:250px;flex-shrink:0;text-align:left" data-act="video" data-arg="${v.id}">
    <div style="height:140px;background:var(--ink);position:relative;overflow:hidden">
      <span class="brand" style="position:absolute;left:12px;top:12px;font-size:20px;color:var(--bg)">Gamma<br>Squeeze</span>
      <span style="position:absolute;right:12px;top:12px">${v.free?'<span class="tag" style="background:var(--bg);color:var(--ink);border-color:var(--bg)">免费</span>':'<span class="tag pro" style="background:var(--bg);color:var(--ink)">PRO</span>'}</span>
      <span style="position:absolute;left:12px;bottom:12px;width:36px;height:36px;border-radius:50%;background:var(--bg);display:flex;align-items:center;justify-content:center">${IC.play}</span>
      <span class="num" style="position:absolute;right:12px;bottom:12px;color:var(--bg);font-size:11px">${v.dur}</span></div>
    <div style="font-size:14px;font-weight:700;margin-top:8px;line-height:1.45">${esc(v.title)}</div><div class="xs muted" style="margin-top:2px">${v.series}${v.latest?' · 最新一期':''}</div></button>`;
}
function videoList(){
  return `<div style="padding-top:16px;display:flex;flex-direction:column;gap:24px">${VIDEOS.map(v=>{ const b=relatedBooks(VIDEO_BOOK_TAGS[v.id],1)[0]; return `<div><div style="display:flex">${videoCard(v).replace('width:250px','width:100%')}</div>${b?`<button data-act="book-open" data-arg="${b.id}|video" style="display:flex;gap:10px;align-items:center;width:100%;text-align:left;margin-top:10px;padding:8px;background:var(--tint)">${bookCover(b,'xs')}<span style="flex:1;min-width:0"><span class="xs muted" style="display:block">相关期权书籍</span><span style="font-size:13px;font-weight:700">${esc(b.zh)}</span></span><span class="small">${isPro()?yuan(memberPrice(b.price.zh)):yuan(b.price.zh)}</span></button>`:''}</div>`; }).join('')}</div>`;
}

// ---------- Video ----------

// ---------- Research ----------

// ---------- Article ----------
// [block index where the section starts, heading]
const ART_SECTIONS = {
  'gamma-earnings':[[1,'一、正 Gamma：市场里的“减震器”'],[3,'二、翻转点之下：对冲方向反转'],[7,'三、本周要留意的两类事件']],
  'term-structure':[[1,'一、卖方的赔率在哪里'],[3,'二、翻转点上下的两种结论']],
  'treasury-auction':[[1,'一、期限溢价如何传导到股票'],[3,'二、利率波动率与 VIX']],
  'shutdown-risk':[[1,'一、真正的传导路径'],[3,'二、期权市场已经开始定价']],
  'oil-gold':[[1,'一、原油：库存与偏度'],[3,'二、黄金：波动率回落']],
  'breadth':[[1,'一、广度为什么重要']],
};
function pageArticle(id){
  const a = ARTICLES.find(x=>x.id===id); if(!a) return pageHome();
  const cfg=articleCfg(id);
  const canRead = isPro() || cfg.free;
  const marked = S.bookmarks.includes(id);
  const fs=[1,1.12,1.25][S.fontScale||0];
  const right = `<div style="display:flex"><button class="icon-btn" data-act="font" aria-label="字号" style="font-family:var(--f-serif);font-size:16px">Aa</button><button class="icon-btn" data-act="bookmark" data-arg="${id}" aria-label="${marked?'取消收藏':'收藏'}" aria-pressed="${marked}">${marked?IC.bookmarkOn:IC.bookmark}</button><button class="icon-btn" data-act="share" data-arg="${id}" aria-label="分享">${IC.share}</button></div>`;
  let h = `<header class="band paper art-head"><div class="pad"><div class="topbar"><button class="icon-btn" style="justify-content:flex-start" data-act="back" aria-label="返回">${IC.back}</button><span class="latin" style="font-weight:800;font-size:17px;letter-spacing:-0.03em">Gamma Squeeze</span>${right}</div></div>
    <div class="pad" style="padding-block:14px 28px"><div style="display:flex;align-items:center;gap:10px"><span class="kicker">${a.cat}</span><span class="xs sub">${cfg.free?'深度 · 免费阅读':'深度 · 订阅专享'}</span></div>
    <h1 class="serif" style="margin:14px 0 0;font-weight:900;font-size:28px;line-height:1.34">${esc(a.title)}</h1>
    <p class="serif" style="margin:12px 0 0;font-size:17px;line-height:1.65;color:var(--ink2)">${esc(a.dek)}</p></div>
    <div class="pad" style="padding-bottom:6px">${artImg(a,'hero-img')}</div></header>

    <div class="pad"><div style="display:flex;align-items:center;gap:12px;padding:16px 0;border-bottom:1px solid var(--line)">
      <div class="thumb" style="width:44px;height:44px;border-radius:50%;font-size:12px" aria-hidden="true">GS</div>
      <div style="display:flex;flex-direction:column;gap:2px;min-width:0"><span style="font-size:14px;font-weight:700">${AUTHOR}</span><span class="small muted">${a.date} · 阅读 ${a.mins} 分钟</span></div>
      <button class="btn sm ghost" style="margin-left:auto;${S.follows.includes('author')?'':'border-color:var(--accent-text);color:var(--accent-text)'}" data-act="follow" aria-pressed="${S.follows.includes('author')}">${S.follows.includes('author')?'已关注':'关注'}</button></div></div>`;
  const notes = ART_NOTES[id]||[]; let figN=0; let pi=-1;
  const noteAt = {}; notes.forEach(([i,t],n)=>{ noteAt[i]=n+1; });
  const blocks = a.body.map((b,bi)=>{
    if(typeof b==='string'){ pi=bi; const n=noteAt[bi]; const dbx=ART_DATA[id]&&ART_DATA[id].after===bi?dataBox(ART_DATA[id]):''; return `<p>${esc(b)}${n?`<sup class="fn"><a href="#fn-${n}" id="fnr-${n}" aria-label="注释 ${n}">${n}</a></sup>`:''}</p>${dbx}`; }
    if(b.t==='quote') return `<blockquote>${esc(b.text)}</blockquote>`;
    if(b.t==='chart'){ figN++; return `<figure class="eco-fig"><div class="eco-fig-k">图 ${figN}</div><div class="eco-fig-h">${symLabel(b.sym)}：按行权价的做市商 Gamma 敞口</div><div class="eco-fig-s">十亿美元 / 标的变动 1% · 蓝为正 Gamma，酒红为负 Gamma</div><div class="eco-fig-c">${gammaSVG(b.sym)}</div><figcaption>来源：Gamma Squeeze 研究部根据期权持仓计算 · 示例数据</figcaption></figure>`; }
    if(b.t==='spark'){ figN++; return `<figure class="eco-fig"><div class="eco-fig-k">图 ${figN}</div><div class="eco-fig-h">${esc(b.cap)}</div><div class="eco-fig-c">${areaSVG(b.sym,140)}</div><figcaption>来源：示例数据</figcaption></figure>`; }
    if(b.t==='curve'){ figN++; return `<figure class="eco-fig"><div class="eco-fig-k">图 ${figN}</div><div class="eco-fig-h">${esc(b.cap)}</div><div class="eco-fig-s">实线为今日，虚线为一周前</div><div class="eco-fig-c">${curveSVG()}</div><figcaption>来源：示例数据</figcaption></figure>`; }
    if(b.t==='vx'){ figN++; return `<figure class="eco-fig"><div class="eco-fig-k">图 ${figN}</div><div class="eco-fig-h">${esc(b.cap)}</div><div class="eco-fig-c">${vxSVG()}</div><figcaption>来源：示例数据</figcaption></figure>`; }
    if(b.t==='levels'){ const g=gamma(b.sym); return `<section style="font-family:var(--f-sans);border-top:3px solid var(--strong);padding-top:12px"><div style="font-size:13px;font-weight:700">今日关注价位 · ${b.sym}</div>
      ${[['Call Wall · 上方压力',g.cw],['Gamma 翻转点',g.flip],['Put Wall · 下方支撑',g.pw]].map(([k,v])=>`<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--line);font-size:14px"><span>${k}</span><span class="num" style="font-weight:600">${lv(b.sym,v)}</span></div>`).join('')}
      <button class="btn sm ghost" style="margin-top:10px" data-act="new-alert" data-arg="${b.sym}">${IC.bell} 设置价位提醒</button></section>`; }
    return '';
  });
  // Opening (before the first section) is public; from section one on, subscribers only.
  const secs = ART_SECTIONS[id] || a.secs || [];
  const firstSec = secs.length ? secs[0][0] : 1;
  const secAt = {}; secs.forEach(([i,t],n)=>{ secAt[i]=`<h2 class="art-h" id="sec-${n+1}">${esc(t)}</h2>`; });
  const full = blocks.map((b,i)=>(secAt[i]||'')+b);
  const opening = full.slice(0, firstSec).map((b,i)=> i===0 ? b.replace('<p>','<p class="lede">') : b).join('');
  const notesHTML = notes.length ? `<section class="footnotes" aria-label="注释"><div class="fn-h">注释</div><ol>${notes.map(([i,t],n)=>`<li id="fn-${n+1}">${esc(t)} <a href="#fnr-${n+1}" aria-label="返回正文">↩</a></li>`).join('')}</ol></section>` : '';
  const disclosure = notesHTML + `<div class="disclosure"><div><strong style="color:var(--ink)">作者持仓披露：</strong>撰写本文时，作者未持有文中提及标的的头寸。</div><div style="margin-top:6px">本文仅供一般性信息参考，不构成针对个人的投资建议。期权交易风险较高，可能损失全部本金。</div></div>`;
  const toc = secs.length ? `<nav class="art-toc" aria-label="本文目录"><div class="kicker">本文目录</div>${secs.map(([i,t],n)=>`<div class="toc-i"><span class="num">${String(n+1).padStart(2,'0')}</span><span>${esc(t.replace(/^[一二三四五六]、/,''))}</span>${canRead?'':IC.lock}</div>`).join('')}</nav>` : '';
  if(canRead){
    h += `<div class="pad" style="padding-top:20px"><div class="article-body" style="--fs:${fs}">${opening}${toc}${full.slice(firstSec).join('')}${disclosure}</div></div>`;
  } else {
    const [, t1] = secs[0] || [0,'正文'];
    h += `<div class="pad" style="padding-top:20px"><div class="article-body" style="--fs:${fs}">${opening}${toc}</div>
      <div class="art-locked"><h2 class="art-h">${esc(t1)}</h2>
        <div class="ghost-lines" aria-hidden="true"><span style="width:96%"></span><span style="width:100%"></span><span style="width:88%"></span><span style="width:93%"></span><span style="width:61%"></span></div>
        ${paywallBox({src:'article', id, intro:`全文共 ${secs.length} 节，约 ${a.mins} 分钟。以下为订阅后可以查阅的内容。`})}
        </div></div>`;
    U._pw = U._pw || {}; if(!U._pw[id]){ U._pw[id]=1; track('paywall_view',{src:'article', id}); }
  }
  h += gearPromo(id);
  if(ART_BOOK_TAGS[id]) h += bookRecBox(ART_BOOK_TAGS[id],'article');
  h += commentsSection(id);
  // related
  const rel = ARTICLES.filter(x=>x.id!==id && x.syms.some(s=>a.syms.includes(s))).slice(0,2);
  const more = rel.length ? rel : ARTICLES.filter(x=>x.id!==id).slice(0,3);
  h += `<section class="pad sec"><div class="sec-head"><h2 class="h2">继续阅读</h2><button class="link" data-go="research">研究库 ›</button></div>${more.slice(0,3).map(artRow).join('')}</section>`;
  return h + footer();
}
function commentsSection(id){
  const cfg=articleCfg(id);
  let list = (S.comments[id]||[]).filter(c=> c.status!=='removed' && (c.status!=='pending' || c.mine));
  if(U.csort==='new') list = list.slice().sort((a,b)=>(b.ts||0)-(a.ts||0));
  else if(U.csort==='pick') list = list.filter(c=>c.pick);
  else list = list.slice().sort((a,b)=>(b.pick?1000:0)+b.likes-((a.pick?1000:0)+a.likes));
  const hidden = S.queue.filter(q=>q.aid===id && q.done==='deleted').length;
  let h = `<section class="pad" id="comments" style="margin-top:30px" aria-label="评论"><div class="sec-head" style="align-items:baseline"><h2 class="h2" style="font-size:20px">评论 <span class="num muted" style="font-size:15px">${commentCount(id)}</span></h2><button class="link" data-act="rules">社区规则</button></div>`;
  if(!cfg.comments){ h += `<p class="small muted" style="margin-top:12px">本文评论已关闭。</p></section>`; return h; }
  if(isPro()){
    h += `<form data-form="comment" data-arg="${id}" style="margin-top:14px;display:flex;flex-direction:column;gap:8px"><label for="cmt" class="small muted">以 <strong style="color:var(--ink)">${esc(uname())}</strong> 身份发表评论</label>
      <textarea id="cmt" class="input" maxlength="500" required placeholder="分享你的观点。请勿喊单、推荐个股或发布引流信息。"></textarea>
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span class="xs muted">发布前会经过自动审核 · 优质评论参与每月赠礼</span><button class="btn sm primary" type="submit">发布</button></div></form>`;
  } else {
    h += `<div class="tintbox" style="margin-top:14px;display:flex;justify-content:space-between;align-items:center;gap:10px"><span class="small">订阅用户可参与评论，与作者和其他交易员交流</span><button class="btn xs primary" data-act="paywall" data-arg="comment">订阅 Pro</button></div>`;
  }
  h += `<div class="tabs" role="tablist" aria-label="评论排序" style="margin-top:18px">${[['best','最佳'],['new','最新'],['pick','编辑精选']].map(([k,l])=>`<button role="tab" aria-selected="${U.csort===k}" data-act="csort" data-arg="${k}">${l}</button>`).join('')}</div>`;
  h += list.map(c=>commentHTML(id,c)).join('') || '<p class="small muted" style="padding:16px 0">还没有评论。</p>';
  if(hidden) h += `<div class="small muted" style="padding:10px 0">${hidden} 条评论因违反社区规则已被隐藏</div>`;
  return h + '</section>';
}
function badgeHTML(c){ if(c.badge==='author') return '<span class="badge author">作者</span>'; if(c.badge==='mod') return '<span class="badge mod">审核员</span>'; if(c.badge==='elite') return '<span class="badge elite">高级会员</span>'; if(c.pick) return '<span class="badge pick">编辑精选</span>'; if(c.badge==='pro') return '<span class="badge">Pro 会员</span>'; return ''; }
function commentHTML(id,c,isReply){
  const liked = !!S.liked[c.id];
  return `<article class="${isReply?'reply':'cmt'}"><div class="who"><strong>${esc(c.user)}</strong>${badgeHTML(c)}${c.status==='pending'?'<span class="badge pending">审核中 · 仅自己可见</span>':''}<span class="t">${c.ago||'刚刚'}</span></div>
    <p>${esc(c.text)}</p>
    <div class="acts"><button data-act="like" data-arg="${id}|${c.id}" aria-pressed="${liked}" aria-label="点赞，当前 ${c.likes+(liked?1:0)}">${IC.like}${c.likes+(liked?1:0)}</button>
    ${!isReply?`<button data-act="reply" data-arg="${id}|${c.id}">回复</button>`:''}
    ${c.mine?'':`<button data-act="report" data-arg="${id}|${c.id}" style="margin-left:auto" aria-label="举报此评论">${IC.flag}举报</button>`}</div>
    ${U.replyTo===c.id?`<form data-form="reply" data-arg="${id}|${c.id}" style="margin-top:8px;display:flex;flex-direction:column;gap:8px"><label for="rp" class="sr">回复</label><textarea id="rp" class="input" required maxlength="500" placeholder="回复 ${esc(c.user)}"></textarea><div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" class="btn sm ghost" data-act="reply" data-arg="${id}|">取消</button><button class="btn sm primary" type="submit">回复</button></div></form>`:''}
    ${(c.replies||[]).filter(r=>r.status!=='removed').map(r=>commentHTML(id,r,true)).join('')}</article>`;
}

// ---------- Ticker ----------
function pageTicker(sym){
  const q=SYMS[sym]; if(!q) return pageHome();
  const inWl = S.watchlist.includes(sym);
  let h = `<section class="band paper tk-head"><div class="pad" style="padding-block:4px 20px">
    <div class="topbar"><button class="icon-btn" style="justify-content:flex-start" data-act="back" aria-label="返回">${IC.back}</button>
    <button class="btn sm ghost" data-act="wl" data-arg="${sym}" aria-pressed="${inWl}">${inWl?IC.check+'已自选':IC.plus+'加自选'}</button></div>
    <div class="brand" style="font-size:44px;line-height:1;margin-top:6px">${symLabel(sym)}</div><div class="small sub" style="margin-top:4px">${q.name}</div>
    <div style="display:flex;align-items:baseline;gap:12px;margin-top:16px;flex-wrap:wrap"><span class="num big-px" id="tk-px" data-q="${sym}" data-f="px">${pxText(sym)}</span><span class="num ${quote(sym).up?'up':'down'}" style="font-size:14px" id="tk-ch" data-q="${sym}" data-f="full">${chFull(sym)}</span></div>
    <div class="xs sub" style="margin-top:4px" id="tk-time">示例数据 · 延迟 15 分钟 · 按住图表查看历史</div>
    <div class="scrub" style="margin-top:16px">${priceSVG(sym,U.range)}</div>
    <div class="seg" role="tablist" aria-label="时间范围" style="margin-top:10px">${['1D','5D','1M','YTD','1Y'].map(r=>`<button role="tab" aria-selected="${U.range===r}" data-act="range" data-arg="${r}">${r}</button>`).join('')}</div></div></section>
    <section class="metrics" aria-label="关键指标"><div><div class="k">VIX</div><div class="v" data-q="VIX" data-f="px">${pxText('VIX')}</div></div><div><div class="k">隐含波动</div><div class="v">${q.iv}</div></div><div><div class="k">0DTE 占比</div><div class="v">${q.zdte}</div></div></section>`;
  const tabs = q.opt ? ['概览','快照','深度','期权','讨论'] : ['概览','快照','深度','讨论'];
  if(!tabs.includes(U.ttab)) U.ttab='概览';
  const dn = (S.disc[sym]||[]).filter(d=>d.status!=='removed').length + (sym==='SPX'?84:0);
  h += `<nav class="tabs pad" style="gap:22px;font-size:14px" role="tablist" aria-label="标的栏目">${tabs.map(t=>`<button role="tab" aria-selected="${U.ttab===t}" data-act="ttab" data-arg="${t}">${t}${t==='讨论'?' '+dn:''}</button>`).join('')}</nav>`;
  const snaps = liveSnaps(s=>s.sym===sym);
  const arts = ARTICLES.filter(a=>a.syms.includes(sym));
  const snapSec = `<section class="pad sec"><div class="sec-head"><h2 class="h2" style="font-size:18px">${symLabel(sym)} 今日快照</h2><span class="tag">免费 · 全天更新</span></div>${snaps.map(snapRow).join('') || '<p class="small muted">今日暂无该标的快照。</p>'}</section>`;
  const artSec = `<section class="pad sec"><div class="sec-head"><h2 class="h2" style="font-size:18px">相关深度</h2>${lockedTag()}</div>${arts.map(artRow).join('') || '<p class="small muted">暂无相关文章。</p>'}</section>`;
  const alertBtn = `<button class="btn sm ghost" data-act="new-alert" data-arg="${sym}">${IC.bell} 设置提醒</button>`;
  if(U.ttab==='概览'){
    if(q.opt) h += `<div class="pad" style="margin-top:18px">${gammaCard(sym)}<div style="margin-top:10px">${alertBtn}</div></div>`;
    else h += `<div class="pad" style="margin-top:18px">${alertBtn}</div>`;
    h += snapSec + artSec + discSection(sym, 2);
  } else if(U.ttab==='快照') h += snapSec;
  else if(U.ttab==='深度') h += artSec;
  else if(U.ttab==='期权') h += optionsTab(sym);
  else h += discSection(sym);
  return h + footer();
}
function optionsTab(sym){
  const g=gamma(sym), q=SYMS[sym];
  const top = g.rows.slice().sort((a,b)=>Math.abs(b.g)-Math.abs(a.g)).slice(0,8);
  const max = Math.abs(top[0].g);
  const tbl = `<table class="cmp" style="margin-top:10px"><thead><tr><th>行权价</th><th style="text-align:right">净 Gamma（$mn / 1%）</th><th>方向</th></tr></thead><tbody>${top.map(r=>`<tr><td class="num">${lv(sym,r.k)}${r.k===g.cw?' <span class="tag" style="padding:0 4px">CW</span>':''}${r.k===g.pw?' <span class="tag red" style="padding:0 4px">PW</span>':''}</td><td class="num" style="text-align:right">${(r.g/max*q.bn*120).toFixed(0)}</td><td>${r.g>=0?'<span class="up">正</span>':'<span class="down">负</span>'}</td></tr>`).join('')}</tbody></table>`;
  const exp = `<div style="margin-top:8px">${['0DTE','本周','本月','更远'].map((l,i)=>`<div style="display:grid;grid-template-columns:56px 1fr 40px;gap:8px;align-items:center;margin-top:6px;font-size:12px"><span>${l}</span><div style="height:10px;background:var(--tint)"><div style="height:10px;width:${q.exp[i]}%;background:var(--band)"></div></div><span class="num" style="text-align:right">${q.exp[i]}%</span></div>`).join('')}</div>`;
  const inner = `<section class="sec"><div class="sec-head"><h2 class="h2" style="font-size:18px">主要行权价</h2><span class="tag pro">PRO</span></div>${tbl}</section><section class="sec"><div class="sec-head"><h2 class="h2" style="font-size:18px">按到期日的 Gamma 分布</h2></div>${exp}</section>`;
  return `<div class="pad" style="margin-top:18px">${gammaCard(sym)}</div><div class="pad">${isPro()?inner:`<div class="lockwrap"><div class="blurred">${inner.replace(/class="num"( style="text-align:right")?>[^<]+</g,'class="num"$1>•••<')}</div><div class="lockveil"><span style="font-size:13px">行权价明细与到期分布为 Pro 内容</span><button class="btn primary" data-act="paywall" data-arg="options-tab">订阅 Pro</button></div></div>`}</div>`;
}
function discSection(sym, limit){
  let list=(S.disc[sym]||[]).filter(d=>d.status!=='removed' && (d.status!=='pending'||d.mine));
  const total=list.length;
  if(limit) list=list.slice(0,limit);
  return `<section class="pad sec" aria-label="讨论"><div class="sec-head"><h2 class="h2" style="font-size:18px">${symLabel(sym)} 讨论区</h2>${limit && total>limit?`<button class="link" data-act="ttab" data-arg="讨论">全部 ›</button>`:''}</div>
    ${list.map(d=>`<div style="padding:14px 0;border-bottom:1px solid var(--line)"><div style="display:flex;gap:8px;align-items:center;font-size:13px"><strong>${esc(d.user)}</strong>${d.status==='pending'?'<span class="badge pending">审核中</span>':''}<span class="muted small" style="margin-left:auto">${d.ago||'刚刚'}</span></div><p style="margin:6px 0 0;font-size:14px;line-height:1.65;overflow-wrap:anywhere">${esc(d.text)}</p></div>`).join('') || '<p class="small muted" style="padding:12px 0">还没有讨论，来发第一条。</p>'}
    ${limit? `<button class="btn block" style="margin-top:12px" data-act="ttab" data-arg="讨论">参与讨论</button>` :
      (isPro()? `<form data-form="disc" data-arg="${sym}" style="margin-top:14px;display:flex;flex-direction:column;gap:8px"><label for="dsc" class="small muted">发表对 ${symLabel(sym)} 的看法</label><textarea id="dsc" class="input" required maxlength="300" placeholder="请勿喊单或发布引流信息"></textarea><button class="btn sm primary" style="align-self:flex-end" type="submit">发布</button></form>`
       : `<button class="btn block" style="margin-top:12px" data-act="paywall" data-arg="discussion">订阅后参与讨论</button>`)}</section>`;
}

// ---------- Watchlist & alerts ----------
function pageWatch(){
  const all = Object.keys(SYMS).filter(s=>!S.watchlist.includes(s));
  let h = subHeader('自选',{sub:'示例数据 · 延迟 15 分钟'});
  h += `<section class="pad" style="padding-top:8px">${S.watchlist.map(s=>{ const opt=SYMS[s].opt; const rg=opt?regime(s):null; return `<div class="wl-row"><button data-go="t-${s}" style="text-align:left;min-width:0;padding:10px 0"><div class="latin" style="font-weight:700;font-size:16px">${symLabel(s)}</div><div class="xs muted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${SYMS[s].name}${opt?` · <span class="dot ${rg}" style="display:inline-block;width:7px;height:7px"></span> ${rg==='pos'?'正':'负'} Gamma`:''}</div></button>
    <div style="text-align:right"><div class="num" style="font-weight:600" data-q="${s}" data-f="px">${pxText(s)}</div><div class="num xs ${quote(s).up?'up':'down'}" data-q="${s}" data-f="ch">${chText(s)}</div></div>
    <button class="icon-btn" data-act="wl" data-arg="${s}" aria-label="从自选移除 ${symLabel(s)}" style="color:var(--muted)">${IC.x}</button></div>`; }).join('') || '<p class="muted">还没有自选标的。</p>'}
    ${all.length?`<div style="margin-top:14px"><div class="small muted" style="margin-bottom:8px">添加标的</div><div class="chips">${all.map(s=>`<button class="chip" data-act="wl" data-arg="${s}">${IC.plus}${symLabel(s)}</button>`).join('')}</div></div>`:''}</section>`;
  h += alertsSection();
  return h + footer();
}
function alertsSection(){
  const limit = isPro()? '不限' : (isUser()? '1 条' : '注册后 1 条');
  return `<section class="pad sec" id="alerts"><div class="sec-head"><h2 class="h2">价位提醒</h2><span class="tag ${isPro()?'':'gray'}">${isPro()?'Pro · 不限数量':'免费 · 限 1 条'}</span></div>
    <p class="small muted" style="margin:6px 0 0">价格上穿或下穿关键价位时通知你。当前额度：${limit}。</p>
    ${S.alerts.map(a=>`<div class="list-item"><div class="grow"><div style="font-size:14px"><strong>${symLabel(a.sym)}</strong> ${a.dir==='above'?'上穿':'下穿'} ${ALERT_NAME[a.type]}</div><div class="xs muted num">${lv(a.sym,alertLevel(a))}${a.fired?' · 已触发':''}</div></div>
      <button class="btn xs ghost" data-act="test-alert" data-arg="${a.id}">测试</button><button class="switch" role="switch" aria-checked="${a.on}" aria-label="启用提醒" data-act="toggle-alert" data-arg="${a.id}"></button><button class="icon-btn" data-act="del-alert" data-arg="${a.id}" aria-label="删除提醒" style="color:var(--muted)">${IC.x}</button></div>`).join('') || '<p class="small muted" style="padding:12px 0;border-bottom:1px solid var(--line)">还没有提醒。</p>'}
    <button class="btn block" style="margin-top:12px" data-act="new-alert" data-arg="SPX">${IC.bell} 新建提醒</button></section>`;
}
function alertForm(sym){
  const opts = Object.keys(SYMS).map(s=>`<option value="${s}" ${s===sym?'selected':''}>${symLabel(s)}</option>`).join('');
  return `<h2>新建价位提醒</h2><p class="small muted" style="margin:0 0 14px">Gamma 关键价位每 15 分钟更新，提醒会跟随最新价位。</p>
  <form data-form="alert" style="display:flex;flex-direction:column;gap:12px">
    <div><label class="lbl" for="al-sym">标的</label><select id="al-sym" class="input" name="sym">${opts}</select></div>
    <div><label class="lbl" for="al-type">价位</label><select id="al-type" class="input" name="type"><option value="flip">Gamma 翻转点</option><option value="cw">Call Wall</option><option value="pw">Put Wall</option><option value="price">自定义价格</option></select></div>
    <div><label class="lbl" for="al-level">自定义价格（仅“自定义价格”时填写）</label><input id="al-level" class="input" name="level" type="number" step="any" inputmode="decimal" placeholder="${pxText(sym).replace(/[,%]/g,'')}"></div>
    <div><label class="lbl" for="al-dir">方向</label><select id="al-dir" class="input" name="dir"><option value="below">向下穿过</option><option value="above">向上穿过</option></select></div>
    <p class="xs muted" style="margin:0">没有期权数据的标的（VIX、原油、黄金、利率）只能设置自定义价格。</p>
    <button class="btn primary block" type="submit">创建提醒</button></form>`;
}
