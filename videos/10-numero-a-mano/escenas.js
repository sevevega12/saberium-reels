// =====================================================================
//  10 · Número a mano
//  Mundo: parada de autobús una mañana de lluvia (08:12), marquesina con gotas,
//  luz gris azulada. Pieza protagonista: monigote de línea blanca y el número
//  escrito a boli en la palma (Piezas.Manuscrito).
//  La web «mala» es genérica e inventada; el chat es neutro y dibujado en código
//  (nunca la interfaz ni el logo de WhatsApp). El remate es la web real de
//  The Barber Kingdom, que tiene su botón de WhatsApp a la vista.
// =====================================================================

const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };

// ---------- anchors ----------
const A = {
  out1: W(1, 'acabó').start,             // pull back from the palm to the bus stop
  zoomPh: L(2).start - 0.2,                          // into the phone
  primera: W(2, 'primera').start,
  estaba: W(2, 'estaba').start,
  tap1: W(2, 'imagen').start + 0.1, tap2: W(2, 'puede').start,
  pulsar: W(2, 'pulsar').start,
  apunto: L(3).start - 0.25,
  cifra: W(3, 'apuntó').start,
  equivoco: W(3, 'equivocó').start,
  una: W(3, 'una').start,
  mensaje: W(3, 'mensaje').start - 0.15,
  nunca: W(3, 'nunca').start,
  llego: W(3, 'llegó').end,
  sol: L(4).start - 0.55,
  boton: W(4, 'botón').start,
  vista: W(4, 'vista').start,
  abre: W(4, 'abre').start,
  saludo: W(4, 'saludo').start,
  escrito: W(4, 'escrito').end,
  cliente: W(4, 'cliente').start,
  enviar: W(4, 'enviar').start,
  cta: CTA.start,
};
Object.entries(A).forEach(([k, v]) => Reel.anchor(k, v));

// writing schedule in the palm (scene 4): one digit per beat, "cifra a cifra"
const NUM = '612 34 56 78', WRONG = 6;              // digit 6 (the second 6) ends up as an 8
const WT = []; for (let i = 0; i < 9; i++) WT.push(A.cifra + 0.05 + i * 0.16);

// ---------- music and sound marks ----------
Reel.section(0, A.zoomPh, 'tension');
Reel.section(A.zoomPh, A.sol, 'pulso');
Reel.section(A.sol, CTA.end + 0.35, 'claro');
Reel.hit(A.out1, 'whoosh_rev');
Reel.hit(A.zoomPh + 0.1, 'whoosh');
Reel.hit(A.estaba, 'thud', 0.7);
Reel.hit(A.tap1 + 0.05, 'click'); Reel.hit(A.tap2 + 0.05, 'click'); Reel.hit(A.pulsar + 0.1, 'knock');
Reel.hit(A.apunto, 'whoosh');
WT.forEach(t => Reel.hit(t + 0.1, 'tick', 0.6));
Reel.hit(A.una, 'pluck');
Reel.hit(A.mensaje + 0.2, 'whoosh');
Reel.hit(A.sol, 'whoosh_rev');
Reel.hit(A.boton, 'hit');
Reel.hit(A.abre + 0.05, 'click');
Reel.hit(A.enviar + 0.05, 'pluck');
Reel.hit(A.cta - 0.3, 'rise');

// ---------- camera over the bus stop (world coordinates, wide shot = scale 1) ----------
const PALM = { x: 668, y: 984 }, PHONE = { x: 768, y: 1112 };
function camAt(t) {
  // returns {s, tx, ty, blur}
  const c = (F, P, s) => ({ s, tx: P.x - F.x * s, ty: P.y - F.y * s });
  const lerpCam = (a, b, k) => ({ s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), k)), tx: lerp(a.tx, b.tx, k), ty: lerp(a.ty, b.ty, k) });
  const closePalm = c(PALM, { x: 560, y: 800 }, 3.4);
  const wide = c(PALM, PALM, 1);
  const wide2 = c({ x: 620, y: 1000 }, { x: 560, y: 930 }, 1.3);
  const closePh = c(PHONE, { x: 540, y: 842 }, 4.2);
  let r, blur;
  if (t < A.out1) { r = closePalm; blur = 7; }
  else if (t < A.out1 + 0.85) { const k = E.io(seg(t, A.out1, A.out1 + 0.85)); r = lerpCam(closePalm, wide, k); blur = 7 * (1 - k); }
  else if (t < A.zoomPh) { r = lerpCam(wide, wide2, E.io2(seg(t, A.out1 + 0.85, A.zoomPh))); blur = 0; }
  else { const k = E.io(seg(t, A.zoomPh, A.zoomPh + 0.75)); r = lerpCam(wide2, closePh, k); blur = 8 * k; }
  r.blur = blur; return r;
}
const camMap = (cam, p) => ({ x: p.x * cam.s + cam.tx, y: p.y * cam.s + cam.ty });

