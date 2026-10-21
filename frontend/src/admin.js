// ---------- Editor back office ----------
function pageAdmin(){
  if(S.role!=='admin') return subHeader('编辑后台') + `<div class="pad" style="padding-top:20px"><p>编辑后台仅对管理员开放。</p><button class="btn primary" data-act="role" data-arg="admin">切换为管理员（演示）</button></div>`;
  const pend = S.queue.filter(q=>!q.done).length;
  const secs = [['stats','运营统计'],['queue','审核队列',pend],['snap','自动快照'],['articles','深度文章'],['books','书籍'],['giveaway','评论抽奖'],['users','用户与封禁'],['perm','审核权限'],['keywords','关键词规则'],['settings','订阅设置']];
  const body = {stats:adminStats, queue:adminQueue, snap:adminSnap, articles:adminArticles, books:adminBooks, giveaway:adminGiveaway, users:adminUsers, perm:adminPerms, keywords:adminKeywords, settings:adminSettings}[U.asec]();
  return `<div class="admin"><aside class="aside"><div class="brandbox" style="padding:0 20px 18px"><div class="brand" style="font-size:24px">Gamma<br>Squeeze</div><div class="xs" style="color:var(--on-band-2);margin-top:6px">编辑后台</div></div>
    <nav class="nav" aria-label="后台导航">${secs.map(([k,l,c])=>`<button data-act="asec" data-arg="${k}" ${U.asec===k?'aria-current="page"':''}><span>${l}</span>${c?`<span class="cnt">${c}</span>`:''}</button>`).join('')}
    <button data-go="home"><span>← 返回前台</span></button></nav>
    <div class="foot xs" style="padding:18px 20px;color:var(--on-band-2)">已登录：编辑部 · 示例数据</div></aside>
    <main class="amain">${body}</main></div>`;
}
function adminStats(){
  const visits=cnt('app_open'), signups=cnt('signup')+cnt('newsletter_signup'), pw=cnt('paywall_view'), pv=cnt('pricing_view'), conv=cnt('subscribe');
  const steps=[['访问',visits],['注册 / 留资',signups],['触发付费墙',pw],['打开订阅页',pv],['付费订阅',conv]];
  const max=Math.max(1,...steps.map(s=>s[1]));
  const bySrc={}; S.events.filter(e=>e.n==='paywall_view').forEach(e=>{ const k=e.m.src||'其他'; bySrc[k]=(bySrc[k]||0)+1; });
  const SRC={article:'文章付费墙',gammamap:'Gamma Map',comment:'评论发言','options-tab':'期权明细',alert:'第 2 条提醒',discussion:'讨论区',video:'Pro 视频',lesson:'进阶课程',books:'书籍会员折扣',me:'我的页','research-banner':'深度列表横幅','article-end':'文末升级',snapshot:'快照价位',books:'书籍会员折扣'};
  const reads={}; S.events.filter(e=>e.n==='article_read').forEach(e=>{ reads[e.m.id]=(reads[e.m.id]||0)+1; });
  const topArts = Object.entries(reads).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const recent = S.events.slice(-15).reverse();
  const pct=(a,b)=> b? (a/b*100).toFixed(0)+'%' : '—';
  return `<div class="ahead"><div><h1>运营统计</h1><div class="small muted" style="margin-top:4px">本机测试数据 · 你在前台的每一步操作都会记录在这里 · 正式版接入统计服务</div></div><button class="btn sm ghost" data-act="clear-events">清空统计</button></div>
   <div class="kpis">${[['访问次数',visits],['注册 / 留资',signups],['付费墙触发',pw],['付费订阅',cnt('subscribe')],['书籍销量',cnt('book_purchase')],['评论发布',cnt('comment_post')]].map(([k,v])=>`<div class="kpi"><div class="k">${k}</div><div class="v">${v}</div></div>`).join('')}</div>
   <div class="split"><section><h2 class="h2" style="font-size:18px">转化漏斗</h2><div class="funnel" style="margin-top:6px">${steps.map(([l,v],i)=>`<div class="step"><span>${l}${i?`<span class="xs muted" style="display:block">较上一步 ${pct(v,steps[i-1][1])}</span>`:''}</span><div><div class="bar" style="width:${Math.max(6,v/max*100)}%">${v}</div></div></div>`).join('')}</div>
     <h2 class="h2" style="font-size:18px;margin-top:26px">付费墙来源</h2>${Object.keys(bySrc).length? Object.entries(bySrc).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="list-item" style="min-height:44px"><span class="grow">${SRC[k]||k}</span><span class="num">${v}</span></div>`).join('') : '<p class="small muted">还没有触发记录。去前台以免费用户身份打开一篇深度文章试试。</p>'}</section>
   <section><h2 class="h2" style="font-size:18px">热门文章（阅读次数）</h2>${topArts.length? topArts.map(([id,v])=>`<div class="list-item" style="min-height:44px"><span class="grow small">${esc((ARTICLES.find(a=>a.id===id)||{}).title||id)}</span><span class="num">${v}</span></div>`).join('') : '<p class="small muted">暂无阅读记录。</p>'}
     <h2 class="h2" style="font-size:18px;margin-top:26px">最近事件</h2><div class="tbl-wrap" style="margin-top:8px"><table class="tbl" style="min-width:0"><thead><tr><th>时间</th><th>事件</th><th>参数</th></tr></thead><tbody>${recent.map(e=>`<tr><td class="num xs">${new Date(e.t).toTimeString().slice(0,8)}</td><td class="num xs">${e.n}</td><td class="xs muted">${esc(Object.values(e.m).join(' · '))}</td></tr>`).join('') || '<tr><td colspan="3" class="muted small">暂无</td></tr>'}</tbody></table></div></section></div>`;
}
function adminQueue(){
  const F={all:'全部',ai:'AI 标记',kw:'关键词拦截',report:'用户举报',new:'新用户首评'};
  const open = S.queue.filter(q=>!q.done);
  const list = open.filter(q=>U.qfilter==='all'||q.src===U.qfilter);
  const sel = open.find(q=>q.id===U.qsel) || list[0];
  const riskTag = r => r>=0.85?'<span class="tag red">高</span>': r>=0.5?'<span class="tag warn">中</span>':'<span class="tag good">低</span>';
  const today = S.queue.filter(q=>q.src==='report').length;
  return `<div class="ahead"><div><h1>审核队列</h1><div class="small muted" style="margin-top:4px">被自动规则拦截、AI 标记或用户举报的评论 · 风险分为规则模拟</div></div>
    <div style="display:flex;gap:8px"><button class="btn sm ghost" data-act="q-bulk" data-arg="approve">批量通过当前列表</button><button class="btn sm danger" data-act="q-bulk" data-arg="delete">批量删除当前列表</button></div></div>
   <div class="kpis"><div class="kpi"><div class="k">待审核</div><div class="v">${open.length}</div></div><div class="kpi"><div class="k">用户举报</div><div class="v">${today}</div></div><div class="kpi"><div class="k">已处理</div><div class="v">${S.queue.length-open.length}</div></div><div class="kpi"><div class="k">封禁用户</div><div class="v">${S.banned.length}</div></div></div>
   <div class="chips" style="margin-top:18px">${Object.entries(F).map(([k,l])=>`<button class="chip" aria-pressed="${U.qfilter===k}" data-act="qf" data-arg="${k}">${l} ${k==='all'?open.length:open.filter(q=>q.src===k).length}</button>`).join('')}</div>
   <div class="split"><div class="tbl-wrap"><table class="tbl" style="min-width:560px"><thead><tr><th>评论内容</th><th>作者</th><th>原因</th><th>风险</th></tr></thead><tbody>
    ${list.map(q=>`<tr class="${sel&&q.id===sel.id?'sel':''}"><td style="max-width:320px"><button data-act="qsel" data-arg="${q.id}" style="text-align:left"><div style="font-size:13px;line-height:1.5">${esc(q.text)}</div><div class="xs muted" style="margin-top:4px">${esc(q.where)} · ${q.ago}</div></button></td><td><div style="font-weight:600">${esc(q.user)}</div><div class="xs muted">${q.meta}</div></td><td class="small">${q.reason}</td><td style="white-space:nowrap">${riskTag(q.risk)} <span class="num xs">${q.risk.toFixed(2)}</span></td></tr>`).join('') || '<tr><td colspan="4" class="muted" style="padding:24px">队列已清空。</td></tr>'}
   </tbody></table></div>
   ${sel?`<aside class="box"><div class="xs muted">评论详情</div><p style="font-size:15px;line-height:1.7;margin:8px 0">${esc(sel.text)}</p>
     <div class="tintbox small"><strong>判定 ${sel.risk.toFixed(2)}</strong> · ${esc(sel.why||sel.reason)}</div>
     <div style="margin-top:14px;font-size:13px">${[['显示名',sel.user],['用户信息',sel.meta],['所在文章',sel.where],['来源',F[sel.src]]].map(([k,v])=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--line)"><span class="muted">${k}</span><span>${esc(v)}</span></div>`).join('')}</div>
     <div style="display:flex;flex-direction:column;gap:8px;margin-top:14px"><button class="btn sm primary" data-act="q-do" data-arg="${sel.id}|approve">通过并发布</button><button class="btn sm danger" data-act="q-do" data-arg="${sel.id}|delete">删除</button><button class="btn sm ghost" data-act="q-do" data-arg="${sel.id}|mute">删除并禁言 7 天</button><button class="btn sm ghost" data-act="q-do" data-arg="${sel.id}|ban">永久封禁</button></div>
     <form data-form="kw-add" style="display:flex;gap:8px;margin-top:14px"><label for="kw-q" class="sr">关键词</label><input id="kw-q" class="input" style="height:36px" placeholder="加入自动拦截关键词"><button class="btn sm" type="submit">添加</button></form>
     ${sel.aid?`<button class="btn sm ghost block" style="margin-top:8px" data-act="toggle-comments" data-arg="${sel.aid}">${articleCfg(sel.aid).comments?'关闭本文评论':'重新开放本文评论'}</button>`:''}</aside>`:''}</div>`;
}
function adminSnap(){
  const d=S.draft; const checks = d? draftChecks(d) : [];
  const st = sn => isLive(sn) ? ['pub','已发布'] : (S.polPending||[]).includes(sn.id) ? ['pend','待审核'] : ['q', sn.sector==='政治'?'排队 · 需审核':'排队中'];
  const timeline = S.snapshots.filter(x=>x.status==='sched').sort((a,b)=>a.time.localeCompare(b.time));
  return `<div class="ahead"><div><h1>自动快照 <span class="tag ${S.autoPaused?'warn':'good'}" style="vertical-align:middle">${S.autoPaused?'已暂停':'运行中'}</span></h1><div class="small muted" style="margin-top:4px">五个板块错峰发布，全天 ${timeline.length} 条，约每 30 分钟一条 · ${nextSnap()} · 示例数据</div></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><label class="small muted" for="simt-a">模拟美东时间</label><select id="simt-a" class="input" style="height:36px;width:auto" data-change="simtime">${simOptions()}</select><button class="btn sm ghost" data-act="pause-auto">${S.autoPaused?'恢复自动发布':'暂停自动发布'}</button><button class="btn sm primary" data-act="gen-batch">提前发布下一批</button></div></div>
   <h2 class="h2" style="font-size:18px;margin-top:20px">今日排期 <span class="xs muted" style="font-family:var(--f-sans);font-weight:400">各板块时段交错，用户每次打开都有新内容</span></h2>
   <div class="tbl-wrap" style="margin-top:8px"><table class="tbl" style="min-width:640px"><thead><tr><th style="width:130px">板块</th><th>时段（美东）</th><th style="width:120px">发布模式</th></tr></thead><tbody>
    ${SECTORS.map(sec=>`<tr><td style="font-weight:600">${SECTOR_FULL[sec]}</td><td><div style="display:flex;flex-wrap:wrap;gap:8px">${timeline.filter(x=>x.sector===sec).map(x=>{ const [c,l]=st(x); return `<span style="display:inline-flex;gap:6px;align-items:center;border:1px solid var(--line);padding:4px 8px"><span class="num small" style="font-weight:600">${x.time}</span><span class="st ${c}">${l}</span>${c==='pend'?`<button class="btn xs" data-act="pol-approve" data-arg="${x.id}">审核通过</button>`:''}</span>`; }).join('')}</div></td><td class="xs" style="${sec==='政治'?'color:var(--warn);font-weight:700':'color:var(--muted)'}">${sec==='政治'?'必须人工审核':'自动发布'}</td></tr>`).join('')}
   </tbody></table></div>
   <div class="split"><section><h2 class="h2" style="font-size:18px">热点雷达 <span class="xs muted" style="font-family:var(--f-sans);font-weight:400">排期之外的突发快照 · 每分钟扫描</span></h2>
    ${S.radar.map(r=>`<div class="list-item" style="align-items:flex-start;padding:12px 0"><div class="grow"><div class="xs muted">${r.kind} · <span class="num">${r.time}</span></div><div style="font-size:14px;margin-top:3px">${esc(r.text)}</div></div><span class="num small" style="width:36px">${r.score.toFixed(2)}</span>
      ${r.used?'<span class="tag gray">已生成</span>':`<button class="btn xs ${r.review?'':'primary'}" data-act="radar" data-arg="${r.id}">${r.review?'生成并送审':'生成简讯'}</button>`}</div>`).join('')}</section>
   <section class="box">${d?`<div class="xs muted">草稿 · ${SECTOR_FULL[d.sector]} · ${d.time} 热点快照 · 由热点雷达生成</div>
     <form data-form="draft" style="display:flex;flex-direction:column;gap:10px;margin-top:10px">
      <div><label class="lbl" for="dr-body">正文（一段话，上限 160 字）</label><textarea id="dr-body" class="input" maxlength="160" style="min-height:130px">${esc(d.body)}</textarea><div class="xs muted" style="text-align:right"><span id="dr-count">${d.body.length}</span> / 160</div></div>
      <div><div class="lbl">自动校验</div><div id="dr-checks">${checksHTML(checks)}</div></div>
      ${d.sector==='政治'?`<label class="check"><input type="checkbox" id="dr-reviewed"> <span>我已人工审核本条政治类内容</span></label>`:''}
      <div class="xs muted">数据来源：[行情数据 API] · [期权数据源] · [新闻聚类源]</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm primary" type="submit">确认并发布</button><button type="button" class="btn sm ghost" data-act="draft-regen">重新生成</button><button type="button" class="btn sm danger" data-act="draft-reject">驳回</button></div></form>`
     : `<div class="xs muted">草稿区</div><p class="small" style="margin:8px 0 0">在左侧热点雷达点“生成简讯”，草稿会出现在这里，校验通过后确认发布，前台“今日快照”会立即出现并带“热点”标记。</p>`}
     <h3 style="font-size:14px;margin:20px 0 6px">生成规则与护栏</h3>
     <ul class="small" style="margin:0;padding-left:18px;line-height:1.9;color:var(--ink2)"><li>每条快照为一段话，并附 3 个关键数据</li><li>数字必须来自已接入数据源</li><li>禁止买卖建议与目标价（含“${BANNED_ADVICE.slice(0,3).join('”“')}”等词会被拦截）</li><li>Gamma 具体价位只在 Pro 中展示，快照只写环境与距离</li><li>政治类一律人工审核</li></ul></section></div>`;
}
function draftChecks(d){
  const bad = BANNED_ADVICE.filter(w=>d.body.includes(w));
  return [
    {ok:true, t:'价格与成交数据已与行情源核对'},
    {ok:!bad.length, t: bad.length?`包含买卖建议用语：${bad.join('、')}`:'未包含买卖建议或目标价'},
    {ok:d.body.length<=160 && d.body.length>=40, t:`字数 ${d.body.length}（40–160，一段话）`},
    {ok:true, t:'已附“自动生成”标识与免责声明'},
  ];
}
function checksHTML(cs){ return cs.map(c=>`<div class="check"><span class="${c.ok?'ok':'no'}">${c.ok?IC.check:'!'}</span><span>${esc(c.t)}</span></div>`).join(''); }
function adminArticles(){
  return `<div class="ahead"><div><h1>深度文章</h1><div class="small muted" style="margin-top:4px">设置每篇文章的阅读权限与评论开关，前台即时生效</div></div></div>
   <div class="tbl-wrap" style="margin-top:18px"><table class="tbl"><thead><tr><th>标题</th><th>分类</th><th>阅读</th><th>评论</th><th>权限</th><th>评论区</th></tr></thead><tbody>
   ${ARTICLES.map(a=>{ const c=articleCfg(a.id); return `<tr><td style="max-width:380px"><button data-go="a-${a.id}" style="text-align:left;font-weight:600">${esc(a.title)}</button><div class="xs muted">${a.date}</div></td><td class="small">${a.cat}</td><td class="num">${cnt('article_read',e=>e.m.id===a.id)}</td><td class="num">${commentCount(a.id)}</td>
     <td><button class="btn xs ${c.free?'':'primary'}" data-act="art-free" data-arg="${a.id}">${c.free?'免费阅读':'订阅专享'}</button></td><td><button class="switch" role="switch" aria-checked="${c.comments}" aria-label="评论区开关" data-act="toggle-comments" data-arg="${a.id}"></button></td></tr>`; }).join('')}</tbody></table></div>`;
}
function adminUsers(){
  return `<div class="ahead"><div><h1>用户与封禁</h1><div class="small muted" style="margin-top:4px">示例用户</div></div></div>
   <div class="tbl-wrap" style="margin-top:18px"><table class="tbl"><thead><tr><th>显示名</th><th>方案</th><th>注册时长</th><th>历史违规</th><th>状态</th><th>操作</th></tr></thead><tbody>
   ${SEED_USERS.map(u=>{ const b=S.banned.find(x=>x.name===u.name); return `<tr><td style="font-weight:600">${esc(u.name)}</td><td class="small">${u.plan}</td><td class="small">${u.since}</td><td class="num">${u.vio + S.queue.filter(q=>q.user===u.name && q.done && q.done!=='approved').length}</td><td>${b?`<span class="tag red">${b.type==='ban'?'永久封禁':'禁言 7 天'}</span>`:'<span class="tag good">正常</span>'}</td><td>${b?`<button class="btn xs ghost" data-act="unban" data-arg="${esc(u.name)}">解除</button>`:`<button class="btn xs ghost" data-act="mute-user" data-arg="${esc(u.name)}">禁言 7 天</button>`}</td></tr>`; }).join('')}</tbody></table></div>`;
}
function adminKeywords(){
  return `<div class="ahead"><div><h1>关键词规则</h1><div class="small muted" style="margin-top:4px">命中关键词的评论会进入审核队列，不直接发布</div></div></div>
   <form data-form="kw-add" style="display:flex;gap:8px;margin-top:18px;max-width:480px"><label for="kw-q" class="sr">新关键词</label><input id="kw-q" class="input" placeholder="输入关键词"><button class="btn primary" type="submit">添加</button></form>
   <div class="chips" style="margin-top:14px">${S.keywords.map(k=>`<span class="chip">${esc(k)}<button data-act="kw-del" data-arg="${esc(k)}" aria-label="删除关键词 ${esc(k)}" style="color:var(--muted)">${IC.x}</button></span>`).join('')}</div>
   <p class="small muted" style="margin-top:18px">另外，评论中出现网址、手机号或微信号格式的内容会自动标记为“疑似引流”。</p>`;
}
function adminSettings(){
  const P=S.pricing;
  return `<div class="ahead"><div><h1>订阅设置</h1><div class="small muted" style="margin-top:4px">修改后前台订阅页、付费墙文案即时更新，便于测试不同定价</div></div></div>
   <form data-form="pricing" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-top:18px;max-width:860px">
    <div><label class="lbl" for="pr-m">Pro 月付（美元 / 月）</label><input id="pr-m" class="input" type="number" min="1" value="${P.monthly}"></div>
    <div><label class="lbl" for="pr-a">Pro 年付（美元 / 年）</label><input id="pr-a" class="input" type="number" min="1" value="${P.annual}"></div>
    <div><label class="lbl" for="pr-em">高级月付（美元 / 月）</label><input id="pr-em" class="input" type="number" min="1" value="${P.eliteM??198}"></div>
    <div><label class="lbl" for="pr-ea">高级年付（美元 / 年）</label><input id="pr-ea" class="input" type="number" min="1" value="${P.eliteA??1888}"></div>
    <div style="grid-column:1/-1"><button class="btn primary" type="submit">保存</button> <span class="small muted">当前年付比月付省 ${annualSave()}%</span></div></form>
   <h2 class="h2" style="margin-top:34px">新用户限时优惠</h2><div class="small muted" style="margin-top:4px">付费墙和结算页显示的年付立减与倒计时。倒计时从用户第一次看到付费墙开始，只提供一次，结束后不会重新开始。</div>
   <form data-form="offer" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-top:14px;max-width:860px">
    <label class="check" style="align-self:end"><input id="of-on" type="checkbox" ${offerCfg().on?'checked':''}> 开启优惠</label>
    <div><label class="lbl" for="of-amt">立减金额</label><input id="of-amt" class="input" type="number" min="1" value="${offerCfg().amt}"></div>
    <div><label class="lbl" for="of-cur">货币符号</label><input id="of-cur" class="input" maxlength="3" value="${esc(offerCfg().cur)}"></div>
    <div><label class="lbl" for="of-min">倒计时（分钟）</label><input id="of-min" class="input" type="number" min="1" max="1440" value="${offerCfg().mins}"></div>
    <div style="grid-column:1/-1"><button class="btn primary" type="submit">保存</button> <button class="btn ghost" type="button" data-act="offer-reset">重置演示倒计时</button> <span class="small muted">${S.offerUsed?'当前演示账号已使用优惠':S.offerStart?`当前演示账号剩余 ${mmss(Math.max(0,S.offerStart+offerCfg().mins*60000-Date.now()))}`:'当前演示账号尚未开始计时'}</span></div></form>`;
}
