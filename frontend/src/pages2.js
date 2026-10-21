// ---------- Me ----------
const ROLE_NAME = {guest:'访客', free:'免费用户', pro:'Pro 会员', elite:'高级会员', admin:'管理员'};
function pageMe(){
  let status;
  if(S.role==='guest') status = `<div style="font-size:15px;font-weight:700">尚未登录</div><div class="small sub" style="margin-top:4px">注册免费账号，同步自选、设置提醒</div><button class="btn" style="margin-top:14px" data-act="register" data-arg="me">注册 / 登录</button>`;
  else if(isPro()) status = `<div style="font-size:15px;font-weight:700">${esc(uname())} · ${ROLE_NAME[S.role]}</div><div class="small sub" style="margin-top:4px">${S.plan==='annual'?'Pro 年付':S.plan==='monthly'?'Pro 月付':'全部功能已开通'}</div>`;
  else status = `<div style="font-size:15px;font-weight:700">${esc(uname())} · 免费用户</div><div class="small sub" style="margin-top:4px">深度文章可读开头 · 提醒 ${S.alerts.length}/1 条</div><button class="btn" style="margin-top:14px" data-act="paywall" data-arg="me">订阅 Pro</button>`;
  const item = (go,label,right='',act) => `<button class="list-item" ${act?`data-act="${act}"`:`data-go="${go}"`}><span class="grow" style="font-size:15px">${label}</span><span class="small muted">${right}</span>${IC.chev}</button>`;
  return `<header class="band paper pad" style="padding-block:4px 22px"><div class="topbar"><span class="latin" style="font-weight:800;font-size:17px;letter-spacing:-0.03em">我的</span><span class="tag">${ROLE_NAME[S.role]}</span></div>${status}</header>
  <section class="pad">
    ${item('books','期权书籍', isPro()?'会员 '+(10-bookCfg().discount/10)+' 折':'')}
    ${item('shelf','我的书架', (S.purchases||[]).length+' 本')}
    ${item('saved','我的收藏', S.bookmarks.length+' 篇')}
    ${item('watch','价位提醒', S.alerts.length+' 条')}
    ${item('watch','自选标的', S.watchlist.length+' 个')}
    ${item('', '关注板块', S.interests.join('、'), 'interests')}
    ${item('', '通知设置', '', 'notif')}
    ${item('', '邀请好友，双方各得 1 个月 Pro', S.referral, 'invite')}
    ${item('pricing','订阅方案', isPro()?'':'年付立省 '+annualSave()+'%')}
    ${item('calendar','事件日历')}
    ${item('academy','Gamma 学院')}
    ${item('method','数据与方法论')}
    ${S.role==='admin'?item('admin','进入编辑后台'):''}
  </section>
  <section class="pad sec"><div class="box soft" style="border-style:dashed">
    <div class="kicker">测试工具 · 正式版移除</div><h2 class="h2" style="font-size:17px;margin-top:4px">演示身份切换</h2>
    <p class="small muted" style="margin:6px 0 10px">切换身份即可测试不同权限下的界面和付费墙。</p>
    <div class="chips">${['guest','free','pro','admin'].map(r=>`<button class="chip" aria-pressed="${S.role===r}" data-act="role" data-arg="${r}">${ROLE_NAME[r]}</button>`).join('')}</div>
    <div class="chips" style="margin-top:10px">
      <label class="chip" for="simt">快照时间 <select id="simt" data-change="simtime" style="border:0;background:none">${simOptions()}</select></label>
      <button class="chip" data-act="onboard">重新显示新手引导</button>
      <button class="chip" data-act="reset-all">重置全部演示数据</button>
    </div></div></section>` + footer();
}
function pageSaved(){
  const list = ARTICLES.filter(a=>S.bookmarks.includes(a.id));
  return subHeader('我的收藏') + `<div class="pad">${list.map(artRow).join('') || '<p class="muted" style="padding-top:16px">还没有收藏的文章。在文章页点右上角的书签即可收藏。</p>'}</div>` + footer();
}