// ---------- the world: rainy street, bus shelter, bench, the line figure ----------
let world, worldInner, figSvg, fig = {}, led, ledMin, glassDrops = [];
Reel.scene({
  name: 'parada', z: 1,
  build(root) {
    world = el('div', 'world', root);
    const r = rng(10);
    el('div', 'sky', world);
    const city = el('div', 'city', world);
    [[0, 560, 210, 640], [190, 470, 170, 730], [350, 610, 240, 590], [580, 520, 180, 680], [750, 590, 150, 610], [880, 500, 260, 700]].forEach(([x, y, w, h]) => {
      const b = el('div', 'bld', city); css(b, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });
      for (let i = 0; i < 9; i++) { if (r() < .45) continue; const wi = el('i', '', b); css(wi, { left: 14 + r() * (w - 40) + 'px', top: 20 + r() * (h - 200) + 'px', opacity: .25 + r() * .5 }); }
    });
    const bk = el('div', 'streetbokeh', world);
    for (let i = 0; i < 22; i++) { const d = el('i', '', bk); const s = 40 + r() * 110;
      css(d, { left: r() * 1080 + 'px', top: 640 + r() * 520 + 'px', width: s + 'px', height: s + 'px',
        background: `radial-gradient(circle,rgba(${r() < .45 ? '255,196,130' : '170,200,255'},${.16 + r() * .22}),transparent 70%)` }); }
    el('div', 'road', world); el('div', 'wet', world);
    // shelter
    el('div', 'glassback', world);
    const gd = el('div', 'drops', world);
    for (let i = 0; i < 70; i++) { const d = el('i', '', gd); const s = 5 + r() * 13;
      css(d, { left: r() * 790 + 'px', top: r() * 770 + 'px', width: s + 'px', height: s * (1 + r() * .5) + 'px' });
      glassDrops.push({ d, y0: r() * 770, sp: r() < .2 ? 20 + r() * 50 : 0 }); }
    el('div', 'post p1', world); el('div', 'post p2', world);
    el('div', 'roof', world); el('div', 'roofLight', world);
    led = el('div', 'led', world);
    el('div', 'ln1 txt', led, '<b>27</b> CENTRO');
    ledMin = el('div', 'ln2 txt', led, '4 min');
    el('div', 'clock txt', led, '08:12');
    // bench, back bar first (behind the figure)
    el('div', 'benchBack', world); el('div', 'benchLeg l1', world); el('div', 'benchLeg l2', world);
    // phone lying on the bench, screen up, glowing
    const ph = el('div', 'benchPhone', world); el('i', '', ph);
    el('div', 'phoneGlow', world);
    // the figure, white line (SVG in world coordinates)
    figSvg = svgEl('svg', { width: 1080, height: 1920, viewBox: '0 0 1080 1920', class: 'fig' }, world);
    const st = { fill: 'none', stroke: '#F4F7FF', 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
    fig.head = svgEl('circle', Object.assign({ cx: 548, cy: 836, r: 31 }, st), figSvg);
    fig.body = svgEl('path', st, figSvg);
    fig.legs = svgEl('path', st, figSvg);
    fig.armFar = svgEl('path', st, figSvg);
    fig.palm = svgEl('path', Object.assign({}, st, { 'stroke-width': 6 }), figSvg);
    fig.armNear = svgEl('path', st, figSvg);
    fig.pen = svgEl('path', Object.assign({}, st, { 'stroke-width': 5, stroke: '#9CC8FF' }), figSvg);
    el('div', 'benchSeat', world);
  },
  update(t) {
    const c = camAt(t);
    world.style.transform = `translate(${c.tx}px,${c.ty}px) scale(${c.s})`;
    world.style.filter = c.blur > 0.2 ? `blur(${c.blur.toFixed(1)}px) brightness(${1 - c.blur * 0.035})` : '';
    led.style.opacity = c.s < 1.32 && t > A.out1 + 0.75 ? 1 : 0;
    figSvg.style.opacity = 1 - seg(c.s, 1.6, 2.6);
    ledMin.textContent = t < 8 ? '4 min' : '3 min';
    glassDrops.forEach(g => { if (g.sp) g.d.style.top = ((g.y0 + t * g.sp) % 770) + 'px'; });
    // pose: head bent to the hand, near arm writes (small loops)
    const w = Math.sin(t * 9) * 5, w2 = Math.cos(t * 7) * 3;
    fig.body.setAttribute('d', 'M552 868 C556 930 566 1010 582 1104 M552 874 L552 868');
    fig.legs.setAttribute('d', 'M582 1104 L692 1110 L704 1288 L738 1290 M582 1104 L676 1118 L684 1290 L716 1292');
    fig.armFar.setAttribute('d', 'M556 902 L598 1008 L652 992');
    fig.palm.setAttribute('d', 'M650 992 C662 972 690 970 694 984 C696 996 676 1004 652 1000 M664 975 L668 958 M676 973 L682 956 M687 976 L695 962');
    const hx = 660 + w, hy = 968 + w2;
    fig.armNear.setAttribute('d', `M560 906 L612 1030 L${hx} ${hy}`);
    fig.pen.setAttribute('d', `M${hx - 4} ${hy + 4} L${hx + 34} ${hy - 44}`);
  }
});

