// ---------- Round 12 (Ed): WSJ-style restraint, image-led cards, motion, opening animation ----------
// Loaded after ux/oei and before main, so the reassignments below are in place before boot.

['towers','news','suit','gold','desk'].forEach(k=>PHOTOS[k]=`img/photos/${k}.jpg`);
ART_IMG['midterm-vol']='news';
Object.assign(SECTOR_IMG, {'美股':'towers','大宗':'gold'});
// Portrait (4:5) crops of the same photos for tall cards.
const PORTRAIT = new Set(['analyst','analyst2','bond','capitol','chip','copper','desk','fed','gold','news','oil','pit','shop','skyline','suit','towers','trader','trader2']);
function photo(key, cls, tall){
  if(!PHOTOS[key]) return editImg(key, cls);
  const src = tall && PORTRAIT.has(key) ? `img/photos/${key}-p.jpg` : PHOTOS[key];
  return `<div class="ph ${cls||''}"><img src="${src}" alt="" loading="lazy" decoding="async"></div>`;
}
const imgKey = a => ART_IMG[a.id] || SECTOR_IMG[CHAN_SECTOR[a.chan]] || 'skyline';
function quoteChip(a){
  const s=(a.syms||[]).find(x=>SYMS[x]); if(!s) return '';
  const q=quote(s); return `<span class="q-chip num"><b>${symLabel(s)}</b><span class="${q.up?'up':'down'}" data-q="${s}" data-f="ch">${chText(s)}</span></span>`;
}

// Full-image poster card: one article is one picture.
function posterCard(a, opts={}){
  const c=articleCfg(a.id);
  return `<button class="pc${opts.full?' full':''}" data-go="a-${a.id}">${photo(imgKey(a),'pc-media',true)}
    <span class="pc-top">${c.free?'<span class="pc-badge free">免费阅读</span>':'<span class="pc-badge">GS 研究</span>'}${quoteChip(a)}</span>
    <span class="pc-body"><span class="pc-k">${a.cat}</span><span class="pc-h serif">${esc(a.title)}</span>
      <span class="pc-d">${esc(opts.why||a.dek)}</span>
      <span class="pc-m">${a.mins} 分钟阅读<span aria-hidden="true">·</span>评论 ${commentCount(a.id)}${c.free?'':` <span class="pc-lock">${IC.lock}</span>`}</span></span></button>`;
}
// Two-column picture grid (staggered heights).
function gridCards(list){
  if(!list.length) return '';
  const card=(a,i)=>`<button class="gc${i%3===1?' tall':''}" data-go="a-${a.id}"><span class="gc-img">${photo(imgKey(a),'',true)}${quoteChip(a)}</span>
    <span class="gc-k">${a.cat}</span><span class="gc-h serif">${esc(a.title)}</span>
    <span class="gc-m"><span>${a.mins} 分钟</span><span>评论 ${commentCount(a.id)}</span></span></button>`;
  const L=[], R=[]; list.forEach((a,i)=>(i%2?R:L).push(card(a,i)));
  return `<div class="gcs"><div>${L.join('')}</div><div>${R.join('')}</div></div>`;
}
function bigCard(a){ return posterCard(a); }

// ----- 首页（今日） -----
function homeToday(h){
  const picks = EDITOR_PICKS.map(p=>({...p, a:ARTICLES.find(x=>x.id===p.id)})).filter(p=>p.a);
  const lead = picks[0], rest = picks.slice(1);
  const used = new Set(picks.map(p=>p.a.id));
  const pool = ARTICLES.filter(a=>!used.has(a.id)).sort((a,b)=>(b.date.startsWith('今天')?1:0)-(a.date.startsWith('今天')?1:0));
  const take = n => pool.splice(0, n);
  h += zone('oei', `<section class="pad" aria-label="Option Edge Index">${oeiCard()}</section>`);
  h += zone('lead', `<section aria-label="编辑精选">${posterCard(lead.a,{full:true, why:lead.why})}</section>`);
  if(rest.length) h += zone('grid', `<section class="pad" aria-label="精选">${gridCards(rest.map(p=>p.a))}</section>`);
  const B=DAILY_BRIEF;
  h += zone('brief', `<section class="pad" aria-label="每日宏观简报">
    <h3 class="serif brief-h" style="margin-top:0">${esc(B.title)}</h3>
    <ol class="brief">${B.items.map(([k,t])=>`<li><span class="brief-k">${k}</span><span>${esc(t)}</span></li>`).join('')}</ol>
    ${!S.newsletter?`<form data-form="newsletter" class="brief-form"><label for="nl-email" class="sr">邮箱</label><input id="nl-email" class="input" type="email" required placeholder="每个交易日 06:30 发送到邮箱" autocomplete="email"><button class="btn primary" type="submit">订阅简报</button></form>`:''}</section>`);
  h += zone('poster', `<section class="pad" aria-label="深度研究">${take(1).map(a=>posterCard(a)).join('')}</section>`);
  h += zone('grid', `<section class="pad" aria-label="深度研究">${gridCards(take(4))}</section>`);
  h += zone('earn', `<section aria-label="财报数据解析">${earnRail()}</section>`);
  h += zone('curve', `<section class="pad" aria-label="收益率曲线">${figCard('curve')}</section>`);
  h += zone('events', eventsPanel());
  h += zone('poster', `<section class="pad" aria-label="深度研究">${take(1).map(a=>posterCard(a)).join('')}</section>`);
  const snaps=liveSnaps().slice(0,4);
  if(snaps.length) h += zone('snap', `<section class="pad" aria-label="盘中快照">${snaps.map(snapRow).join('')}</section>`);
  h += zone('video', `<section aria-label="视频"><div class="v-rail">${VIDEOS.slice(0,5).map(videoCard).join('')}</div>
    <div class="series-rail" style="margin-top:6px">${VIDEO_SERIES.map(se=>seriesCard(se)).join('')}</div></section>`);
  if(pool.length) h += zone('grid', `<section class="pad" aria-label="更多研究">${gridCards(pool)}</section>`);
  h += zone('curve', `<section class="pad" aria-label="VIX 期货">${figCard('vx')}</section>`);
  return h + footer();
}

