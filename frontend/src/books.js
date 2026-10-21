// ---------- Books (sample catalogue; titles are placeholders for Gamma Squeeze's own publications) ----------
const SERIES = {
  '入门':{name:'入门系列', guide:'期权指南', color:'#A88A1F', sym:'Δ', price:{zh:59, en:69}},
  '进阶':{name:'进阶系列', guide:'期权进阶指南', color:'#2F7A5F', sym:'V', price:{zh:89, en:99}},
  '终极':{name:'终极系列', guide:'期权终极指南', color:'#2A2A72', sym:'Γ', price:{zh:129, en:149}},
};
const BOOK_SRC = [
  ['intro-whitepaper','入门','I','期权入门白皮书','Options Guide: An Introductory White Paper','合约、定价与希腊字母的系统导论',['合约与定价','希腊字母','风险管理','交易计划'],['basics','greeks'],236],
  ['intro-handbook','入门','II','期权入门实战手册','Options Guide: A Practical Handbook','从开户下单到交易计划的完整流程',['下单与期权链','盈亏计算','基础组合','常见错误'],['basics'],212],
  ['income','入门','III','期权收租策略','Options Guide: Income Strategies','备兑看涨与现金担保看跌的收益与风险',['权利金收入','行权价选择','保证金管理','实盘案例'],['selling','income'],228],
  ['index-etf','进阶','I','指数与ETF期权','Advanced Options Guide: Index and ETF Options','SPX、SPY 与 QQQ 期权的策略与组合管理',['收租结构','波动率判断','跨市场组合','资金管理'],['index','gamma','vol'],284],
  ['structured','进阶','II','结构化策略实战','Advanced Options Guide: Structured Strategies in Practice','组合期权的盈亏逻辑、对冲与仓位管理',['垂直价差','蝶式与铁鹰','动态调整','仓位管理'],['selling','structures','gamma'],296],
  ['macro-earnings','进阶','III','宏观事件与财报交易','Advanced Options Guide: Macro Event and Earnings Trading','事件前后的波动率定价与风险管理',['财报波动','CPI 与 FOMC','回测验证','交易心理'],['events','vol'],268],
  ['institutional','终极','I','机构高阶策略组合','Ultimate Options Guide: Advanced Institutional Strategies','箱式价差、风险逆转与对角价差的结构与执行',['Box Spread','Risk Reversal','Diagonal','多策略风控'],['structures','advanced'],342],
  ['pro-system','终极','II','职业化交易系统','Ultimate Options Guide: Professional Trading Systems','策略模块、风控体系与回测迭代',['策略矩阵','风控落地','纪律执行','回测迭代'],['risk','advanced','selling'],318],
  ['macro-vol','终极','III','宏观周期与波动率','Ultimate Options Guide: Macro Cycles and Volatility','经济周期、波动率结构与跨市场传导',['周期定位','期限结构','LEAPS 与日历','跨市场传导'],['vol','macro','index'],326],
];
const BOOKS = BOOK_SRC.map(([id,series,no,zh,en,sub,toc,tags,pages])=>({id, series, no, zh, en, sub, toc, tags, pages, level:SERIES[series].name, price:SERIES[series].price,
  desc:`${SERIES[series].guide} · ${SERIES[series].name} ${no}。${sub}。全书围绕${toc.join('、')}展开，配套 Gamma Squeeze 平台数据案例。`}));
BOOKS.push({id:'set9', series:'套装', no:'', zh:'期权指南丛书 · 九册套装', en:'The Options Guide Series · 9-Volume Set', sub:'入门、进阶、终极三个系列完整收录', toc:BOOKS.map(b=>`${b.level} ${b.no}：${b.zh}`), tags:[], pages:2510, level:'九册套装', price:{zh:699, en:799}, set:true,
  desc:'入门、进阶、终极三个系列共九册，从合约与希腊字母一直讲到机构策略与宏观波动率。套装价比单册合计更低，适合系统学习。'});
const ART_BOOK_TAGS = {'gamma-earnings':['index','gamma','events'], 'term-structure':['vol','selling','macro']};
const VIDEO_BOOK_TAGS = {v1:['basics','greeks'], v2:['index','vol'], v3:['gamma','greeks','basics'], v4:['index','gamma','events'], v5:['vol','events']};
const LESSON_BOOK_TAGS = {l1:['basics'], l2:['gamma','greeks'], l3:['gamma','selling'], l4:['index','events']};