// ---------- the palm, close up (white line hand, number in light blue ballpoint) ----------
let palmL, palmSvg, hand, pen, penG, drop, splash, ringPalm, chip;
Reel.scene({
  name: 'palma', z: 30,
  build(root) {
    palmL = el('div', 'palmL', root);
    palmSvg = svgEl('svg', { width: 760, height: 900, viewBox: '0 0 760 900' }, palmL);
    const defs = svgEl('defs', {}, palmSvg);
    defs.innerHTML = '<linearGradient id="skin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#26355f"/><stop offset="1" stop-color="#121a3a"/></linearGradient>' +
      '<linearGradient id="wristFade" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      '<mask id="wm"><rect x="0" y="0" width="760" height="900" fill="url(#wristFade)"/></mask>';
    const shapes = g => {
      svgEl('rect', { x: 268, y: 640, width: 240, height: 300, rx: 40 }, g);          // wrist
      svgEl('rect', { x: 205, y: 370, width: 365, height: 400, rx: 130 }, g);          // palm
      svgEl('rect', { x: 212, y: 150, width: 80, height: 330, rx: 40 }, g);            // index
      svgEl('rect', { x: 298, y: 96, width: 82, height: 380, rx: 41 }, g);             // middle
      svgEl('rect', { x: 386, y: 122, width: 80, height: 356, rx: 40 }, g);            // ring
      svgEl('rect', { x: 472, y: 200, width: 72, height: 300, rx: 36 }, g);            // little
      svgEl('rect', { x: 130, y: 420, width: 92, height: 270, rx: 46, transform: 'rotate(-38 176 600)' }, g); // thumb
    };
    hand = svgEl('g', { mask: 'url(#wm)' }, palmSvg);
    const out = svgEl('g', { fill: 'none', stroke: '#F4F7FF', 'stroke-width': 10 }, hand); shapes(out);
    const fill = svgEl('g', { fill: 'url(#skin)' }, hand); shapes(fill);
    const cr = svgEl('g', { fill: 'none', stroke: 'rgba(244,247,255,.32)', 'stroke-width': 4, 'stroke-linecap': 'round' }, hand);
    ['M236 540 C300 520 380 500 470 470', 'M250 600 C330 600 420 590 545 560', 'M300 470 C300 560 330 650 380 740',
     'M253 300 L285 300', 'M340 260 L372 260', 'M425 280 L458 280', 'M505 340 L535 340'].forEach(d => svgEl('path', { d }, cr));
    // the number: two rows, slightly rotated, like a hurried note
    penG = svgEl('g', { transform: 'rotate(-7 385 520)' }, palmSvg);
    this.m1 = Piezas.Manuscrito(penG, { text: '612 34', x: 238, y: 432, size: 0.78, adv: 52, gap: 20, seed: 4, width: 7.5 });
    this.m2 = Piezas.Manuscrito(penG, { text: '56 78', x: 268, y: 562, size: 0.78, adv: 52, gap: 20, seed: 9, width: 7.5 });
    this.dg = this.m1.digits.concat(this.m2.digits).map((d, i) => ({ d, m: i < 5 ? this.m1 : this.m2, j: i < 5 ? i : i - 5 }));
    // the wrong digit is written twice: as a 6 that the rain smudges, and the 8 that stays
    this.alt = Piezas.Manuscrito(penG, { text: '8', x: this.dg[WRONG].d.x, y: 562, size: 0.78, seed: 21, width: 7.5 });
    ringPalm = svgEl('circle', { cx: 0, cy: 0, r: 44, fill: 'none', stroke: '#9CC8FF', 'stroke-width': 4, opacity: 0 }, penG);
    // ballpoint pen in line art, light blue tip
    pen = svgEl('g', {}, palmSvg);
    pen.innerHTML = '<path d="M0 0 L-14 -40 L-14 -330 C-14 -344 14 -344 14 -330 L14 -40 Z" fill="#141c3c" stroke="#F4F7FF" stroke-width="6" stroke-linejoin="round"/>' +
      '<path d="M-14 -40 L14 -40" stroke="#F4F7FF" stroke-width="5"/><path d="M14 -300 L26 -300 L26 -180" fill="none" stroke="#F4F7FF" stroke-width="5" stroke-linecap="round"/>' +
      '<circle cx="0" cy="-2" r="5" fill="#9CC8FF"/>';
    drop = el('div', 'raindrop', palmL); splash = el('div', 'splash', palmL);
    chip = el('div', 'errchip glass txt', root, '<em>56</em> en tu web · <em class="b">58</em> en su mano');
  },
  update(t) {
    const dg = this.dg;
    // phases
    const s1Out = seg(t, A.out1, A.out1 + 0.85);
    const s4In = E.expo(seg(t, A.apunto, A.apunto + 0.6));
    const s4Out = E.in2(seg(t, A.sol - 0.1, A.sol + 0.45));
    let vis, X, Y, S, R;
    if (t < A.out1 + 0.9) {
      // close-up that shrinks into the figure's hand while the camera pulls back
      const c = camAt(t), p = camMap(c, PALM);
      const k = E.io(s1Out);
      X = lerp(560, p.x, k); Y = lerp(800, p.y, k); S = lerp(1.18, 0.16, k) * (1 + 0.02 * Math.sin(t * 1.3)); R = lerp(-4, 0, k);
      vis = 1 - seg(s1Out, 0.45, 0.85);
    } else {
      X = 640 + (1 - s4In) * 120; Y = 905 + (1 - s4In) * 700 + s4Out * 500; S = 0.86 - s4Out * 0.1; R = -3 + Math.sin(t * .9) * 1.2;
      vis = (t > A.apunto ? s4In : 0) * (1 - s4Out);
    }
    palmL.style.opacity = vis;
    palmL.style.transform = `translate(${X - 380}px,${Y - 450}px) scale(${S}) rotate(${R}deg)`;
    // ink: scene 1 shows the finished (wrong) note being written; scene 4 writes it again
    let penAt = null;
    const firstPass = t < A.apunto;
    dg.forEach((q, i) => {
      let k;
      if (firstPass) { const t0 = -1.7 + i * 0.36; k = seg(t, t0, t0 + 0.3); if (k > 0 && k < 1) penAt = q.m.pen(q.j, k); }
      else { k = seg(t, WT[i], WT[i] + 0.15); if (k > 0 && k < 1) penAt = q.m.pen(q.j, k); }
      q.m.draw(q.j, k);
      if (i === WRONG) {
        // first pass: the 8 directly. second pass: a 6 that a raindrop turns into an 8
        const sm = seg(t, A.una, A.una + 0.45);
        const six = firstPass ? 0 : 1 - sm;
        q.d.path.style.opacity = six;
        q.d.path.style.filter = !firstPass && sm > 0 ? `blur(${(sm * 5).toFixed(1)}px)` : '';
        this.alt.draw(0, firstPass ? k : seg(t, A.una + 0.15, A.una + 0.5));
      }
    });
    if (penAt == null) {   // rest the pen beside the last digit
      const last = firstPass ? dg[Math.min(8, Math.floor(clamp((t + 1.7) / 0.36, 0, 8)))] : dg[8];
      penAt = last.m.pen(last.j, 1);
    }
    const lift = firstPass ? 0 : seg(t, WT[8] + 0.3, WT[8] + 0.7);
    const a = -7 * Math.PI / 180, cx = 385, cy = 520;
    const px = cx + (penAt.x - cx) * Math.cos(a) - (penAt.y - cy) * Math.sin(a);
    const py = cy + (penAt.x - cx) * Math.sin(a) + (penAt.y - cy) * Math.cos(a);
    pen.setAttribute('transform', `translate(${px + lift * 160},${py - lift * 260}) rotate(${28 + lift * 10})`);
    pen.style.opacity = 1 - lift;
    // the raindrop: falls onto the 6 and smudges it
    const w = dg[WRONG].d; const wx = w.x + 24, wy = 562 + 34;
    const wxr = cx + (wx - cx) * Math.cos(a) - (wy - cy) * Math.sin(a), wyr = cy + (wx - cx) * Math.sin(a) + (wy - cy) * Math.cos(a);
    const fk = seg(t, A.una - 0.45, A.una);
    drop.style.opacity = !firstPass && fk > 0 && fk < 1 ? 1 : 0;
    drop.style.left = wxr - 9 + 'px'; drop.style.top = lerp(-200, wyr - 28, E.in2(fk)) + 'px';
    const sk = seg(t, A.una, A.una + 0.5);
    splash.style.opacity = !firstPass && sk > 0 && sk < 1 ? (1 - sk) : 0;
    splash.style.left = wxr - 60 + 'px'; splash.style.top = wyr - 60 + 'px'; splash.style.transform = `scale(${0.3 + sk * 1.2})`;
    // the mistake, shown: ring on the 8 and a chip that compares
    const rk = inout(t, A.una + 0.45, A.mensaje, 0.3, 0.3);
    ringPalm.setAttribute('cx', wx); ringPalm.setAttribute('cy', wy); ringPalm.setAttribute('opacity', rk);
    ringPalm.setAttribute('r', 44 + 6 * Math.sin(t * 6));
    const ck = inout(t, A.una + 0.55, A.nunca, 0.35, 0.35);
    chip.style.opacity = ck; chip.style.transform = `translateY(${(1 - ck) * 24}px)`;
  }
});

