// ---------- 机构持仓 / 国会交易 (subscribers only) ----------
// Sample data. Production: SEC EDGAR 13F filings + ARK daily holdings files; House Clerk and Senate eFD periodic transaction reports.
const INSTS = [
  {id:'ark', name:'ARK Invest', fund:'ARKK 旗舰基金', src:'每日持仓', asof:'10/20', aum:'62 亿美元', n:34,
   rows:[['TSLA','Tesla',10.8,6.7,'增持',2.1],['COIN','Coinbase',8.9,5.5,'减持',-3.4],['ROKU','Roku',7.1,4.4,'不变',0],['HOOD','Robinhood',6.5,4.0,'增持',4.8],['PLTR','Palantir',6.2,3.8,'减持',-1.9],['CRSP','CRISPR Therapeutics',5.0,3.1,'增持',1.2],['SHOP','Shopify',4.7,2.9,'不变',0],['RBLX','Roblox',4.4,2.7,'新建',null],['TEM','Tempus AI',4.0,2.5,'增持',6.3],['AMD','AMD',3.6,2.2,'减持',-2.6]],
   trades:[['10/20','买入','TSLA','4.2 万股'],['10/20','卖出','COIN','3.1 万股'],['10/17','买入','RBLX','12.8 万股'],['10/16','买入','HOOD','9.5 万股'],['10/15','卖出','PLTR','6.0 万股']]},
  {id:'citadel', name:'Citadel Advisors', fund:'13F 申报', src:'2026 年二季度', asof:'08/14', aum:'6,410 亿美元（含期权名义）', n:4210,
   rows:[['SPY','SPDR S&P 500 ETF (Puts)',9.6,615,'增持',18.2],['QQQ','Invesco QQQ (Calls)',5.1,327,'增持',11.0],['NVDA','NVIDIA',2.9,186,'增持',7.4],['MSFT','Microsoft',2.2,141,'减持',-4.1],['AAPL','Apple',2.0,128,'减持',-6.8],['AMZN','Amazon',1.6,103,'增持',3.3],['META','Meta',1.3,83,'不变',0],['IWM','iShares Russell 2000 (Puts)',1.2,77,'新建',null],['GOOGL','Alphabet',1.1,71,'增持',5.0],['TSLA','Tesla (Calls)',0.9,58,'减持',-9.5]]},
  {id:'berkshire', name:'Berkshire Hathaway', fund:'13F 申报', src:'2026 年二季度', asof:'08/14', aum:'2,640 亿美元', n:41,
   rows:[['AAPL','Apple',22.4,591,'减持',-2.0],['AXP','American Express',16.1,425,'不变',0],['BAC','Bank of America',10.2,269,'减持',-5.7],['KO','Coca-Cola',9.8,259,'不变',0],['CVX','Chevron',6.9,182,'增持',1.4],['OXY','Occidental',4.6,121,'增持',2.2],['MCO','Moody\'s',4.3,114,'不变',0],['CB','Chubb',3.4,90,'增持',3.8],['KHC','Kraft Heinz',3.1,82,'不变',0],['DPZ','Domino\'s',0.6,16,'新建',null]]},
  {id:'bridgewater', name:'Bridgewater Associates', fund:'13F 申报', src:'2026 年二季度', asof:'08/14', aum:'205 亿美元', n:712,
   rows:[['SPY','SPDR S&P 500 ETF',7.9,16.2,'减持',-12.0],['IVV','iShares Core S&P 500',6.8,13.9,'减持',-8.5],['GOOGL','Alphabet',3.1,6.4,'增持',22.0],['NVDA','NVIDIA',2.8,5.7,'增持',15.1],['IEMG','iShares Core MSCI EM',2.6,5.3,'新建',null],['GLD','SPDR Gold Shares',2.2,4.5,'增持',9.6],['PG','Procter & Gamble',1.9,3.9,'不变',0],['JNJ','Johnson & Johnson',1.7,3.5,'增持',4.0],['META','Meta',1.5,3.1,'减持',-7.2],['WMT','Walmart',1.4,2.9,'不变',0]]},
  {id:'pershing', name:'Pershing Square', fund:'13F 申报', src:'2026 年二季度', asof:'08/14', aum:'131 亿美元', n:9,
   rows:[['UBER','Uber',19.8,26.0,'增持',4.4],['BN','Brookfield',17.5,22.9,'不变',0],['GOOGL','Alphabet',13.9,18.2,'减持',-3.0],['HLT','Hilton',12.6,16.5,'不变',0],['QSR','Restaurant Brands',11.0,14.4,'不变',0],['AMZN','Amazon',9.7,12.7,'新建',null],['CMG','Chipotle',8.4,11.0,'减持',-15.8],['HHH','Howard Hughes',7.1,9.3,'增持',2.5]]},
];
// Placeholder members: sample rows must not attach invented trades to real people.
const CONGRESS = [
  ['10/20','10/02','众议员 A','众议院','CA','民主党','NVDA','买入','$250,001–$500,000','配偶'],
  ['10/19','09/26','参议员 B','参议院','TX','共和党','XOM','卖出','$15,001–$50,000','本人'],
  ['10/18','09/30','众议员 C','众议院','FL','共和党','PLTR','买入','$50,001–$100,000','本人'],
  ['10/17','09/12','众议员 A','众议院','CA','民主党','AAPL','卖出（部分）','$100,001–$250,000','配偶'],
  ['10/16','10/01','参议员 D','参议院','GA','民主党','MSFT','买入','$1,001–$15,000','本人'],
  ['10/15','09/18','众议员 E','众议院','NY','民主党','TSLA','买入（看涨期权）','$15,001–$50,000','本人'],
  ['10/14','09/22','众议员 F','众议院','OH','共和党','LMT','买入','$15,001–$50,000','配偶'],
  ['10/11','08/29','参议员 G','参议院','PA','共和党','JPM','卖出','$50,001–$100,000','本人'],
  ['10/10','09/25','众议员 C','众议院','FL','共和党','AVGO','买入','$15,001–$50,000','本人'],
  ['10/09','09/08','众议员 H','众议院','IL','民主党','GOOGL','卖出','$1,001–$15,000','子女'],
  ['10/08','09/19','参议员 B','参议院','TX','共和党','CVX','卖出','$15,001–$50,000','本人'],
  ['10/07','09/15','众议员 E','众议院','NY','民主党','NVDA','买入','$50,001–$100,000','本人'],
];
const CG_TOP = [['NVDA',3,'买入 3'],['AAPL',2,'卖出 2'],['PLTR',1,'买入 1'],['MSFT',1,'买入 1']];
function delayDays(filed, traded){ const y=2026, d=s=>new Date(`${y}-${s.replace('/','-')}T12:00:00`); return Math.round((d(filed)-d(traded))/864e5); }
function chgCell(t,v){ const cls=t==='增持'||t==='新建'?'up':t==='减持'||t==='清仓'?'down':'muted'; return `<span class="num xs ${cls}">${t}${v?` ${v>0?'+':''}${v}%`:''}</span>`; }

