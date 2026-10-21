
// ---------- Official free data sources (browser fetch, falls back to sample data) ----------
const SOURCES = [
  {id:'vix', name:'CBOE 官方 VIX 日线', org:'Cboe Global Markets', url:'https://cdn.cboe.com/api/global/us_indices/daily_prices/VIX_History.csv', type:'csv'},
  {id:'cpi', name:'美国 CPI（CUUR0000SA0）', org:'美国劳工统计局 BLS', url:'https://api.bls.gov/publicAPI/v1/timeseries/data/CUUR0000SA0', type:'json'},
  {id:'debt', name:'联邦债务总额（Debt to the Penny）', org:'美国财政部 Fiscal Data', url:'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny?sort=-record_date&page%5Bsize%5D=1', type:'json'},
];
const LIVEDATA = { status:{}, val:{} };
const LIVE_KEY = 'gs_live_v1';
function parseSource(id, body){
  if(id==='vix'){
    const rows = body.trim().split(/\r?\n/).slice(1).map(l=>l.split(',')); const a=rows[rows.length-1], b=rows[rows.length-2];
    return {close:+a[4], prev:+b[4], date:a[0]};
  }
  if(id==='cpi'){
    const d = body.Results.series[0].data; const yoy = (d[0].value/d[12].value-1)*100;
    return {yoy:+yoy.toFixed(1), period:`${d[0].year}年${+d[0].period.slice(1)}月`, index:+d[0].value};
  }
  if(id==='debt'){ const r=body.data[0]; return {total:+r.tot_pub_debt_out_amt, date:r.record_date}; }
}
function applyLive(){
  const v=LIVEDATA.val.vix; if(v && SYMS.VIX){ SYMS.VIX.prev=v.prev; SYMS.VIX.px=v.close; LIVE.VIX=v.close; }
}
async function fetchSource(s){
  const ctl = new AbortController(); const t=setTimeout(()=>ctl.abort(), 8000);
  try{
    const r = await fetch(s.url, {signal:ctl.signal}); if(!r.ok) throw new Error('HTTP '+r.status);
    const body = s.type==='csv' ? await r.text() : await r.json();
    LIVEDATA.val[s.id] = parseSource(s.id, body); LIVEDATA.status[s.id] = {ok:true, at:Date.now()};
  }catch(e){ LIVEDATA.status[s.id] = {ok:false, err: e.name==='AbortError'?'超时':'浏览器无法访问（网络或跨域限制）'}; }
  finally{ clearTimeout(t); }
}
async function loadLive(){
  try{ const c=JSON.parse(localStorage.getItem(LIVE_KEY)||'null'); if(c && Date.now()-c.at < 6*36e5){ Object.assign(LIVEDATA, c.d); applyLive(); return; } }catch(e){}
  await Promise.all(SOURCES.map(fetchSource));
  applyLive();
  try{ if(Object.values(LIVEDATA.status).some(s=>s.ok)) localStorage.setItem(LIVE_KEY, JSON.stringify({at:Date.now(), d:LIVEDATA})); }catch(e){}
  track('live_sources',{ok:SOURCES.filter(s=>LIVEDATA.status[s.id]?.ok).map(s=>s.id).join(',')});
  if(['home','method'].includes(U.route)) rerender();
}
function liveOK(id){ return !!(LIVEDATA.status[id] && LIVEDATA.status[id].ok); }
function officialZone(){
  const v=LIVEDATA.val, pend = !Object.keys(LIVEDATA.status).length;
  const card=(id,k,big,cap)=>`<div class="ofc"><div class="ofc-k">${k}</div><div class="num ofc-v">${big}</div><div class="xs muted">${cap}</div>
    <div class="ofc-src">${pend?'<span class="spin" style="width:10px;height:10px"></span> 正在连接':liveOK(id)?'<span class="okdot"></span>官方实时':'示例数据'}</div></div>`;
  return `<div class="pad"><div class="sec-head"><h2 class="h2">官方数据</h2><button class="link" data-go="method">来源 ›</button></div>
    <div class="small muted" style="margin-top:4px">直接读取政府与交易所公开接口，免费、可溯源</div>
    <div class="ofc-grid">
      ${card('vix','VIX 收盘', v.vix?v.vix.close.toFixed(2):'16.84', v.vix?`${v.vix.date} · Cboe`:'Cboe 日线')}
      ${card('cpi','CPI 同比', v.cpi?v.cpi.yoy.toFixed(1)+'%':'3.0%', v.cpi?`${v.cpi.period} · BLS`:'BLS 月度')}
      ${card('debt','联邦债务', v.debt?(v.debt.total/1e12).toFixed(2)+'万亿':'38.2万亿', v.debt?`美元 · ${v.debt.date}`:'美元 · 财政部日度')}
    </div></div>`;
}
function sourcesTable(){
  return `<section class="sec"><div class="sec-head"><h2 class="h2">数据源连接状态</h2></div>
    ${SOURCES.map(s=>{ const st=LIVEDATA.status[s.id]; return `<div class="list-item"><div class="grow"><div style="font-size:14px;font-weight:700">${s.name}</div><div class="xs muted">${s.org}</div></div><span class="tag ${st?(st.ok?'good':'warn'):'gray'}">${st?(st.ok?'已连接':'未连接'):'检测中'}</span></div>`; }).join('')}
    <p class="xs muted">页面会在浏览器里直接请求以上公开接口。请求失败时（例如网络限制或接口不允许跨域），自动回退为示例数据。指数价格、期权持仓等需要交易所授权的数据，正式版通过后端接入持牌数据商。</p></section>`;
}
