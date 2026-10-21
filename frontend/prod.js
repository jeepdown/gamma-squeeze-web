// ---------- Production adapter: Supabase auth + server API + Stripe ----------
// Appended after the prototype scripts by scripts/build-frontend.mjs. Function declarations here replace the
// prototype's demo versions; *Base functions are the prototype originals, renamed by the build.
const PROD = { sb:null, session:null, me:{signedIn:false}, offerDeadline:null, offerAsked:false, full:{}, cfg:null };

async function api(path, opts={}){
  const headers = {'Content-Type':'application/json', ...(opts.headers||{})};
  if(PROD.session?.access_token) headers.Authorization = 'Bearer '+PROD.session.access_token;
  const r = await fetch('/api/'+path, {...opts, headers});
  const body = await r.json().catch(()=>({}));
  if(!r.ok) throw Object.assign(new Error(body.error||('HTTP '+r.status)), {status:r.status});
  return body;
}

function applyMe(me){
  PROD.me = me;
  S.role = !me.signedIn ? 'guest' : (me.role==='admin'||me.role==='editor') ? 'admin' : me.subscriber ? 'pro' : 'free';
  S.plan = me.plan || null; S.userName = me.signedIn ? (S.userName || me.email.split('@')[0]) : null;
  PROD.offerDeadline = me.offer?.deadline ? new Date(me.offer.deadline).getTime() : null;
  S.offerUsed = !!me.offer?.used; S.offerStart = PROD.offerDeadline ? PROD.offerDeadline - offerCfg().mins*60000 : null;
  save();
}

async function refreshMe(){
  try{ applyMe(await api('me')); }catch(e){ applyMe({signedIn:false}); }
  if(isPro()) loadPremium();
  rerender();
}

async function loadArticles(){
  try{
    const {articles} = await api('articles');
    if(articles?.length){
      ARTICLES.splice(0, ARTICLES.length, ...articles.map(a=>({...a, date: fmtPub(a.published_at), base:0})));
      articles.forEach(a=>{ ART_META[a.id] = a.meta && a.meta.topics ? a.meta : {events:[], topics:[]}; if(a.img) ART_IMG[a.id]=a.img; });
      rerender();
    }
  }catch(e){ /* keep bundled samples when the API is unreachable */ }
}
function fmtPub(t){
  if(!t) return '';
  const d=new Date(t), now=new Date(), hm=`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  const day=Math.floor((new Date(now.toDateString())-new Date(d.toDateString()))/864e5);
  return day===0?`今天 ${hm}`:day===1?`昨天 ${hm}`:`${d.getMonth()+1}/${d.getDate()} ${hm}`;
}

async function loadPremium(){
  for(const kind of ['earn','insts','congress']){
    try{
      const {payload} = await api('premium?kind='+kind);
      if(!payload) continue;
      if(kind==='earn') Object.assign(EARN, payload);
      if(kind==='insts') INSTS.splice(0, INSTS.length, ...payload);
      if(kind==='congress') CONGRESS.splice(0, CONGRESS.length, ...payload);
    }catch(e){}
  }
  rerender();
}

// Article page: fetch the server's version (full text only for subscribers) once per article and sign-in state.
function pageArticle(id){
  const key = id+'|'+S.role;
  if(!PROD.full[key]){
    PROD.full[key] = 'loading';
    api('article?id='+encodeURIComponent(id)).then(({article})=>{
      const i = ARTICLES.findIndex(x=>x.id===id); const merged = {...(ARTICLES[i]||{}), ...article, date: fmtPub(article.published_at), base:(ARTICLES[i]||{}).base||0};
      if(i>=0) ARTICLES[i]=merged; else ARTICLES.push(merged);
      if(article.notes?.length) ART_NOTES[id] = article.notes;
      PROD.full[key]='done'; if(U.route==='a-'+id) rerender();
    }).catch(()=>{ PROD.full[key]='done'; });
  }
  return pageArticleBase(id);
}

// New-user offer: the deadline lives on the server; guests are asked to sign in first.
function offerLeft(){
  const o=offerCfg(); if(!o.on || isPro() || S.offerUsed || !PROD.me.signedIn) return 0;
  if(!PROD.offerDeadline && !PROD.offerAsked){
    PROD.offerAsked = true;
    api('offer',{method:'POST'}).then(({deadline})=>{ if(deadline){ PROD.offerDeadline=new Date(deadline).getTime(); S.offerStart=PROD.offerDeadline-o.mins*60000; rerender(); } }).catch(()=>{});
  }
  return PROD.offerDeadline ? Math.max(0, PROD.offerDeadline-Date.now()) : 0;
}

// Sign in with a one-time email code (Supabase Auth OTP).
function openRegister(src){
  track('register_view',{src});
  openSheet(`<h2>登录或注册</h2><p class="small muted" style="margin:0 0 14px">输入邮箱，我们会发送 6 位验证码。新邮箱会自动创建账号。</p>
    <form data-form="otp-send" style="display:flex;flex-direction:column;gap:12px">
      <div><label class="lbl" for="otp-email">邮箱</label><input id="otp-email" class="input" type="email" required autocomplete="email" placeholder="name@example.com"></div>
      <button class="btn primary block" type="submit">发送验证码</button></form>`,'登录');
}
function openOtpCode(email){
  openSheet(`<h2>输入验证码</h2><p class="small muted" style="margin:0 0 14px">验证码已发送到 ${esc(email)}，10 分钟内有效。</p>
    <form data-form="otp-verify" data-arg="${esc(email)}" style="display:flex;flex-direction:column;gap:12px">
      <div><label class="lbl" for="otp-code">验证码</label><input id="otp-code" class="input num" inputmode="numeric" autocomplete="one-time-code" maxlength="6" required></div>
      <button class="btn primary block" type="submit">登录</button></form>`,'验证码');
}

// Checkout goes to Stripe; the subscription becomes active when the webhook lands.
function subscribe(plan){
  if(!PROD.me.signedIn){ toast('请先登录，再订阅'); openRegister('checkout'); return; }
  const cyc = plan.replace('elite-','');
  api('checkout',{method:'POST', body:JSON.stringify({plan:cyc})})
    .then(({url})=>{ track('checkout_start',{plan:cyc}); location.href=url; })
    .catch(e=>toast(e.status===409?'你已经是订阅用户':'暂时无法打开支付页面，请稍后再试'));
}

function pageMe(){
  const m=PROD.me, base=pageMeBase(), i=base.indexOf('</header>');
  if(!m.signedIn || i<0) return base;
  const acct = `<section class="pad sec"><div class="box"><div class="kicker">账号</div><div style="font-weight:700;margin-top:4px">${esc(m.email)}</div>
    ${m.renews&&!m.staff?`<div class="small muted" style="margin-top:4px">${m.cancelAtPeriodEnd?'到期日':'下次续费'} ${new Date(m.renews).toLocaleDateString('zh-CN')}</div>`:''}
    <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">${m.subscriber&&!m.staff?'<button class="btn sm" data-act="billing">管理订阅与发票</button>':''}<button class="btn sm ghost" data-act="logout">退出登录</button></div></div></section>`;
  return base.slice(0,i+9) + acct + base.slice(i+9);
}

