
// ---------- Round 8: research-publication layout (FT × The Information) ----------
const vTitle = v => `${v.series} · 第 ${v.ep} ${v.series==='周度复盘'?'期':'集'}：${v.title}`;
function artTags(a, max){
  const m=ART_META[a.id]||{events:[],topics:[]};
  const t=[...a.syms.map(s=>`<span class="tg sym">${symLabel(s)}</span>`), ...m.topics.map(x=>`<span class="tg">${x}</span>`)];
  return `<span class="tgs">${t.slice(0,max||4).join('')}</span>`;
}
function unreadCount(){ return (S.notifs||[]).filter(n=>!n.read).length; }

// ----- 首页（今日） -----
function homeToday(h){
  // Round 9 (Ed): no section names or explanations; content only, rich with charts and research.
  const picks = EDITOR_PICKS.map(p=>({...p, a:ARTICLES.find(x=>x.id===p.id)})).filter(p=>p.a);
  const lead = picks[0], rest = picks.slice(1);
  const used = new Set(picks.map(p=>p.a.id));
  const pool = ARTICLES.filter(a=>!used.has(a.id)).sort((a,b)=>(b.date.startsWith('今天')?1:0)-(a.date.startsWith('今天')?1:0));
  const take = n => pool.splice(0, n);
  h += zone('front', `<section class="pad" aria-label="编辑精选">
    <button class="lead-story" data-go="a-${lead.a.id}"><div class="lead-art">${gammaArtwork()}</div>
      <div class="kicker" style="margin-top:14px">${lead.a.cat}</div><h3 class="lead-h serif">${esc(lead.a.title)}</h3><p class="lead-dek">${esc(lead.a.dek)}</p>
      <div class="lead-meta">${AUTHOR} · ${lead.a.mins} 分钟 · 评论 ${commentCount(lead.a.id)}</div></button>
    <div class="pick-grid">${rest.map(p=>`<button class="pick" data-go="a-${p.a.id}"><div class="pick-fig">${artFigure(p.a, 70)}</div><div class="kicker">${p.a.cat}</div><h3 class="serif pick-h">${esc(p.a.title)}</h3><p class="pick-why">${esc(p.why)}</p><div class="xs muted">${p.a.mins} 分钟</div></button>`).join('')}</div></section>`, '');
  h += zone('oei', `<section class="pad" aria-label="Option Edge Index">${oeiCard()}</section>`, '');
  h += zone('tiles', `<section class="pad" aria-label="市场">${chartTiles(['SPX','VIX','US10Y','ES','GOLD','WTI'])}</section>`, '');
  const B=DAILY_BRIEF; const sn=liveSnaps().slice(0,3);
  h += zone('brief', `<section class="pad" aria-label="每日宏观简报">
    <h3 class="serif brief-h" style="margin-top:0">${esc(B.title)}</h3>
    <ol class="brief">${B.items.map(([k,t])=>`<li><span class="brief-k">${k}</span><span>${esc(t)}</span></li>`).join('')}</ol>
    ${!S.newsletter?`<form data-form="newsletter" class="brief-form"><label for="nl-email" class="sr">邮箱</label><input id="nl-email" class="input" type="email" required placeholder="每个交易日 06:30 发送到邮箱" autocomplete="email"><button class="btn primary" type="submit">订阅简报</button></form>`:''}
    ${sn.length?`<div class="brief-snaps">${sn.map(s=>`<button class="bs" data-act="snap" data-arg="${s.id}"><span class="num xs">${s.time}</span><span class="xs muted">${s.sector}</span><span class="bs-t">${esc(s.title)}</span></button>`).join('')}</div>`:''}</section>`, '');
  h += zone('research', `<section class="pad" aria-label="深度研究">${take(2).map(bigCard).join('')}</section>`, '');
  h += zone('earn', `<section aria-label="财报数据解析">${earnRail()}</section>`, '');
  h += zone('research', `<section class="pad" aria-label="深度研究">${take(3).map(artRow).join('')}</section>`, '');
  h += zone('curve', `<section class="pad" aria-label="收益率曲线">${figCard('curve')}</section>`, '');
  h += zone('events', eventsPanel(), '');
  h += zone('research', `<section class="pad" aria-label="深度研究">${take(2).map(bigCard).join('')}</section>`, '');
  const snaps=liveSnaps().slice(3,7);
  if(snaps.length) h += zone('snap', `<section class="pad" aria-label="盘中快照">${snaps.map(snapRow).join('')}</section>`, '');
  h += zone('video', `<section aria-label="视频"><div class="v-rail">${VIDEOS.slice(0,5).map(videoCard).join('')}</div>
    <div class="series-rail" style="margin-top:6px">${VIDEO_SERIES.map(se=>seriesCard(se)).join('')}</div></section>`, '');
  h += zone('curve', `<section class="pad" aria-label="VIX 期货">${figCard('vx')}</section>`, '');
  if(pool.length) h += zone('research', `<section class="pad" aria-label="更多研究">${pool.slice(0,1).map(bigCard).join('')}${pool.slice(1).map(artRow).join('')}</section>`, '');
  return h + footer();
}
// Large area chart for a symbol, used on home tiles and in articles.
function areaSVG(sym, H){
  const r=rng(hash(sym+'area')); const q=SYMS[sym]; const n=48; let v=q.prev*(1-(r()-0.4)*0.04); const pts=[];
  for(let i=0;i<n;i++){ v += (LIVE[sym]-v)/(n-i)*0.6 + (r()-0.5)*q.px*0.004; pts.push(v); } pts[n-1]=LIVE[sym];
  const lo=Math.min(...pts), hi=Math.max(...pts), W=320; H=H||120; const up=pts[n-1]>=pts[0]; const c=up?'var(--up)':'var(--down)';
  const X=i=>(i/(n-1)*W).toFixed(1), Y=p=>(H-4-(p-lo)/((hi-lo)||1)*(H-12)).toFixed(1);
  const d=pts.map((p,i)=>`${i?'L':'M'}${X(i)} ${Y(p)}`).join(' ');
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" preserveAspectRatio="none" aria-hidden="true"><path d="${d} L${W} ${H} L0 ${H}Z" fill="${c}" opacity=".09"/><path d="${d}" fill="none" stroke="${c}" stroke-width="1.8" vector-effect="non-scaling-stroke"/></svg>`;
}
function artFigure(a, H){
  const s=a.syms[0]||'SPX'; const fig=(a.body||[]).find(b=>typeof b==='object' && b.t!=='quote' && b.t!=='levels');
  if(fig && fig.t==='curve') return `<div class="af">${curveSVG()}</div>`;
  if(fig && fig.t==='vx') return `<div class="af">${vxSVG()}</div>`;
  if(SYMS[s].opt && (!fig || fig.t==='chart')) return `<div class="af">${gammaMiniWide(fig&&fig.sym||s, H)}</div>`;
  return `<div class="af">${areaSVG(fig&&fig.sym||s, H)}</div>`;
}
function gammaMiniWide(sym, H){
  const g=gamma(sym), rows=g.rows, max=Math.max(...rows.map(r=>Math.abs(r.g))); H=H||110; const mid=H/2, bw=320/rows.length;
  return `<svg viewBox="0 0 320 ${H}" width="100%" height="${H}" preserveAspectRatio="none" aria-hidden="true">${rows.map((r,i)=>{ const h=Math.abs(r.g)/max*(mid-6); return `<rect x="${(i*bw+1).toFixed(1)}" y="${r.g>=0?mid-h:mid}" width="${(bw-2).toFixed(1)}" height="${Math.max(h,.5)}" fill="${r.g>=0?'var(--pos)':'var(--neg)'}" opacity="${r.g>=0?.85:.6}"/>`; }).join('')}<line x1="0" x2="320" y1="${mid}" y2="${mid}" stroke="var(--ink)" stroke-width=".6"/></svg>`;
}
function bigCard(a){
  const c=articleCfg(a.id);
  return `<button class="big-card" data-go="a-${a.id}">${artImg(a,'bc-img')}
    <div class="kicker" style="margin-top:12px">${a.cat}</div><h3 class="serif bc-h">${esc(a.title)}</h3><p class="bc-dek">${esc(a.dek)}</p>
    <div class="bc-meta">${artTags(a,3)}<span class="xs muted">${a.date} · ${a.mins} 分钟${c.free?' · 免费':''}</span></div></button>`;
}
function chartTiles(syms){
  return `<div class="tiles">${syms.filter(s=>SYMS[s]).map(s=>{ const q=quote(s); return `<button class="tile" data-go="t-${s}"><span class="tile-k">${symLabel(s)}</span><span class="num tile-v" data-q="${s}" data-f="px">${pxText(s)}</span><span class="num xs ${q.up?'up':'down'}" data-q="${s}" data-f="ch">${chText(s)}</span><span class="tile-c">${areaSVG(s,44)}</span></button>`; }).join('')}</div>`;
}
function earnRail(){
  const ev=upcomingEvents().filter(c=>c.er).slice(0,8); const pro=isPro();
  return `<div class="er-rail">${ev.map(c=>{ const e=EARN[c.er]; const m=Math.max(e.imp,e.avg)*1.15;
    return `<button class="er-card" data-go="earn-${c.er}"><span class="xs muted">${evDay(c.d)} · ${c.t}</span><span class="er-n serif">${e.name}</span><span class="xs muted">EPS 预期 $${e.eps.toFixed(2)}</span>
      <span class="er-bars"><span><i style="width:${(e.imp/m*100).toFixed(0)}%"></i></span><span class="num xs">±${e.imp}%</span><span><i class="h" style="width:${(e.avg/m*100).toFixed(0)}%"></i></span><span class="num xs muted">±${e.avg}%</span></span>
      <span class="er-foot xs">${pro?'财报数据解析 ›':`${IC.lock} 订阅专享`}</span></button>`; }).join('')}</div>`;
}
function figCard(kind){
  if(kind==='curve') return `<button class="fig-card" data-act="chan" data-arg="债券"><figure class="eco-fig" style="margin:0"><div class="eco-fig-h">美国国债收益率曲线</div><div class="eco-fig-s">实线为今日，虚线为一周前</div><div class="eco-fig-c">${curveSVG()}</div><figcaption>来源：示例数据，正式版接入美国财政部每日收益率曲线</figcaption></figure></button>`;
  return `<button class="fig-card" data-act="chan" data-arg="期货"><figure class="eco-fig" style="margin:0"><div class="eco-fig-h">VIX 期货期限结构</div><div class="eco-fig-s">近月升水 ${(VX_CURVE[1][1]-VX_CURVE[0][1]).toFixed(2)} 点</div><div class="eco-fig-c">${vxSVG()}</div><figcaption>来源：示例数据</figcaption></figure></button>`;
}
function oeiPanel(){
  const g=gamma('SPX'), rg=regime('SPX'), op=nextOpex(), q=SYMS.SPX, pro=isPro();
  const cell=(k,v,sub,lock)=>`<div class="oei-c"><div class="oei-k">${k}</div><div class="oei-v num">${lock&&!pro?'••••':v}</div><div class="xs muted">${sub}</div></div>`;
  return `<section class="pad" aria-label="期权结构指标"><div class="sec-head"><h2 class="h2">期权结构指标</h2><span class="xs muted">SPX · 每 15 分钟</span></div>
    <div class="oei-reg"><span class="dot ${rg}"></span><strong>${rg==='pos'?'正 Gamma 环境':'负 Gamma 环境'}</strong><span class="small muted">${rg==='pos'?'做市商对冲倾向抑制波动':'做市商对冲倾向放大波动'}</span></div>
    <div class="oei">${cell('净 GEX / 1%', `${g.net>=0?'+':'−'}$${Math.abs(g.net).toFixed(1)}bn`, '全部到期加总')}${cell('翻转点', lv('SPX',g.flip), `距现价 ${((LIVE.SPX/g.flip-1)*100).toFixed(1)}%`, true)}${cell('Call Wall', lv('SPX',g.cw), '上方压力', true)}${cell('Put Wall', lv('SPX',g.pw), '下方支撑', true)}${cell('0DTE 占比', q.zdte, '当日成交')}${cell('月度 OPEX', op.days+' 天', op.label)}</div>
    <div class="oei-acts">${pro?'':`<button class="btn sm primary" data-act="paywall" data-arg="gammamap">订阅 Pro 查看价位</button>`}<button class="btn sm ghost" data-act="chan" data-arg="GEX 热力图">GEX 热力图 ›</button><button class="btn sm ghost" data-go="t-SPX">SPX 详情 ›</button></div></section>`;
}
function eventsPanel(){
  const ev=upcomingEvents().filter(e=>e.hi || e.type==='财报').slice(0,6);
  return `<section class="pad" aria-label="重要市场事件">
    ${ev.map(e=>{ const why=EVENT_WHY[e.what.replace(/（.*?）/,'')]||EVENT_WHY[e.what]; return `<div class="ev-row${e.er?' ev-link':''}"${e.er?` data-go="earn-${e.er}" role="link" tabindex="0"`:''}><div class="ev-date"><span class="num" style="font-weight:700">${evDay(e.d)}</span><span class="xs muted">${e.t||''}</span></div><div class="grow"><div style="font-size:15px;${e.hi?'font-weight:700':''}">${esc(e.what)} ${e.hi?'<span class="imp" title="重要">●●●</span>':'<span class="imp lo">●●</span>'}</div>${e.est?`<div class="xs muted num">${esc(e.est)}</div>`:''}${why?`<div class="ev-why">${esc(why)}</div>`:''}${e.er?`<div class="ev-why">财报数据解析${isPro()?'':' · 订阅专享'} ›</div>`:''}</div></div>`; }).join('')}</section>`;
}

