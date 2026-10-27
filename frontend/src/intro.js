// ---------- Opening animation: a small exhibition of ideas behind the market ----------
// One ink colour, one element at the visual centre at a time: Bayes and his theorem, Nash and his equilibrium,
// then the option gamma curve, which squeezes into a line and releases the wordmark.
// Bayes's only known portrait is of doubtful attribution, so both drawings are interpretive line studies.
function introArt(){
  // d: delay in seconds; every stroke is drawn via stroke-dashoffset on a unit pathLength.
  const P=(d, delay, extra='')=>`<path d="${d}" pathLength="1" class="ln" style="--d:${delay}s" ${extra}/>`;
  const T=(x, y, s, delay, txt, cls='', anchor='start')=>`<text x="${x}" y="${y}" font-size="${s}" text-anchor="${anchor}" class="tx ${cls}" style="--d:${delay}s">${txt}</text>`;
  const bayes = [
    // profile facing right
    'M70 28 C76 36 79 46 79 56 C80 60 82 63 84 66 L92 78 C90 81 86 82 84 83 C86 86 86 88 84 90 C86 92 86 95 83 97 C83 102 80 106 74 109 C70 111 68 114 68 124',
    'M72 60 q4 -2 7 0', 'M76 52 q3 -2 6 0', 'M53 70 C46 66 44 79 51 85', 'M50 74 c2 2 2 6 0 7',
    'M87 80 q-3 1 -4 -1', 'M75 72 c2 8 0 16 -6 22', 'M68 108 c-8 2 -16 -2 -22 -10', 'M70 28 c-6 5 -12 5 -17 2',
    // wig with curls
    'M70 28 C60 13 34 15 29 36 C21 45 27 54 22 63 C15 72 25 81 20 90 C15 100 27 107 24 117 C22 125 30 130 38 127',
    'M31 48 c-7 2 -7 11 0 11 c6 0 6 -8 0 -8', 'M26 74 c-7 2 -7 11 0 11 c6 0 6 -8 0 -8', 'M27 99 c-7 2 -7 11 0 11 c6 0 6 -8 0 -8', 'M42 30 c-6 3 -4 11 2 10', 'M38 62 c-6 2 -6 10 0 10 c5 0 5 -7 0 -7', 'M36 88 c-6 2 -6 10 0 10 c5 0 5 -7 0 -7', 'M56 22 c-6 2 -6 9 0 9',
    // coat and preaching bands
    'M14 160 C18 140 30 130 44 130 C52 131 60 130 68 124', 'M68 124 C78 132 94 138 106 160',
    'M64 127 L61 147 L67 147 L68 127', 'M70 127 L70 147 L76 147 L72 127',
  ];
  const nash = [
    // profile facing left
    'M50 30 C44 38 41 47 41 57 C40 61 38 64 36 67 L28 79 C30 82 34 83 36 84 C34 87 34 89 36 91 C34 93 34 96 37 98 C37 103 40 107 46 110 C50 112 52 115 52 125',
    'M48 61 q-4 -2 -7 0', 'M45 53 q-3 -2 -7 1', 'M67 71 C74 67 76 80 69 86', 'M70 75 c-2 2 -2 6 0 7',
    'M33 81 q3 1 4 -1', 'M52 109 c8 2 16 -2 22 -10',
    // short side-parted hair, back of head
    'M50 30 C57 17 86 15 95 33 C101 46 99 61 93 72 C89 80 86 92 82 104 C80 112 78 118 76 125',
    'M56 27 C64 23 76 22 86 27', 'M62 24 C70 20 82 20 90 26', 'M52 33 c6 -6 14 -9 24 -9',
    'M91 40 c2 5 2 10 1 14', 'M86 36 c2 4 3 8 2 12',
    // collar, tie, lapels
    'M52 125 L58 137 L65 127', 'M58 137 L55 157 L58 161 L61 157 Z', 'M14 161 C20 142 36 131 52 125', 'M65 127 C80 131 96 141 106 161',
  ];
  // Three quiet scenes at the visual centre, one at a time, then the gamma curve squeezes into the wordmark.
  const scene=(out, body)=>`<g class="sc" style="--out:${out}s">${body}</g>`;
  const label=(delay, name, years)=>T(120,200,10,delay,name,'name','middle')+T(120,216,8.5,delay+0.1,years,'lab','middle');
  const s1 = scene(1.7, `<g transform="translate(60 14)" class="sk">${bayes.map((d,i)=>P(d, 0.1+i*0.02)).join('')}</g>`
    + label(0.5,'THOMAS BAYES','1701 — 1761') + T(120,252,14,0.65,'P(A | B) = P(B | A) P(A) / P(B)','f','middle'));
  const s2 = scene(3.5, `<g transform="translate(60 14)" class="sk">${nash.map((d,i)=>P(d, 1.9+i*0.02)).join('')}</g>`
    + label(2.3,'JOHN F. NASH JR.','1928 — 2015') + T(120,252,14,2.45,'uᵢ(sᵢ*, s₋ᵢ*) ≥ uᵢ(sᵢ, s₋ᵢ*)','f','middle'));
  const s3 = `<g class="sc3">`
    + `<g class="sk sq">${P('M30 150 H210',3.7)}${P('M32 148 C70 146 92 62 120 58 C148 62 170 146 208 148',3.8)}${P('M120 58 V150',4.3,'class="ln dash"')}</g>`
    + `<g class="sc" style="--out:4.8s">${T(120,180,9,4.3,'K','f','middle')}${label(4.0,'PRICE · RISK · HEDGING','')}${T(120,252,14,4.1,'Γ = ∂²V / ∂S²','f','middle')}</g></g>`;
  return `<svg class="in-art" viewBox="0 0 240 270" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <defs><filter id="in-sketch"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="2"/></filter></defs>${s1}${s2}${s3}</svg>`;
}
function introPlay(){
  // Plays on every app open (Ed: a sense of ceremony); tap anywhere to skip. Tests set gs_nointro to bypass.
  let off=false; try{ off=sessionStorage.getItem('gs_nointro')==='1'; }catch(e){}
  if(off || /admin/.test(location.hash)) return;
  const el=document.createElement('div'); el.id='intro'; el.setAttribute('aria-hidden','true');
  el.innerHTML=`${introArt()}<div class="in-mark"><div class="in-word"><span class="brand">Gamma Squeeze</span></div><i class="in-rule"></i>
    <div class="in-sub latin">Independent Macro &amp; Derivatives Research</div></div><div class="in-skip">轻触跳过</div>`;
  document.body.appendChild(el); document.documentElement.classList.add('intro-on');
  const done=()=>{ if(el.classList.contains('out')) return; el.classList.add('out'); document.documentElement.classList.remove('intro-on'); setTimeout(()=>el.remove(), 700); };
  el.addEventListener('click', done);
  setTimeout(done, REDUCED ? 1200 : 6900);
}
introPlay();