// ---------- Pricing ----------
function pagePricing(){
  const P=S.pricing; const annual = U.bill==='annual';
  const proPrice = annual ? `$${P.annual}<span style="font-size:14px;font-weight:600">/年</span>` : `$${P.monthly}<span style="font-size:14px;font-weight:600">/月</span>`;
  const sub = annual ? `折合每月 $${(P.annual/12).toFixed(2)}，比月付省 ${annualSave()}%` : `按月扣费，随时取消`;
  const rows = [['今日快照（各板块 4 个时段）',1,1],['行情、事件日历、Gamma 学院',1,1],['Gamma 环境（正/负）',1,1],['深度文章','开头','全文'],['Gamma Map 关键价位与完整地形',0,1],['行权价明细与到期分布',0,1],['价位提醒','1 条','不限'],['评论与讨论区发言',0,1],['全部视频',0,1],['期权书籍（中 / 英文版）','原价',`${10-bookCfg().discount/10} 折`],['债券 / 期货数据与快照',1,1,1],['机构持仓（13F 与 ARK 每日持仓）',0,1],['国会议员交易申报',0,1],['GEX 热力图（行权价 × 到期日）',0,0,1],['热力图盘中回放',0,0,1]];
  const cell = v => v===1?`<span class="up">${IC.check}</span>`: v===0?'<span class="muted">—</span>':`<span class="small">${v}</span>`;
  const offL = S.offerStart ? offerLeft() : 0;
  return subHeader('订阅方案',{sub:'独立的宏观经济与衍生品研究'}) + `<div class="pad" style="padding-top:18px">${offL?offerBox(offL):''}
    <div class="seg light" role="tablist" aria-label="计费周期"><button role="tab" aria-selected="${annual}" data-act="bill" data-arg="annual">年付 · 省 ${annualSave()}%</button><button role="tab" aria-selected="${!annual}" data-act="bill" data-arg="monthly">月付</button></div>
    <div class="plans" style="margin-top:14px">
      <div class="plan hi"><div style="display:flex;justify-content:space-between;align-items:center"><span class="latin" style="font-weight:800;font-size:18px">Pro</span>${annual?'<span class="tag solid">最受欢迎</span>':''}</div>
        <div class="price">${proPrice}</div><div class="small muted">${sub}</div>
        ${isPro() ? `<button class="btn block" disabled>当前方案</button>` : `
        <button class="btn block primary" data-act="subscribe" data-arg="${U.bill}">订阅 Pro</button>`}
        <div class="xs muted">${annual?'按年扣费':'按月扣费'} · 可随时在“我的”中取消续订</div></div>
      ${SHOW_ELITE?eliteCard():''}
      <div class="plan"><span class="latin" style="font-weight:800;font-size:18px">免费</span><div class="price">$0</div><div class="small muted">快照、行情与学院，适合入门了解</div>${S.role==='guest'?`<button class="btn block" data-act="register" data-arg="pricing">注册免费账号</button>`:''}</div>
    </div>
    <section class="sec"><div class="sec-head"><h2 class="h2">权益对比</h2></div>
      <div style="overflow-x:auto"><table class="cmp"><thead><tr><th>功能</th><th>免费</th><th>Pro</th>${SHOW_ELITE?'<th>高级</th>':''}</tr></thead><tbody>${rows.filter(r=>SHOW_ELITE||r.length<4||r[2]).map(r=>`<tr><td>${r[0]}</td><td>${cell(r[1])}</td><td>${cell(r[2])}</td>${SHOW_ELITE?`<td>${cell(r[3]??r[2])}</td>`:''}</tr>`).join('')}</tbody></table></div></section>
    <section class="sec"><div class="sec-head"><h2 class="h2">常见问题</h2></div>
      ${[['可以随时取消吗？','可以。取消后当前计费周期内仍可使用全部 Pro 功能，到期后不再续费。'],['数据来自哪里？','行情与期权持仓来自授权数据源，Gamma 敞口由我们按公开方法计算，详见“数据与方法论”。初版为示例数据。'],['可以开发票吗？','可以，订阅后在“我的 → 订阅管理”申请。'],['内容是投资建议吗？','不是。所有内容仅供一般性信息参考，不构成针对个人的投资建议。']].map(([q,a])=>`<details style="border-bottom:1px solid var(--line);padding:12px 0"><summary style="cursor:pointer;font-weight:700;font-size:14px">${q}</summary><p class="small muted" style="margin:8px 0 0;line-height:1.7">${a}</p></details>`).join('')}</section>
  </div>` + footer();
}