// ---------- the phone, close up: generic old web, the number inside an image ----------
let phone, web, banner, bDigits = [], boxImg, labImg, real, sheet, field, fieldTx, sendB, sentB, ticks, wbtnRing, labBtn, lab2, status;
const PH = { cx: 540, cy: 842.5 };
Reel.scene({
  name: 'movil', z: 25,
  build(root) {
    phone = Piezas.Movil(root, { x: 270, y: 280, w: 540 });
    const sc = phone.screen;
    web = el('div', 'oldweb', sc);
    web.innerHTML =
      '<div class="ow-bar"><span>PELUQUERÍA</span><i></i></div>' +
      '<div class="ow-hero"><div class="ow-ht">Bienvenidos</div><div class="ow-hs">a nuestra peluquería</div></div>' +
      '<div class="ow-p"><i style="width:440px"></i><i style="width:400px;top:34px"></i><i style="width:450px;top:68px"></i><i style="width:300px;top:102px"></i></div>' +
      '<div class="ow-h2">Nuestros servicios</div>' +
      '<div class="ow-row" style="top:760px">Corte de pelo<i></i></div><div class="ow-row" style="top:830px">Color y mechas<i></i></div><div class="ow-row" style="top:900px">Peinados<i></i></div>' +
      '<div class="ow-gal"><i></i><i></i><i></i><i></i></div>' +
      '<div class="ow-map">Dónde estamos</div>' +
      '<div class="ow-foot">© 2017 · Todos los derechos reservados</div>';
    banner = el('div', 'ow-banner', web);
    el('div', 'bn-t', banner, 'PIDE TU CITA');
    el('div', 'bn-ic', banner, '<svg width="54" height="54" viewBox="0 0 24 24"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z" fill="#fff8e8"/></svg>');
    const num = el('div', 'bn-n', banner);
    [...NUM].forEach(ch => { const s = el('em', ch === ' ' ? 'sp' : '', num, ch === ' ' ? '&nbsp;' : ch); if (ch !== ' ') bDigits.push(s); });
    boxImg = el('div', 'imgbox', banner); el('div', 'imgname', boxImg, 'cita.jpg');
    // the real site (desktop capture cropped to the phone): the WhatsApp button is in sight
    real = el('div', 'realweb', sc);
    status = el('div', 'statusbar', sc, '08:14');
    const img = el('img', '', real); img.src = ASSET('webs/escritorio/the-barber-kingdom.jpg');
    wbtnRing = el('div', 'wring', real);
    // the chat: neutral, drawn in code
    sheet = el('div', 'sheet', sc);
    const hd = el('div', 'sh-hd', sheet); el('i', 'av', hd); el('div', 'sh-t', hd, 'Nueva conversación'); el('div', 'sh-s', hd, 'por WhatsApp · desde la web');
    sentB = el('div', 'sent', sheet, 'Hola, quería pedir cita.'); ticks = el('div', 'ticks', sentB, '<svg width="40" height="22" viewBox="0 0 40 22"><path d="M2 12 L8 18 L20 4 M16 16 L18 18 L30 4" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>');
    field = el('div', 'field', sheet); fieldTx = el('div', 'ftx2', field); el('i', 'caret2', field);
    sendB = el('div', 'sendb', sheet, '<svg width="40" height="40" viewBox="0 0 24 24"><path d="M3 20.5 21 12 3 3.5 3 10l12 2-12 2z" fill="#fff"/></svg>');
    // labels outside the phone (inside the safe area)
    labImg = el('div', 'tag glass txt', root, '<i></i>ES UNA IMAGEN · NO SE PUEDE PULSAR');
    labBtn = el('div', 'tag glass txt', root, '<i></i>BOTÓN A LA VISTA · UN TOQUE');
    lab2 = el('div', 'tag glass txt', root, '<i></i>SALUDO YA ESCRITO');
  },
  update(t) {
    // where the phone is: grows out of the bench, then small in the corner, then back
    const c = camAt(t), p0 = camMap(c, PHONE);
    const kin = E.expo(seg(t, A.zoomPh + 0.05, A.zoomPh + 0.75));
    const kSmall = E.io(seg(t, A.apunto, A.apunto + 0.6));
    const kBack = E.io(seg(t, A.sol - 0.2, A.sol + 0.5));
    const kOut = E.in2(seg(t, A.cta - 0.55, A.cta - 0.1));
    let sc = lerp(0.1, 1, kin), dx = lerp(p0.x - PH.cx, 0, kin), dy = lerp(p0.y - PH.cy, 0, kin), rot = lerp(-24, 0, kin);
    const sm = kSmall * (1 - kBack);
    sc = lerp(sc, 0.5, sm); dx = lerp(dx, 248 - PH.cx, sm); dy = lerp(dy, 720 - PH.cy, sm); rot += sm * -4;
    sc *= 1 + 0.015 * Math.sin(t * 1.1);
    phone.el.style.opacity = (t > A.zoomPh ? seg(kin, 0, 0.25) : 0) * (1 - kOut);
    phone.el.style.transform = `translate(${dx}px,${dy - kOut * 60}px) scale(${sc}) rotate(${rot}deg)`;
    this.T = { sc, dx, dy, rot };
    // the old web scrolls, searching (two swipes), and stops on the image
    const scr = mv(t, A.zoomPh + 0.5, 0.9, 0, 380, E.io) + mv(t, A.zoomPh + 1.5, 0.9, 0, 420, E.io);
    web.style.transform = `translateY(${-scr}px)`;
    const swap = E.io(seg(t, A.sol + 0.05, A.sol + 0.55));
    web.style.opacity = 1 - swap;
    real.style.opacity = swap; real.style.transform = `translateY(${(1 - swap) * 120}px)`;
    status.style.opacity = swap;
    // the image is marked as an image
    const bk = E.expo(seg(t, A.estaba, A.estaba + 0.4));
    const bOff = 1 - E.io(seg(t, A.apunto + 0.2, A.apunto + 0.6));
    boxImg.style.opacity = bk * bOff; boxImg.style.transform = `scale(${1.06 - 0.06 * bk})`;
    const shake = (t0) => t > t0 ? Math.sin((t - t0) * 40) * 7 * (1 - seg(t, t0, t0 + 0.35)) : 0;
    banner.style.transform = `translateX(${shake(A.tap1 + 0.05) + shake(A.tap2 + 0.05)}px)`;
    [labImg, labBtn].forEach(l => { l.style.left = (540 - l.offsetWidth / 2) + 'px'; l.style.top = '448px'; });
    lab2.style.left = '302px'; lab2.style.top = '1010px';
    const lk = inout(t, A.estaba + 0.15, A.apunto - 0.1, 0.35, 0.3);
    labImg.style.opacity = lk; labImg.style.transform = `translateY(${(1 - lk) * 20}px)`;
    // digits on the banner light up one by one while they are copied
    bDigits.forEach((s, i) => { const on = t > A.apunto && t < A.sol ? inout(t, WT[i] - 0.1, WT[i] + 0.25, 0.08, 0.25) : 0;
      s.style.textShadow = on > 0.01 ? `0 0 ${18 * on}px rgba(156,200,255,${on}), 0 0 2px #fff` : '';
      s.style.color = i === WRONG && t > A.una + 0.45 && t < A.mensaje + 0.3 ? '#cfe3ff' : ''; });
    // the solution: ring on the real WhatsApp button, tap, the chat opens with the greeting
    const zk = E.io(seg(t, A.boton - 0.2, A.boton + 0.6)) * (1 - E.io(seg(t, A.abre + 0.1, A.abre + 0.7)));
    const zimg = real.querySelector('img'); zimg.style.transform = `scale(${1 + 0.32 * zk})`;
    const wr = inout(t, A.boton - 0.1, A.abre + 0.3, 0.3, 0.3);
    wbtnRing.style.opacity = wr; wbtnRing.style.transform = `scale(${(1 + 0.32 * zk) * (1 + 0.06 * Math.sin(t * 7))})`;
    const bl = inout(t, A.boton + 0.1, A.abre - 0.1, 0.35, 0.3);
    labBtn.style.opacity = bl; labBtn.style.transform = `translateY(${(1 - bl) * 20}px)`;
    const shk = E.expo(seg(t, A.abre + 0.15, A.abre + 0.75));
    sheet.style.transform = `translateY(${(1 - shk) * 700}px)`; sheet.style.opacity = shk > 0.01 ? 1 : 0;
    const G = 'Hola, quería pedir cita.';
    const n = Math.round(G.length * seg(t, A.saludo - 0.1, A.escrito));
    const sent = t >= A.enviar + 0.12;
    fieldTx.textContent = sent ? '' : G.slice(0, n);
    field.querySelector('.caret2').style.opacity = sent || n === G.length ? (Math.floor(t * 2.4) % 2 ? 0 : 0.8) * (sent ? 0 : 1) : 1;
    field.querySelector('.caret2').style.left = 28 + fieldTx.offsetWidth + 4 + 'px';
    const l2 = inout(t, A.saludo, A.enviar - 0.1, 0.35, 0.3);
    lab2.style.opacity = l2; lab2.style.transform = `translateY(${(1 - l2) * 20}px)`;
    const pulse = t > A.cliente && t < A.enviar + 0.1 ? 0.5 + 0.5 * Math.sin((t - A.cliente) * 8) : 0;
    sendB.style.boxShadow = `0 0 0 ${4 + pulse * 10}px rgba(156,200,255,${0.25 + pulse * 0.45}), 0 10px 30px rgba(10,34,241,.6)`;
    sendB.style.transform = `scale(${t > A.enviar && t < A.enviar + 0.2 ? 0.9 : 1})`;
    const sk = E.expo(seg(t, A.enviar + 0.1, A.enviar + 0.55));
    sentB.style.opacity = sk; sentB.style.transform = `translateY(${(1 - sk) * 190}px) scale(${0.9 + 0.1 * sk})`;
    ticks.style.color = t > A.enviar + 0.6 ? '#9CC8FF' : 'rgba(255,255,255,.45)';
  }
});

