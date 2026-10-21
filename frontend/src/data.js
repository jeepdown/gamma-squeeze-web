// ---------- Static sample data (all figures are examples) ----------
const SYMS = {
  SPX:  {name:'标普 500 指数', px:6742.18, prev:6714.02, dec:2, opt:true, step:25, cc:60,  pc:-160, w:120, A:1.0, B:0.78, bn:9.4, iv:'14.2%', zdte:'47%', exp:[47,21,18,14]},
  QQQ:  {name:'纳斯达克 100 ETF', px:608.35, prev:604.66, dec:2, opt:true, step:5, cc:12, pc:-22, w:18, A:1.0, B:0.9, bn:2.1, iv:'19.6%', zdte:'38%', exp:[38,24,22,16]},
  SPY:  {name:'标普 500 ETF', px:672.40, prev:669.62, dec:2, opt:true, step:2.5, cc:6, pc:-16, w:12, A:1.0, B:0.8, bn:3.3, iv:'14.0%', zdte:'52%', exp:[52,19,16,13]},
  NVDA: {name:'NVIDIA', px:182.50, prev:179.80, dec:2, opt:true, step:2.5, cc:8, pc:-10, w:9, A:1.0, B:1.05, bn:1.2, iv:'41.8%', zdte:'22%', exp:[22,31,27,20]},
  TSLA: {name:'Tesla', px:438.20, prev:441.90, dec:2, opt:true, step:5, cc:22, pc:-6, w:16, A:0.8, B:1.1, bn:0.9, iv:'58.3%', zdte:'26%', exp:[26,34,24,16]},
  AAPL: {name:'Apple', px:252.30, prev:250.10, dec:2, opt:true, step:2.5, cc:5, pc:-12, w:9, A:1.0, B:0.7, bn:0.8, iv:'23.1%', zdte:'18%', exp:[18,29,30,23]},
  VIX:  {name:'CBOE 波动率指数', px:16.84, prev:17.38, dec:2, opt:false, iv:'—', zdte:'—'},
  WTI:  {name:'WTI 原油', px:71.35, prev:71.98, dec:2, opt:false, iv:'31.0%', zdte:'—'},
  GOLD: {name:'黄金', label:'黄金', px:3412.70, prev:3404.20, dec:2, opt:false, iv:'16.4%', zdte:'—'},
  US10Y:{name:'美国 10 年期国债收益率', px:4.18, prev:4.15, dec:2, opt:false, yield:true, iv:'—', zdte:'—'},
  // 债券（收益率）
  US3M: {name:'美国 3 个月期国库券收益率', px:3.88, prev:3.89, dec:2, opt:false, yield:true, iv:'—', zdte:'—', bond:true},
  US2Y: {name:'美国 2 年期国债收益率', px:3.58, prev:3.56, dec:2, opt:false, yield:true, iv:'—', zdte:'—', bond:true},
  US5Y: {name:'美国 5 年期国债收益率', px:3.72, prev:3.70, dec:2, opt:false, yield:true, iv:'—', zdte:'—', bond:true},
  US30Y:{name:'美国 30 年期国债收益率', px:4.71, prev:4.69, dec:2, opt:false, yield:true, iv:'—', zdte:'—', bond:true},
  // 期货（主力合约）
  ES:  {name:'E-mini 标普 500 期货', px:6768.50, prev:6741.25, dec:2, opt:false, iv:'14.0%', zdte:'—', fut:{grp:'股指', exch:'CME', ct:'12月', oi:'2.14M', vol:'1.38M', basis:'+26.3'}},
  NQ:  {name:'E-mini 纳斯达克 100 期货', px:25184.75, prev:25032.00, dec:2, opt:false, iv:'19.1%', zdte:'—', fut:{grp:'股指', exch:'CME', ct:'12月', oi:'268K', vol:'612K', basis:'+118.4'}},
  YM:  {name:'E-mini 道指期货', px:46902, prev:46788, dec:0, opt:false, iv:'12.8%', zdte:'—', fut:{grp:'股指', exch:'CBOT', ct:'12月', oi:'96K', vol:'142K', basis:'+171'}},
  RTY: {name:'E-mini 罗素 2000 期货', px:2466.30, prev:2471.10, dec:2, opt:false, iv:'21.5%', zdte:'—', fut:{grp:'股指', exch:'CME', ct:'12月', oi:'458K', vol:'201K', basis:'+9.6'}},
  NG:  {name:'天然气期货', px:3.412, prev:3.468, dec:3, opt:false, iv:'58.0%', zdte:'—', fut:{grp:'能源', exch:'NYMEX', ct:'11月', oi:'1.52M', vol:'402K', basis:'—'}},
  SI:  {name:'白银期货', px:40.18, prev:40.34, dec:2, opt:false, iv:'27.2%', zdte:'—', fut:{grp:'金属', exch:'COMEX', ct:'12月', oi:'158K', vol:'74K', basis:'—'}},
  HG:  {name:'铜期货', px:4.982, prev:4.951, dec:3, opt:false, iv:'22.6%', zdte:'—', fut:{grp:'金属', exch:'COMEX', ct:'12月', oi:'221K', vol:'88K', basis:'—'}},
  ZN:  {name:'10 年期美债期货', px:112.703, prev:112.906, dec:3, opt:false, iv:'5.9%', zdte:'—', fut:{grp:'利率', exch:'CBOT', ct:'12月', oi:'5.06M', vol:'1.71M', basis:'—'}},
  ZB:  {name:'美国长期国债期货', px:116.250, prev:116.594, dec:3, opt:false, iv:'10.4%', zdte:'—', fut:{grp:'利率', exch:'CBOT', ct:'12月', oi:'1.94M', vol:'412K', basis:'—'}},
  '6E':{name:'欧元期货', label:'欧元', px:1.1712, prev:1.1689, dec:4, opt:false, iv:'7.1%', zdte:'—', fut:{grp:'外汇', exch:'CME', ct:'12月', oi:'812K', vol:'226K', basis:'—'}},
};
// Futures board also lists WTI and GOLD from the commodities set.
const FUT_LIST = ['ES','NQ','YM','RTY','WTI','NG','GOLD','SI','HG','ZN','ZB','6E'];
const FUT_EXTRA = { WTI:{grp:'能源', exch:'NYMEX', ct:'12月', oi:'1.81M', vol:'356K', basis:'—'}, GOLD:{grp:'金属', exch:'COMEX', ct:'12月', oi:'496K', vol:'211K', basis:'—'} };
// 国债收益率曲线：期限、当前收益率（无行情代码的期限用固定示例值）、一周前
const CURVE = [['1M',3.92,3.95],['3M','US3M',3.91],['6M',3.80,3.84],['1Y',3.66,3.70],['2Y','US2Y',3.61],['5Y','US5Y',3.76],['10Y','US10Y',4.20],['20Y',4.66,4.67],['30Y','US30Y',4.70]];
const BOND_STATS = [['2s10s 利差','60bp','+1bp'],['3M10Y 利差','30bp','+3bp'],['5s30s 利差','99bp','0bp'],['10 年期盈亏平衡通胀','2.31%','+2bp'],['10 年期 TIPS 实际收益率','1.87%','+1bp'],['MOVE 指数','92.4','−1.8'],['投资级信用利差 OAS','78bp','−1bp'],['高收益信用利差 OAS','286bp','−4bp']];
const AUCTIONS = [['10/21','20 年期国债','130 亿美元','13:00'],['10/22','5 年期 TIPS 增发','240 亿美元','13:00'],['10/27','2 年期国债','690 亿美元','13:00'],['10/28','5 年期国债','700 亿美元','13:00'],['10/29','7 年期国债','440 亿美元','13:00']];
const VX_CURVE = [['现货',16.84],['11月',17.95],['12月',18.82],['1月',19.40],['2月',19.86],['3月',20.18],['4月',20.42],['5月',20.60]];
const STRIP = ['SPX','VIX','QQQ','ES','US10Y','WTI','GOLD'];
const CHANNELS = ['今日','美股','期权','机构持仓','国会交易','债券','期货','大宗商品','宏观','美国政治','视频'];
const CHAN_SECTOR = {'美股':'美股','期权':'期权','债券':'债券','期货':'期货','大宗商品':'大宗','宏观':'宏观','美国政治':'政治'};
const SECTORS = ['美股','期权','债券','期货','大宗','宏观','政治'];
const SECTOR_FULL = {'美股':'美股','期权':'期权 · Gamma','债券':'债券','期货':'期货','大宗':'大宗商品','宏观':'宏观','政治':'美国政治'};
const AUTHOR = 'Gamma Squeeze 研究部';

