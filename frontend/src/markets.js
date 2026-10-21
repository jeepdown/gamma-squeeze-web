
// ---------- GEX 热力图（高级订阅） ----------
const HEAT_SYMS = Object.keys(SYMS).filter(s=>SYMS[s].opt);
const HEAT_EXP = ['0DTE','明日','本周五','下周五','11月 OPEX','12月季度'];
const HEAT_SLOTS = 14; // 09:30 → 16:00, every 30 min
function slotLabel(i){ const m=570+i*30; return `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`; }
function heatData(sym, slot){
  const q=SYMS[sym], g=gamma(sym), spot=q.px;
  const mid=g.rows.findIndex(r=>r.k>=spot); const rows=g.rows.slice(Math.max(0,mid-10), Math.max(0,mid-10)+21);
  const e=q.exp, w=[e[0], e[1]*.45, e[1]*.55, e[2]*.4, e[2]*.6, e[3]];
  const max=Math.max(...g.rows.map(r=>Math.abs(r.g))), sc=q.bn*120/max/30;
  const t=slot/(HEAT_SLOTS-1);
  const cells = rows.map(r=>w.map((wt,j)=>{
    const rnd=rng(hash(sym+r.k+'|'+j+'|'+slot))();
    let v = r.g*wt*sc*(1+(rnd-0.5)*0.5);
    if(j===0){ const d=(r.k-spot)/q.w; v *= (0.6+t*1.6)*Math.exp(-d*d*t*2.2); }
    if(j>=1 && Math.abs(r.k-g.cw)<q.step/2) v *= 1.25;
    return Math.round(v);
  }));
  let king={i:0,j:0,v:0}; cells.forEach((row,i)=>row.forEach((v,j)=>{ if(Math.abs(v)>Math.abs(king.v)) king={i,j,v}; }));
  return {rows, cells, king, spot, colTot: HEAT_EXP.map((_,j)=>cells.reduce((s,r)=>s+r[j],0)), rowTot: cells.map(r=>r.reduce((s,v)=>s+v,0))};
}
function fmtMn(v){ const a=Math.abs(v); const s=v>=0?'+':'−'; return a>=1000 ? s+(a/1000).toFixed(1)+'k' : s+a; }
function heatGrid(sym, slot, locked){
  const d=heatData(sym, slot); const max=Math.max(...d.cells.flat().map(Math.abs))||1;
  const spotIdx = d.rows.findIndex(r=>r.k>=d.spot);
  const cell=(v,i,j)=>{ const a=Math.min(1,Math.abs(v)/max); const pct=Math.round(8+a*82);
    const bg=`color-mix(in srgb, var(${v>=0?'--pos':'--neg'}) ${pct}%, var(--panel))`; const dark=pct>48;
    const k = d.king.i===i && d.king.j===j;
    const tag = locked?'div':'button';
    return `<${tag} class="hc${k?' king':''}" style="background:${bg};color:${dark?'#fff':'var(--ink)'}" ${locked?'':`data-act="heat-cell" data-arg="${i}|${j}"`}>${locked?'••':fmtMn(v)}</${tag}>`; };
  let h = `<div class="heat" role="grid" aria-label="${symLabel(sym)} GEX 热力图，单位百万美元 / 1%"><div class="hh hs">行权价</div>${HEAT_EXP.map(e=>`<div class="hh">${e}</div>`).join('')}<div class="hh">合计</div>`;
  d.rows.slice().reverse().forEach((r,ri)=>{ const i=d.rows.length-1-ri;
    h += `<div class="hk num${i===spotIdx?' spot':''}">${lv(sym,r.k)}</div>${d.cells[i].map((v,j)=>cell(v,i,j)).join('')}<div class="ht num ${d.rowTot[i]>=0?'':'neg'}">${locked?'••':fmtMn(d.rowTot[i])}</div>`;
    if(i===spotIdx) h += `<div class="spotline"><span>现价 ${pxText(sym)}</span></div>`;
  });
  h += `<div class="hk">合计</div>${d.colTot.map(v=>`<div class="ht num ${v>=0?'':'neg'}">${locked?'••':fmtMn(v)}</div>`).join('')}<div class="ht"></div></div>`;
  return {html:h, d};
}
function heatView(){
  const sym = HEAT_SYMS.includes(U.hsym)?U.hsym:'SPX'; const slot = U.hslot ?? (HEAT_SLOTS-1);
  const locked = !isElite();
  const {html, d} = heatGrid(sym, slot, locked);
  const k=d.king, kr=d.rows[k.i];
  const sel = U.hcell && !locked ? U.hcell.split('|').map(Number) : null;
  const detail = sel ? (()=>{ const [i,j]=sel, v=d.cells[i][j], tot=d.colTot[j]; return `<div class="heat-detail"><span class="num" style="font-weight:700">${lv(sym,d.rows[i].k)} · ${HEAT_EXP[j]}</span><span class="num ${v>=0?'':'down'}">${fmtMn(v)}mn / 1%</span><span class="xs muted">占该到期净 GEX ${tot?Math.round(v/tot*100):0}% · ${v>=0?'做市商在此偏向逆势对冲，形成“磁吸/支撑”':'做市商在此偏向顺势对冲，价格穿越时易加速'}</span></div>`; })() : '';
  if(locked){ U._pw=U._pw||{}; if(!U._pw.heat){ U._pw.heat=1; track('paywall_view',{src:'heatmap'}); } }
  return `<section class="pad" aria-label="GEX 热力图">
    <div class="sec-head"><h2 class="h2">GEX 热力图</h2><span class="tag elite">高级订阅</span></div>
    <div class="small muted" style="margin-top:4px">按行权价 × 到期日的做市商净 Gamma 敞口（百万美元 / 标的变动 1%）。蓝为正 Gamma，酒红为负 Gamma，琥珀色框为全图最大敞口节点。</div>
    <div class="chips" role="group" aria-label="标的" style="margin-top:12px">${HEAT_SYMS.map(s=>`<button class="chip" aria-pressed="${s===sym}" data-act="hsym" data-arg="${s}">${symLabel(s)}</button>`).join('')}</div>
    <div class="heat-kpi">
      <div><div class="k">最大节点</div><div class="v num">${locked?'••••':lv(sym,kr.k)}</div><div class="xs muted">${locked?'高级订阅可见':HEAT_EXP[k.j]+' · '+fmtMn(k.v)+'mn'}</div></div>
      <div><div class="k">翻转点</div><div class="v num">${locked?'••••':lv(sym,gamma(sym).flip)}</div><div class="xs muted">全部到期加总</div></div>
      <div><div class="k">0DTE 占比</div><div class="v num">${SYMS[sym].zdte}</div><div class="xs muted">当日成交</div></div>
    </div>
    <div class="heat-scrub"><button class="icon-btn" data-act="heat-play" aria-label="${U.hplay?'暂停回放':'播放盘中回放'}" style="width:36px;height:36px;border:1px solid var(--strong)">${U.hplay?'<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>':'<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>'}</button>
      <label for="hslot" class="sr">盘中时间</label><input id="hslot" type="range" min="0" max="${HEAT_SLOTS-1}" value="${slot}" data-heat-slot ${locked?'disabled':''}>
      <span class="num small" style="width:84px;text-align:right">${slotLabel(slot)} 美东</span></div>
    <div class="heat-wrap${locked?' locked':''}">${html}
      ${locked?`<div class="lockveil"><span class="tag elite">高级订阅</span><strong style="font-size:16px">解锁实时 GEX 热力图</strong><span class="small muted" style="max-width:300px">${isPro()?'你已是 Pro 会员，升级高级订阅即可查看全部节点数值与盘中回放。':'查看每个行权价与到期日的敞口数值、最大节点与盘中变化。'}</span><button class="btn primary" data-act="go-elite">${isPro()?'升级高级订阅':'查看高级订阅'}</button></div>`:''}</div>
    ${detail}
    <div class="heat-legend" aria-hidden="true"><span>负 Gamma</span><i></i><span>正 Gamma</span></div>
    <p class="xs muted">示例数据，由合成持仓模型生成，用于演示交互。正式版需接入有授权的期权持仓数据源，每 5 分钟刷新。</p>
  </section>`;
}
function heatTeaser(){
  const {html} = heatGrid('SPX', HEAT_SLOTS-1, true);
  return `<div class="pad"><div class="sec-head"><h2 class="h2">GEX 热力图</h2><span class="tag elite">高级订阅</span></div>
    <div class="small muted" style="margin-top:4px">行权价 × 到期日的做市商敞口地图，一眼看到价格的“磁吸点”和“加速区”</div>
    <div class="heat-teaser" role="button" tabindex="0" data-act="chan" data-arg="GEX 热力图"><div class="heat-wrap locked mini">${html}</div><span class="btn primary sm" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)">查看 SPX 热力图 ›</span></div></div>`;
}
let HEAT_TIMER=null;
function heatPlay(){
  clearInterval(HEAT_TIMER); if(!U.hplay) return;
  HEAT_TIMER=setInterval(()=>{ if(U.route!=='home' || U.chan!=='GEX 热力图' || !U.hplay){ clearInterval(HEAT_TIMER); U.hplay=false; return; }
    U.hslot = ((U.hslot ?? HEAT_SLOTS-1) + 1) % HEAT_SLOTS; rerender(); }, 900);
}
document.addEventListener('input', e=>{ if(e.target.matches && e.target.matches('[data-heat-slot]')){ U.hslot=+e.target.value; U.hplay=false; clearInterval(HEAT_TIMER); rerender(); const r=$('[data-heat-slot]'); if(r) r.focus(); } });