function bookCfg(){ return Object.assign({discount:10, membersOnly:false}, S.bookCfg||{}); }
function memberPrice(p){ return Math.round(p*(100-bookCfg().discount))/100; }
function priceFor(b, ed){ const p=b.price[ed]; return isPro()? memberPrice(p) : p; }
function owned(bid, ed){ return (S.purchases||[]).some(x=>x.book===bid && (!ed || x.ed===ed)); }
function relatedBooks(tags, n=2){ if(!tags) return []; return BOOKS.map(b=>({b, s:b.tags.filter(t=>tags.includes(t)).length})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).slice(0,n).map(x=>x.b); }
const yuan = v => '¥'+(Number.isInteger(v)? v : v.toFixed(2));

function bookCover(b, size='md'){
  const w={xs:34,sm:56,md:96,lg:150}[size], h=Math.round(w*1.4);
  if(b.set) return `<img src="img/books-set.jpg" alt="" style="width:${w}px;height:${h}px;object-fit:cover;flex-shrink:0;background:#E9E8E4">`;
  const se=SERIES[b.series]; const k=w/150;
  const fs=n=>Math.max(4, +(n*k).toFixed(1));
  return `<div aria-hidden="true" style="width:${w}px;height:${h}px;flex-shrink:0;background:#F6F4EE;color:#1A1C2E;border-top:${Math.max(2,Math.round(6*k))}px solid ${se.color};box-shadow:0 1px 3px rgba(0,0,0,0.18);padding:${fs(12)}px ${fs(12)}px ${fs(8)}px;display:flex;flex-direction:column;overflow:hidden">
    ${size==='xs'?'':`<span style="font-size:${fs(6.5)}px;color:${se.color};font-weight:700;letter-spacing:.06em">${se.guide} · ${se.name} ${b.no}</span>`}
    <span class="serif" style="font-weight:900;font-size:${fs(15)}px;line-height:1.25;margin-top:${fs(8)}px">${size==='xs'?'':esc(b.zh)}</span>
    <span style="flex:1;display:flex;align-items:center;justify-content:center;font-family:'Noto Serif SC',serif;font-weight:900;font-size:${fs(60)}px;color:${se.color};line-height:1">${se.sym}</span>
    ${size==='xs'||size==='sm'?'':`<span class="latin" style="font-size:${fs(6)}px;letter-spacing:.14em;color:${se.color};font-weight:700">GAMMA SQUEEZE</span>`}</div>`;
}
function priceLine(b, ed='zh'){
  const p=b.price[ed], m=memberPrice(p);
  return isPro()
    ? `<span class="num" style="font-weight:700;color:var(--accent-text)">${yuan(m)}</span> <s class="num xs muted">${yuan(p)}</s> <span class="tag" style="padding:0 5px">会员 ${10-bookCfg().discount/10} 折</span>`
    : `<span class="num" style="font-weight:700">${yuan(p)}</span> <span class="xs muted">会员价 ${yuan(m)}</span>`;
}
function bookRow(b, src){
  return `<button class="art-row" data-act="book-open" data-arg="${b.id}|${src||'list'}" style="align-items:center">${bookCover(b,'sm')}
    <div style="flex:1;min-width:0"><div class="kicker">${b.set?'九册套装':`${SERIES[b.series].guide} · ${b.level} ${b.no}`} · 中 / 英文版</div><div class="h3" style="font-size:16px;margin-top:3px">${esc(b.zh)}</div><div class="xs muted">${esc(b.en)}</div>
    <div class="small" style="margin-top:6px">${owned(b.id)?'<span class="tag good">已购买</span>':priceLine(b)}</div></div></button>`;
}
function bookRecBox(tags, src){
  const list=relatedBooks(tags); if(!list.length) return '';
  return `<section class="pad sec" aria-label="相关期权书籍"><div class="sec-head"><h2 class="h2" style="font-size:18px">相关期权书籍</h2><button class="link" data-go="books">书籍 ›</button></div>
    ${list.map(b=>bookRow(b,src)).join('')}
    <button class="link" style="margin-top:10px;color:var(--accent-text);font-weight:700" data-act="book-open" data-arg="set9|${src}">或选择《期权指南丛书》九册套装 ${isPro()?yuan(memberPrice(699)):'¥699'} ›</button>
    ${!isPro()?`<div class="xs muted" style="margin-top:8px">订阅 Pro 后购买书籍享 ${10-bookCfg().discount/10} 折</div>`:''}</section>`;
}
function bookRecCompact(tags, src){
  const list=relatedBooks(tags); if(!list.length) return '';
  return `<div style="margin-top:16px;border-top:3px solid var(--strong);padding-top:10px"><div style="font-weight:700;font-size:14px">相关期权书籍</div>${list.map(b=>bookRow(b,src)).join('')}</div>`;
}