function instView(){
  const cur=INSTS.find(i=>i.id===(U.inst||'ark'))||INSTS[0]; const max=Math.max(...cur.rows.map(r=>r[2]));
  const buys=INSTS.flatMap(i=>i.rows.filter(r=>r[4]==='新建'||(r[4]==='增持'&&r[5]>=5)).map(r=>[i.name,r])).slice(0,6);
  return `<section class="pad"><div class="inst-chips" role="tablist" aria-label="机构">${INSTS.map(i=>`<button role="tab" aria-selected="${i.id===cur.id}" data-act="inst" data-arg="${i.id}">${i.name}</button>`).join('')}</div>
    <div class="inst-head"><div><div class="serif inst-n">${cur.name}</div><div class="xs muted">${cur.fund} · ${cur.src} · 截至 ${cur.asof}</div></div><div style="text-align:right"><div class="num" style="font-weight:600">${cur.aum}</div><div class="xs muted">${cur.n} 个持仓</div></div></div>
    <div class="hold">${cur.rows.map((r,i)=>`<div class="hold-r"><span class="num xs muted">${i+1}</span><span class="hold-s"><b class="num">${r[0]}</b><span class="xs muted">${esc(r[1])}</span></span><span class="hold-w"><i style="width:${(r[2]/max*100).toFixed(0)}%"></i></span><span class="num small">${r[2].toFixed(1)}%</span>${chgCell(r[4],r[5])}</div>`).join('')}</div>
    ${cur.trades?`<div class="kicker" style="margin-top:22px">每日交易</div>${cur.trades.map(t=>`<div class="list-item"><span class="num xs" style="width:44px">${t[0]}</span><span class="tag ${t[1]==='买入'?'good':'gray'}">${t[1]}</span><b class="num grow">${t[2]}</b><span class="num xs muted">${t[3]}</span></div>`).join('')}`:''}
    <div class="kicker" style="margin-top:22px">本季重点增持与新建仓</div>
    ${buys.map(([n,r])=>`<div class="list-item"><b class="num" style="width:56px">${r[0]}</b><span class="grow small">${n}</span>${chgCell(r[4],r[5])}</div>`).join('')}
    <p class="xs muted" style="margin-top:14px">示例数据。13F 每季度申报，最长滞后 45 天；ARK 持仓按日披露。</p></section>`;
}
function congressView(){
  const f=U.cg||{side:'全部', ch:'全部'};
  const rows=CONGRESS.filter(r=>(f.side==='全部'||r[7].startsWith(f.side)) && (f.ch==='全部'||r[3]===f.ch));
  const buy=CONGRESS.filter(r=>r[7].startsWith('买入')).length, avg=Math.round(CONGRESS.reduce((s,r)=>s+delayDays(r[0],r[1]),0)/CONGRESS.length);
  return `<section class="pad"><div class="cg-stats"><div><span class="xs muted">近 30 日申报</span><b class="num">${CONGRESS.length}</b></div><div><span class="xs muted">买入占比</span><b class="num">${Math.round(buy/CONGRESS.length*100)}%</b></div><div><span class="xs muted">平均申报延迟</span><b class="num">${avg} 天</b></div></div>
    <div class="cg-top">${CG_TOP.map(([s,n,l])=>`<span class="cg-t"><b class="num">${s}</b><span class="xs muted">${l}</span></span>`).join('')}</div>
    <div class="chips" style="margin-top:14px">${['全部','买入','卖出'].map(c=>`<button class="chip" aria-pressed="${f.side===c}" data-act="cg" data-arg="side|${c}">${c}</button>`).join('')}<span style="width:8px"></span>${['全部','众议院','参议院'].map(c=>`<button class="chip" aria-pressed="${f.ch===c}" data-act="cg" data-arg="ch|${c}">${c==='全部'?'两院':c}</button>`).join('')}</div>
    <div class="cg-list">${rows.map(r=>{ const dl=delayDays(r[0],r[1]); return `<div class="cg-r"><div class="cg-l"><b class="num cg-s">${r[6]}</b><span class="tag ${r[7].startsWith('买入')?'good':'gray'}">${r[7]}</span></div>
      <div class="cg-m"><span style="font-weight:700">${r[2]}</span><span class="xs muted">${r[3]} · ${r[4]} · ${r[5]} · ${r[9]}</span></div>
      <div class="cg-a"><span class="num xs">${r[8]}</span><span class="xs muted">交易 ${r[1]} · 申报 ${r[0]}${dl>45?' <span class="down">逾期</span>':''}</span></div></div>`; }).join('') || '<p class="muted small">没有符合条件的申报。</p>'}</div>
    <p class="xs muted" style="margin-top:14px">示例数据，议员姓名以占位符代替。正式版来自众议院书记官办公室与参议院电子申报系统的公开交易报告；法律要求在交易后 45 天内申报，金额只披露区间。</p></section>`;
}
function flowsLocked(kind){
  const prev = kind==='inst'
    ? `<div class="hold">${INSTS[0].rows.slice(0,4).map((r,i)=>`<div class="hold-r"><span class="num xs muted">${i+1}</span><span class="hold-s"><b class="num">${r[0]}</b><span class="xs muted">${esc(r[1])}</span></span><span class="hold-w"><i style="width:${70-i*12}%"></i></span><span class="num small">••%</span><span class="xs muted">••</span></div>`).join('')}</div>`
    : `<div class="cg-list">${CONGRESS.slice(0,3).map(r=>`<div class="cg-r"><div class="cg-l"><b class="num cg-s">${r[6]}</b><span class="tag gray">••</span></div><div class="cg-m"><span style="font-weight:700">••••</span><span class="xs muted">${r[3]} · ••</span></div><div class="cg-a"><span class="num xs">$••,•••</span></div></div>`).join('')}</div>`;
  const intro = kind==='inst' ? `ARK、Citadel、Berkshire、Bridgewater、Pershing Square 等 ${INSTS.length} 家机构的前十大持仓、季度增减持与 ARK 每日交易。` : '国会议员公开申报的股票与期权交易：标的、方向、金额区间、交易日与申报日，可按两院与买卖方向筛选。';
  return `<section class="pad"><div class="lockwrap"><div class="blurred" aria-hidden="true">${prev}</div></div>
    ${paywallBox({src:kind, id:kind, note: kind==='inst'?'机构持仓为订阅内容':'国会交易为订阅内容', intro})}</section>`;
}
function flowsPage(kind){
  if(!isPro()){ U._pw=U._pw||{}; if(!U._pw['flows-'+kind]){ U._pw['flows-'+kind]=1; track('paywall_view',{src:kind}); } return zone('flows', flowsLocked(kind)) + footer(); }
  return zone('flows', kind==='inst'?instView():congressView()) + footer();
}
