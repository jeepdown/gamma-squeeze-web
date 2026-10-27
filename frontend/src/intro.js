// ---------- Opening animation: Gamma, then Squeeze ----------
// One ink colour at the visual centre: the option gamma curve draws itself, squeezes into a line
// and releases the wordmark, then the app opens.
function introArt(){
  // d: delay in seconds; every stroke is drawn via stroke-dashoffset on a unit pathLength.
  const P=(d, delay, extra='')=>`<path d="${d}" pathLength="1" class="ln" style="--d:${delay}s" ${extra}/>`;
  const T=(x, y, s, delay, txt, cls='', anchor='start')=>`<text x="${x}" y="${y}" font-size="${s}" text-anchor="${anchor}" class="tx ${cls}" style="--d:${delay}s">${txt}</text>`;
  const s3 = `<g class="sc3">`
    + `<g class="sk sq">${P('M30 150 H210',0.15)}${P('M32 148 C70 146 92 62 120 58 C148 62 170 146 208 148',0.35)}${P('M120 58 V150',1.25,'class="ln dash"')}</g>`
    + `<g class="sc" style="--out:2.5s">${T(120,200,10,0.8,'PRICE · RISK · HEDGING','name','middle')}</g></g>`;
  return `<svg class="in-art" viewBox="0 0 240 270" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <defs><filter id="in-sketch"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="2"/></filter></defs>${s3}</svg>`;
}
function introPlay(){
  // Plays on every app open (Ed: a sense of ceremony); tap anywhere to skip. Tests set gs_nointro to bypass.
  let off=false; try{ off=sessionStorage.getItem('gs_nointro')==='1'; }catch(e){}
  if(off || /admin/.test(location.hash)) return;
  const el=document.createElement('div'); el.id='intro'; el.setAttribute('aria-hidden','true');
  el.innerHTML=`${introArt()}<div class="in-mark"><div class="in-word"><span class="brand">Gamma Squeeze</span></div><i class="in-rule"></i></div><div class="in-skip">轻触跳过</div>`;
  document.body.appendChild(el); document.documentElement.classList.add('intro-on');
  const done=()=>{ if(el.classList.contains('out')) return; el.classList.add('out'); document.documentElement.classList.remove('intro-on'); setTimeout(()=>el.remove(), 900); };
  el.addEventListener('click', done);
  setTimeout(done, REDUCED ? 1000 : 5200);
}
introPlay();
