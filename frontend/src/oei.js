// ---------- Option Edge Index (Ed's methodology v0.1) ----------
// Sample snapshot in the shape oei/run.py publishes. Production replaces OEI_DATA from /api/oei.
let OEI_DATA = {asof:'2026-10-26', version:'0.1', sample:true, rows:{
  SPY:{spot:672.40, oei:18.6, fair_vol:15.2, fair_vol_ewma:15.9, rv5:13.1, rv20:14.6, rv60:15.8, events_ahead:[{date:'2026-10-29',name:'FOMC'},{date:'2026-11-06',name:'非农就业'},{date:'2026-11-12',name:'CPI'}]},
  QQQ:{spot:608.35, oei:27.4, fair_vol:29.1, fair_vol_ewma:28.3, rv5:31.8, rv20:30.2, rv60:26.4, events_ahead:[{date:'2026-10-29',name:'FOMC'},{date:'2026-10-29',name:'MSFT · GOOGL 财报'},{date:'2026-10-30',name:'AAPL · AMZN 财报'},{date:'2026-11-12',name:'CPI'}]},
}, history:null};
const OEI_DAYS = 30;

function oeiRow(sym){
  const r=OEI_DATA.rows[sym]; if(!r) return null;
  const edge = r.edge_spread ?? (r.fair_vol!=null ? r.oei-r.fair_vol : null);
  const vrp = r.vrp ?? (r.fair_vol!=null ? (r.oei/100)**2-(r.fair_vol/100)**2 : null);
  const em = r.expected_move_30d ?? r.spot*r.oei/100*Math.sqrt(OEI_DAYS/365);
  return {...r, edge, vrp, em, emPct: em/r.spot*100};
}
// One year of daily history ending at today's values (sample only; production reads /api/oei history).
function oeiHistory(sym){
  if(OEI_DATA.history && OEI_DATA.history[sym]) return OEI_DATA.history[sym];
  const r=OEI_DATA.rows[sym], g=rng(hash('oei'+sym)), n=260; const iv=[], fv=[];
  let a=r.oei*0.9, b=r.fair_vol*0.95;
  for(let i=0;i<n;i++){
    const shock = g()<0.03 ? (g()*9) : 0;   // occasional vol spikes
    a += (r.oei*0.92-a)*0.06 + (g()-0.5)*1.6 + shock; a=Math.max(8,a);
    b += (a*0.86-b)*0.08 + (g()-0.5)*0.9; b=Math.max(7,b);
    iv.push(a); fv.push(b);
  }
  // Blend the last 20 days onto today's published values.
  for(let i=n-20;i<n;i++){ const w=(i-(n-20)+1)/20; iv[i]=iv[i]*(1-w)+r.oei*w; fv[i]=fv[i]*(1-w)+r.fair_vol*w; }
  return (OEI_DATA.history=OEI_DATA.history||{})[sym] = iv.map((v,i)=>({oei:+v.toFixed(2), fair_vol:+fv[i].toFixed(2), edge_spread:+(v-fv[i]).toFixed(2)}));
}
function oeiPct(sym){
  const h=oeiHistory(sym).map(x=>x.edge_spread).filter(x=>x!=null), e=oeiRow(sym).edge;
  return h.length && e!=null ? Math.round(h.filter(x=>x<e).length/h.length*100) : null;
}
function oeiRead(edge, pct){
  if(edge==null) return '';
  if(edge>=2) return `期权定价的波动明显高于模型对未来 30 天实际波动的预测，处于过去一年的第 ${pct} 百分位。历史上这种状态下，期权卖方获得的风险补偿较厚。`;
  if(edge<=-1) return `期权定价的波动低于模型预测的实际波动，处于过去一年的第 ${pct} 百分位。期权相对便宜，若事件冲击兑现，实际波动超出定价的可能性较高。`;
  return `期权定价与模型预测接近，处于过去一年的第 ${pct} 百分位，波动率风险溢价不突出。`;
}
const sgn = (v,d=1) => (v>=0?'+':'−')+Math.abs(v).toFixed(d);