// ---------- Calendar / Academy / Method / Search ----------
function pageCalendar(){
  const op=nextOpex(); const f=U.calf||'全部'; const ev=upcomingEvents().filter(e=> f==='全部' || (f==='财报') === (e.type==='财报'));
  return subHeader('事件日历',{sub:'央行、数据、财报与期权到期'}) + `<div class="pad" style="padding-top:16px">
    <div class="tintbox" style="display:flex;justify-content:space-between;align-items:center"><div><div class="xs muted">下一个月度期权到期（OPEX）</div><div class="num" style="font-weight:600;font-size:16px">${op.label}</div><div class="xs muted" style="margin-top:2px">到期后 Gamma 结构通常明显重置</div></div><div class="num" style="font-size:30px;font-weight:600;color:var(--accent-text)">${op.days}<span class="small muted"> 天</span></div></div>
    <div class="chips" role="group" aria-label="事件类型" style="margin-top:14px">${['全部','财报','宏观'].map(c=>`<button class="chip" aria-pressed="${f===c}" data-act="calf" data-arg="${c}">${c}</button>`).join('')}</div>
    ${ev.map(e=>`<div class="list-item"><div style="width:58px"><div class="num" style="font-weight:600">${e.d.slice(5).replace('-','/')}</div><div class="xs muted">周${'日一二三四五六'[new Date(e.d+'T12:00:00').getDay()]} ${e.t||''}</div></div><div class="grow"><div style="font-size:14px;${e.hi?'font-weight:700':''}">${e.what}</div>${e.est?`<div class="xs muted">${e.est}</div>`:''}${e.er?`<button class="xs" style="color:var(--accent-text)" data-go="earn-${e.er}">财报数据解析 ${isPro()?'':'· 订阅专享 '}›</button>`:e.sym?`<button class="xs" style="color:var(--accent-text)" data-go="t-${e.sym}">${symLabel(e.sym)} ›</button>`:''}</div><span class="tag ${e.hi?'':'gray'}">${e.type}</span></div>`).join('')}
    <p class="xs muted">示例日程，日期以官方公布为准。正式版将接入经济日历数据源并支持一键加入提醒。</p></div>` + footer();
}
function pageAcademy(){
  return subHeader('Gamma 学院',{sub:'从零读懂期权结构'}) + `<div class="pad">
    <section class="sec"><div class="sec-head"><h2 class="h2">入门课</h2></div>${LESSONS.map(l=>`<button class="list-item" data-act="lesson" data-arg="${l.id}"><span class="grow"><span style="font-size:15px">${l.title}</span><span class="xs muted" style="display:block">${l.mins} 分钟</span></span>${l.free?'<span class="tag good">免费</span>':'<span class="tag pro">PRO</span>'}</button>`).join('')}</section>
    <section class="sec"><div class="sec-head"><h2 class="h2">术语表</h2><span class="xs muted">${GLOSSARY.length} 个词条</span></div>${GLOSSARY.map(g=>`<details style="border-bottom:1px solid var(--line);padding:12px 0"><summary style="cursor:pointer;font-weight:700">${g.k}</summary><p class="small" style="margin:8px 0 0;line-height:1.7;color:var(--ink2)">${g.d}</p></details>`).join('')}</section></div>` + footer();
}
function pageMethod(){
  const p = (t)=>`<p style="margin:0 0 14px;font-size:15px;line-height:1.8">${t}</p>`;
  return subHeader('数据与方法论',{sub:'我们如何计算 Gamma 敞口'}) + `<div class="pad" style="padding-top:18px">${sourcesTable()}
    <section><h2 class="h2" style="font-size:18px;margin-bottom:8px">数据来源</h2>${p('行情与期权持仓数据来自交易所授权的数据供应商，按授权要求延迟至少 15 分钟展示。初版使用示例数据，所有页面均有标注。')}</section>
    <section class="sec"><h2 class="h2" style="font-size:18px;margin-bottom:8px">计算口径</h2>
      <ol style="margin:0 0 14px;padding-left:20px;font-size:15px;line-height:1.8"><li>取全部到期日的未平仓合约，按行权价汇总。</li><li>用 Black-Scholes 模型计算每张合约的 Gamma。</li><li>假设做市商持有看涨期权多头、看跌期权空头的主流口径，得到按行权价的净 Gamma。</li><li>换算为“标的每变动 1% 需要对冲的美元金额”。</li><li>净 Gamma 由负转正的价格为翻转点；正、负 Gamma 最集中的行权价分别为 Call Wall、Put Wall。</li></ol></section>
    <section class="sec"><h2 class="h2" style="font-size:18px;margin-bottom:8px">更新频率</h2>${p('交易时段内每 15 分钟重新计算一次；每日快照按美东时间 06:30、09:45、12:30、16:15 发布。')}</section>
    <section class="sec"><h2 class="h2" style="font-size:18px;margin-bottom:8px">局限</h2>${p('做市商的真实持仓方向无法直接观测，上述口径是行业通行的近似。Gamma 结构描述的是对冲压力，不是价格预测。')}</section>
    <div class="disclosure">所有内容仅供一般性信息参考，不构成投资建议。</div></div>` + footer();
}
function pageSearch(){
  return `<header class="band paper pad" style="padding-block:4px 16px"><div class="topbar"><button class="icon-btn" style="justify-content:flex-start" data-act="back" aria-label="返回">${IC.back}</button><span class="latin" style="font-weight:800;font-size:17px">搜索</span><span style="width:44px"></span></div>
    <label for="q" class="sr">搜索标的、文章或术语</label><input id="q" class="input" style="border-color:var(--strong)" placeholder="搜索标的、文章或术语，如 SPX、翻转点" value="${esc(U.search)}" autocomplete="off"></header>
    <div class="pad" id="search-results">${searchResults()}</div>` + footer();
}
function searchResults(){
  const q=U.search.trim().toLowerCase();
  if(!q) return `<section class="sec"><div class="small muted">热门搜索</div><div class="chips" style="margin-top:8px">${['SPX','翻转点','NVDA','0DTE','期限结构','OPEX'].map(t=>`<button class="chip" data-act="search-fill" data-arg="${t}">${t}</button>`).join('')}</div></section>`;
  const syms = Object.keys(SYMS).filter(s=> s.toLowerCase().includes(q) || SYMS[s].name.toLowerCase().includes(q) || symLabel(s).includes(q));
  const arts = ARTICLES.filter(a=> (a.title+a.dek+a.cat).toLowerCase().includes(q));
  const terms = GLOSSARY.filter(g=> (g.k+g.d).toLowerCase().includes(q));
  const snaps = liveSnaps(s=>(s.title+s.text).toLowerCase().includes(q));
  const books = BOOKS.filter(b=>(b.zh+b.en+b.sub+b.desc).toLowerCase().includes(q));
  let h='';
  if(syms.length) h+=`<section class="sec"><div class="kicker">标的</div>${syms.map(s=>`<button class="list-item" data-go="t-${s}"><span class="latin" style="font-weight:700;width:60px">${symLabel(s)}</span><span class="grow small muted">${SYMS[s].name}</span><span class="num small" data-q="${s}" data-f="px">${pxText(s)}</span></button>`).join('')}</section>`;
  if(arts.length) h+=`<section class="sec"><div class="kicker">深度</div>${arts.map(artRow).join('')}</section>`;
  if(snaps.length) h+=`<section class="sec"><div class="kicker">快照</div>${snaps.map(snapRow).join('')}</section>`;
  if(books.length) h+=`<section class="sec"><div class="kicker">书籍</div>${books.map(b=>bookRow(b,'search')).join('')}</section>`;
  if(terms.length) h+=`<section class="sec"><div class="kicker">术语</div>${terms.map(g=>`<div style="padding:12px 0;border-bottom:1px solid var(--line)"><div style="font-weight:700">${g.k}</div><div class="small" style="color:var(--ink2);margin-top:4px;line-height:1.7">${g.d}</div></div>`).join('')}</section>`;
  return h || `<p class="muted" style="padding-top:20px">没有找到“${esc(U.search)}”相关的内容。</p>`;
}

