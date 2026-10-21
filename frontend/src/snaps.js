// ---------- Snapshots: staggered all-day schedule (sample content) ----------
// Each sector publishes at its own times, so something new lands roughly every 30 minutes (US Eastern).
const SNAP_SCHEDULE = {
  '美股':['06:30','09:35','12:00','14:30','16:05'],
  '期权':['07:00','09:45','11:30','13:30','15:30'],
  '债券':['07:15','09:20','11:45','13:05','15:15'],
  '期货':['06:45','08:45','10:15','12:15','14:15','17:15'],
  '大宗':['07:30','10:30','13:00','15:00'],
  '宏观':['08:00','10:00','12:30','14:00','16:30'],
  '政治':['08:30','11:00','15:45'],
};
const SEED_SNAPSHOTS = [
  // 美股
  {id:'us-0630', time:'06:30', sector:'美股', sym:'SPX', title:'盘前', text:'标普 500 期货盘前上涨 0.3%，纳指 100 期货上涨 0.4%，科技权重股领涨。盘前成交量约为 20 日均值的 85%。隔夜亚太市场涨跌互现，日经 225 收涨 0.6%。今日关注零售销售数据与三家成分股财报，本周期权到期结构集中在周五。',
   data:[['标普期货','+0.31%','up'],['纳指期货','+0.42%','up'],['日经 225','+0.60%','up']]},
  {id:'us-0935', time:'09:35', sector:'美股', sym:'SPX', title:'开盘', text:'开盘 5 分钟，标普 500 涨 0.38% 报 6,739，纳指 100 涨 0.55%。上涨与下跌家数之比为 1.4 : 1，市值加权跑赢等权约 0.3 个百分点，上涨集中在半导体与软件。NVDA 开盘涨 1.5%，成交额居全市场首位。',
   data:[['SPX','6,739','up'],['涨跌家数比','1.4','up'],['NVDA','+1.5%','up']]},
  {id:'us-1200', time:'12:00', sector:'美股', sym:'SPX', title:'午盘', text:'午盘标普 500 涨 0.42%，上午区间 6,721 至 6,751，振幅仅 0.45%。11 个板块中 7 个上涨，科技与通信服务领涨，公用事业与房地产走弱。纽交所成交量较 20 日均值低 12%，资金整体偏谨慎。',
   data:[['日内振幅','0.45%',''],['上涨板块','7 / 11','up'],['成交量','−12%','down']]},
  {id:'us-1430', time:'14:30', sector:'美股', sym:'SPX', title:'尾盘前', text:'距收盘 90 分钟，指数在 6,740 附近窄幅震荡，连续第三个小时未突破上午高点。等权标普 500 仅涨 0.1%，与市值加权的分化扩大到 0.3 个百分点。TSLA 跌 0.8%，拖累可选消费板块。',
   data:[['等权 SPX','+0.10%','up'],['分化','0.30pp',''],['TSLA','−0.8%','down']]},
  {id:'us-1605', time:'16:05', sector:'美股', sym:'SPX', title:'收盘', text:'收盘：标普 500 涨 0.42% 报 6,742.18，纳指 100 涨 0.61%，道指涨 0.28%。全天成交 112 亿股，低于 20 日均值。AAPL、TSLA 财报日程临近，期货盘后走平。',
   data:[['SPX','+0.42%','up'],['NDX','+0.61%','up'],['成交','112 亿股','']]},
  // 期权
  {id:'op-0700', time:'07:00', sector:'期权', sym:'SPX', title:'盘前 Gamma', pro:true, text:'SPX 盘前位于 Gamma 翻转点上方约 0.9%，处于正 Gamma 区间，做市商对冲倾向抑制波动。当日到期合约的未平仓量集中在平值上方 50 点以内，开盘后价格容易被钉在大额行权价附近。',
   data:[['环境','正 Gamma','up'],['距翻转点','+0.9%','up'],['净 GEX','+$2.7bn','up']]},
  {id:'op-0945', time:'09:45', sector:'期权', sym:'SPX', title:'开盘 Gamma', pro:true, text:'开盘 15 分钟，SPX 当日到期合约成交 41 万张，占 SPX 期权总成交的 47%，集中在平值附近。看涨与看跌成交比 1.12，较昨日回升。指数仍在正 Gamma 区间，日内实际波动率 9.8%，低于隐含波动率。',
   data:[['0DTE 占比','47%',''],['看涨 / 看跌','1.12','up'],['实际波动','9.8%','']]},
  {id:'op-1130', time:'11:30', sector:'期权', sym:'VIX', title:'波动率', text:'VIX 跌 3.1% 至 16.84，近月 VIX 期货与现货价差扩大到 1.2 点，期限结构正常升水。SPX 30 天平值隐含波动率 14.2%，处于近一年 25% 分位。看跌偏度小幅走平，市场对下行保护的需求减弱。',
   data:[['VIX','16.84','down'],['IV30','14.2%',''],['一年分位','25%','']]},
  {id:'op-1330', time:'13:30', sector:'期权', sym:'QQQ', title:'午后异动', pro:true, text:'QQQ 当日到期看跌期权成交在午后放大，集中在平值下方 2% 以内，成交量为上午同时段的 1.6 倍。QQQ 仍在正 Gamma 区间，但距翻转点只有约 1%，若跌破，做市商对冲方向可能切换。',
   data:[['QQQ','608.35','up'],['看跌成交','×1.6','down'],['距翻转点','+1.0%','up']]},
  {id:'op-1530', time:'15:30', sector:'期权', sym:'SPX', title:'尾盘 Gamma', pro:true, text:'收盘前 30 分钟，SPX 当日到期合约的 Gamma 敞口升至全天高点，Charm 流量倾向推动指数向大额行权价靠拢。今日未平仓量最大的行权价 6,750 距现价不到 0.2%。',
   data:[['最大持仓行权价','6,750',''],['距现价','0.12%',''],['0DTE Gamma','全天高点','up']]},
  // 大宗
  {id:'cm-0730', time:'07:30', sector:'大宗', sym:'WTI', title:'早盘', text:'WTI 原油亚洲时段跌 0.6% 至 71.50 美元，市场预期本周 EIA 库存连续第三周增加，布伦特与 WTI 价差 3.9 美元。黄金报 3,408 美元，美元指数走弱 0.2%，对金价形成支撑。',
   data:[['WTI','71.50','down'],['黄金','3,408','up'],['美元指数','−0.2%','down']]},
  {id:'cm-1030', time:'10:30', sector:'大宗', sym:'WTI', title:'期权结构', text:'WTI 期权看跌偏度升至一个月高位，25 Delta 看跌与看涨的隐含波动率差为 4.1 个百分点。原油 30 天隐含波动率 31%，高于 26% 的实际波动率。铜价持平，工业金属缺乏方向。',
   data:[['看跌偏度','4.1pp','down'],['原油 IV30','31%',''],['实际波动','26%','']]},
  {id:'cm-1300', time:'13:00', sector:'大宗', sym:'WTI', title:'异动', text:'WTI 原油午盘 15 分钟内跌 0.9%，触发异动阈值，报 71.30 美元。同期汽油期货跌 1.1%，需求端担忧主导。黄金在 3,410 美元上方窄幅震荡，白银跌 0.4%。',
   data:[['WTI 15 分钟','−0.9%','down'],['汽油期货','−1.1%','down'],['白银','−0.4%','down']]},
  {id:'cm-1500', time:'15:00', sector:'大宗', sym:'GOLD', title:'收盘', text:'原油收于 71.35 美元，跌 0.88%；黄金报 3,412.70 美元，涨 0.25%。金油比升至 47.8，为近两个月高位，市场对增长的担忧多于对通胀的担忧。',
   data:[['WTI','71.35','down'],['黄金','3,412.70','up'],['金油比','47.8','up']]},
  // 债券
  {id:'bd-0715', time:'07:15', sector:'债券', sym:'US10Y', title:'早盘利率', text:'亚洲与欧洲时段美债小幅走弱，10 年期收益率上行 2 个基点至 4.17%，2 年期上行 1 个基点至 3.57%，曲线略有变陡。德国 10 年期国债收益率上行 3 个基点，欧洲供给压力外溢。隔夜美债期货成交量约为 20 日均值的 70%，交投清淡。',
   data:[['10 年期','4.17%','up'],['2 年期','3.57%','up'],['德债 10Y','+3bp','up']]},
  {id:'bd-0920', time:'09:20', sector:'债券', sym:'US2Y', title:'开盘前', text:'现货开盘前，2s10s 利差报 60 个基点，较上周五扩大 1 个基点；3 个月与 10 年期利差 30 个基点。10 年期盈亏平衡通胀率 2.31%，实际收益率 1.87%，名义利率上行主要来自实际利率而非通胀预期。',
   data:[['2s10s','60bp','up'],['盈亏平衡','2.31%',''],['实际利率','1.87%','up']]},
  {id:'bd-1145', time:'11:45', sector:'债券', sym:'US10Y', title:'波动与信用', text:'MOVE 指数回落 1.8 点至 92.4，利率波动率处于今年以来 30% 分位。投资级信用利差 78 个基点，高收益 286 个基点，均较上周收窄。信用市场没有跟随利率上行出现压力，风险偏好整体平稳。',
   data:[['MOVE','92.4','down'],['IG OAS','78bp','down'],['HY OAS','286bp','down']]},
  {id:'bd-1305', time:'13:05', sector:'债券', sym:'US30Y', title:'拍卖结果', text:'20 年期国债拍卖 130 亿美元，中标收益率 4.665%，较发行前交易水平高 0.8 个基点，需求略弱。投标倍数 2.58 倍，低于近六次均值 2.64 倍；间接投标人占 66.2%。拍卖后 30 年期收益率上行 1 个基点。',
   data:[['中标收益率','4.665%','up'],['投标倍数','2.58','down'],['尾差','+0.8bp','down']]},
  {id:'bd-1515', time:'15:15', sector:'债券', sym:'US10Y', title:'收盘', text:'现货收盘：10 年期收益率 4.18%，上行 3 个基点；30 年期 4.71%，2 年期 3.58%。曲线整体平行上移，期限溢价小幅回升。明日关注 5 年期 TIPS 增发与每周初请失业金数据。',
   data:[['10 年期','4.18%','up'],['30 年期','4.71%','up'],['2 年期','3.58%','up']]},
  // 期货
  {id:'fu-0645', time:'06:45', sector:'期货', sym:'ES', title:'隔夜盘', text:'Globex 隔夜时段，E-mini 标普 500 期货涨 0.31% 报 6,762，纳指期货涨 0.42%，罗素 2000 期货跌 0.1%。隔夜成交 42 万手，约为 20 日均值的 80%。期指相对现货升水 26 点，与距 12 月到期的持有成本一致。',
   data:[['ES','+0.31%','up'],['NQ','+0.42%','up'],['RTY','−0.10%','down']]},
  {id:'fu-0845', time:'08:45', sector:'期货', sym:'ZN', title:'利率期货', text:'10 年期美债期货跌 6/32 至 112-22+，长期国债期货跌 11/32。联邦基金期货隐含 12 月降息 25 个基点的概率为 64%，较昨日下降 3 个百分点。2 年期期货持仓量增加 4.2 万手，资金在短端加仓。',
   data:[['ZN','−6/32','down'],['12 月降息','64%','down'],['2 年期持仓','+42K','up']]},
  {id:'fu-1015', time:'10:15', sector:'期货', sym:'VIX', title:'VIX 期货', text:'VIX 期货曲线保持正常升水，11 月合约 17.95，12 月 18.82，近两月价差 0.87 点，处于近三个月高位。现货与近月升水 1.1 点，展期收益对做空波动率策略有利，但升水扩大也意味着远端对冲需求仍在。',
   data:[['VX 11月','17.95',''],['近两月价差','0.87','up'],['升水','1.1 点','']]},
  {id:'fu-1215', time:'12:15', sector:'期货', sym:'WTI', title:'能源金属', text:'WTI 12 月合约报 71.30 美元，跌 0.9%；天然气跌 1.6% 至 3.41 美元，暖冬预报压制需求。铜期货涨 0.6% 至 4.98 美元，白银小跌 0.4%。原油近月与次月价差收窄至 0.28 美元，现货偏紧程度缓解。',
   data:[['WTI','−0.9%','down'],['天然气','−1.6%','down'],['铜','+0.6%','up']]},
  {id:'fu-1415', time:'14:15', sector:'期货', sym:'ES', title:'持仓与资金', text:'E-mini 标普 500 期货持仓量 214 万手，较上周增加 3.1 万手，价格上涨伴随持仓增加，属于新多头入场。最新 CFTC 持仓报告显示资产管理人净多头 82 万手，杠杆基金净空头 31 万手，两者分歧较上期扩大。',
   data:[['ES 持仓','2.14M','up'],['资管净多','82 万手','up'],['杠杆基金净空','31 万手','down']]},
  {id:'fu-1715', time:'17:15', sector:'期货', sym:'ES', title:'日盘结算', text:'日盘结算：ES 收于 6,768.50，涨 0.40%；NQ 涨 0.61%；ZN 跌 6/32；黄金期货涨 0.3%，欧元期货涨 0.2%。Globex 18:00（美东）重新开盘，亚洲时段关注日本央行官员讲话。',
   data:[['ES','6,768.50','up'],['黄金','+0.3%','up'],['欧元','+0.2%','up']]},
  // 宏观
  {id:'mc-0800', time:'08:00', sector:'宏观', sym:'US10Y', title:'数据', text:'美国 9 月零售销售环比增长 0.4%，高于预期的 0.3%，剔除汽车后增长 0.5%。数据公布后 2 年期收益率上行 2 个基点至 3.62%，利率期货对年内降息次数的定价基本不变。',
   data:[['零售销售','+0.4%','up'],['预期','+0.3%',''],['2 年期','3.62%','up']]},
  {id:'mc-1000', time:'10:00', sector:'宏观', sym:'US10Y', title:'利率', text:'10 年期美债收益率报 4.18%，较昨日上行 3 个基点；2 年与 10 年期利差 56 个基点。美元指数跌 0.2%，日元走强。MOVE 指数 92，利率波动率仍高于股票波动率。',
   data:[['10 年期','4.18%','up'],['2s10s','56bp',''],['MOVE','92','']]},
  {id:'mc-1230', time:'12:30', sector:'宏观', sym:'US10Y', title:'利率定价', text:'联邦基金期货显示，12 月会议降息 25 个基点的概率为 64%，较一周前下降 6 个百分点。今日 14:00 有美联储官员讲话，市场关注其对资产负债表的表述。',
   data:[['12 月降息概率','64%','down'],['周变化','−6pp','down'],['下一事件','14:00','']]},
  {id:'mc-1400', time:'14:00', sector:'宏观', sym:'US10Y', title:'官员讲话', text:'美联储官员讲话称通胀回落路径仍需观察，没有对 12 月会议给出明确指引。讲话后 10 年期收益率在 4.16% 至 4.20% 之间波动，股指反应有限。',
   data:[['10 年期区间','4.16–4.20%',''],['SPX 反应','±0.1%',''],['指引','无','']]},
  {id:'mc-1630', time:'16:30', sector:'宏观', sym:'US10Y', title:'收盘', text:'收盘：10 年期收益率 4.18%，30 年期 4.71%，美元指数收跌 0.2%。本周关注 7 年期国债拍卖与周四的初请失业金人数。',
   data:[['10 年期','4.18%','up'],['30 年期','4.71%','up'],['美元指数','−0.2%','down']]},
  // 政治
  {id:'po-0830', time:'08:30', sector:'政治', sym:'SPX', title:'政策追踪', text:'预算谈判今日继续，距临时拨款期限还有 11 天。本周国会日程中有 3 个与市场相关的节点：周二众议院拨款委员会会议、周三参议院程序表决、周四财政部再融资讨论。短端国库券利率尚未出现扭曲。',
   data:[['距期限','11 天',''],['本周节点','3 个',''],['短端利率','平稳','']]},
  {id:'po-1100', time:'11:00', sector:'政治', sym:'SPX', title:'最新进展', text:'多家媒体报道两党在支出上限上的分歧缩小（6 个来源）。1 个月期国库券收益率比 3 个月期低 4 个基点，市场尚未计入停摆风险溢价。临近期限的 SPX 期权隐含波动率小幅抬升 0.3 个点。',
   data:[['报道来源','6 个',''],['1M − 3M','−4bp',''],['事件期 IV','+0.3','up']]},
  {id:'po-1545', time:'15:45', sector:'政治', sym:'SPX', title:'明日看点', text:'明日关注众议院程序性投票。若谈判破裂，部分经济数据可能延迟发布，市场将在缺少数据的情况下交易。本条经编辑人工审核。',
   data:[['明日','程序性投票',''],['数据风险','延迟发布','down'],['审核','人工','']]},
];