const ARTICLES = [
  {id:'gamma-earnings', cat:'期权与波动率', chan:'期权', syms:['SPX','QQQ'], mins:6, base:128, date:'今天 08:12', free:false, feature:true,
   title:'财报周前的 Gamma 地形：做市商对冲会放大还是压住波动？',
   dek:'正 Gamma 区间里，价格往往被“钉”在大额行权价附近；一旦跌破翻转点，对冲方向就会反过来。',
   body:[
    '每到财报密集周，期权市场的仓位结构都会变得格外重要。原因很简单：大量期权集中在少数几个行权价上，做市商为了保持中性，必须跟着价格买卖标的，这些对冲交易本身就会反过来影响价格。',
    '当做市商整体持有正 Gamma 时，价格上涨他们卖出、价格下跌他们买入，相当于在市场里放了一个“减震器”。这就是为什么在某些交易日，指数会反复围绕一个大额行权价来回震荡，怎么也走不远。',
    {t:'chart', sym:'SPX'},
    '问题出在翻转点以下。一旦价格跌入负 Gamma 区，同样的对冲逻辑会变成“追涨杀跌”：价格下跌，做市商需要继续卖出，波动被放大而不是被吸收。',
    {t:'quote', text:'翻转点不是支撑位，它是市场“性格”切换的地方。'},
    '对于做卖方策略的交易者，这意味着同一个铁蝶，在翻转点上方和下方的风险完全不同。我们在每日盘前会更新三个关键价位，并标注当天的结构偏向。',
    {t:'levels', sym:'SPX'},
    '本周还需要留意两类事件：一是成分股龙头的财报，它们的隐含波动率在财报前后的变化会通过指数期权传导；二是周五的到期结构，大量周度合约到期后，Gamma 的“钉住”效应会明显减弱。'
   ]},
  {id:'term-structure', cat:'期权与波动率', chan:'期权', syms:['VIX','SPX'], mins:5, base:64, date:'昨天 17:40', free:false,
   title:'波动率期限结构重新变陡，卖方策略该如何调整',
   dek:'近月隐含波动率回落快于远月，期限结构的斜率回到今年中位数上方。',
   body:[
    'VIX 期货曲线在过去一周重新变陡：近月合约回落，远月相对坚挺。这种形态通常出现在短期事件风险释放、但中期不确定性仍在的阶段。',
    '对卖方策略而言，陡峭的期限结构意味着卖出近月、买入远月的日历价差有更好的赔率，但也要注意近月波动率已处于偏低位置，继续下行的空间有限。',
    {t:'quote', text:'期限结构变陡，说的不是市场更安全，而是风险被推到了后面。'},
    '我们的观察是：在翻转点上方，近月卖方仍然占优；一旦指数跌破翻转点，近月隐含波动率可能快速抬升，日历价差的近腿会承受压力。',
    '建议关注每日盘前更新的 VIX 期限结构快照，以及 SPX 翻转点的位置变化。'
   ]},
  {id:'treasury-auction', cat:'宏观', chan:'宏观', syms:['US10Y'], mins:9, base:46, date:'今天 07:05', free:false,
   title:'美债拍卖需求转弱，期限溢价重回交易台讨论中心',
   dek:'长端拍卖的投标倍数下滑，尾部利差扩大，利率波动率开始向股票波动率传导。',
   body:[
    '最近几次长端国债拍卖的需求指标走弱：投标倍数低于近期均值，海外买家占比下降，拍卖尾部利差扩大。这些信号让“期限溢价”重新成为交易台的热门话题。',
    '期限溢价上升，意味着投资者持有长债要求更高的补偿。它对股票的影响主要通过两条路径：一是折现率抬升压制估值，二是利率波动率上升带动股票隐含波动率。',
    {t:'quote', text:'利率波动率是股票波动率的上游。'},
    '从历史上看，MOVE 指数与 VIX 的相关性在利率主导的阶段明显增强。当前两者的价差处于偏高位置，若利率波动率继续抬升，股票期权的卖方需要更谨慎。',
    '后续关注：本周的 7 年期拍卖、官员讲话中对资产负债表的表述，以及财政部再融资公告。'
   ]},
  {id:'shutdown-risk', cat:'美国政治', chan:'美国政治', syms:['SPX','US10Y'], mins:7, base:212, date:'今天 06:50', free:false,
   title:'预算谈判进入倒计时：停摆风险如何传导到利率和波动率',
   dek:'政治事件的市场影响，往往先体现在短端利率和事件日附近的期权定价上。',
   body:[
    '预算谈判进入关键阶段。对市场而言，真正需要跟踪的不是政治表态本身，而是时间表：哪一天是期限、哪些数据发布可能因停摆延迟。',
    '历史上的政府停摆对股指的直接影响通常有限，但会通过两条路径影响波动率：一是经济数据延迟发布，让市场在“没有数据”的状态下交易；二是短端国债的定价扭曲。',
    {t:'quote', text:'政策日历有时比财报更容易触发 Gamma 翻转。'},
    '期权市场上，事件日附近的到期合约隐含波动率已出现小幅抬升。若谈判进展不顺，指数可能在流动性较弱的时段跌破翻转点，进入放大波动的区间。',
    '我们会在每日政策追踪快照中更新国会日程与市场相关节点。本文不对任何政治立场作出评价。'
   ]},
  {id:'oil-gold', cat:'大宗商品', chan:'大宗商品', syms:['WTI','GOLD'], mins:5, base:31, date:'昨天 15:20', free:false,
   title:'原油与黄金走势分化：美元走弱下的大宗配置',
   dek:'油价跟随需求预期回落，金价在美元走弱与避险需求之间维持高位。',
   body:[
    '过去两周，原油与黄金走出明显分化：WTI 跟随需求预期下修回落，黄金则在美元走弱和央行购金的支撑下维持高位震荡。',
    '原油方面，库存数据连续两周超预期累库，炼厂开工率季节性回落；期权市场上，看跌偏度有所抬升。',
    {t:'quote', text:'当美元走弱时，黄金看的是信用，原油看的是需求。'},
    '黄金方面，隐含波动率回落到近三个月低位，期权市场对继续上行的定价相对克制。',
    '后续关注：EIA 周度库存、OPEC+ 会议纪要以及美元指数的走势。'
   ]},
  {id:'breadth', cat:'美股', chan:'美股', syms:['SPX','QQQ','NVDA','AAPL'], mins:4, base:58, date:'今天 10:05', free:true,
   title:'科技股领涨背后：等权与市值加权的广度分化',
   dek:'市值加权指数创新高，等权指数却跑输，上涨集中在少数龙头。',
   body:[
    '今天开盘后科技股领涨，标普 500 市值加权指数走强，但等权指数表现落后。这种分化说明上涨集中在少数大市值公司。',
    '市场广度偏弱并不必然意味着顶部，但它会让指数对少数个股的财报更加敏感。龙头公司的期权仓位，也会通过指数期权影响做市商的整体对冲需求。',
    {t:'quote', text:'广度是指数的体检报告。'},
    '我们建议同时关注等权指数与市值加权指数的相对表现，以及龙头个股的财报日程。本文为免费阅读文章。'
   ]},
];