// ----- 研究页（按代码 / 事件 / 主题检索） -----
function pageResearch(){
  const F=U.rf||(U.rf={sym:null,event:null,topic:null,q:'',sort:'new'});
  const syms=[...new Set(ARTICLES.flatMap(a=>a.syms))], events=[...new Set(Object.values(ART_META).flatMap(m=>m.events))], topics=[...new Set(Object.values(ART_META).flatMap(m=>m.topics))];
  const cnt=(fn)=>ARTICLES.filter(fn).length;
  const q=(F.q||'').trim().toLowerCase();
  let list=ARTICLES.filter(a=>{ const m=ART_META[a.id]||{events:[],topics:[]};
    return (!F.sym||a.syms.includes(F.sym)) && (!F.event||m.events.includes(F.event)) && (!F.topic||m.topics.includes(F.topic)) && (!q || (a.title+a.dek+a.syms.join(' ')+m.topics.join(' ')+m.events.join(' ')).toLowerCase().includes(q)); });
  if(F.sort==='hot') list=list.slice().sort((a,b)=>commentCount(b.id)-commentCount(a.id));
  const row=(label,key,items,lab)=>`<div class="rf-row"><div class="rf-k">${label}</div><div class="rf-chips">${items.map(x=>`<button class="chip sm" aria-pressed="${F[key]===x}" data-act="rf" data-arg="${key}|${x}">${lab?lab(x):x}<span class="rf-n">${cnt(a=>key==='sym'?a.syms.includes(x):(ART_META[a.id]||{})[key==='event'?'events':'topics']?.includes(x))}</span></button>`).join('')}</div></div>`;
  const active=['sym','event','topic'].filter(k=>F[k]);
  return subHeader('') + `<div class="pad" style="padding-top:16px">
    <label for="rq" class="sr">搜索研究</label><input id="rq" class="input" placeholder="搜索标题、代码或主题，如 SPX、期限溢价" value="${esc(F.q||'')}" autocomplete="off">
    <div class="rf">${row('股票代码','sym',syms,symLabel)}${row('市场事件','event',events)}${row('研究主题','topic',topics)}</div>
    <div class="rf-bar"><span class="small"><strong>${list.length}</strong> 篇研究${active.length?` · <button class="link" data-act="rf-clear">清除筛选</button>`:''}</span>
      <div class="seg light" style="width:150px">${[['new','最新'],['hot','最热']].map(([k,l])=>`<button aria-selected="${F.sort===k}" data-act="rf-sort" data-arg="${k}">${l}</button>`).join('')}</div></div>
    <div id="rf-list">${list.map(a=>`<button class="res-row" data-go="a-${a.id}"><span class="res-d xs muted">${a.date}</span><span class="res-b"><span class="kicker">${a.cat}</span><span class="serif res-h">${esc(a.title)}</span><span class="small muted res-dek">${esc(a.dek)}</span>${artTags(a,5)}</span>${articleCfg(a.id).free?'<span class="tag good">免费</span>':'<span class="lockmark muted">'+IC.lock+'</span>'}</button>`).join('') || '<p class="muted small" style="padding:20px 0">没有符合条件的研究，试试清除筛选。</p>'}</div>
    ${!isPro()?`<div class="tintbox" style="margin-top:16px;display:flex;justify-content:space-between;align-items:center;gap:10px"><span class="small">每篇研究可免费阅读开头，订阅 Pro 查看全文</span><button class="btn xs primary" data-act="paywall" data-arg="research-banner">订阅 Pro</button></div>`:''}
  </div>` + footer();
}