// ---------- Pages ----------
function pageBooks(){
  const F=[['all','全部'],['入门','入门系列'],['进阶','进阶系列'],['终极','终极系列'],['套装','九册套装']];
  const f=U.bfilter||'all'; const list=BOOKS.filter(b=>f==='all'||b.series===f);
  const c=bookCfg();
  return subHeader('期权书籍',{sub:'中文版 / 英文版 · PDF 与 EPUB 下载'}) +
   `<div class="pad" style="padding-top:14px"><div class="tintbox" style="display:flex;justify-content:space-between;align-items:center;gap:10px"><span class="small">${isPro()?`你是 Pro 会员，全部书籍 <strong>${10-c.discount/10} 折</strong>`:`订阅 Pro 会员，全部书籍 <strong>${10-c.discount/10} 折</strong>${c.membersOnly?'（书籍仅向订阅用户销售）':''}`}</span>${isPro()?'':`<button class="btn xs primary" data-act="paywall" data-arg="books">订阅 Pro</button>`}</div>
   <button data-act="book-open" data-arg="set9|books-hero" style="display:block;width:100%;text-align:left;margin-top:14px;border:1px solid var(--line)"><img src="img/books-set.jpg" alt="期权指南丛书九册套装封面：入门、进阶、终极三个系列" style="width:100%;aspect-ratio:1/1;object-fit:cover;max-height:360px;display:block;background:#E9E8E4">
    <div style="padding:14px"><div class="kicker">期权指南丛书 · 中文版 / 英文版</div><div class="h3" style="margin-top:4px">九册套装：入门 · 进阶 · 终极</div><div class="small" style="margin-top:6px">${priceLine(BOOKS.find(b=>b.set))} <span class="xs muted">单册合计 ¥${BOOKS.filter(b=>!b.set).reduce((s,b)=>s+b.price.zh,0)}</span></div></div></button>
   <div class="chips" style="margin-top:14px" role="group" aria-label="分类">${F.map(([k,l])=>`<button class="chip" aria-pressed="${f===k}" data-act="bfilter" data-arg="${k}">${l}</button>`).join('')}</div>
   ${(S.purchases||[]).length?`<button class="list-item" data-go="shelf"><span class="grow" style="font-size:15px;font-weight:700">我的书架</span><span class="small muted">${S.purchases.length} 本</span>${IC.chev}</button>`:''}
   <div>${list.map(b=>bookRow(b,'books')).join('')}</div>
   <p class="xs muted" style="margin-top:12px">价格为占位，可在后台修改折扣。</p></div>` + footer();
}
function pageBook(id){
  const b=BOOKS.find(x=>x.id===id); if(!b) return pageBooks();
  const ed=U.bed||'zh', fmt=U.bfmt||'PDF'; const p=b.price[ed], m=memberPrice(p); const c=bookCfg();
  const has=owned(b.id, ed); const blocked = c.membersOnly && !isPro();
  let buy;
  if(has) buy = `<button class="btn primary block" data-act="book-dl" data-arg="${b.id}|${ed}">下载${ed==='zh'?'中文版':'英文版'}（${fmt}）</button>`;
  else if(blocked) buy = `<button class="btn primary block" data-act="paywall" data-arg="books">订阅 Pro 后购买 · 会员价 ${yuan(m)}</button>`;
  else buy = `<button class="btn primary block" data-act="book-buy" data-arg="${b.id}">${isPro()?`会员价购买 ${yuan(m)}`:`购买 ${yuan(p)}`}</button>
    ${!isPro()?`<button class="btn block" data-act="paywall" data-arg="books">订阅 Pro，本书立省 ${yuan(+(p-m).toFixed(2))}</button>`:''}`;
  const rel = ARTICLES.filter(a=>ART_BOOK_TAGS[a.id] && ART_BOOK_TAGS[a.id].some(t=>b.tags.includes(t)));
  return subHeader('') + `<div class="pad" style="padding-top:20px">
    <div style="display:flex;gap:18px;align-items:flex-start">${bookCover(b,'lg')}<div style="min-width:0"><div class="kicker">${b.level}</div><h1 class="serif" style="margin:4px 0 0;font-size:24px;font-weight:900;line-height:1.3">${esc(b.zh)}</h1><div class="latin small" style="margin-top:4px;color:var(--ink2)">${esc(b.en)}</div><div class="small muted" style="margin-top:6px">${esc(b.sub)} · ${AUTHOR} · ${b.set?'共 9 册':b.pages+' 页'}</div></div></div>
    <div style="margin-top:18px"><div class="lbl">版本</div><div class="seg light" role="tablist" aria-label="版本"><button role="tab" aria-selected="${ed==='zh'}" data-act="bed" data-arg="zh">中文版</button><button role="tab" aria-selected="${ed==='en'}" data-act="bed" data-arg="en">英文版 English</button></div></div>
    <div style="margin-top:12px"><div class="lbl">格式</div><div class="seg light" role="tablist" aria-label="格式">${['PDF','EPUB'].map(x=>`<button role="tab" aria-selected="${fmt===x}" data-act="bfmt" data-arg="${x}">${x}</button>`).join('')}</div></div>
    <div class="box soft" style="margin-top:16px">${has?`<div class="small"><span class="tag good">已购买</span> 可随时在“我的书架”重新下载</div>`:
      `<div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap"><span class="latin" style="font-size:30px;font-weight:800;${isPro()?'color:var(--accent-text)':''}">${yuan(isPro()?m:p)}</span>${isPro()?`<s class="num muted">${yuan(p)}</s><span class="tag">会员 ${10-c.discount/10} 折</span>`:`<span class="small muted">Pro 会员价 <strong class="num" style="color:var(--accent-text)">${yuan(m)}</strong></span>`}</div>`}
      <div style="display:flex;flex-direction:column;gap:8px;margin-top:12px">${buy}<button class="btn block ghost" data-act="book-sample" data-arg="${b.id}">免费试读第一章</button></div>
      <div class="xs muted" style="margin-top:8px">购买后中文版与英文版分别计价；电子书下载后可在任意设备阅读。</div></div>
    <section class="sec"><div class="sec-head"><h2 class="h2" style="font-size:18px">内容简介</h2></div><p style="font-size:15px;line-height:1.8;margin:10px 0 0">${esc(b.desc)}</p></section>
    <section class="sec"><div class="sec-head"><h2 class="h2" style="font-size:18px">${b.set?'收录':'目录'}</h2></div><ol style="margin:10px 0 0;padding-left:22px;font-size:14px;line-height:2">${b.toc.map(t=>`<li>${esc(t)}</li>`).join('')}</ol></section>
    ${rel.length?`<section class="sec"><div class="sec-head"><h2 class="h2" style="font-size:18px">配套阅读</h2></div>${rel.map(artRow).join('')}</section>`:''}</div>` + footer();
}
function pageShelf(){
  const list=S.purchases||[];
  return subHeader('我的书架',{sub:`${list.length} 本已购书籍`}) + `<div class="pad">${list.map(pu=>{ const b=BOOKS.find(x=>x.id===pu.book); return `<div class="art-row" style="align-items:center">${bookCover(b,'sm')}<div style="flex:1;min-width:0"><div class="h3" style="font-size:16px">${esc(b.zh)}</div><div class="xs muted">${pu.ed==='zh'?'中文版':'英文版'} · ${pu.fmt} · 实付 ${yuan(pu.price)}</div></div><button class="btn sm" data-act="book-dl" data-arg="${b.id}|${pu.ed}">下载</button></div>`; }).join('') || '<p class="muted" style="padding-top:16px">还没有购买书籍。</p>'}
    <button class="btn block" style="margin-top:16px" data-go="books">浏览全部书籍</button></div>` + footer();
}
function bookBuySheet(id){
  const b=BOOKS.find(x=>x.id===id); const ed=U.bed||'zh', fmt=U.bfmt||'PDF'; const p=b.price[ed], m=memberPrice(p); const pay=isPro()?m:p;
  openSheet(`<h2>确认购买</h2><p class="small muted" style="margin:0 0 14px">初版为模拟支付，不会产生真实扣费。</p>
    <div style="display:flex;gap:14px;align-items:center">${bookCover(b,'sm')}<div><div style="font-weight:700">${esc(b.zh)}</div><div class="xs muted">${ed==='zh'?'中文版':'英文版'} · ${fmt}</div></div></div>
    <div style="margin-top:14px;font-size:14px">${[['原价',yuan(p)], ...(isPro()?[[`Pro 会员 ${10-bookCfg().discount/10} 折`,'−'+yuan(+(p-m).toFixed(2))]]:[]), ['实付',yuan(pay)]].map(([k,v],i,a)=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line);${i===a.length-1?'font-weight:700':''}"><span>${k}</span><span class="num">${v}</span></div>`).join('')}</div>
    ${!isPro()?`<p class="xs muted">订阅 Pro 后购买本书只需 ${yuan(m)}。<button class="link" style="color:var(--accent-text);font-weight:700" data-act="go-pricing">了解 Pro ›</button></p>`:''}
    <button class="btn primary block" style="margin-top:14px" data-act="book-pay" data-arg="${b.id}">模拟支付 ${yuan(pay)}</button>`,'确认购买');
}

// ---------- Admin ----------
function adminBooks(){
  const c=bookCfg(); const ps=S.purchases||[]; const rev=ps.reduce((s,x)=>s+x.price,0); const mem=ps.filter(x=>x.member).length;
  return `<div class="ahead"><div><h1>书籍</h1><div class="small muted" style="margin-top:4px">书目、会员折扣与销售 · 本机测试数据</div></div></div>
   <div class="kpis"><div class="kpi"><div class="k">销量</div><div class="v">${ps.length}</div></div><div class="kpi"><div class="k">销售额（元）</div><div class="v">${rev.toFixed(2)}</div></div><div class="kpi"><div class="k">会员购买占比</div><div class="v">${ps.length?Math.round(mem/ps.length*100)+'%':'—'}</div></div><div class="kpi"><div class="k">推荐位点击</div><div class="v">${cnt('book_rec_click')}</div></div></div>
   <form data-form="bookcfg" style="display:flex;gap:16px;align-items:flex-end;flex-wrap:wrap;margin-top:18px"><div><label class="lbl" for="bk-d">会员折扣（%）</label><input id="bk-d" class="input" type="number" min="0" max="50" value="${c.discount}" style="width:140px"></div>
    <label class="check" style="height:44px;align-items:center"><input type="checkbox" id="bk-m" ${c.membersOnly?'checked':''}> <span>书籍仅向订阅用户销售</span></label><button class="btn primary" type="submit">保存</button></form>
   <div class="tbl-wrap" style="margin-top:18px"><table class="tbl"><thead><tr><th>书名</th><th>级别</th><th>中文版</th><th>英文版</th><th>会员价（中 / 英）</th><th>销量</th><th>推荐标签</th></tr></thead><tbody>
   ${BOOKS.map(b=>`<tr><td><button data-act="book-open" data-arg="${b.id}|admin" style="text-align:left;font-weight:600">${esc(b.zh)}</button><div class="xs muted">${esc(b.en)}</div></td><td class="small">${b.level}</td><td class="num">${yuan(b.price.zh)}</td><td class="num">${yuan(b.price.en)}</td><td class="num">${yuan(memberPrice(b.price.zh))} / ${yuan(memberPrice(b.price.en))}</td><td class="num">${ps.filter(x=>x.book===b.id).length}</td><td class="xs muted">${b.tags.join('、')}</td></tr>`).join('')}</tbody></table></div>`;
}

// ---------- Trader's Gear & monthly comment giveaway ----------
function monthLabel(){ const d=new Date(); return `${d.getFullYear()}年${d.getMonth()+1}月`; }
function gearPromo(aid){
  const w = S.winners && S.winners.list && S.winners.list.length ? S.winners : null;
  return `<section class="pad sec" aria-label="每月优质评论赠礼"><div class="box" style="padding:0;overflow:hidden">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px;background:var(--line)">
      <button data-act="gear" style="display:block;background:#EDEDEB"><img src="img/gear.jpg" alt="Trader's Gear：Gamma Squeeze 黑白 T 恤与棒球帽，背面印 FOMO PANICAN YOLO" style="width:100%;aspect-ratio:4/5;object-fit:cover;display:block"></button>
      <button data-act="book-open" data-arg="set9|giveaway" style="display:block;background:#E9E8E4"><img src="img/books-set.jpg" alt="《期权指南丛书》九册套装" style="width:100%;aspect-ratio:4/5;object-fit:cover;display:block"></button></div>
    <div style="padding:16px"><div class="kicker">每月优质评论赠礼 · ${monthLabel()}</div>
      <h2 class="h2" style="font-size:18px;margin-top:4px">写下有价值的评论，赢 Trader's Gear 或期权书籍</h2>
      <p class="small" style="margin:8px 0 0;line-height:1.7;color:var(--ink2)">每月从编辑精选和高赞评论中抽取 3 位，赠送 Trader's Gear（Gamma Squeeze T 恤或棒球帽）或《期权指南丛书》任选一册。</p>
      ${w?`<p class="xs muted" style="margin:8px 0 0">${w.month} 获奖：${w.list.map(x=>esc(x.user)).join('、')}</p>`:''}
      <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap"><button class="btn sm primary" data-act="to-comments">${isPro()?'去写评论':'参与评论'}</button><button class="btn sm ghost" data-act="gear">Trader's Gear</button><button class="btn sm ghost" data-act="giveaway-rules">活动规则</button></div></div></div></section>`;
}
function adminGiveaway(){
  const cands=[]; Object.entries(S.comments).forEach(([aid,list])=>list.forEach(c=>{ const go=c=>{ if(c.status!=='removed' && c.status!=='pending' && (c.pick || c.likes>=15 || c.mine)) cands.push({aid, ...c}); }; go(c); (c.replies||[]).forEach(go); }));
  const w=S.winners;
  return `<div class="ahead"><div><h1>每月评论抽奖</h1><div class="small muted" style="margin-top:4px">${monthLabel()} · 候选：编辑精选、获赞 15 以上及本月新评论 · 每月抽 3 位</div></div><button class="btn sm primary" data-act="draw">${w&&w.month===monthLabel()?'重新抽取':'抽取 3 位'}</button></div>
   ${w&&w.list.length?`<h2 class="h2" style="font-size:18px;margin-top:18px">${w.month} 获奖名单</h2><div class="tbl-wrap" style="margin-top:8px"><table class="tbl" style="min-width:560px"><thead><tr><th>用户</th><th>评论</th><th>奖品</th></tr></thead><tbody>${w.list.map(x=>`<tr><td style="font-weight:600">${esc(x.user)}</td><td class="small">${esc(x.text.slice(0,60))}…</td><td class="small">${esc(x.prize)}</td></tr>`).join('')}</tbody></table></div>`:''}
   <h2 class="h2" style="font-size:18px;margin-top:22px">候选评论 <span class="num muted" style="font-size:14px">${cands.length}</span></h2>
   <div class="tbl-wrap" style="margin-top:8px"><table class="tbl" style="min-width:560px"><thead><tr><th>用户</th><th>评论</th><th>文章</th><th>点赞</th></tr></thead><tbody>
   ${cands.map(c=>`<tr><td style="font-weight:600">${esc(c.user)}${c.pick?' <span class="badge pick">精选</span>':''}</td><td class="small" style="max-width:420px">${esc(c.text)}</td><td class="xs muted">${esc((ARTICLES.find(a=>a.id===c.aid)||{}).title||'').slice(0,14)}</td><td class="num">${c.likes}</td></tr>`).join('') || '<tr><td colspan="4" class="muted">暂无候选。</td></tr>'}</tbody></table></div>`;
}
const PRIZES = ["Trader's Gear · Gamma Squeeze T 恤", "Trader's Gear · 棒球帽", '《期权指南丛书》任选一册'];
