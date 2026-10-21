// ---------- Router & render ----------
const ROUTES = ['home','watch','research','video','me','pricing','calendar','academy','search','method','admin','saved','books','shelf','heatmap','community','inbox'];
function validRoute(r){ return ROUTES.includes(r) || (r.startsWith('t-') && SYMS[r.slice(2)]) || (r.startsWith('a-') && ARTICLES.some(a=>a.id===r.slice(2))) || (r.startsWith('b-') && BOOKS.some(b=>b.id===r.slice(2))) || (r.startsWith('earn-') && EARN[r.slice(5)]); }
function render(){
  const r=U.route; const app=$('#app');
  let html;
  if(r==='home') html=pageHome();
  else if(r==='watch') html=pageWatch();
  else if(r==='research') html=pageResearch();
  else if(r==='video') html=pageVideo();
  else if(r==='me') html=pageMe();
  else if(r==='pricing') html=pagePricing();
  else if(r==='calendar') html=pageCalendar();
  else if(r==='academy') html=pageAcademy();
  else if(r==='search') html=pageSearch();
  else if(r==='method') html=pageMethod();
  else if(r==='saved') html=pageSaved();
  else if(r==='admin') html=pageAdmin();
  else if(r==='books') html=pageBooks();
  else if(r==='shelf') html=pageShelf();
  else if(r==='community') html=pageCommunity();
  else if(r==='inbox') html=pageInbox();
  else if(r.startsWith('earn-')) html=pageEarn(r.slice(5));
  else if(r.startsWith('b-')) html=pageBook(r.slice(2));
  else if(r.startsWith('t-')) html=pageTicker(r.slice(2));
  else if(r.startsWith('a-')) html=pageArticle(r.slice(2));
  else html=pageHome();
  app.classList.toggle('wide', r==='admin');
  app.innerHTML = html + (r==='admin'?'':bnav());
  uxAfterRender();
}
function go(r, opts={}){
  if(!validRoute(r)) r='home';
  if(r==='heatmap') r='home';
  closeSheet();
  if(!opts.replace && U.route!==r) U.stack.push(U.route);
  if(U.stack.length>50) U.stack.shift();
  if(r.startsWith('t-')){ if(U.route!==r){ U.ttab='概览'; U.range='1D'; } }
  if(r.startsWith('a-')){ U.replyTo=null; const id=r.slice(2); const cfg=articleCfg(id); track('article_read',{id, full:isPro()||cfg.free}); }
  if(r==='pricing') track('pricing_view',{});
  if(r.startsWith('b-') && U.route!==r){ U.bed='zh'; U.bfmt='PDF'; track('book_view',{id:r.slice(2)}); }
  U.route=r; if(r==='home') markSeen(); render(); enterAnim(); window.scrollTo(0,0);
}
function back(){ const r=U.stack.pop(); U.route = r || 'home'; closeSheet(); render(); enterAnim(); window.scrollTo(0,0); }
function rerender(){ const y=window.scrollY; render(); window.scrollTo(0,y); }