// ----- 视频（按系列组织） -----
function seriesCard(se){
  const eps=VIDEOS.filter(v=>v.series===se.name);
  return `<button class="series-card" data-act="vseries" data-arg="${se.name}"><span class="sc-kind">${se.kind}</span><span class="sc-name serif">${se.name}</span><span class="sc-meta">${se.season} · ${eps.length} ${se.name==='周度复盘'?'期':'集'}</span></button>`;
}
function pageVideo(){
  const hero=VIDEO_SERIES[0], heroEps=VIDEOS.filter(v=>v.series===hero.name);
  return subHeader('') + `
  <section class="v-hero"><div class="pad"><span class="sc-kind">${hero.kind} · ${hero.season}</span><h2 class="serif v-hero-h">${hero.name}</h2><p class="v-hero-p">${esc(hero.desc)}</p>
    <div style="display:flex;gap:10px;margin-top:16px"><button class="btn primary" data-act="video" data-arg="${heroEps[0].id}">${IC.play} 播放第 1 集</button><button class="btn on-dark" data-act="vseries" data-arg="${hero.name}">全部剧集</button></div></div></section>
  ${VIDEO_SERIES.map(se=>{ const eps=VIDEOS.filter(v=>v.series===se.name).sort((a,b)=>se.name==='周度复盘'?b.ep-a.ep:a.ep-b.ep); const teach=se.kind==='教学系列';
    return `<section class="v-series" id="vs-${hash(se.name)}"><div class="pad"><div class="sec-head"><div><span class="sc-kind dark">${se.kind}</span><h2 class="h2" style="margin-top:4px">${se.name}</h2></div><span class="xs muted">${se.season}</span></div><p class="small muted" style="margin:6px 0 0">${esc(se.desc)}</p></div>
    ${teach ? `<div class="pad"><ol class="lesson-list">${eps.map(v=>`<li><button data-act="video" data-arg="${v.id}"><span class="num ln">${String(v.ep).padStart(2,'0')}</span><span class="grow">${esc(v.title)}<span class="xs muted" style="display:block">${v.dur}</span></span>${v.free?'<span class="tag good">免费</span>':'<span class="tag pro">PRO</span>'}</button></li>`).join('')}</ol></div>`
    : `<div class="ep-rail">${eps.map(v=>`<button class="ep" data-act="video" data-arg="${v.id}"><span class="ep-art"><span class="ep-n">${se.name==='周度复盘'?'第 '+v.ep+' 期':'第 '+v.ep+' 集'}</span><span class="ep-play">${IC.play}</span><span class="num ep-dur">${v.dur}</span></span><span class="ep-t">${esc(v.title)}</span><span class="xs muted">${v.free?'免费':'Pro'}${v.latest?' · 最新':''}</span></button>`).join('')}</div>`}
    </section>`; }).join('')}` + footer();
}