function snapNow(){ if(S.simTime) return S.simTime; const t=etParts(); return t<'06:00' ? '23:59' : t; }
function isLive(s){ return s.status==='published' || (s.status==='sched' && (s.time<=snapNow() || (S.forcePub||[]).includes(s.id))); }
function liveSnaps(filter){ return S.snapshots.filter(s=>isLive(s) && (!filter || filter(s))).sort((a,b)=>b.time.localeCompare(a.time)); }
function nextSnap(sector){
  const now=snapNow(); const up = S.snapshots.filter(s=>!isLive(s) && (!sector||s.sector===sector)).sort((a,b)=>a.time.localeCompare(b.time))[0];
  return up ? `下一条 ${up.time} · ${SECTOR_FULL[up.sector]}（美东）` : '今日更新已完成 · 明日 06:30 继续（美东）';
}
function snapRow(s){
  const isNew = (U.newSnaps||[]).includes(s.id);
  return `<button class="row" data-act="snap" data-arg="${s.id}"><div class="when"><span class="t">${s.time}</span><span class="s">${s.sector}</span>${isNew?'<span class="newdot">新</span>':''}</div>
    <div class="txt"><strong>${esc(s.title||'')}${s.hot?' · 热点':''}：</strong>${esc(s.text)}
    ${s.data?`<span class="sdata">${s.data.map(d=>`<span class="sd"><span class="k">${esc(d[0])}</span><span class="num ${d[2]||''}">${esc(d[1])}</span></span>`).join('')}</span>`:''}</div>${editImg(SECTOR_IMG[s.sector]||'skyline','snap-img')}</button>`;
}
function snapSheet(id){
  const s=S.snapshots.find(x=>x.id===id); if(!s) return;
  track('snap_open',{sector:s.sector});
  const rel = ARTICLES.find(a=>a.syms.includes(s.sym) && (s.sector!=='期权' || a.chan==='期权'));
  const more = liveSnaps(x=>x.sector===s.sector && x.id!==s.id).slice(0,3);
  openSheet(`<div class="kicker">${SECTOR_FULL[s.sector]} · ${s.time}（美东）· 自动生成</div><h2 style="margin-top:6px">${esc(s.title||'快照')}</h2>
    <p style="font-family:var(--f-serif);font-size:16px;line-height:1.85;margin:8px 0 0">${esc(s.text)}</p>
    ${s.data?`<div class="kv3" style="margin-top:14px;border-top:1px solid var(--line);padding-top:12px">${s.data.map(d=>`<div><div class="k">${esc(d[0])}</div><div class="v ${d[2]||''}" style="font-size:14px">${esc(d[1])}</div></div>`).join('')}</div>`:''}
    ${s.pro && !isPro()?`<div class="tintbox" style="margin-top:14px;display:flex;justify-content:space-between;align-items:center;gap:10px"><span class="small">Call Wall、翻转点与 Put Wall 具体价位为 Pro 内容</span><button class="btn xs primary" data-act="paywall" data-arg="snapshot">查看价位</button></div>`:''}
    <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap"><button class="btn sm" data-go="t-${s.sym}">${symLabel(s.sym)} 行情与讨论 ›</button>${rel?`<button class="btn sm ghost" data-go="a-${rel.id}">相关深度 ›</button>`:''}</div>
    ${more.length?`<div style="margin-top:18px;border-top:3px solid var(--strong);padding-top:8px"><div style="font-weight:700;font-size:14px">${SECTOR_FULL[s.sector]} 今日更早</div>${more.map(snapRow).join('')}</div>`:''}
    <p class="xs muted" style="margin-top:12px">${nextSnap()} · 本条为示例数据，仅供参考，不构成投资建议。</p>`,'快照');
}
function simOptions(){
  const opts=[['','实时（美东）']].concat(['07:15','09:50','12:10','14:10','16:40'].map(t=>[t,'模拟 '+t]));
  return opts.map(([v,l])=>`<option value="${v}" ${ (S.simTime||'')===v?'selected':''}>${l}</option>`).join('');
}
function markSeen(){ const live=liveSnaps().map(s=>s.id); U.newSnaps = (S.seenSnaps&&S.seenSnaps.length) ? live.filter(id=>!S.seenSnaps.includes(id)) : []; S.seenSnaps = Array.from(new Set((S.seenSnaps||[]).concat(live))); save(); }
// Publish newly due snapshots while the app is open.
let _liveCount = null;
setInterval(()=>{ const n=liveSnaps().length; if(_liveCount!==null && n>_liveCount){ const add=n-_liveCount; U.newSnaps=(U.newSnaps||[]).concat(liveSnaps().slice(0,add).map(s=>s.id)); toast(`新快照 ${add} 条`); if(U.route==='home') rerender(); } _liveCount=n; }, 30000);