// map a point in phone-local layout coords (stage px, untransformed) to the stage
function phoneMap(T, p) {
  const a = T.rot * Math.PI / 180, x = (p.x - PH.cx) * T.sc, y = (p.y - PH.cy) * T.sc;
  return { x: PH.cx + T.dx + x * Math.cos(a) - y * Math.sin(a), y: PH.cy + T.dy + x * Math.sin(a) + y * Math.cos(a) };
}
const SCREEN0 = { x: 270 + 12, y: 280 + 12 };

// ---------- thumb (line art) for scrolling and tapping, and the tap rings ----------
let thumb, rings = [];
const TAPS = () => [A.tap1, A.tap2, A.abre, A.enviar];
Reel.scene({
  name: 'dedo', z: 27,
  build(root) {
    thumb = svgEl('svg', { width: 260, height: 560, viewBox: '0 0 260 560', class: 'thumb' }, root);
    thumb.innerHTML = '<g transform="rotate(-24 70 60)"><rect x="18" y="10" width="104" height="560" rx="52" fill="#141c3c" stroke="#F4F7FF" stroke-width="7"/>' +
      '<path d="M36 74 C36 40 104 40 104 74 L104 120 C104 134 36 134 36 120 Z" fill="none" stroke="rgba(244,247,255,.55)" stroke-width="5"/>' +
      '<path d="M40 250 C60 262 84 262 104 250" fill="none" stroke="rgba(244,247,255,.35)" stroke-width="4" stroke-linecap="round"/></g>';
    TAPS().forEach(() => rings.push(el('div', 'tapring', root)));
  },
  update(t) {
    const T = (Reel.scenes.find(s => s.name === 'movil')).T;
    if (!T) return;
    // targets in phone layout coords
    const imgN = { x: SCREEN0.x + 258, y: SCREEN0.y + 1230 + 150 - 800 };   // the number in the banner (after the scroll)
    const wbtn = { x: SCREEN0.x + 273, y: SCREEN0.y + 479 };
    const send = { x: SCREEN0.x + 452, y: SCREEN0.y + 844 };
    const rest = { x: 800, y: 1500 }, swipeA = { x: 560, y: 1080 }, swipeB = { x: 560, y: 760 };
    let p, on = 0, press = 0;
    const sw = (t0) => { const k = seg(t, t0, t0 + 0.9); return { x: lerp(swipeA.x, swipeB.x, E.io(k)) + 40, y: lerp(swipeA.y, swipeB.y, E.io(k)) }; };
    const pressAt = (t0) => (t > t0 - 0.12 && t < t0 + 0.12) ? 1 - Math.abs(t - t0) / 0.12 : 0;
    if (t < A.apunto) {
      on = inout(t, A.zoomPh + 0.35, A.pulsar + 0.35, 0.3, 0.35);
      if (t < A.zoomPh + 1.5) p = sw(A.zoomPh + 0.5); else if (t < A.zoomPh + 2.5) p = sw(A.zoomPh + 1.5);
      else { const k = E.expo(seg(t, A.zoomPh + 2.5, A.tap1 - 0.15)); const q = phoneMap(T, imgN); p = { x: lerp(sw(A.zoomPh + 1.5).x, q.x, k), y: lerp(swipeB.y, q.y, k) }; }
      press = pressAt(A.tap1) + pressAt(A.tap2) + pressAt(A.pulsar + 0.05);
    } else if (t > A.boton) {
      on = inout(t, A.vista, A.abre + 0.25, 0.4, 0.35) + inout(t, A.cliente, A.enviar + 0.4, 0.4, 0.4);
      const qa = phoneMap(T, wbtn), qs = phoneMap(T, send);
      const k1 = E.expo(seg(t, A.vista, A.abre - 0.1)), k2 = E.expo(seg(t, A.abre + 0.3, A.cliente + 0.3)), k3 = E.expo(seg(t, A.cliente + 0.3, A.enviar - 0.1));
      p = { x: lerp(rest.x, qa.x, k1), y: lerp(rest.y, qa.y, k1) };
      p = { x: lerp(p.x, rest.x, k2), y: lerp(p.y, rest.y, k2) };
      p = { x: lerp(p.x, qs.x, k3), y: lerp(p.y, qs.y, k3) };
      press = pressAt(A.abre) + pressAt(A.enviar);
    }
    if (!p) { thumb.style.opacity = 0; } else {
      thumb.style.opacity = on;
      thumb.style.transform = `translate(${p.x - 30}px,${p.y - 22 + press * 10}px) scale(${1 - press * 0.05})`;
    }
    const pts = [phoneMap(T, imgN), phoneMap(T, imgN), phoneMap(T, wbtn), phoneMap(T, send)];
    TAPS().forEach((t0, i) => {
      const k = seg(t, t0, t0 + 0.55), r = rings[i];
      r.style.opacity = k > 0 && k < 1 ? (1 - k) : 0;
      r.style.left = pts[i].x - 60 + 'px'; r.style.top = pts[i].y - 60 + 'px';
      // on the image the ring bounces back (nothing happens); on the button it opens
      const s = i < 2 ? 0.4 + 0.8 * Math.sin(k * Math.PI) : 0.3 + 1.4 * E.out(k);
      r.style.transform = `scale(${s})`;
    });
  }
});