const VIDEOS = [
  {id:'v1', series:'交易员回忆录', ep:1, title:'第一次看懂做市商', dur:'18:24', free:true},
  {id:'v4', series:'交易员回忆录', ep:2, title:'0DTE 交易日的一天', dur:'21:47', free:false},
  {id:'v6', series:'交易员回忆录', ep:3, title:'2020 年 3 月：流动性消失的一周', dur:'27:15', free:false},
  {id:'v3', series:'Gamma 入门课', ep:1, title:'翻转点、Call Wall 与 Put Wall', dur:'12:05', free:true},
  {id:'v7', series:'Gamma 入门课', ep:2, title:'做市商对冲的方向与节奏', dur:'10:40', free:true},
  {id:'v8', series:'Gamma 入门课', ep:3, title:'OPEX 前后的结构重置', dur:'13:22', free:false},
  {id:'v2', series:'周度复盘', ep:42, title:'SPX | VIX | QQQ：波动率与仓位', dur:'26:10', free:false, latest:true},
  {id:'v5', series:'周度复盘', ep:41, title:'到期日之后的波动率回归', dur:'24:32', free:true},
  {id:'v9', series:'宏观对谈', ep:1, title:'期限溢价回归：与固收交易员的对话', dur:'38:05', free:false},
];
const VIDEO_SERIES = [
  {name:'交易员回忆录', kind:'纪录片', season:'第一季', desc:'跟随三位期权交易员，重回他们职业生涯里最难忘的交易日。每集一个真实市场时刻。'},
  {name:'Gamma 入门课', kind:'教学系列', season:'共 3 课', desc:'从零理解做市商对冲、Gamma 地形与关键价位，每课 15 分钟以内。'},
  {name:'周度复盘', kind:'市场节目', season:'每周一更新', desc:'研究部每周复盘 SPX、VIX 与 QQQ 的波动率与仓位变化。'},
  {name:'宏观对谈', kind:'访谈', season:'第一季', desc:'与利率、外汇与大宗交易员的长对话，讨论宏观变量如何进入衍生品定价。'},
];
// 研究页检索维度
const ART_META = {
  'gamma-earnings':{events:['财报季','OPEX'], topics:['Gamma 结构','波动率']},
  'term-structure':{events:['OPEX'], topics:['波动率','期限结构']},
  'treasury-auction':{events:['国债拍卖','FOMC'], topics:['利率','期限溢价']},
  'shutdown-risk':{events:['预算谈判','FOMC'], topics:['政策','利率','波动率']},
  'oil-gold':{events:['EIA 库存','OPEC+'], topics:['大宗商品','美元']},
  'breadth':{events:['财报季'], topics:['市场广度','美股结构']},
};
// 脚注：[正文段落序号, 注释]
const ART_NOTES = {
  'gamma-earnings':[[1,'Gamma 敞口按“标的变动 1% 时做市商需要对冲的美元金额”计算，假设做市商持有看涨期权空头、看跌期权多头，详见“数据与方法论”。'],[3,'翻转点为全部到期日加总后的净 Gamma 由负转正的价格，盘中会随标的价格与隐含波动率变化。'],[7,'成分股财报对指数隐含波动率的传导，取决于该成分股在指数中的权重与财报日隐含波动率的跳升幅度。']],
  'term-structure':[[0,'期限结构斜率以 VIX 期货第二个月合约减第一个月合约计算。'],[1,'日历价差在近月隐含波动率处于一年 25% 分位以下时，期权费收入偏低，风险收益比下降。']],
  'treasury-auction':[[0,'尾部利差（tail）指中标收益率高于发行前交易水平（when-issued）的幅度，正值代表需求偏弱。'],[3,'MOVE 指数衡量美债期权隐含波动率，可视为“债券市场的 VIX”。']],
  'shutdown-risk':[[1,'2018—2019 年停摆期间，部分经济数据推迟发布超过一个月。']],
  'oil-gold':[[1,'看跌偏度为 25 Delta 看跌期权与看涨期权的隐含波动率差。']],
  'breadth':[[0,'等权标普 500 指数中，每只成分股权重相同，不受市值大小影响。']],
};
// 正文中的研究数据框：插在第 after 段之后
const ART_DATA = {
  'gamma-earnings':{after:3, title:'本周 SPX 期权结构', rows:[['当日到期占比','47%'],['净 GEX / 1%','+$2.7bn'],['距翻转点','+0.9%'],['看涨 / 看跌成交比','1.12']], src:'Gamma Squeeze 研究部根据期权持仓计算 · 示例数据'},
  'treasury-auction':{after:1, title:'近期长端拍卖需求', rows:[['20 年期 投标倍数','2.58（均值 2.64）'],['20 年期 尾部利差','+0.8bp'],['间接投标人占比','66.2%'],['10 年期期限溢价','+0.42%']], src:'美国财政部拍卖结果 · 示例数据'},
  'shutdown-risk':{after:0, title:'政策日历', rows:[['临时拨款到期','11 天后'],['本周相关表决','3 场'],['1M − 3M 国库券','−4bp'],['事件日附近 IV','+0.3 点']], src:'国会日程与市场数据 · 示例数据'},
  'oil-gold':{after:2, title:'大宗期权定价', rows:[['原油 IV30','31%'],['原油看跌偏度','4.1pp'],['黄金 IV30','16.4%'],['金油比','47.8']], src:'示例数据'},
};
// 首页：编辑精选与每日宏观简报
const EDITOR_PICKS = [
  {id:'gamma-earnings', why:'财报周最重要的结构问题：价格会被钉住，还是被放大？'},
  {id:'treasury-auction', why:'利率波动率重新成为股票波动率的上游。'},
  {id:'shutdown-risk', why:'政治日历如何变成可交易的事件风险。'},
];
const DAILY_BRIEF = {
  title:'期限溢价回升，期权市场仍在押注平静', mins:3,
  items:[
    ['利率','10 年期美债收益率升至 4.18%，上行主要来自实际利率，盈亏平衡通胀率基本持平。'],
    ['美联储','联邦基金期货隐含 12 月降息概率降至 64%，一周下降 6 个百分点。'],
    ['波动率','VIX 回落至 16.84，期限结构升水扩大，市场对近期事件风险定价克制。'],
    ['期权结构','SPX 位于翻转点上方约 0.9%，正 Gamma 环境下指数日内波动受到抑制。'],
    ['今日看点','20 年期国债拍卖（13:00）与美联储官员讲话（14:00，美东）。'],
  ],
};
// 重要市场事件：我们的看点
const EVENT_WHY = {
  'FOMC 利率决议':'决议当周 0DTE 成交通常放大，翻转点附近的波动会被放大。',
  '美国 9 月 CPI':'核心通胀若超预期，利率波动率将率先抬升，再传导到股指期权。',
  '美国三季度 GDP 初值':'增长数据决定期限溢价的方向。',
  '9 月核心 PCE 物价':'美联储最看重的通胀指标。',
  '美国 10 月非农就业':'就业数据日的隐含波动率通常高于普通交易日 30% 以上。',
  '美国 10 月 CPI':'年内最后一次 CPI 前的定价窗口。',
  'NVDA 财报':'指数第一大权重之一，财报前后会显著改变 QQQ 的 Gamma 地形。',
};
// 社区：消息提醒（示例）
const SEED_NOTIFS = [
  {id:'n1', kind:'author', text:'作者回复了你关注的讨论串：《财报周前的 Gamma 地形》', go:'a-gamma-earnings', ago:'45 分钟前', read:false},
  {id:'n2', kind:'reply', text:'SPX_Theta 回复了你在 SPX 讨论区的发言', go:'t-SPX', ago:'2 小时前', read:false},
  {id:'n3', kind:'pick', text:'你的评论被选为“编辑精选”，已进入本月赠礼抽奖', go:'a-shutdown-risk', ago:'昨天', read:true},
  {id:'n4', kind:'research', text:'新研究：《美债拍卖需求转弱，期限溢价重回交易台讨论中心》', go:'a-treasury-auction', ago:'今天 07:05', read:true},
];
// 后台：审核权限
const MOD_ROLES = ['主编','审核员','作者','社区志愿者'];
const MOD_PERMS = [['queue','查看审核队列'],['delete','删除评论'],['pick','设为编辑精选'],['pin','置顶讨论串'],['ban','封禁用户'],['keywords','编辑关键词规则'],['snap','审核与发布快照']];
const MOD_DEFAULT = {
  '主编':{queue:1,delete:1,pick:1,pin:1,ban:1,keywords:1,snap:1},
  '审核员':{queue:1,delete:1,pick:0,pin:0,ban:1,keywords:1,snap:0},
  '作者':{queue:0,delete:0,pick:1,pin:1,ban:0,keywords:0,snap:0},
  '社区志愿者':{queue:1,delete:0,pick:0,pin:0,ban:0,keywords:0,snap:0},
};
const MOD_TEAM = [['编辑部','主编'],['林澈','审核员'],['Gamma Squeeze 研究部','作者'],['波动率老猫','社区志愿者']];