function oeiLines(sym, H, showFair){
  const h=oeiHistory(sym), n=h.length, W=320; H=H||120; if(n<2) return '';
  const all=h.flatMap(x=>showFair?[x.oei,x.fair_vol]:[x.oei]); const lo=Math.min(...all)*0.95, hi=Math.max(...all)*1.03;
  const X=i=>(i/(n-1)*W).toFixed(1), Y=v=>(H-4-(v-lo)/(hi-lo)*(H-10)).toFixed(1);
  const path=k=>h.map((x,i)=>`${i?'L':'M'}${X(i)} ${Y(x[k])}`).join(' ');
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" preserveAspectRatio="none" aria-hidden="true">
    <path d="${path('oei')} L${W} ${H} L0 ${H}Z" fill="var(--band-ink)" opacity=".07"/>
    <path d="${path('oei')}" fill="none" stroke="var(--band-ink)" stroke-width="1.8" vector-effect="non-scaling-stroke"/>
    ${showFair?`<path d="${path('fair_vol')}" fill="none" stroke="var(--amber)" stroke-width="1.5" stroke-dasharray="4 3" vector-effect="non-scaling-stroke"/>`:''}</svg>`;
}
function oeiEdgeBars(sym, H){
  const h=oeiHistory(sym), n=h.length, W=320; H=H||100; if(n<2) return ''; const m=Math.max(...h.map(x=>Math.abs(x.edge_spread)))||1, mid=H/2, bw=W/n;
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" preserveAspectRatio="none" aria-hidden="true">${h.map((x,i)=>{ const v=x.edge_spread, hh=Math.abs(v)/m*(mid-4); return `<rect x="${(i*bw).toFixed(2)}" y="${(v>=0?mid-hh:mid).toFixed(1)}" width="${Math.max(bw-0.2,0.4).toFixed(2)}" height="${Math.max(hh,.4).toFixed(1)}" fill="${v>=0?'var(--pos)':'var(--neg)'}" opacity=".8"/>`; }).join('')}<line x1="0" x2="${W}" y1="${mid}" y2="${mid}" stroke="var(--ink)" stroke-width=".6" vector-effect="non-scaling-stroke"/></svg>`;
}
function oeiHist(sym, H){
  const h=oeiHistory(sym).map(x=>x.edge_spread).filter(x=>x!=null), e=oeiRow(sym).edge, W=320; H=H||90; if(h.length<2||e==null) return '';
  const lo=Math.floor(Math.min(...h,e)), hi=Math.ceil(Math.max(...h,e)), nb=Math.max(hi-lo,1), bins=Array(nb).fill(0);
  h.forEach(v=>bins[Math.min(nb-1,Math.floor(v-lo))]++); const m=Math.max(...bins), bw=W/nb, ex=(e-lo)/(hi-lo)*W;
  return `<svg viewBox="0 0 ${W} ${H+14}" width="100%" height="${H+14}" preserveAspectRatio="none" aria-hidden="true">${bins.map((c,i)=>`<rect x="${(i*bw+1).toFixed(1)}" y="${(H-c/m*(H-6)).toFixed(1)}" width="${(bw-2).toFixed(1)}" height="${(c/m*(H-6)).toFixed(1)}" fill="var(--muted)" opacity=".35"/>`).join('')}
    <line x1="${ex.toFixed(1)}" x2="${ex.toFixed(1)}" y1="0" y2="${H}" stroke="var(--band-ink)" stroke-width="2" vector-effect="non-scaling-stroke"/>
    <text x="${Math.min(Math.max(ex,24),W-24).toFixed(1)}" y="${H+12}" text-anchor="middle" font-size="10" fill="var(--band-ink)">今日 ${sgn(e)}</text></svg>`;
}

// ----- 首页卡片 -----
function oeiCard(){
  const pro=isPro();
  const col=sym=>{ const r=oeiRow(sym);
    return `<div class="oe-col"><div class="oe-sym">${sym}-OEI</div><div class="oe-v num serif">${r.oei.toFixed(1)}</div>
      <div class="xs muted">30 天预期波动 <b class="num" style="color:var(--ink)">±$${r.em.toFixed(1)}</b> <span class="num">(±${r.emPct.toFixed(1)}%)</span></div>
      <div class="oe-pro"><span><span class="xs muted">Fair Vol</span><b class="num">${pro?r.fair_vol.toFixed(1):'••'}</b></span><span><span class="xs muted">Edge</span><b class="num ${pro?(r.edge>=0?'up':'down'):''}">${pro?sgn(r.edge):'••'}</b></span></div>
      <div class="oe-chart">${oeiLines(sym, 46, pro)}</div></div>`; };
  return `<button class="oe-card" data-go="oei"><div class="oe-head"><span class="oe-k">Option Edge Index</span><span class="xs muted">${OEI_DATA.asof} 收盘前${OEI_DATA.sample?' · 示例数据':''}</span></div>
    <div class="oe-grid">${col('SPY')}${col('QQQ')}</div>
    <div class="oe-foot xs">${pro?'Edge Spread 历史分布与方法论 ›':`${IC.lock} Fair Vol、Edge Spread 与历史分位为订阅专享 ›`}</div></button>`;
}