// Admin: publish articles and snapshots to the live site and app.
function parseBody(text){
  const body=[], secs=[];
  text.split(/\n\s*\n/).map(t=>t.trim()).filter(Boolean).forEach(b=>{
    let m;
    if((m=b.match(/^##\s+(.+)/))) secs.push([body.length, m[1].trim()]);
    else if((m=b.match(/^>\s*(.+)/s))) body.push({t:'quote', text:m[1].trim()});
    else if((m=b.match(/^\[(chart|spark|levels):([A-Z0-9]+)(?:\|(.+))?\]$/))) body.push({t:m[1], sym:m[2], cap:m[3]||''});
    else if((m=b.match(/^\[(curve|vx)(?:\|(.+))?\]$/))) body.push({t:m[1], cap:m[2]||''});
    else body.push(b);
  });
  return {body, secs};
}
function adminPublish(){
  const chans=CHANNELS.filter(c=>!['今日','视频'].includes(c));
  return `<div class="ahead"><div><h1>线上发布</h1><div class="small muted" style="margin-top:4px">发布后网站与 App 同时更新。正文用空行分段；“## 标题”开始新的一节（付费墙从第一节开始）；“> ”为引语；[chart:SPX]、[spark:US10Y|图注]、[curve|图注]、[vx] 插入图表。</div></div></div>
   <form data-form="pub-article" style="display:grid;gap:12px;margin-top:18px;max-width:860px">
    <div><label class="lbl" for="pa-id">链接名（英文，如 cpi-preview）</label><input id="pa-id" class="input" required pattern="[a-z0-9-]+"></div>
    <div><label class="lbl" for="pa-title">标题</label><input id="pa-title" class="input" required></div>
    <div><label class="lbl" for="pa-dek">导语</label><input id="pa-dek" class="input"></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px">
      <div><label class="lbl" for="pa-chan">栏目</label><select id="pa-chan" class="input">${chans.map(c=>`<option>${c}</option>`).join('')}</select></div>
      <div><label class="lbl" for="pa-cat">分类显示名</label><input id="pa-cat" class="input" value="期权与波动率"></div>
      <div><label class="lbl" for="pa-syms">相关代码（逗号分隔）</label><input id="pa-syms" class="input" placeholder="SPX,VIX"></div>
      <div><label class="lbl" for="pa-img">配图</label><select id="pa-img" class="input">${Object.keys(ILL).map(k=>`<option>${k}</option>`).join('')}</select></div>
      <div><label class="lbl" for="pa-mins">阅读分钟</label><input id="pa-mins" class="input" type="number" min="1" value="6"></div>
    </div>
    <div><label class="lbl" for="pa-body">正文</label><textarea id="pa-body" class="input" rows="14" required></textarea></div>
    <label class="check"><input type="checkbox" id="pa-free"> 免费文章（不设付费墙）</label>
    <div style="display:flex;gap:8px"><button class="btn primary" type="submit" data-arg="published">发布</button><button class="btn ghost" type="submit" data-arg="draft">存为草稿</button></div>
   </form>
   <h2 class="h2" style="margin-top:34px">发布快照</h2>
   <form data-form="pub-snap" style="display:grid;gap:12px;margin-top:12px;max-width:860px">
    <div style="display:grid;grid-template-columns:140px 1fr;gap:12px"><div><label class="lbl" for="ps-sec">板块</label><select id="ps-sec" class="input">${Object.keys(SECTOR_IMG).map(k=>`<option>${k}</option>`).join('')}</select></div><div><label class="lbl" for="ps-title">标题</label><input id="ps-title" class="input" required></div></div>
    <div><label class="lbl" for="ps-text">正文（一段，含数据）</label><textarea id="ps-text" class="input" rows="4" required></textarea></div>
    <div><button class="btn primary" type="submit">发布快照</button></div></form>`;
}

document.addEventListener('submit', async e=>{
  const f=e.target.closest('form[data-form]'); if(!f) return;
  const kind=f.dataset.form; if(!['otp-send','otp-verify','pub-article','pub-snap'].includes(kind)) return;
  e.preventDefault(); e.stopImmediatePropagation();
  try{
    if(kind==='otp-send'){ const email=$('#otp-email').value.trim(); const {error}=await PROD.sb.auth.signInWithOtp({email}); if(error) throw error; openOtpCode(email); }
    if(kind==='otp-verify'){ const {data,error}=await PROD.sb.auth.verifyOtp({email:f.dataset.arg, token:$('#otp-code').value.trim(), type:'email'}); if(error) throw error; PROD.session=data.session; closeSheet(); await refreshMe(); toast('已登录'); }
    if(kind==='pub-article'){
      const status=(e.submitter&&e.submitter.dataset.arg)||'published'; const {body,secs}=parseBody($('#pa-body').value);
      const item={id:$('#pa-id').value.trim(), title:$('#pa-title').value.trim(), dek:$('#pa-dek').value.trim(), chan:$('#pa-chan').value, cat:$('#pa-cat').value.trim(), syms:$('#pa-syms').value.split(',').map(s=>s.trim().toUpperCase()).filter(Boolean), img:$('#pa-img').value, mins:+$('#pa-mins').value||5, free:$('#pa-free').checked, body, secs, status};
      await api('admin/publish',{method:'POST', body:JSON.stringify({kind:'article', item})}); toast(status==='published'?'已发布，网站与 App 已更新':'草稿已保存'); loadArticles();
    }
    if(kind==='pub-snap'){
      await api('admin/publish',{method:'POST', body:JSON.stringify({kind:'snapshot', item:{id:'s'+Date.now(), sector:$('#ps-sec').value, title:$('#ps-title').value.trim(), text:$('#ps-text').value.trim()}})}); toast('快照已发布'); f.reset();
    }
  }catch(err){ toast(err.message||'操作失败'); }
}, true);

document.addEventListener('click', async e=>{
  const b=e.target.closest('[data-act="billing"],[data-act="logout"]'); if(!b) return;
  e.preventDefault(); e.stopImmediatePropagation();
  if(b.dataset.act==='billing'){ try{ const {url}=await api('portal',{method:'POST'}); location.href=url; }catch(err){ toast('暂时无法打开订阅管理'); } }
  if(b.dataset.act==='logout'){ await PROD.sb.auth.signOut(); PROD.session=null; PROD.full={}; await refreshMe(); toast('已退出'); }
}, true);

(async function prodBoot(){
  try{
    PROD.cfg = await api('config');
    PROD.sb = window.supabase.createClient(PROD.cfg.supabaseUrl, PROD.cfg.supabaseAnonKey);
    const {data} = await PROD.sb.auth.getSession(); PROD.session = data.session;
    PROD.sb.auth.onAuthStateChange((_ev, session)=>{ PROD.session = session; });
  }catch(e){ console.warn('Gamma Squeeze API unavailable', e); }
  S.offer = {...offerCfg(), mins: PROD.cfg?.offerMinutes || 10, amt: PROD.cfg?.offerAmount || 100, cur:'$'};
  await Promise.all([refreshMe(), loadArticles()]);
  if(new URLSearchParams(location.search).get('checkout')==='success'){ toast('支付成功，订阅开通可能需要几秒'); setTimeout(refreshMe, 4000); }
})();