// ----- 社区（讨论串 / 作者回复 / 会员标识 / 提醒） -----
function allThreads(){
  const t=[];
  ARTICLES.forEach(a=>{ (S.comments[a.id]||[]).filter(c=>c.status!=='removed' && (c.status!=='pending'||c.mine)).forEach(c=>t.push({where:'a-'+a.id, title:a.title, kind:'研究', c, authorReplied:(c.replies||[]).some(r=>r.badge==='author'), n:(c.replies||[]).length, follow:S.followThreads.includes(a.id), key:a.id})); });
  Object.keys(S.disc||{}).forEach(sym=>{ (S.disc[sym]||[]).filter(d=>d.status!=='removed').forEach(d=>t.push({where:'t-'+sym, title:`${symLabel(sym)} 讨论区`, kind:'标的', c:{...d, text:d.text, user:d.user, likes:d.likes||0, badge:d.badge}, authorReplied:false, n:(d.replies||[]).length, follow:S.followThreads.includes(sym), key:sym})); });
  return t;
}
function pageCommunity(){
  const tab=U.ctab||'hot'; let list=allThreads();
  if(tab==='hot') list.sort((a,b)=>(b.c.likes+b.n*5)-(a.c.likes+a.n*5));
  if(tab==='author') list=list.filter(x=>x.authorReplied);
  if(tab==='follow') list=list.filter(x=>x.follow);
  if(tab==='new') list.sort((a,b)=>(b.c.ts||0)-(a.c.ts||0));
  const n=unreadCount();
  const right=`<button class="icon-btn bell" data-go="inbox" aria-label="消息提醒${n?'，'+n+' 条未读':''}">${IC.bell}${n?`<span class="bell-n">${n}</span>`:''}</button>`;
  return subHeader('',{right}) + `<div class="pad" style="padding-top:12px">
    <div class="tabs" role="tablist">${[['hot','热门'],['new','最新'],['author','作者已回复'],['follow','我关注的']].map(([k,l])=>`<button role="tab" aria-selected="${tab===k}" data-act="ctab" data-arg="${k}">${l}</button>`).join('')}</div>
    ${list.slice(0,30).map(x=>`<article class="thread"><button class="th-where" data-go="${x.where}"><span class="tg${x.kind==='标的'?' sym':''}">${x.kind}</span><span class="th-title serif">${esc(x.title)}</span></button>
      <div class="who" style="margin-top:8px"><strong>${esc(x.c.user)}</strong>${badgeHTML(x.c)}<span class="xs muted" style="margin-left:auto">${x.c.ago||'刚刚'}</span></div>
      <p class="th-text">${esc(x.c.text)}</p>
      <div class="th-foot"><span>${IC.like} ${x.c.likes||0}</span><span>${x.n} 条回复</span>${x.authorReplied?'<span class="badge author">作者已回复</span>':''}
        <button class="link" style="margin-left:auto" data-act="follow-thread" data-arg="${x.key}" aria-pressed="${x.follow}">${x.follow?'已关注':'关注讨论串'}</button></div></article>`).join('') || '<p class="muted small" style="padding:20px 0">这里还没有讨论串。</p>'}
    <div class="tintbox" style="margin-top:18px"><div class="small" style="font-weight:700">社区规则</div><div class="xs muted" style="margin-top:4px;line-height:1.7">禁止喊单、荐股与引流。评论先经自动审核，再由审核团队复核。优质评论每月参与 Trader's Gear 与丛书赠礼抽奖。</div></div>
  </div>` + footer();
}
function pageInbox(){
  const list=S.notifs||[];
  const ic={author:'作者回复', reply:'回复', pick:'编辑精选', research:'新研究', mention:'提到你'};
  return subHeader('消息提醒',{sub:'回复、作者动态与关注的讨论串', right:`<button class="link" style="color:inherit" data-act="notif-all">全部已读</button>`}) + `<div class="pad" style="padding-top:8px">
    ${list.map(n=>`<button class="notif${n.read?'':' unread'}" data-act="notif" data-arg="${n.id}"><span class="tg${n.kind==='author'?' sym':''}">${ic[n.kind]||'通知'}</span><span class="grow" style="min-width:0"><span style="display:block;font-size:14px;line-height:1.5">${esc(n.text)}</span><span class="xs muted">${n.ago}</span></span>${n.read?'':'<span class="udot" aria-label="未读"></span>'}</button>`).join('') || '<p class="muted small">暂无消息。</p>'}
    <div class="sec"><div class="sec-head"><h2 class="h2" style="font-size:17px">提醒设置</h2></div>
      ${[['reply','有人回复我'],['alert','价位提醒触发'],['research','新研究发布'],['snap','我关注板块的快照']].map(([k,l])=>`<div class="list-item"><span class="grow">${l}</span><button class="switch" role="switch" aria-checked="${!!S.notif[k]}" data-act="notif-set" data-arg="${k}" aria-label="${l}"></button></div>`).join('')}</div>
  </div>` + footer();
}
function pushNotif(n){ S.notifs=S.notifs||[]; S.notifs.unshift({id:'n'+Date.now(), read:false, ago:'刚刚', ...n}); save(); }

