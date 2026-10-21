// ---------- Earnings analysis (subscribers only) ----------
// Sample consensus and history; production would come from a licensed estimates feed.
const EARN = {
  NFLX:{name:'NFLX', en:'Netflix', q:'2026 年三季度', eps:6.98, rev:'115.1 亿美元', revY:'+16%', imp:7.4, avg:6.8, beat:'7/8', w:0.5, iv:58, ivr:82, pc:0.74,
    watch:[['付费会员净增','市场预期约 410 万'],['广告层收入','管理层目标全年翻倍'],['营业利润率','公司指引 29%']],
    view:'定价能力与广告层是本季的两条主线。提价后的流失率若维持在低位，全年利润率指引存在上调空间；反之，会员净增低于 300 万会让市场重新审视估值。'},
  TSLA:{name:'TSLA', en:'Tesla', q:'2026 年三季度', eps:0.54, rev:'262 亿美元', revY:'+3%', imp:8.9, avg:9.6, beat:'4/8', w:2.1, iv:71, ivr:64, pc:0.88,
    watch:[['汽车毛利率（不含积分）','市场预期约 17.0%'],['储能装机','上季 9.6 GWh'],['自动驾驶与机器人进展','电话会表述决定次日方向']],
    view:'交付数据已提前公布，本季看点在毛利率和电话会。期权隐含波动低于历史平均，若管理层给出明确的新车型或自动驾驶时间表，实际波动可能超出期权定价。'},
  IBM:{name:'IBM', en:'IBM', q:'2026 年三季度', eps:2.45, rev:'163 亿美元', revY:'+4%', imp:5.2, avg:4.9, beat:'8/8', w:0.4, iv:33, ivr:55, pc:0.69,
    watch:[['软件业务增速','市场预期约 9%'],['红帽增速','上季 12%'],['生成式 AI 订单','累计签约金额']],
    view:'连续八个季度超出盈利预期，市场对“超预期”本身已不敏感，次日走势更取决于软件增速和全年自由现金流指引。'},
  INTC:{name:'INTC', en:'Intel', q:'2026 年三季度', eps:0.02, rev:'136 亿美元', revY:'+3%', imp:9.8, avg:8.7, beat:'5/8', w:0.2, iv:76, ivr:71, pc:0.81,
    watch:[['代工业务亏损','上季营业亏损 31 亿美元'],['毛利率指引','市场预期约 38%'],['18A 制程良率','电话会表述']],
    view:'盈利接近盈亏平衡，任何指引变化都会被放大。期权定价的波动高于历史均值，说明市场对代工进展的分歧仍然很大。'},
  MSFT:{name:'MSFT', en:'Microsoft', q:'2027 财年一季度', eps:3.65, rev:'754 亿美元', revY:'+14%', imp:4.6, avg:4.1, beat:'8/8', w:6.6, iv:29, ivr:58, pc:0.62,
    watch:[['Azure 增速','市场预期约 37%'],['资本开支','上季 242 亿美元'],['Copilot 付费席位','管理层披露口径']],
    view:'Azure 增速仍是唯一能明显改变股价方向的数字。MSFT 占 SPX 权重较高，财报后的走势会直接影响指数期权的对冲需求，尤其是在同日 FOMC 决议之后。'},
  GOOGL:{name:'GOOGL', en:'Alphabet', q:'2026 年三季度', eps:2.28, rev:'993 亿美元', revY:'+13%', imp:5.9, avg:5.6, beat:'7/8', w:4.0, iv:34, ivr:61, pc:0.66,
    watch:[['搜索收入增速','市场预期约 11%'],['云业务利润率','上季 20.7%'],['资本开支指引','全年口径']],
    view:'搜索业务在 AI 竞争下的韧性是核心问题。云业务利润率连续改善，若资本开支指引再次上调，市场关注点会转向回报周期。'},
  META:{name:'META', en:'Meta', q:'2026 年三季度', eps:6.70, rev:'498 亿美元', revY:'+20%', imp:7.8, avg:9.1, beat:'7/8', w:2.8, iv:41, ivr:66, pc:0.71,
    watch:[['广告展示量与单价','两者增速拆分'],['资本开支指引','2027 年初步口径'],['Reality Labs 亏损','上季 45 亿美元']],
    view:'历史上 Meta 财报后的实际波动经常超过期权定价，本季隐含波动再次低于历史均值。资本开支指引是最可能引发大幅波动的变量。'},
  AAPL:{name:'AAPL', en:'Apple', q:'2026 财年四季度', eps:1.76, rev:'1015 亿美元', revY:'+7%', imp:4.1, avg:3.6, beat:'8/8', w:6.9, iv:26, ivr:49, pc:0.67,
    watch:[['iPhone 收入','新机首个完整季度'],['服务业务毛利率','上季 75.6%'],['大中华区收入','同比变化']],
    view:'新机周期的首个季度通常给出保守指引。AAPL 权重最高，若与AMZN 同晚发布，盘后指数期货的波动将同时反映两家公司的结果。'},
  AMZN:{name:'AMZN', en:'Amazon', q:'2026 年三季度', eps:1.58, rev:'1778 亿美元', revY:'+10%', imp:6.6, avg:7.2, beat:'6/8', w:3.9, iv:37, ivr:60, pc:0.70,
    watch:[['AWS 增速','市场预期约 19%'],['北美零售利润率','上季 6.5%'],['四季度营业利润指引','节日季口径']],
    view:'AWS 增速是否重新加速决定市场情绪。四季度指引历来偏保守，次日走势往往先反映 AWS，再在电话会后修正。'},
  NVDA:{name:'NVDA', en:'NVIDIA', q:'2027 财年三季度', eps:1.12, rev:'548 亿美元', revY:'+56%', imp:7.1, avg:6.4, beat:'8/8', w:7.4, iv:52, ivr:68, pc:0.79,
    watch:[['数据中心收入','市场预期约 488 亿美元'],['毛利率','公司指引 73.5%'],['下季收入指引','与市场预期的差距']],
    view:'NVDA 是对指数期权影响最大的单一财报。超预期已是常态，市场真正交易的是下季指引相对预期的幅度。'},
};
const EARN_SCEN = [['超预期并上调指引',0.35,1.25],['大致符合预期',0.45,0.35],['不及预期或下调指引',0.20,-1.45]];
function earnHist(sym){ // four quarters of sample history: [label, actual, estimate, next-day move %]
  const e=EARN[sym]; let seed=0; for(const c of sym) seed=(seed*31+c.charCodeAt(0))%9973;
  const rnd=()=>{ seed=(seed*7919+13)%9973; return seed/9973; };
  return ['上季','两季前','三季前','四季前'].map(l=>{ const est=+(e.eps*(0.86+rnd()*0.2)).toFixed(2); const act=+(est*(0.96+rnd()*0.14)).toFixed(2); const mv=+((rnd()-0.45)*2*e.avg).toFixed(1); return [l,act,est,mv]; });
}
function earnEvent(sym){ return CAL.find(c=>c.er===sym); }
function earnBars(sym){
  const hs=earnHist(sym).slice().reverse(); const max=Math.max(...hs.map(h=>Math.max(h[1],h[2])))*1.15; const W=320,H=150,bw=22;
  const bars=hs.map((h,i)=>{ const x=30+i*74; const ya=H-24-(h[1]/max)*(H-40), ye=H-24-(h[2]/max)*(H-40);
    return `<rect x="${x}" y="${ye}" width="${bw}" height="${H-24-ye}" fill="var(--line)"/><rect x="${x+bw+4}" y="${ya}" width="${bw}" height="${H-24-ya}" fill="${h[1]>=h[2]?'var(--band)':'var(--neg)'}"/><text x="${x+bw+2}" y="${H-8}" text-anchor="middle" font-size="10" fill="var(--muted)">${h[0]}</text>`; }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="过去四个季度每股收益实际值与预期值"><line x1="20" x2="${W-6}" y1="${H-24}" y2="${H-24}" stroke="var(--line)"/>${bars}</svg>
    <div class="xs muted" style="display:flex;gap:14px"><span><i class="lg" style="background:var(--line)"></i>市场预期</span><span><i class="lg" style="background:var(--band)"></i>实际（超预期）</span><span><i class="lg" style="background:var(--neg)"></i>实际（不及）</span></div>`;
}
function earnMoveBar(e){ const m=Math.max(e.imp,e.avg)*1.2; const row=(l,v,c)=>`<div class="mv-row"><span class="xs">${l}</span><span class="mv-track"><i style="width:${(v/m*100).toFixed(0)}%;background:${c}"></i></span><span class="num small">±${v}%</span></div>`;
  return row('期权隐含波动',e.imp,'var(--band)')+row('过去 8 季平均',e.avg,'var(--muted)'); }

function pageEarn(sym){
  const e=EARN[sym]; if(!e) return pageHome(); const ev=earnEvent(sym)||{}; const pro=isPro();
  const others=upcomingEvents().filter(c=>c.er && c.er!==sym).slice(0,4);
  let h = subHeader(`${e.name} ${e.q}财报解析`,{sub:`${ev.d?evDay(ev.d):''} ${ev.t||''} · 美东时间 · <span class="tag pro" style="padding:1px 6px">订阅专享</span>`});
  h += `<div class="pad" style="padding-top:18px">
    <div class="kicker">市场一致预期</div>
    <div class="er-grid"><div><span class="xs muted">每股收益</span><b class="num">$${e.eps.toFixed(2)}</b></div><div><span class="xs muted">营收</span><b class="num">${e.rev}</b><span class="xs muted">同比 ${e.revY}</span></div>
      <div><span class="xs muted">期权隐含波动</span><b class="num">±${e.imp}%</b></div><div><span class="xs muted">过去 8 季超预期</span><b class="num">${e.beat}</b></div></div>
    <p class="xs muted" style="margin:10px 0 0">示例数据，正式版接入授权的一致预期与期权数据。</p></div>`;
  if(pro){
    const hs=earnHist(sym); const up=e.imp*1.0;
    h += `<div class="pad article-body" style="--fs:1">
      <h2 class="art-h">一、过去四个季度</h2>
      <figure class="eco-fig"><figcaption><b>图 1</b> 每股收益：实际与预期（美元）</figcaption>${earnBars(sym)}</figure>
      <table class="cmp er-t"><thead><tr><th>季度</th><th>实际</th><th>预期</th><th>次日涨跌</th></tr></thead><tbody>${hs.map(r=>`<tr><td>${r[0]}</td><td class="num">$${r[1].toFixed(2)}</td><td class="num">$${r[2].toFixed(2)}</td><td class="num ${r[3]>=0?'up':'down'}">${r[3]>=0?'+':''}${r[3]}%</td></tr>`).join('')}</tbody></table>
      <h2 class="art-h">二、本季关键指标</h2>
      ${e.watch.map((w,i)=>`<div class="er-w"><span class="num">${String(i+1).padStart(2,'0')}</span><div><b>${w[0]}</b><div class="small muted">${w[1]}</div></div></div>`).join('')}
      <h2 class="art-h">三、期权市场怎么定价</h2>
      <figure class="eco-fig"><figcaption><b>图 2</b> 财报次日波动：期权定价与历史均值</figcaption>${earnMoveBar(e)}</figure>
      <div class="eco-data"><div class="kicker">研究数据</div><div class="eco-grid"><div><span>近月隐含波动率</span><b class="num">${e.iv}%</b></div><div><span>IV Rank</span><b class="num">${e.ivr}</b></div><div><span>看跌 / 看涨成交比</span><b class="num">${e.pc}</b></div><div><span>占 SPX 权重</span><b class="num">${e.w}%</b></div></div></div>
      <p>${e.imp>e.avg?`期权定价的波动（±${e.imp}%）高于过去 8 个季度的平均实际波动（±${e.avg}%），说明市场对本季结果分歧较大，卖方获得的溢价相对丰厚。`:`期权定价的波动（±${e.imp}%）低于过去 8 个季度的平均实际波动（±${e.avg}%）。若结果明显偏离预期，实际波动超出期权定价的概率较高，买方相对占优。`}</p>
      <h2 class="art-h">四、情景分析</h2>
      <table class="cmp er-t"><thead><tr><th>情景</th><th>概率</th><th>次日参考区间</th></tr></thead><tbody>${EARN_SCEN.map(([l,p,k])=>{ const c=+(k*up).toFixed(1); return `<tr><td>${l}</td><td class="num">${Math.round(p*100)}%</td><td class="num ${c>=0?'up':'down'}">${c>=0?'+':''}${c}%</td></tr>`; }).join('')}</tbody></table>
      <p class="xs muted">概率为研究部主观估计，参考区间按期权隐含波动换算，仅供参考。</p>
      <h2 class="art-h">五、研究部观点</h2><p>${e.view}</p>
      ${e.w>=2?`<p>${e.name} 占 SPX 权重约 ${e.w}%。财报后的大幅波动会通过指数成分传导到 SPX 期权的对冲需求，我们会在次日盘前简报中更新指数 Gamma 的变化。</p>`:''}
      <div class="disclosure"><div>本页内容仅供一般性信息参考，不构成针对个人的投资建议。</div></div></div>`;
  } else {
    h += `<div class="pad"><div class="art-locked"><h2 class="art-h">一、过去四个季度</h2>
      <div class="ghost-lines" aria-hidden="true"><span style="width:96%"></span><span style="width:100%"></span><span style="width:88%"></span><span style="width:70%"></span></div>
      ${paywallBox({src:'earn', id:sym, note:'历史表现、关键指标、期权定价与情景分析', intro:`本页包含 ${e.name} 过去四个季度的盈利表现、本季三项关键指标、期权市场的波动定价、三种情景下的参考区间，以及研究部观点。`})}</div></div>`;
    U._pw = U._pw || {}; if(!U._pw['earn-'+sym]){ U._pw['earn-'+sym]=1; track('paywall_view',{src:'earn', id:sym}); }
  }
  if(others.length) h += `<section class="pad sec"><div class="sec-head"><h2 class="h2">其他财报解析</h2><button class="link" data-act="cal-open" data-arg="财报">财报日历 ›</button></div>
    ${others.map(c=>`<button class="list-item" data-go="earn-${c.er}"><span style="width:80px" class="num small">${evDay(c.d)}<span class="xs muted" style="display:block">${c.t}</span></span><span class="grow"><span style="font-size:15px;font-weight:700">${EARN[c.er].name}</span><span class="xs muted" style="display:block">${c.est||''} · 隐含波动 ±${EARN[c.er].imp}%</span></span>${pro?'':IC.lock}</button>`).join('')}</section>`;
  return h + footer();
}

IC.clock = '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/></svg>';
// ---------- Paywall with benefits and the new-user offer ----------
// The offer clock starts the first time a non-subscriber sees a paywall and is never restarted, so the deadline is real.
function offerCfg(){ return {on:true, amt:100, cur:'$', mins:10, ...(S.offer||{})}; }
function offerLeft(){
  const o=offerCfg(); if(!o.on || isPro() || S.offerUsed) return 0;
  if(!S.offerStart){ S.offerStart=Date.now(); save(); track('offer_start',{}); }
  return Math.max(0, S.offerStart + o.mins*60000 - Date.now());
}
function mmss(ms){ const s=Math.ceil(ms/1000); return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; }
function offerBox(left){
  const o=offerCfg();
  return `<div class="offer" role="timer" aria-label="新用户限时优惠倒计时"><div class="offer-top"><span class="offer-k">新用户限时优惠</span><span class="cd num" data-countdown>${IC.clock}<span>${mmss(left)}</span></span></div>
    <div class="offer-h">年度订阅立减 <b class="num">${o.cur}${o.amt}</b></div>
    <div class="offer-bar"><i data-cdbar style="width:${(left/(o.mins*60000)*100).toFixed(1)}%"></i></div>
    <div class="xs muted">倒计时结束后恢复原价，此优惠每位新用户仅提供一次。</div></div>`;
}
function paywallBox({src, id, intro, note}){
  const left=offerLeft(); const reads=ARTICLES.filter(a=>!a.free && a.id!==id).slice(0,3); const er=upcomingEvents().filter(c=>c.er).length;
  const ben=[['全部深度研究全文',`研究库 ${ARTICLES.filter(a=>!a.free).length} 篇，每周更新`],['美股财报数据解析',`本季 ${er} 家公司：历史表现、期权定价与情景分析`],['盘中快照里的 Gamma 关键价位','Call Wall、翻转点、Put Wall 与完整地形'],['机构持仓与国会交易','ARK、Citadel 等机构持仓变化，议员公开申报交易'],['研究数据与图表','文中数据框、图表与脚注来源'],['社区发言与作者交流','订阅用户可发言，研究部作者回复'],['Pro 视频与教学系列全集',`期权丛书会员 ${10-bookCfg().discount/10} 折`]];
  return `<div class="paywall"><div style="display:flex;align-items:center;gap:8px"><span class="tag pro">PRO</span><span class="small muted">${note||'本节起为订阅内容'}</span></div>
    <h2 class="h2">订阅查看全文</h2>
    <p class="small muted" style="margin:0">${intro}</p>
    ${left?offerBox(left):''}
    <div class="pw-ben"><div class="kicker">订阅后可以查阅</div><ul>${ben.map(([t,d])=>`<li><span class="up">${IC.check}</span><span><b>${t}</b><span class="xs muted">${d}</span></span></li>`).join('')}</ul></div>
    ${reads.length?`<div class="pw-reads"><div class="kicker">本周订阅文章</div>${reads.map(a=>`<button data-go="a-${a.id}"><span class="serif">${esc(a.title)}</span>${IC.lock}</button>`).join('')}</div>`:''}
    ${left?`<button class="btn primary block" data-act="subscribe" data-arg="annual">以优惠价订阅年付 · 立减 ${offerCfg().cur}${offerCfg().amt}</button><button class="btn block ghost" data-act="go-pricing">查看全部方案</button>`
      :`<button class="btn primary block" data-act="go-pricing">订阅 Pro · 年付立省 ${annualSave()}%</button>`}
    ${!isUser()?`<button class="btn block ghost" data-act="register" data-arg="${src}">已有账号？登录</button>`:''}
  </div>`;
}
let _cdWas=0;
setInterval(()=>{
  const els=document.querySelectorAll('[data-countdown]'); if(!els.length){ _cdWas=0; return; }
  const o=offerCfg(); const left=S.offerStart ? Math.max(0, S.offerStart+o.mins*60000-Date.now()) : 0;
  els.forEach(el=>{ const t=el.querySelector('span'); if(t) t.textContent=mmss(left); el.classList.toggle('urgent', left<60000); });
  document.querySelectorAll('[data-cdbar]').forEach(b=>b.style.width=(left/(o.mins*60000)*100).toFixed(1)+'%');
  if(!left && !_cdWas){ _cdWas=1; track('offer_expire',{}); rerender(); }
}, 1000);