// ---------- Sheets ----------
const PW_COPY = {
  heatmap:['解锁 GEX 热力图','高级订阅专享：每个行权价与到期日的做市商敞口、最大节点和盘中回放。'],
  gammamap:['查看完整 Gamma 地形','Call Wall、翻转点、Put Wall 三个关键价位，每 15 分钟更新。'],
  'options-tab':['查看行权价明细','主要行权价的净 Gamma 与按到期日的分布。'],
  comment:['加入讨论','订阅用户可发表评论，与作者和其他交易员交流。'],
  discussion:['加入讨论','订阅用户可在标的讨论区发言。'],
  alert:['设置更多提醒','Pro 会员可设置不限数量的价位提醒。'],
  video:['观看全部视频','周度复盘与交易员回忆录全集。'],
  snapshot:['查看 Gamma 关键价位','快照中提到的 Call Wall、翻转点与 Put Wall 具体价位，每 15 分钟更新。'],
  lesson:['解锁全部课程','Gamma 学院进阶课程为 Pro 内容。'],
  books:['会员购书享折扣','Pro 会员购买全部中英文版期权书籍享会员折扣。'],
};
function openPaywall(src){
  track('paywall_view',{src});
  const [t,d] = PW_COPY[src] || ['升级 Gamma Squeeze Pro','专业的期权结构数据与深度研究。'];
  openSheet(`<span class="tag pro">PRO</span><h2 style="margin-top:10px">${t}</h2><p class="small muted" style="margin:0">${d}</p>
    <ul class="benefits">${['全部深度文章，不限篇数','实时 Gamma Map 与关键价位','不限数量的价位提醒','评论区与讨论区发言','全部视频与进阶课程',`期权书籍 ${10-bookCfg().discount/10} 折`].map(b=>`<li>${IC.check}<span>${b}</span></li>`).join('')}</ul>
    <div style="display:flex;flex-direction:column;gap:8px">
    
    <button class="btn block primary" data-act="go-pricing">查看订阅方案 · 年付立省 ${annualSave()}%</button>
    <button class="btn block ghost" data-act="close-sheet">稍后再说</button></div>
    <p class="xs muted" style="margin:10px 0 0">可随时取消续订。</p>`, t);
}
function openRegister(src){
  track('register_view',{src});
  openSheet(`<h2>注册 Gamma Squeeze</h2><p class="small muted" style="margin:0 0 14px">免费注册即可同步自选、设置 1 条价位提醒，并订阅盘前简报。</p>
    <form data-form="register" data-arg="${src}" style="display:flex;flex-direction:column;gap:12px">
      <div><label class="lbl" for="rg-id">手机号或邮箱</label><input id="rg-id" class="input" required autocomplete="email" placeholder="name@example.com"></div>
      <div><label class="lbl" for="rg-name">显示名</label><input id="rg-name" class="input" required maxlength="20" placeholder="评论区显示的名字"></div>
      <label class="check"><input type="checkbox" id="rg-nl" checked> <span>同时订阅每日盘前简报</span></label>
      <button class="btn primary block" type="submit">注册并继续</button>
      <p class="xs muted" style="margin:0">初版为模拟注册，不会发送验证码。</p></form>`,'注册');
}
function openOnboarding(step=1){
  const allSec=['美股','期权','大宗商品','宏观','美国政治'];
  if(step===1) openSheet(`<div class="kicker">欢迎 · 1 / 3</div><h2 style="margin-top:4px">你最关注哪些板块？</h2><p class="small muted" style="margin:0 0 14px">首页会优先展示这些板块的快照与深度。</p>
    <div class="chips">${allSec.map(s=>`<button class="chip" aria-pressed="${S.interests.includes(s)}" data-act="ob-int" data-arg="${s}">${s}</button>`).join('')}</div>
    <button class="btn primary block" style="margin-top:18px" data-act="ob-next" data-arg="2">下一步</button>`,'新手引导');
  else if(step===2) openSheet(`<div class="kicker">欢迎 · 2 / 3</div><h2 style="margin-top:4px">选择要跟踪的标的</h2><p class="small muted" style="margin:0 0 14px">它们会出现在首页“我的自选”。</p>
    <div class="chips">${Object.keys(SYMS).map(s=>`<button class="chip" aria-pressed="${S.watchlist.includes(s)}" data-act="ob-sym" data-arg="${s}">${symLabel(s)}</button>`).join('')}</div>
    <button class="btn primary block" style="margin-top:18px" data-act="ob-next" data-arg="3">下一步</button>`,'新手引导');
  else openSheet(`<div class="kicker">欢迎 · 3 / 3</div><h2 style="margin-top:4px">免费内容与 Pro</h2>
    <ul class="benefits"><li>${IC.check}<span><strong>免费：</strong>全天更新的板块快照、行情、事件日历、Gamma 学院、深度文章开头</span></li><li>${IC.check}<span><strong>Pro：</strong>全部深度、实时 Gamma 关键价位、不限提醒、评论发言</span></li></ul>
    <div style="display:flex;flex-direction:column;gap:8px">${S.role==='guest'?`<button class="btn primary block" data-act="register" data-arg="onboarding">注册免费账号</button>`:''}<button class="btn block" data-act="go-pricing">了解 Pro 订阅</button><button class="btn block ghost" data-act="ob-done">先逛逛</button></div>`,'新手引导');
}
function openDrawer(){
  closeSheet();
  const d=document.createElement('div'); d.id='drawer';
  d.innerHTML = `<div class="scrim" data-act="close-sheet" style="align-items:stretch"></div><nav class="drawer" aria-label="菜单"><div class="brand" style="font-size:28px;color:var(--accent-text)">Gamma<br>Squeeze</div><div style="margin-top:18px">
    ${[['home','首页'],['research','研究'],['community','社区'],['calendar','事件日历'],['academy','Gamma 学院'],['books','期权书籍'],['method','数据与方法论'],['pricing','订阅方案'],['saved','我的收藏']].map(([r,l])=>`<button class="item" data-go="${r}">${l}${IC.chev}</button>`).join('')}
    ${S.role==='admin'?`<button class="item" data-go="admin" style="color:var(--accent-text);font-weight:700">编辑后台${IC.chev}</button>`:''}</div>
    <p class="xs muted" style="margin-top:18px">当前身份：${ROLE_NAME[S.role]}</p></nav>`;
  document.body.appendChild(d);
}