// ---------- copied digit by digit: each digit flies from the image to the palm ----------
let flyers = [];
Reel.scene({
  name: 'cifras', z: 32,
  build(root) { [...NUM.replace(/ /g, '')].forEach(ch => flyers.push(el('div', 'flyer', root, ch))); },
  update(t) {
    const ms = Reel.scenes.find(s => s.name === 'movil'), ps = Reel.scenes.find(s => s.name === 'palma');
    flyers.forEach((f, i) => {
      const k = seg(t, WT[i] - 0.32, WT[i] + 0.02);
      if (k <= 0 || k >= 1 || !ms.T) { f.style.opacity = 0; return; }
      const sp = bDigits[i]; const bx = SCREEN0.x + sp.offsetLeft + sp.parentElement.offsetLeft + banner.offsetLeft + sp.offsetWidth / 2;
      const by = SCREEN0.y + banner.offsetTop - 800 + sp.parentElement.offsetTop + sp.offsetHeight / 2;
      const a = phoneMap(ms.T, { x: bx, y: by });
      const q = ps.dg[i]; const pp = q.m.pen(q.j, 0.5);
      // palm layer transform at the end of the flight (it is still while writing)
      const S = 0.86, X = 640, Y = 905, ang = -7 * Math.PI / 180, R = (-3 + Math.sin(WT[i] * .9) * 1.2) * Math.PI / 180;
      let lx = 385 + (pp.x - 385) * Math.cos(ang) - (pp.y - 520) * Math.sin(ang), ly = 520 + (pp.x - 385) * Math.sin(ang) + (pp.y - 520) * Math.cos(ang);
      lx -= 380; ly -= 450;
      const b = { x: X + S * (lx * Math.cos(R) - ly * Math.sin(R)), y: Y + S * (lx * Math.sin(R) + ly * Math.cos(R)) };
      const e = E.io(k);
      f.style.opacity = Math.sin(k * Math.PI) * 0.95 + 0.05;
      f.style.transform = `translate(${lerp(a.x, b.x, e) - 20}px,${lerp(a.y, b.y, e) - 30 - Math.sin(k * Math.PI) * 90}px) scale(${0.6 + 0.6 * Math.sin(k * Math.PI)})`;
    });
  }
});