const GLOSSARY = [
  {k:'Gamma', d:'期权 Delta 随标的价格变化的速度。做市商持有的 Gamma 决定了他们需要多频繁、朝哪个方向调整对冲。'},
  {k:'GEX（Gamma 敞口）', d:'按行权价汇总的做市商 Gamma 敞口，通常以“标的每变动 1% 需要对冲的金额”表示。'},
  {k:'翻转点（Gamma Flip）', d:'做市商净 Gamma 由正转负的价格。上方对冲倾向抑制波动，下方倾向放大波动。'},
  {k:'Call Wall', d:'正 Gamma 最集中的行权价，常被视为上方的阻力区。'},
  {k:'Put Wall', d:'负 Gamma 最集中的行权价，常被视为下方的支撑区或加速区。'},
  {k:'0DTE', d:'当日到期的期权。成交占比上升会让日内对冲流量更集中。'},
  {k:'Vanna', d:'Delta 对隐含波动率变化的敏感度。波动率回落时，Vanna 流量常推动指数上行。'},
  {k:'Charm', d:'Delta 随时间流逝的变化。临近到期时，Charm 会带来可预期的对冲流量。'},
  {k:'OPEX', d:'月度期权到期日，通常为每月第三个星期五。到期后 Gamma 结构会明显重置。'},
  {k:'隐含波动率（IV）', d:'从期权价格反推出的市场对未来波动的预期。'},
  {k:'期限结构', d:'不同到期日的隐含波动率连成的曲线。近低远高为正常形态，倒挂往往出现在压力时期。'},
  {k:'Delta 对冲', d:'做市商买卖标的，使期权仓位对价格变化保持中性。'},
];