// ----- OEI 页面 -----
function pageOei(){
  const sym=U.oeisym||'SPY', r=oeiRow(sym), pro=isPro(), pct=oeiPct(sym);
  let h = subHeader('Option Edge Index', {sub:`SPY-OEI · QQQ-OEI · 每个交易日 15:45 美东发布${OEI_DATA.sample?' · 示例数据':''}`});
  h += `<div class="pad" style="padding-top:16px">
    <div class="seg light" style="width:180px">${['SPY','QQQ'].map(s=>`<button aria-selected="${s===sym}" data-act="oeisym" data-arg="${s}">${s}</button>`).join('')}</div>
    <div class="oe-big"><div><span class="xs muted">${sym}-OEI</span><b class="num serif">${r.oei.toFixed(1)}</b><span class="xs muted">30 天隐含波动率</span></div>
      <div><span class="xs muted">30 天预期波动</span><b class="num serif">±$${r.em.toFixed(1)}</b><span class="xs muted num">±${r.emPct.toFixed(1)}% · 现价 $${r.spot.toFixed(2)}</span></div></div>
    <figure class="eco-fig"><div class="eco-fig-h">${sym}-OEI${pro?' 与 Fair Vol':''}，过去一年</div><div class="eco-fig-s">${pro?'实线为 OEI，虚线为 Fair Vol（模型预测的未来 30 天实际波动）':'OEI 每日收盘前快照'}</div>
      <div class="eco-fig-c">${oeiLines(sym, 140, pro)}</div><figcaption>来源：Gamma Squeeze Research${OEI_DATA.sample?'，示例数据':''}</figcaption></figure></div>`;
  if(pro){
    h += `<div class="pad article-body" style="--fs:1">
      <div class="eco-data"><div class="kicker">今日读数</div><div class="eco-grid">
        <div><span>Fair Vol（HAR-RV）</span><b class="num">${r.fair_vol.toFixed(1)}</b></div><div><span>Edge Spread</span><b class="num ${r.edge>=0?'up':'down'}">${sgn(r.edge)}</b></div>
        <div><span>VRP（年化方差）</span><b class="num">${sgn(r.vrp,4)}</b></div><div><span>Edge 一年分位</span><b class="num">${pct}%</b></div>
        <div><span>Fair Vol（EWMA 校验）</span><b class="num">${(r.fair_vol_ewma??r.fair_vol).toFixed(1)}</b></div><div style="grid-column:1/-1"><span>已实现波动 RV5 / RV20 / RV60</span><b class="num">${[r.rv5,r.rv20,r.rv60].map(v=>v==null?'–':v.toFixed(1)).join(' / ')}</b></div></div></div>
      <p>${oeiRead(r.edge, pct)}</p>
      ${(r.events_ahead||[]).length?`<p class="small muted">未来 30 天已计入的事件：${r.events_ahead.map(e=>`${e.date.slice(5)} ${esc(e.name)}`).join('，')}。事件日的额外波动按历史均值单独加入 Fair Vol。</p>`:''}
      <figure class="eco-fig"><div class="eco-fig-h">Edge Spread，过去一年</div><div class="eco-fig-s">OEI − Fair Vol，单位为波动率点</div><div class="eco-fig-c">${oeiEdgeBars(sym, 100)}</div></figure>
      <figure class="eco-fig"><div class="eco-fig-h">Edge Spread 分布</div><div class="eco-fig-s">过去一年每日读数，竖线为今日</div><div class="eco-fig-c">${oeiHist(sym, 90)}</div></figure></div>`;
  } else {
    h += `<div class="pad"><div class="art-locked"><h2 class="art-h">Fair Vol 与 Edge Spread</h2>
      <div class="ghost-lines" aria-hidden="true"><span style="width:92%"></span><span style="width:100%"></span><span style="width:80%"></span></div>
      ${paywallBox({src:'oei', id:'oei', note:'Fair Vol、Edge Spread、VRP 与历史分位', intro:'订阅后可以看到 SPY 与 QQQ 的 Fair Vol、Edge Spread、波动率风险溢价、一年历史分位与分布，以及每日解读。'})}</div></div>`;
  }
  h += `<div class="pad article-body" style="--fs:1"><h2 class="art-h">方法论 v0.1</h2>
    <p><b>OEI</b> 是 SPY 与 QQQ 的 30 天恒定期限隐含波动率。计算方法与 VIX 相同，使用无模型方差：取近月和次月两个到期日的全部虚值期权，从买卖中间价计算各自的隐含方差，再按总方差插值到 30 天。</p>
    <ul class="small" style="line-height:1.9;padding-left:18px;color:var(--ink2)">
      <li>远期价格由看涨看跌平价推出；SPY、QQQ 为美式期权且有分红，使用分红调整后的远期。</li>
      <li>虚值期权从 K0 向两侧取，买价为零跳过，连续两个零买价停止。</li>
      <li>OEI = 100 × √(30 天插值方差)。</li></ul>
    <p><b>Fair Vol</b> 是对未来 30 天实际波动的独立预测。默认使用 HAR-RV 模型，用日、周、月三个尺度的已实现方差回归未来 21 个交易日的平均方差；EWMA（λ = 0.94）作为校验。已知事件（CPI、FOMC、非农、大型科技股财报）的额外波动按历史均值单独加入，只加一次。</p>
    <ul class="small" style="line-height:1.9;padding-left:18px;color:var(--ink2)">
      <li>Edge Spread = OEI − Fair Vol</li><li>VRP = (OEI/100)² − (Fair Vol/100)²</li><li>30 天预期波动 = 现价 × OEI/100 × √(30/365)</li>
      <li>年化口径统一：30 个自然日窗口内的总方差 × 365/30。RV5、RV20、RV60 按市场惯例用 252 年化。</li></ul>
    <p class="small muted">发布：每个交易日美东 15:45 计算并发布当日快照，期权报价来自授权数据源。</p>
    <div class="disclosure"><div>OEI 是研究指标，不是交易信号，也不构成针对个人的投资建议。期权交易风险较高，可能损失全部权利金或更多。</div></div></div>`;
  return h + footer();
}