// ----- Motion -----
// Scroll reveal: blocks rise in as they enter the viewport; photos settle from a slight zoom.
let _io=null;
function reveal(){
  const els=document.querySelectorAll('#app .zone, #app .pc, #app .gc, #app .eco-fig, #app .big-card');
  if(REDUCED || !('IntersectionObserver' in window)){ els.forEach(e=>e.classList.add('rv','in')); return; }
  if(_io) _io.disconnect();
  _io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); _io.unobserve(e.target); } }), {rootMargin:'0px 0px -6% 0px', threshold:0.06});
  const vh=innerHeight;
  els.forEach(e=>{ e.classList.add('rv'); if(e.getBoundingClientRect().top < vh*0.92) e.classList.add('in'); else _io.observe(e); });
}
const uxAfterRenderBase = uxAfterRender;
uxAfterRender = function(){ uxAfterRenderBase(); reveal(); };

// Page transitions: View Transitions where supported; the tapped card's photo morphs into the article hero.
let _vtFrom=null, _inVT=false;
document.addEventListener('click', e=>{ _vtFrom = e.target.closest && e.target.closest('[data-go]'); }, true);
function withVT(update){
  if(REDUCED || !document.startViewTransition){ update(); return; }
  const src = _vtFrom && _vtFrom.isConnected ? _vtFrom.querySelector('.ph') : null; _vtFrom=null;
  if(src) src.style.viewTransitionName='hero';
  _inVT=true;
  const t=document.startViewTransition(()=>{ update(); const dst=document.querySelector('.art-head .hero-img'); if(src && dst) dst.style.viewTransitionName='hero'; });
  t.finished.finally(()=>{ _inVT=false; document.querySelectorAll('[style*="view-transition-name"]').forEach(x=>x.style.viewTransitionName=''); });
}
const goBase = go, backBase = back, enterAnimBase = enterAnim;
go = function(r, opts){ withVT(()=>goBase(r, opts)); };
back = function(){ withVT(backBase); };
enterAnim = function(){ if(!_inVT) enterAnimBase(); };

// Bottom navigation tucks away while reading down, returns on any upward scroll.
(function(){
  let y0=scrollY;
  addEventListener('scroll', ()=>{ const y=scrollY, d=y-y0; if(Math.abs(d)<6) return;
    document.body.classList.toggle('nav-tuck', d>0 && y>160); y0=y; }, {passive:true});
})();


// Video: every episode and series gets a photo, not a flat placeholder.
const VIDEO_IMGS=['trader','pit','desk','trader2','suit','analyst2','towers','analyst'];
const vidImg = id => VIDEO_IMGS[hash(id)%VIDEO_IMGS.length];
function videoCard(v){
  return `<button class="vc" data-act="video" data-arg="${v.id}"><span class="vc-img">${photo(vidImg(v.id),'')}
    <span class="vc-tag">${v.free?'免费':'PRO'}</span><span class="vc-play">${IC.play}</span><span class="num vc-dur">${v.dur}</span></span>
    <span class="vc-t">${esc(v.title)}</span><span class="xs muted">${v.series}${v.latest?' · 最新一期':''}</span></button>`;
}
function seriesCard(se){
  const eps=VIDEOS.filter(v=>v.series===se.name);
  return `<button class="series-card sc-photo" data-act="vseries" data-arg="${se.name}">${photo(vidImg(se.name),'',true)}<span class="sc-kind">${se.kind}</span><span class="sc-name serif">${se.name}</span><span class="sc-meta">${se.season} · ${eps.length} ${se.name==='周度复盘'?'期':'集'}</span></button>`;
}