// ----- 后台：审核权限 -----
function adminPerms(){
  const P=S.perms||MOD_DEFAULT;
  return `<div class="ahead"><div><h1>审核权限</h1><div class="small muted" style="margin-top:4px">按角色分配社区管理权限，与内容编辑权限分开管理</div></div></div>
   <div class="tbl-wrap" style="margin-top:18px"><table class="tbl" style="min-width:640px"><thead><tr><th>权限</th>${MOD_ROLES.map(r=>`<th style="text-align:center">${r}</th>`).join('')}</tr></thead><tbody>
   ${MOD_PERMS.map(([k,l])=>`<tr><td>${l}</td>${MOD_ROLES.map(r=>`<td style="text-align:center"><button class="switch" role="switch" aria-checked="${!!(P[r]||{})[k]}" data-act="perm" data-arg="${r}|${k}" aria-label="${r} · ${l}"></button></td>`).join('')}</tr>`).join('')}</tbody></table></div>
   <h2 class="h2" style="margin-top:26px;font-size:18px">审核团队</h2>
   <div class="tbl-wrap" style="margin-top:10px"><table class="tbl" style="min-width:520px"><thead><tr><th>成员</th><th>角色</th><th>本周处理</th></tr></thead><tbody>
   ${(S.team||MOD_TEAM).map(([n,r],i)=>`<tr><td>${esc(n)}</td><td><label class="sr" for="tm-${i}">角色</label><select id="tm-${i}" class="input" style="height:36px;max-width:160px" data-change="team" data-arg="${i}">${MOD_ROLES.map(x=>`<option ${x===r?'selected':''}>${x}</option>`).join('')}</select></td><td class="num">${[42,118,9,23][i]||0}</td></tr>`).join('')}</tbody></table></div>
   <p class="small muted" style="margin-top:12px">示例：审核员可以删除评论、封禁用户，但不能设精选；作者可以置顶和精选自己文章下的讨论串。</p>`;
}
function dataBox(d){
  return `<aside class="eco-data" aria-label="${esc(d.title)}"><div class="eco-fig-k">研究数据</div><div class="eco-fig-h">${esc(d.title)}</div><dl>${d.rows.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd class="num">${esc(v)}</dd></div>`).join('')}</dl><div class="eco-src">来源：${esc(d.src)}</div></aside>`;
}
IC.nav_comm = '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12.5h5" stroke-linecap="round"/></svg>';