const LESSONS = [
  {id:'l1', title:'第 1 课：做市商为什么要对冲', mins:6, free:true},
  {id:'l2', title:'第 2 课：读懂 Gamma Map 的三条线', mins:8, free:true},
  {id:'l3', title:'第 3 课：正 Gamma 与负 Gamma 交易日的不同打法', mins:10, free:false},
  {id:'l4', title:'第 4 课：OPEX 前后的结构变化', mins:9, free:false},
];

// t = 美东时间或盘前/盘后；est = 市场预期（示例）
const CAL = [
  {d:'2026-10-21', t:'盘后', what:'NFLX 财报', type:'财报', er:'NFLX', est:'EPS 预期 $6.98'},
  {d:'2026-10-21', t:'08:30', what:'美国 9 月成屋销售', type:'宏观', est:'预期 405 万户'},
  {d:'2026-10-21', t:'10:30', what:'EIA 原油库存', type:'宏观', sym:'WTI', est:'预期 −120 万桶'},
  {d:'2026-10-22', t:'盘后', what:'TSLA 财报', type:'财报', er:'TSLA', sym:'TSLA', est:'EPS 预期 $0.54'},
  {d:'2026-10-22', t:'盘后', what:'IBM 财报', type:'财报', er:'IBM', est:'EPS 预期 $2.45'},
  {d:'2026-10-23', t:'08:30', what:'初请失业金人数', type:'宏观', est:'预期 22.5 万'},
  {d:'2026-10-23', t:'09:45', what:'美国 10 月 PMI 初值', type:'宏观', est:'制造业预期 52.0'},
  {d:'2026-10-23', t:'盘后', what:'INTC 财报', type:'财报', er:'INTC', est:'EPS 预期 $0.02'},
  {d:'2026-10-24', t:'08:30', what:'美国 9 月 CPI', type:'宏观', hi:true, est:'核心同比预期 3.1%'},
  {d:'2026-10-24', t:'10:00', what:'密歇根大学消费者信心终值', type:'宏观', est:'预期 55.0'},
  {d:'2026-10-27', t:'10:00', what:'谘商会消费者信心', type:'宏观', est:'预期 94.0'},
  {d:'2026-10-28', t:'14:00', what:'FOMC 利率决议', type:'央行', hi:true, est:'降息 25bp 概率 64%'},
  {d:'2026-10-28', t:'盘后', what:'MSFT 财报', type:'财报', er:'MSFT', est:'EPS 预期 $3.65'},
  {d:'2026-10-28', t:'盘后', what:'GOOGL 财报', type:'财报', er:'GOOGL', est:'EPS 预期 $2.28'},
  {d:'2026-10-28', t:'盘后', what:'META 财报', type:'财报', er:'META', est:'EPS 预期 $6.70'},
  {d:'2026-10-29', t:'08:30', what:'美国三季度 GDP 初值', type:'宏观', hi:true, est:'环比折年预期 2.4%'},
  {d:'2026-10-29', t:'盘后', what:'AAPL 财报', type:'财报', er:'AAPL', sym:'AAPL', est:'EPS 预期 $1.76'},
  {d:'2026-10-29', t:'盘后', what:'AMZN 财报', type:'财报', er:'AMZN', est:'EPS 预期 $1.58'},
  {d:'2026-10-30', t:'08:30', what:'9 月核心 PCE 物价', type:'宏观', hi:true, est:'同比预期 2.9%'},
  {d:'2026-11-06', t:'08:30', what:'美国 10 月非农就业', type:'宏观', hi:true, est:'预期 +11.0 万'},
  {d:'2026-11-12', t:'08:30', what:'美国 10 月 CPI', type:'宏观', hi:true, est:'核心同比预期 3.0%'},
  {d:'2026-11-19', t:'盘后', what:'NVDA 财报', type:'财报', er:'NVDA', sym:'NVDA', hi:true, est:'EPS 预期 $1.12'},
  {d:'2026-12-09', t:'14:00', what:'FOMC 利率决议', type:'央行', hi:true},
];