// ---------- Actions ----------
function setRole(r){
  S.role=r;
  if(r==='guest'){ S.plan=null; S.userName=null; }
  if(r==='free'){ S.plan=null; S.userName = S.userName || '测试用户'; }
  if(r==='pro' || r==='elite'){ S.plan = S.plan||'annual'; S.userName = S.userName || '测试用户'; }
  if(r==='admin'){ S.plan=null; S.userName='编辑部'; }
  save();
}
function subscribe(plan){
  const el=plan.startsWith('elite-'), cyc=plan.replace('elite-',''); const P=S.pricing;
  const price = el ? (cyc==='annual'?(P.eliteA??399):(P.eliteM??49)) : (cyc==='annual'?P.annual:P.monthly);
  const off = !el && cyc==='annual' && offerLeft() ? offerCfg() : null;
  openSheet(`<h2>确认订阅</h2><p class="small muted" style="margin:0 0 14px">初版为模拟支付，不会产生真实扣费。</p>
    <div class="tintbox" style="display:flex;justify-content:space-between"><span>Gamma Squeeze ${el?'高级订阅':'Pro'} · ${cyc==='annual'?'年付':'月付'}</span><strong class="num">$${price}</strong></div>
    ${off?`<div class="tintbox" style="display:flex;justify-content:space-between;margin-top:6px;color:var(--band-ink)"><span>新用户限时优惠 · 剩余 <span class="num" data-countdown><span>${mmss(offerLeft())}</span></span></span><strong class="num">−${off.cur}${off.amt}</strong></div>
    <div style="display:flex;justify-content:space-between;padding:12px 14px 0;font-weight:700"><span>实付</span><span class="num" style="font-size:18px">$${Math.max(0, price-off.amt)}</span></div>`:''}
    <button class="btn primary block" style="margin-top:14px" data-act="pay" data-arg="${plan}">模拟支付并开通</button>`,'确认订阅');
}
function addComment(aid, text, parentId){
  const hit = S.keywords.find(k=>text.includes(k));
  const lure = /(https?:\/\/|www\.|\b1[3-9]\d{9}\b|vx|wx[:：]|微信号)/i.test(text);
  const c = {id:'m'+Date.now(), user:uname(), badge: S.role==='admin'?'author':'pro', text, likes:0, ago:'刚刚', ts:Date.now(), mine:true, status:(hit||lure)?'pending':'live', replies:[]};
  if(parentId){ const p=(S.comments[aid]||[]).find(x=>x.id===parentId); if(p){ p.replies=p.replies||[]; p.replies.push(c); } }
  else { (S.comments[aid]=S.comments[aid]||[]).unshift(c); }
  if(c.status==='pending'){
    const a=ARTICLES.find(x=>x.id===aid);
    S.queue.unshift({id:'q'+Date.now(), text, where:a.title.slice(0,12), aid, cid:c.id, user:uname(), meta:ROLE_NAME[S.role], reason: hit?'关键词拦截':'疑似引流', src: hit?'kw':'ai', risk: hit?0.82:0.9, ago:'刚刚', why: hit?`命中关键词“${hit}”。`:'包含网址、手机号或联系方式格式。'});
  }
  track('comment_post',{id:aid, status:c.status}); save();
  if(c.status==='live' && !parentId && S.role!=='admin'){ const a=ARTICLES.find(x=>x.id===aid); if(!S.followThreads.includes(aid)) S.followThreads.push(aid);
    setTimeout(()=>{ c.replies=c.replies||[]; c.replies.push({id:'ar'+Date.now(), user:AUTHOR, badge:'author', text:'谢谢补充，这个角度我们会在下一篇复盘里展开。', likes:0, ago:'刚刚', ts:Date.now()});
      pushNotif({kind:'author', text:`作者回复了你在《${a.title}》下的评论`, go:'a-'+aid}); toast('作者回复了你的评论 · 查看提醒'); if(['community','inbox'].includes(U.route)||U.route==='a-'+aid) rerender(); }, 8000); }
  return c.status;
}
function findComment(aid, cid){ for(const c of (S.comments[aid]||[])){ if(c.id===cid) return c; for(const r of (c.replies||[])) if(r.id===cid) return r; } return null; }
function queueDo(id, how){
  const q=S.queue.find(x=>x.id===id); if(!q) return;
  q.done = how==='approve'?'approved':'deleted';
  if(q.cid){ const c=findComment(q.aid,q.cid) || (S.disc[q.sym]||[]).find(d=>d.id===q.cid); if(c) c.status = how==='approve'?'live':'removed'; }
  else if(how==='approve' && q.aid){ (S.comments[q.aid]=S.comments[q.aid]||[]).push({id:'a'+q.id, user:q.user, text:q.text, likes:0, ago:q.ago, status:'live', replies:[]}); }
  if(how==='mute'||how==='ban'){ S.banned = S.banned.filter(b=>b.name!==q.user); S.banned.push({name:q.user, type:how}); }
  U.qsel=null; save();
  toast({approve:'已通过并发布',delete:'已删除',mute:'已删除并禁言 7 天',ban:'已永久封禁该用户'}[how]);
}
function makeDraft(r){ return {rid:r.id, sector:r.sector, sym:r.sym, time:snapNow()==='23:59'?etParts():snapNow(), title:r.kind.split(' · ')[0], body:RADAR_DRAFT[r.id] || r.text}; }
function publishDraft(){
  const d=S.draft;
  S.snapshots.unshift({id:'h'+Date.now(), time:d.time, sector:d.sector, sym:d.sym, title:d.title, hot:true, text:d.body, status:'published', auto:true, data:null});
  const r=S.radar.find(x=>x.id===d.rid); if(r) r.used=true;
  S.draft=null; save(); track('snapshot_publish',{sector:d.sector});
}
function genBatch(){
  let n=0, p=0; S.forcePub=S.forcePub||[]; S.polPending=S.polPending||[];
  SECTORS.forEach(sec=>{ const next=S.snapshots.filter(s=>s.sector===sec && !isLive(s) && !S.polPending.includes(s.id)).sort((a,b)=>a.time.localeCompare(b.time))[0]; if(!next) return;
    if(sec==='政治'){ S.polPending.push(next.id); p++; } else { S.forcePub.push(next.id); n++; } });
  save(); toast(`已提前发布 ${n} 条${p?`，${p} 条政治类送人工审核`:''}`);
}
document.addEventListener('click', e=>{
  const g = e.target.closest('[data-go]');
  if(g){ e.preventDefault(); go(g.dataset.go); return; }
  const el = e.target.closest('[data-act]'); if(!el) return;
  const act=el.dataset.act, arg=el.dataset.arg;
  const [a1,a2] = (arg||'').split('|');
  switch(act){
    case 'close-sheet': closeSheet(); break;
    case 'back': back(); break;
    case 'drawer': openDrawer(); break;
    case 'go-pricing': go('pricing'); break;
    case 'chan': U.chan=arg; track('channel_view',{chan:arg}); rerender(); break;
    case 'all-snaps': openSheet(`<h2>今日全部快照</h2><div class="small muted">${nextSnap()}</div>${liveSnaps().map(snapRow).join('')}`,'今日全部快照'); break;
    case 'snap': snapSheet(arg); break;
    case 'calf': U.calf=arg; rerender(); break;
    case 'rf': { const [k,v]=[a1,a2]; U.rf[k] = U.rf[k]===v?null:v; track('research_filter',{k,v}); rerender(); break; }
    case 'rf-clear': U.rf={...U.rf, sym:null, event:null, topic:null, q:''}; rerender(); break;
    case 'rf-sort': U.rf.sort=arg; rerender(); break;
    case 'vseries': { const el=document.getElementById('vs-'+hash(arg)); if(U.route!=='video'){ go('video'); setTimeout(()=>{ const e2=document.getElementById('vs-'+hash(arg)); if(e2) e2.scrollIntoView({block:'start'}); },60); } else if(el) el.scrollIntoView({block:'start', behavior:'smooth'}); break; }
    case 'ctab': U.ctab=arg; rerender(); break;
    case 'follow-thread': { const i=S.followThreads.indexOf(arg); if(i>=0) S.followThreads.splice(i,1); else S.followThreads.push(arg); save(); rerender(); toast(i>=0?'已取消关注':'已关注，有新回复会提醒你'); break; }
    case 'notif': { const n=(S.notifs||[]).find(x=>x.id===arg); if(n){ n.read=true; save(); go(n.go); } break; }
    case 'notif-all': (S.notifs||[]).forEach(n=>n.read=true); save(); rerender(); break;
    case 'notif-set': S.notif[arg]=!S.notif[arg]; save(); rerender(); break;
    case 'offer-reset': S.offerStart=null; S.offerUsed=false; save(); rerender(); toast('演示倒计时已重置，下次看到付费墙时重新开始'); break;
    case 'inst': U.inst=arg; rerender(); break;
    case 'cg': { U.cg=U.cg||{side:'全部', ch:'全部'}; U.cg[a1]=a2; rerender(); break; }
    case 'perm': { S.perms=S.perms||JSON.parse(JSON.stringify(MOD_DEFAULT)); const p=S.perms[a1]=S.perms[a1]||{}; p[a2]=p[a2]?0:1; save(); rerender(); toast(`${a1}：${(MOD_PERMS.find(x=>x[0]===a2)||[])[1]} 已${p[a2]?'开启':'关闭'}`); break; }
    case 'cal-open': U.calf=arg||'全部'; track('event_tape',{kind:arg}); go('calendar'); break;
    case 'pol-approve': S.polPending=S.polPending.filter(x=>x!==arg); S.forcePub.push(arg); save(); rerender(); toast('已审核并发布'); break;
    case 'range': U.range=arg; rerender(); break;
    case 'ttab': U.ttab=arg; rerender(); break;
    case 'rtab': U.rtab=arg; rerender(); break;
    case 'csort': U.csort=arg; rerender(); break;
    case 'bill': U.bill=arg; rerender(); break;
    case 'wl': { const i=S.watchlist.indexOf(arg); if(i>=0){ S.watchlist.splice(i,1); toast(`已从自选移除 ${symLabel(arg)}`); } else { S.watchlist.push(arg); track('watchlist_add',{sym:arg}); toast(`已加入自选 ${symLabel(arg)}`); } save(); rerender(); break; }
    case 'paywall': openPaywall(arg); break;
    case 'subscribe': subscribe(arg); break;
    case 'pay': { const el=arg.startsWith('elite-'); if(!el && arg==='annual' && offerLeft()){ S.offerUsed=true; track('offer_redeem',{}); } S.role = S.role==='admin'?'admin':(el?'elite':'pro'); S.plan=arg.replace('elite-',''); S.userName=S.userName||'新用户'; save(); track('subscribe',{plan:arg, tier:el?'elite':'pro'}); closeSheet(); rerender(); toast(el?'已开通高级订阅，GEX 热力图已解锁':'订阅成功，欢迎成为 Pro 会员'); break; }
    case 'go-elite': track('elite_cta',{from:U.chan}); go('pricing'); setTimeout(()=>{ const e=$('#plan-elite'); if(e) e.scrollIntoView({block:'center'}); },60); break;
    case 'hsym': U.hsym=arg; U.hcell=null; track('heat_sym',{sym:arg}); rerender(); break;
    case 'heat-cell': U.hcell = U.hcell===arg?null:arg; rerender(); break;
    case 'heat-play': if(!isElite()){ openPaywall('heatmap'); break; } U.hplay=!U.hplay; if(U.hplay && (U.hslot??13)>=13) U.hslot=0; rerender(); break;
    case 'register': openRegister(arg); break;
    case 'bookmark': { const i=S.bookmarks.indexOf(arg); if(i>=0){ S.bookmarks.splice(i,1); toast('已取消收藏'); } else { S.bookmarks.push(arg); track('bookmark',{id:arg}); toast('已收藏，可在“我的 → 我的收藏”查看'); } save(); rerender(); break; }
    case 'share': { const a=ARTICLES.find(x=>x.id===arg); track('share',{id:arg}); copyText(`${a.title}｜Gamma Squeeze 深度`, '标题已复制，可粘贴分享'); break; }
    case 'font': S.fontScale=((S.fontScale||0)+1)%3; save(); rerender(); toast(['标准字号','较大字号','特大字号'][S.fontScale]); break;
    case 'follow': { const i=S.follows.indexOf('author'); if(i>=0) S.follows.splice(i,1); else { S.follows.push('author'); toast('已关注，新文章发布时通知你'); } save(); rerender(); break; }
    case 'like': { if(!isUser()){ openRegister('like'); break; } const k=a2; S.liked[k]=!S.liked[k]; save(); rerender(); break; }
    case 'reply': if(!isPro()){ openPaywall('comment'); break; } U.replyTo = a2 || null; rerender(); setTimeout(()=>{ const t=$('#rp'); if(t) t.focus(); },0); break;
    case 'report': { if(!isUser()){ openRegister('report'); break; } const c=findComment(a1,a2); const art=ARTICLES.find(x=>x.id===a1);
      if(c && !S.queue.some(q=>q.cid===a2 && !q.done)) S.queue.unshift({id:'q'+Date.now(), text:c.text, where:art.title.slice(0,12), aid:a1, user:c.user, meta:'被举报', reason:'用户举报', src:'report', risk:0.55, ago:'刚刚', why:`由 ${uname()} 举报。`});
      track('comment_report',{id:a1}); save(); toast('已举报，编辑会尽快处理'); break; }
    case 'rules': openSheet(`<h2>社区规则</h2><ul class="small" style="line-height:1.9;padding-left:18px;color:var(--ink2)"><li>讨论观点与数据，不针对个人</li><li>不喊单、不承诺收益、不推荐具体买卖点位</li><li>不发布任何引流信息（群、微信、链接等）</li><li>政治话题请聚焦市场影响</li><li>违规内容会被删除，多次违规将被禁言或封禁</li></ul>`,'社区规则'); break;
    case 'new-alert': {
      if(!isUser()){ openRegister('alert'); break; }
      if(!isPro() && S.alerts.length>=1){ openPaywall('alert'); break; }
      openSheet(alertForm(SYMS[arg]?arg:'SPX'),'新建提醒'); break; }
    case 'toggle-alert': { const a=S.alerts.find(x=>x.id===arg); a.on=!a.on; a.fired=false; save(); rerender(); break; }
    case 'del-alert': S.alerts=S.alerts.filter(x=>x.id!==arg); save(); rerender(); toast('已删除提醒'); break;
    case 'test-alert': { const a=S.alerts.find(x=>x.id===arg); toast(`提醒示例：${symLabel(a.sym)} ${a.dir==='above'?'上穿':'下穿'}${ALERT_NAME[a.type]} ${lv(a.sym,alertLevel(a))}`); break; }
    case 'video': { const v=VIDEOS.find(x=>x.id===arg); if(!v.free && !isPro()){ openPaywall('video'); break; } track('video_play',{id:arg}); openSheet(`<div class="kicker">${(VIDEO_SERIES.find(x=>x.name===v.series)||{}).kind||'视频'}</div><h2 style="margin-top:4px">${esc(vTitle(v))}</h2><div style="aspect-ratio:16/9;max-width:100%;background:var(--ink);color:var(--bg);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;margin-top:10px"><span class="brand" style="font-size:22px">Gamma Squeeze</span><span class="small" style="color:var(--on-band-2)">播放器占位 · ${v.dur}</span></div><p class="xs muted">初版不含视频文件，正式版接入视频托管服务。</p>${bookRecCompact(VIDEO_BOOK_TAGS[v.id],'video')}`,'视频'); break; }
    case 'lesson': { const l=LESSONS.find(x=>x.id===arg); if(!l.free && !isPro()){ openPaywall('lesson'); break; } openSheet(`<h2>${l.title}</h2><p class="small muted">约 ${l.mins} 分钟 · 课程正文将在下一版补充，可先阅读术语表。</p><button class="btn block" data-go="academy">返回学院</button>${bookRecCompact(LESSON_BOOK_TAGS[l.id],'lesson')}`,'课程'); break; }
    case 'interests': openSheet(`<h2>关注板块</h2><div class="chips" style="margin-top:12px">${['美股','期权','大宗商品','宏观','美国政治'].map(s=>`<button class="chip" aria-pressed="${S.interests.includes(s)}" data-act="int-toggle" data-arg="${s}">${s}</button>`).join('')}</div>`,'关注板块'); break;
    case 'int-toggle': case 'ob-int': { const i=S.interests.indexOf(arg); if(i>=0) S.interests.splice(i,1); else S.interests.push(arg); save(); el.setAttribute('aria-pressed', S.interests.includes(arg)); if(act==='int-toggle' && U.route==='me') { const y=window.scrollY; $('#app').innerHTML=pageMe()+bnav(); window.scrollTo(0,y);} break; }
    case 'ob-sym': { const i=S.watchlist.indexOf(arg); if(i>=0) S.watchlist.splice(i,1); else S.watchlist.push(arg); save(); el.setAttribute('aria-pressed', S.watchlist.includes(arg)); break; }
    case 'ob-next': openOnboarding(+arg); break;
    case 'ob-done': S.onboarded=true; save(); track('onboarding_done',{}); closeSheet(); rerender(); break;
    case 'onboard': openOnboarding(1); break;
    case 'notif': openSheet(`<h2>通知设置</h2>${[['snap','每日快照推送'],['alert','价位提醒'],['research','新深度文章'],['reply','评论回复']].map(([k,l])=>`<div class="list-item"><span class="grow">${l}</span><button class="switch" role="switch" aria-checked="${S.notif[k]}" aria-label="${l}" data-act="notif-t" data-arg="${k}"></button></div>`).join('')}`,'通知设置'); break;
    case 'notif-t': S.notif[arg]=!S.notif[arg]; save(); el.setAttribute('aria-checked', S.notif[arg]); break;
    case 'invite': track('invite_open',{}); openSheet(`<h2>邀请好友</h2><p class="small muted" style="margin:0 0 12px">好友通过你的邀请码订阅 Pro，你们双方各得 1 个月 Pro 时长。</p><div class="tintbox" style="display:flex;justify-content:space-between;align-items:center"><span class="num" style="font-size:20px;font-weight:600">${S.referral}</span><button class="btn sm primary" data-act="copy-ref">复制邀请语</button></div>`,'邀请好友'); break;
    case 'copy-ref': copyText(`我在用 Gamma Squeeze 看期权结构和 Gamma 关键价位，注册时填邀请码 ${S.referral}，订阅时可多得 1 个月 Pro。`,'邀请语已复制'); break;
    case 'role': setRole(arg); track('demo_role',{role:arg}); if(arg==='admin'){ go('admin'); } else rerender(); toast(`已切换为${ROLE_NAME[arg]}`); break;
    case 'reset-all': openSheet(`<h2>重置全部演示数据？</h2><p class="small muted">自选、提醒、评论、审核记录和统计会恢复为初始状态。</p><button class="btn danger block" data-act="reset-confirm">确认重置</button>`,'重置'); break;
    case 'reset-confirm': try{ localStorage.removeItem(STORE_KEY); }catch(e){} S=freshState(); U.stack=[]; closeSheet(); go('home',{replace:true}); setTimeout(()=>openOnboarding(1),200); break;
    case 'search-fill': U.search=arg; rerender(); { const i=$('#q'); if(i) i.value=arg; } break;
    // admin
    case 'asec': U.asec=arg; rerender(); break;
    case 'qf': U.qfilter=arg; U.qsel=null; rerender(); break;
    case 'qsel': U.qsel=arg; rerender(); break;
    case 'q-do': queueDo(a1,a2); rerender(); break;
    case 'q-bulk': { const list=S.queue.filter(q=>!q.done && (U.qfilter==='all'||q.src===U.qfilter)); list.forEach(q=>{ q.done = arg==='approve'?'approved':'deleted'; if(q.cid){ const c=findComment(q.aid,q.cid); if(c) c.status = arg==='approve'?'live':'removed'; } }); save(); rerender(); toast(`已${arg==='approve'?'通过':'删除'} ${list.length} 条`); break; }
    case 'kw-del': S.keywords=S.keywords.filter(k=>k!==arg); save(); rerender(); break;
    case 'toggle-comments': { const c=S.artCfg[arg]=S.artCfg[arg]||{}; c.comments = !articleCfg(arg).comments; save(); rerender(); toast(c.comments?'评论区已开放':'评论区已关闭'); break; }
    case 'art-free': { const c=S.artCfg[arg]=S.artCfg[arg]||{}; c.free = !articleCfg(arg).free; save(); rerender(); break; }
    case 'unban': S.banned=S.banned.filter(b=>b.name!==arg); save(); rerender(); toast('已解除'); break;
    case 'mute-user': S.banned.push({name:arg, type:'mute'}); save(); rerender(); toast('已禁言 7 天'); break;
    case 'pause-auto': S.autoPaused=!S.autoPaused; save(); rerender(); break;
    case 'gen-batch': if(S.autoPaused){ toast('自动发布已暂停，请先恢复'); break; } genBatch(); rerender(); break;
    case 'radar': { const r=S.radar.find(x=>x.id===arg); S.draft=makeDraft(r); save(); rerender(); break; }
    case 'draft-regen': { const t=$('#dr-body'); const variants=['（更新）','，后续关注午后数据。','，盘中将持续跟踪。']; S.draft.body = (RADAR_DRAFT[S.draft.rid]||S.draft.body).slice(0,100) + variants[Math.floor(Math.random()*variants.length)]; save(); rerender(); break; }
    case 'draft-reject': { const r=S.radar.find(x=>x.id===S.draft.rid); if(r) r.used=true; S.draft=null; save(); rerender(); toast('已驳回草稿'); break; }
    case 'book-open': if(a2 && !['list','books','admin'].includes(a2)) track('book_rec_click',{src:a2, id:a1}); go('b-'+a1); break;
    case 'bed': U.bed=arg; rerender(); break;
    case 'bfmt': U.bfmt=arg; rerender(); break;
    case 'bfilter': U.bfilter=arg; rerender(); break;
    case 'book-buy': if(!isUser()){ openRegister('book'); break; } if(bookCfg().membersOnly && !isPro()){ openPaywall('books'); break; } bookBuySheet(arg); break;
    case 'book-pay': { const b=BOOKS.find(x=>x.id===arg); const ed=U.bed||'zh'; const pay=priceFor(b,ed); S.purchases=S.purchases||[]; S.purchases.push({book:arg, ed, fmt:U.bfmt||'PDF', price:pay, member:isPro(), t:Date.now()}); save(); track('book_purchase',{id:arg, ed, price:pay, member:isPro()}); closeSheet(); rerender(); toast('购买成功，已加入“我的书架”'); break; }
    case 'book-dl': { const [bid,ed]=[a1,a2]; const b=BOOKS.find(x=>x.id===bid); track('book_download',{id:bid, ed}); toast(`《${b.zh}》${ed==='en'?'英文版':'中文版'}：正式版在此下载 PDF / EPUB 文件`); break; }
    case 'book-sample': { const b=BOOKS.find(x=>x.id===arg); track('book_sample',{id:arg}); openSheet(`<div class="kicker">免费试读</div><h2 style="margin-top:4px">${esc(b.zh)} · 第一章</h2><h3 class="h3" style="margin-top:8px">${esc(b.toc[0])}</h3><p style="font-family:var(--f-serif);font-size:16px;line-height:1.85">${esc(b.desc)}</p><p class="small muted">试读正文将在正式版提供。</p><button class="btn primary block" data-act="close-sheet">返回购买</button>`,'试读'); break; }
    case 'to-comments': { const c=document.getElementById('comments'); if(c) c.scrollIntoView({behavior:'smooth'}); if(!isPro()) setTimeout(()=>openPaywall('comment'),400); break; }
    case 'gear': track('gear_view',{}); openSheet(`<div class="kicker">Trader's Gear</div><h2 style="margin-top:4px">Gamma Squeeze 周边</h2><img src="img/gear.jpg" alt="Gamma Squeeze 黑白 T 恤与棒球帽，背面印 FOMO PANICAN YOLO" style="width:100%;max-width:100%;margin-top:10px;display:block;background:#EDEDEB">
      <ul class="benefits"><li>${IC.check}<span>T 恤：黑 / 白两色，胸前 Gamma Squeeze 标识，背面 FOMO · PANICAN · YOLO</span></li><li>${IC.check}<span>棒球帽：藏青色，刺绣 Gamma Squeeze</span></li></ul>
      <p class="small muted">商城即将开放。当前可通过每月优质评论抽奖获得。</p><button class="btn primary block" data-act="close-sheet">知道了</button>`,"Trader's Gear"); break;
    case 'giveaway-rules': openSheet(`<h2>每月优质评论赠礼规则</h2><ol class="small" style="line-height:1.9;padding-left:18px;color:var(--ink2)"><li>当月在任意文章下发布的评论均可参与，需遵守社区规则。</li><li>候选范围：编辑精选评论，以及获赞 15 以上的评论。</li><li>每月初由编辑部从候选中随机抽取 3 位，获奖名单公布在文章页。</li><li>奖品为 Trader's Gear（T 恤或棒球帽）或《期权指南丛书》任选一册（电子版或纸质版以活动页为准）。</li><li>同一用户每季度最多获奖一次。</li></ol>`,'活动规则'); break;
    case 'draw': { const cands=[]; Object.values(S.comments).forEach(list=>list.forEach(c=>{ [c].concat(c.replies||[]).forEach(x=>{ if(x.status!=='removed'&&x.status!=='pending'&&(x.pick||x.likes>=15||x.mine)&&x.badge!=='author') cands.push(x); }); }));
      const pool=cands.slice(); const list=[]; while(pool.length && list.length<3){ const i=Math.floor(Math.random()*pool.length); const x=pool.splice(i,1)[0]; if(!list.some(y=>y.user===x.user)) list.push({user:x.user, text:x.text, prize:PRIZES[list.length%3]}); }
      S.winners={month:monthLabel(), list}; save(); track('giveaway_draw',{n:list.length}); rerender(); toast(`已抽取 ${list.length} 位获奖用户`); break; }
    case 'clear-events': S.events=[]; save(); rerender(); break;
  }
});
document.addEventListener('submit', e=>{
  const f=e.target; const kind=f.dataset.form; if(!kind) return; e.preventDefault();
  const arg=f.dataset.arg;
  if(kind==='newsletter'){ const v=$('#nl-email').value.trim(); S.newsletter=v; save(); track('newsletter_signup',{}); rerender(); toast('已订阅盘前简报，明早 06:30 发送'); }
  else if(kind==='register'){ const name=$('#rg-name').value.trim(); S.role='free'; S.userName=name; if($('#rg-nl').checked) S.newsletter=$('#rg-id').value.trim(); save(); track('signup',{src:arg}); closeSheet(); rerender(); toast('注册成功'); if(arg==='onboarding'){ S.onboarded=true; save(); } }
  else if(kind==='comment'){ const t=$('#cmt').value.trim(); if(!t) return; const st=addComment(arg,t); U.csort='new'; rerender(); toast(st==='live'?'评论已发布':'评论已提交，审核通过后公开显示'); }
  else if(kind==='reply'){ const [aid,cid]=arg.split('|'); const t=$('#rp').value.trim(); if(!t) return; const st=addComment(aid,t,cid); U.replyTo=null; rerender(); toast(st==='live'?'回复已发布':'回复已提交审核'); }
  else if(kind==='disc'){ const t=$('#dsc').value.trim(); if(!t) return; const hit=S.keywords.find(k=>t.includes(k)); const d={id:'dm'+Date.now(), user:uname(), text:t, likes:0, ago:'刚刚', mine:true, status:hit?'pending':'live'}; (S.disc[arg]=S.disc[arg]||[]).unshift(d);
    if(hit) S.queue.unshift({id:'q'+Date.now(), text:t, where:`${arg} 讨论区`, sym:arg, cid:d.id, user:uname(), meta:ROLE_NAME[S.role], reason:'关键词拦截', src:'kw', risk:0.8, ago:'刚刚', why:`命中关键词“${hit}”。`});
    track('comment_post',{sym:arg}); save(); rerender(); toast(hit?'已提交审核':'已发布'); }
  else if(kind==='alert'){ const sym=$('#al-sym').value, type=$('#al-type').value, dir=$('#al-dir').value, lvl=parseFloat($('#al-level').value);
    if(!SYMS[sym].opt && type!=='price'){ toast(`${symLabel(sym)} 没有期权 Gamma 数据，请选择“自定义价格”`); return; }
    if(type==='price' && !isFinite(lvl)){ toast('请填写自定义价格'); return; }
    S.alerts.push({id:'al'+Date.now(), sym, type, dir, level:type==='price'?lvl:null, on:true, fired:false}); save(); track('alert_create',{sym,type}); closeSheet(); rerender(); toast('提醒已创建'); }
  else if(kind==='kw-add'){ const v=$('#kw-q').value.trim(); if(v && !S.keywords.includes(v)){ S.keywords.push(v); save(); toast(`已添加关键词“${v}”`); } rerender(); }
  else if(kind==='draft'){ S.draft.body=$('#dr-body').value.trim(); const cs=draftChecks(S.draft); if(cs.some(c=>!c.ok)){ save(); rerender(); toast('校验未通过，请修改后再发布'); return; }
    if(S.draft.sector==='政治' && !$('#dr-reviewed').checked){ toast('政治类快照需勾选人工审核确认'); return; }
    const sec=S.draft.sector; publishDraft(); rerender(); toast(`已发布到前台「${SECTOR_FULL[sec]}」今日快照`); }
  else if(kind==='bookcfg'){ const d=+$('#bk-d').value; if(d>=0&&d<=50){ S.bookCfg={discount:d, membersOnly:$('#bk-m').checked}; save(); rerender(); toast('书籍设置已保存'); } }
  else if(kind==='offer'){ const amt=+$('#of-amt').value, mins=+$('#of-min').value, cur=$('#of-cur').value.trim()||'$'; if(amt>0&&mins>0){ S.offer={on:$('#of-on').checked, amt, cur, mins}; save(); rerender(); toast('优惠设置已保存'); } }
  else if(kind==='pricing'){ const m=+$('#pr-m').value, a=+$('#pr-a').value, em=+$('#pr-em').value, ea=+$('#pr-ea').value; if(m>0&&a>0&&em>0&&ea>0){ S.pricing={...S.pricing, monthly:m, annual:a, eliteM:em, eliteA:ea}; save(); rerender(); toast('订阅设置已保存'); } }
});
document.addEventListener('input', e=>{
  if(e.target.id==='rq'){ U.rf.q=e.target.value; const pos=e.target.selectionStart; rerender(); const i=$('#rq'); if(i){ i.focus(); try{ i.setSelectionRange(pos,pos); }catch(_){} } return; }
  if(e.target.id==='q'){ U.search=e.target.value; const box=$('#search-results'); if(box) box.innerHTML=searchResults(); }
  if(e.target.id==='dr-body' && S.draft){ S.draft.body=e.target.value; const c=$('#dr-count'); if(c) c.textContent=e.target.value.length; const ch=$('#dr-checks'); if(ch) ch.innerHTML=checksHTML(draftChecks(S.draft)); }
});
document.addEventListener('change', e=>{ if(e.target.dataset.change==='team'){ S.team[+e.target.dataset.arg][1]=e.target.value; save(); toast('角色已更新'); return; } if(e.target.dataset.change==='simtime'){ S.simTime=e.target.value||null; save(); U.newSnaps=[]; rerender(); toast(S.simTime?`快照时间已模拟为美东 ${S.simTime}`:'已恢复实时'); } });
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeSheet(); if(e.key==='Enter' && e.target.matches && e.target.matches('[role=link][data-go]')) e.target.click(); });

// ---------- Boot ----------
(function boot(){
  let initial='home'; try{ const h=(location.hash||'').slice(1); if(h && validRoute(h)) initial=h; }catch(e){}
  if(initial==='admin' && S.role!=='admin') initial='admin';
  track('app_open',{role:S.role});
  loadLive();
  markSeen(); U.route=initial; if(initial.startsWith('a-')) go(initial,{replace:true}); else render();
  if(!S.onboarded && initial!=='admin') setTimeout(()=>openOnboarding(1), 300);
})();
