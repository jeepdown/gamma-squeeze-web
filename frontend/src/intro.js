// ---------- Opening animation: a small exhibition of ideas behind the market ----------
// One ink colour on paper. Line studies of Bayes and Nash draw themselves, the formulas are written in,
// then supply and demand, a 2×2 game and the option gamma curve; the wall recedes into the wordmark.
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
  const g = [P('M6 6 H354 V646 H6 Z', 0, 'class="ln hair frame"')];
  // Bayes line study and label
  g.push(`<g transform="translate(14 26)" class="sk">${bayes.map((d,i)=>P(d, 0.15+i*0.07)).join('')}</g>`);
  g.push(T(20,214,8,1.05,'No. 1','lab'), T(20,228,11,1.1,'THOMAS BAYES','name'), T(20,242,9,1.15,'1701 — 1761','lab'));
  g.push(P('M20 250 L120 250', 1.2, 'class="ln hair"'));
  // Bayes' theorem, written in
  g.push(T(150,104,17,0.9,'P(A | B) =','f'), T(296,92,15,1.05,'P(B | A) P(A)','f','middle'), P('M246 99 L346 99',1.2), T(296,119,15,1.3,'P(B)','f','middle'));
  g.push(T(150,138,9,1.5,'posterior ∝ likelihood × prior','cap'));
  // Nash line study and label
  g.push(`<g transform="translate(226 238)" class="sk">${nash.map((d,i)=>P(d, 1.25+i*0.07)).join('')}</g>`);
  g.push(T(342,426,8,2.05,'No. 2','lab','end'), T(342,440,11,2.1,'JOHN F. NASH JR.','name','end'), T(342,454,9,2.15,'1928 — 2015','lab','end'));
  g.push(P('M242 462 L342 462', 2.2, 'class="ln hair"'));
  // 2×2 game with the equilibrium circled
  const gx=44, gy=270, cw=66, ch=42;
  g.push(`<g class="sk">${P(`M${gx} ${gy} H${gx+2*cw} V${gy+2*ch} H${gx} Z M${gx+cw} ${gy} V${gy+2*ch} M${gx} ${gy+ch} H${gx+2*cw}`,1.6)}</g>`);
  g.push(T(gx+cw/2,gy-8,10,1.7,'C','f','middle'), T(gx+1.5*cw,gy-8,10,1.7,'D','f','middle'), T(gx-10,gy+ch/2+4,10,1.7,'C','f','middle'), T(gx-10,gy+1.5*ch+4,10,1.7,'D','f','middle'));
  [['3, 3',0,0],['0, 5',1,0],['5, 0',0,1],['1, 1',1,1]].forEach(([t,c,r],i)=>g.push(T(gx+cw*(c+0.5),gy+ch*(r+0.5)+5,14,1.8+i*0.1,t,'f','middle')));
  g.push(`<g class="sk">${P(`M${gx+cw+12} ${gy+1.5*ch-2} C${gx+cw+16} ${gy+ch+6} ${gx+2*cw-8} ${gy+ch+4} ${gx+2*cw-6} ${gy+1.5*ch} C${gx+2*cw-4} ${gy+2*ch-6} ${gx+cw+14} ${gy+2*ch-4} ${gx+cw+10} ${gy+1.5*ch+2}`,2.3,'class="ln mark"')}</g>`);
  g.push(T(gx,gy+2*ch+22,10,2.45,'uᵢ(sᵢ*, s₋ᵢ*) ≥ uᵢ(sᵢ, s₋ᵢ*)','f'));
  // Market mechanism: supply and demand, the gamma of an option, Black–Scholes
  g.push(T(20,486,8,2.5,'No. 3','lab'), T(20,500,11,2.55,'PRICE · RISK · HEDGING','name'));
  g.push(`<g class="sk">${P('M24 516 V604 H160',2.6)}${P('M34 524 C70 556 110 584 154 598',2.75)}${P('M34 600 C70 584 110 556 154 524',2.85)}${P('M94 562 H24 M94 562 V604',3.0,'class="ln dash"')}<circle cx="94" cy="562" r="2.6" class="dot" style="--d:3.1s"/></g>`);
  g.push(T(158,520,10,2.95,'S','f'), T(158,600,10,2.95,'D','f'), T(12,566,9,3.1,'P*','f'), T(154,616,9,3.1,'Q','f'));
  g.push(`<g class="sk">${P('M196 604 H344',2.7)}${P('M198 602 C230 600 246 528 270 524 C294 528 310 600 342 602',2.9)}${P('M270 524 V604',3.1,'class="ln dash"')}</g>`);
  g.push(T(270,616,9,3.15,'K','f','middle'), T(270,512,15,3.2,'Γ = ∂²V / ∂S²','f','middle'));
  g.push(T(180,640,10,3.4,'∂V/∂t + ½σ²S² ∂²V/∂S² + rS ∂V/∂S − rV = 0','f','middle'));
  return `<svg class="in-art" viewBox="0 0 360 652" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <defs><filter id="in-sketch"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="2.2"/></filter></defs>${g.join('')}</svg>`;
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
  setTimeout(done, REDUCED ? 1200 : 6200);
}
introPlay();