const SEED_COMMENTS = {
  'gamma-earnings':[
    {id:'c1', user:'波动率老猫', badge:'pick', text:'补充一点：财报周个股的 Gamma 也会通过指数成分股传导回来，龙头公司财报前后的隐含波动率变化，对指数层面的对冲需求影响不小。', likes:86, ago:'1 小时前', pick:true,
     replies:[{id:'c1r', user:AUTHOR, badge:'author', text:'说得对。下周的复盘会单独拆一下成分股财报对指数 Gamma 的影响。', likes:41, ago:'45 分钟前'}]},
    {id:'c2', user:'SPX_Theta', badge:'pro', text:'翻转点这个概念讲得很清楚。想问一下翻转点的计算是只用当日到期，还是全部到期日加总？两者盘中差别挺大的。', likes:23, ago:'2 小时前'},
    {id:'c3', user:'宏观观察者', text:'这种结构在流动性差的时候更明显。建议后续结合预算谈判的时间表一起看，政策日历有时比财报更容易触发翻转。', likes:17, ago:'3 小时前'},
  ],
  'shutdown-risk':[
    {id:'c4', user:'eagle_76', badge:'pro', text:'短端国债的扭曲确实值得盯，上次停摆前一个月票据利率就开始分化。', likes:12, ago:'2 小时前'},
  ],
  'term-structure':[
    {id:'c5', user:'vega_hunter', badge:'pro', text:'日历价差在翻转点下方的表现差别很大，这点同意。', likes:9, ago:'昨天'},
  ],
};
const SEED_DISC = {
  SPX:[
    {id:'d1', user:'SPX_Theta', text:'今天平值附近的成交特别集中，感觉又是一个被钉住的交易日。', likes:14, ago:'20 分钟前'},
    {id:'d2', user:'波动率老猫', text:'VIX 跌得比指数涨得快，期限结构值得留意。', likes:9, ago:'45 分钟前'},
  ],
  NVDA:[{id:'d3', user:'chip_watch', text:'财报前隐含波动率已经抬上来了，跨式的价格不便宜。', likes:6, ago:'1 小时前'}],
};