// ---------- the message goes to the wrong number and dissolves into the rain ----------
let msg, msgBits = [];
Reel.scene({
  name: 'mensaje', z: 34,
  build(root) {
    msg = el('div', 'msg glass', root);
    el('div', 'to txt', msg, 'PARA · 612 34 <em>58</em> 78');
    el('div', 'mt txt', msg, 'Hola, ¿tenéis hueco el sábado?');
    el('div', 'tk', msg, '<svg width="26" height="20" viewBox="0 0 26 20"><path d="M3 11 L9 17 L23 3" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="3.2" stroke-linecap="round"/></svg>');
    const r = rng(77);
    for (let i = 0; i < 46; i++) { const b = el('i', 'bit', root); msgBits.push({ b, ox: (r() - .5) * 620, oy: (r() - .5) * 150, vy: 200 + r() * 500, s: 6 + r() * 12 }); }
  },
  update(t) {
    const k = E.expo(seg(t, A.mensaje, A.mensaje + 0.5));
    const fly = E.in2(seg(t, A.mensaje + 0.5, A.llego));
    const dis = seg(t, A.nunca, A.nunca + 0.55);
    const x = lerp(580, 650, fly), y = lerp(lerp(1010, 830, k), 490, fly);
    msg.style.opacity = k * (1 - dis);
    msg.style.transform = `translate(${x - 330}px,${y - 85}px) scale(${lerp(0.7, 1, k) * (1 - 0.35 * fly)}) rotate(${fly * 4}deg)`;
    msg.style.filter = dis > 0 ? `blur(${dis * 6}px)` : '';
    msgBits.forEach(m => {
      const dk = seg(t, A.nunca + 0.05, A.nunca + 1.2);
      m.b.style.opacity = dk > 0 && dk < 1 ? (1 - dk) * 0.85 : 0;
      m.b.style.left = x + m.ox * (0.5 + dk * 0.6) * (1 - 0.35 * fly) + 'px';
      m.b.style.top = y + m.oy * (1 - 0.35 * fly) + m.vy * dk * dk + 'px';
      m.b.style.width = m.s * 0.5 + 'px'; m.b.style.height = m.s * 1.6 + 'px';
    });
  }
});