// ---------- 债券 ----------
function curveVal(c){ return typeof c[1]==='string' ? LIVE[c[1]] : c[1]; }
function curveSVG(){
  const W=358, H=150, L=30, R=8, T=14, B=24; const now=CURVE.map(curveVal), wk=CURVE.map(c=>c[2]);
  const lo=Math.min(...now,...wk)-0.08, hi=Math.max(...now,...wk)+0.08; const X=i=>L+i*(W-L-R)/(CURVE.length-1), Y=v=>T+(hi-v)/(hi-lo)*(H-T-B);
  const path=a=>a.map((v,i)=>`${i?'L':'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
  const ticks=[lo+0.08, (lo+hi)/2, hi-0.08];
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="美国国债收益率曲线，今日与一周前">
    ${ticks.map(t=>`<line x1="${L}" x2="${W-R}" y1="${Y(t)}" y2="${Y(t)}" stroke="var(--line)"/><text x="0" y="${Y(t)+3}" font-size="9.5" fill="var(--muted)" font-family="IBM Plex Mono, monospace">${t.toFixed(2)}%</text>`).join('')}
    <path d="${path(wk)}" fill="none" stroke="var(--muted)" stroke-width="1.4" stroke-dasharray="4 3"/>
    <path d="${path(now)}" fill="none" stroke="var(--band-ink)" stroke-width="2.2"/>
    ${now.map((v,i)=>`<circle cx="${X(i)}" cy="${Y(v)}" r="3" fill="var(--band-ink)"/><text x="${X(i)}" y="${H-6}" font-size="9.5" text-anchor="middle" fill="var(--ink2)" font-family="IBM Plex Mono, monospace">${CURVE[i][0]}</text>`).join('')}</svg>`;
}
function bondBoard(){
  const rows=CURVE.map(c=>{ const v=curveVal(c), sym=typeof c[1]==='string'?c[1]:null; const bp=Math.round((v-(sym?SYMS[sym].prev:c[2]+((c[1]-c[2])*0.6)))*100);
    return `<${sym?`button data-go="t-${sym}"`:'div'} class="yc-row"><span class="num" style="font-weight:600">${c[0]}</span><span class="num" ${sym?`data-q="${sym}" data-f="px"`:''}>${v.toFixed(2)}%</span><span class="num ${bp>=0?'up':'down'}" ${sym?`data-q="${sym}" data-f="ch"`:''}>${bp>=0?'+':'−'}${Math.abs(bp)}bp</span><span class="num xs muted">周 ${((v-c[2])*100>=0?'+':'−')+Math.abs(Math.round((v-c[2])*100))}bp</span></${sym?'button':'div'}>`; }).join('');
  return `<div class="pad">
    <div class="box" style="padding:12px 10px 6px">${curveSVG()}</div>
    <div class="yc">${rows}</div>
    <div style="margin-top:20px"></div>
    <div class="stat-grid">${BOND_STATS.map(([k,v,c])=>`<div class="st-c"><div class="xs muted">${k}</div><div class="num" style="font-size:17px;font-weight:600;margin-top:2px">${v}</div><div class="num xs ${c.startsWith('−')?'down':c==='0bp'?'muted':'up'}">${c}</div></div>`).join('')}</div>
    <div style="margin-top:20px"></div>
    ${AUCTIONS.map(a=>`<div class="list-item"><span class="num small" style="width:44px;font-weight:600">${a[0]}</span><span class="grow" style="font-size:14px">${a[1]}</span><span class="num xs muted">${a[2]} · ${a[3]}</span></div>`).join('')}
  </div>`;
}

// ---------- 期货 ----------
function futInfo(s){ return SYMS[s].fut || FUT_EXTRA[s]; }
function vxSVG(){
  const W=358,H=120,L=8,R=8,T=16,B=22; const vals=VX_CURVE.map(v=>v[1]); const lo=Math.min(...vals)-1, hi=Math.max(...vals)+0.5;
  const bw=(W-L-R)/vals.length; const Y=v=>T+(hi-v)/(hi-lo)*(H-T-B);
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="VIX 期货期限结构">${VX_CURVE.map(([k,v],i)=>`<rect x="${L+i*bw+4}" y="${Y(v)}" width="${bw-8}" height="${H-B-Y(v)}" fill="${i?'var(--band-ink)':'var(--amber)'}" opacity="${i?0.25+i*0.09:0.9}"/><text x="${L+i*bw+bw/2}" y="${Y(v)-4}" font-size="9.5" text-anchor="middle" fill="var(--ink)" font-family="IBM Plex Mono, monospace">${v.toFixed(2)}</text><text x="${L+i*bw+bw/2}" y="${H-6}" font-size="9.5" text-anchor="middle" fill="var(--muted)">${k}</text>`).join('')}</svg>`;
}
function futBoard(){
  const groups=['股指','能源','金属','利率','外汇'];
  return `<div class="pad">
    ${groups.map(g=>`<div class="fut-g">${g}</div>${FUT_LIST.filter(s=>futInfo(s).grp===g).map(s=>{ const f=futInfo(s); return `<button class="fut-row" data-go="t-${s}"><span><span style="font-weight:700">${symLabel(s)}</span> <span class="xs muted">${f.ct} · ${f.exch}</span><span class="xs muted" style="display:block">${esc(SYMS[s].name)}</span></span><span style="text-align:right"><span class="num" style="display:block;font-weight:600" data-q="${s}" data-f="px">${pxText(s)}</span><span class="num xs ${quote(s).up?'up':'down'}" data-q="${s}" data-f="ch">${chText(s)}</span></span><span class="num xs muted" style="text-align:right">持仓 ${f.oi}<br>成交 ${f.vol}</span></button>`; }).join('')}`).join('')}
    <div style="margin-top:20px"></div>
    <div class="box" style="margin-top:12px;padding:12px 8px 6px">${vxSVG()}</div>
  </div>`;
}

// GEX 热力图与高级订阅暂时下线（Ed，2026-10-20）；改为 true 即恢复
const SHOW_ELITE = false;
function eliteCard(){ const P=S.pricing, annual=U.bill==='annual';
  return `<div class="plan hi elite-plan" id="plan-elite"><div style="display:flex;justify-content:space-between;align-items:center"><span class="latin" style="font-weight:800;font-size:18px">高级订阅</span><span class="tag elite">含 GEX 热力图</span></div>
    <div class="price">$${annual?(P.eliteA??399):(P.eliteM??49)}<span style="font-size:14px;font-weight:600">/${annual?'年':'月'}</span></div><div class="small muted">Pro 全部权益，另加实时 GEX 热力图与盘中回放</div>
    ${isElite() ? `<button class="btn block" disabled>当前方案</button>` : `<button class="btn block primary" data-act="subscribe" data-arg="elite-${U.bill}">${isPro()?'升级高级订阅':'订阅高级'}</button>`}</div>`; }