const SEED_QUEUE = [
  {id:'q1', text:'想要每天的实盘信号？加群领取，名额有限……', where:'财报周前的 Gamma 地形', aid:'gamma-earnings', user:'trader_8812', meta:'注册 2 天', reason:'引流', src:'ai', risk:0.97, ago:'12 分钟前',
   why:'疑似站外引流：包含“加群”“领取”等招揽用语，且作者注册不足 3 天。'},
  {id:'q2', text:'这只票明天必定翻倍，现在不上车就晚了！', where:'科技股领涨背后', aid:'breadth', user:'moon_rocket', meta:'违规 1 次', reason:'喊单', src:'ai', risk:0.91, ago:'25 分钟前', why:'包含确定性收益承诺与诱导交易用语。'},
  {id:'q3', text:'楼上的你根本不懂期权，别在这里丢人了。', where:'财报周前的 Gamma 地形', aid:'gamma-earnings', user:'vega_hunter', meta:'订阅 8 个月', reason:'人身攻击 · 举报 3', src:'report', risk:0.72, ago:'40 分钟前', why:'3 名用户举报：针对他人的贬损言论。'},
  {id:'q4', text:'又是这帮政客，全都应该……（内容涉及过激政治言论）', where:'预算谈判进入倒计时', aid:'shutdown-risk', user:'eagle_76', meta:'订阅 2 个月', reason:'关键词 · 政治', src:'kw', risk:0.64, ago:'1 小时前', why:'命中政治类敏感关键词，按规则须人工审核。'},
  {id:'q5', text:'卖 put 的仓位要注意翻转点，跌破之后对冲会加速。', where:'财报周前的 Gamma 地形', aid:'gamma-earnings', user:'new_trader_01', meta:'新用户', reason:'新用户首评', src:'new', risk:0.08, ago:'1 小时前', why:'新用户首次评论，按规则先审后发。'},
];
const SEED_USERS = [
  {name:'SPX_Theta', plan:'Pro 年付', since:'14 个月', vio:0},
  {name:'波动率老猫', plan:'Pro 年付', since:'2 年', vio:0},
  {name:'vega_hunter', plan:'Pro 月付', since:'8 个月', vio:1},
  {name:'eagle_76', plan:'Pro 月付', since:'2 个月', vio:0},
  {name:'trader_8812', plan:'免费', since:'2 天', vio:0},
  {name:'moon_rocket', plan:'免费', since:'3 周', vio:1},
  {name:'new_trader_01', plan:'免费', since:'1 天', vio:0},
  {name:'宏观观察者', plan:'Pro 年付', since:'11 个月', vio:0},
];
const SEED_RADAR = [
  {id:'r1', kind:'期权成交异常', time:'12:08', sector:'期权', text:'QQQ 当日到期看跌期权成交量明显放大，集中在平值下方', score:0.88, sym:'QQQ'},
  {id:'r2', kind:'价格异动', time:'11:52', sector:'大宗', text:'WTI 原油 15 分钟跌幅触发阈值', score:0.81, sym:'WTI'},
  {id:'r3', kind:'新闻聚类 · 政治', time:'11:40', sector:'政治', text:'多家媒体报道预算谈判最新进展（6 个来源）', score:0.74, sym:'SPX', review:true},
  {id:'r4', kind:'经济日历', time:'14:00', sector:'宏观', text:'美联储官员讲话（预告）', score:0.55, sym:'US10Y'},
  {id:'r5', kind:'波动率', time:'11:15', sector:'期权', text:'VIX 期限结构前端回落，近月与次月价差扩大', score:0.49, sym:'VIX'},
];
const RADAR_DRAFT = {
  r1:'QQQ 当日到期看跌期权成交在午盘前明显放大，主要集中在平值下方。SPX 仍位于 Gamma 翻转点上方，做市商对冲整体偏向抑制波动。关注下午美联储官员讲话。',
  r2:'WTI 原油午盘前 15 分钟内快速下跌，触发异动阈值。库存数据与需求预期仍是主要驱动，期权市场看跌偏度小幅抬升。',
  r3:'预算谈判最新进展：多家媒体报道双方仍在就支出上限沟通。本周国会日程中的关键节点已更新至政策追踪。市场层面暂未见明显的短端利率扭曲。',
  r4:'今日 14:00 美联储官员将发表讲话。市场关注其对资产负债表与利率路径的表述，10 年期收益率盘中窄幅波动。',
  r5:'VIX 期限结构前端回落，近月与次月价差扩大，短期事件风险定价有所释放。远月隐含波动率相对坚挺。',
};
const DEFAULT_KEYWORDS = ['加群','领取','私信','微信','必定翻倍','稳赚','带单','内幕'];
const BANNED_ADVICE = ['买入','卖出','目标价','建仓','清仓','抄底'];