// ---------- rain in front of everything (two depths) and a bus passing at the end ----------
let drops = [], busLight;
Reel.scene({
  name: 'lluvia', z: 60,
  build(root) {
    const r = rng(5);
    for (let i = 0; i < 120; i++) {
      const near = i < 22; const d = el('i', near ? 'rain near' : 'rain', root);
      const h = near ? 120 + r() * 120 : 40 + r() * 70;
      css(d, { height: h + 'px', left: r() * 1180 - 50 + 'px' });
      drops.push({ d, y0: r() * 2200, sp: near ? 2600 + r() * 600 : 1500 + r() * 700, h });
    }
    busLight = el('div', 'busLight', root);
  },
  update(t) {
    const c = camAt(t); const close = clamp((c.s - 1) / 2);
    drops.forEach((p, i) => {
      const y = ((p.y0 + t * p.sp) % 2300) - 200;
      p.d.style.transform = `translate(${-y * 0.2}px,${y}px) rotate(11deg)`;
      p.d.style.opacity = i < 22 ? 0.5 : 0.75 - close * 0.25;
    });
    const bk = seg(t, A.enviar - 0.4, A.cta + 0.2);
    busLight.style.opacity = Math.sin(bk * Math.PI) * 0.8;
    busLight.style.transform = `translateX(${lerp(-900, 1100, bk)}px)`;
  }
});
