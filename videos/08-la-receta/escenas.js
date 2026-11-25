// =====================================================================
//  08 · La receta
//  Mundo: encimera de pizarra vista desde arriba, primera hora, luz blanca de ventana.
//  Pieza protagonista: ficha de receta con casillas que se rellenan (Piezas.Ficha).
//  La web del fontanero es genérica e inventada. La web real del remate es The Barber Kingdom.
// =====================================================================

const A = {
  noSupe: W(1, 'No').start,
  faltan: L(2).start, tres: W(2, 'tres').start,
  serv: W(2, 'Servicios').start, palabras: W(2, 'palabras').start, normales: W(2, 'normales').start,
  como: W(2, 'Cómo').start, trabaja: W(2, 'trabaja').start, cuanto: W(2, 'cuánto').start, tarda: W(2, 'tarda').start,
  imp: L(3).start, idea: W(3, 'idea').start, cuesta: W(3, 'cuesta').start, desde: W(3, 'desde').start,
  porque: W(3, 'porque').start, pregunta: W(3, 'pregunta').start,
  busca: L(4).start, una: W(4, 'Una').start,
  ensena: W(4, 'enseña').start, nada: W(4, 'nada').start, entrar: W(4, 'entrar').start,
  cta: CTA.start,
};
Object.entries(A).forEach(([k, v]) => Reel.anchor(k, v));

// ---------- music and sound marks ----------
Reel.section(0, A.faltan - 0.1, 'tension');
Reel.section(A.faltan - 0.1, A.imp - 0.1, 'pulso');
Reel.section(A.imp - 0.1, A.porque, 'tension');
Reel.section(A.porque, A.una - 0.3, 'pulso');
Reel.section(A.una - 0.3, CTA.end + 0.35, 'claro');
Reel.hit(A.noSupe, 'thud', 0.9);
Reel.hit(A.faltan - 0.05, 'whoosh');
[0, 1, 2].forEach(i => Reel.hit(A.tres + i * 0.16, 'tick', 0.7));
Reel.hit(A.serv - 0.1, 'knock'); Reel.hit(A.normales, 'click');
Reel.hit(A.como - 0.1, 'knock'); Reel.hit(A.tarda, 'click');
Reel.hit(A.imp - 0.05, 'rise');
Reel.hit(A.cuesta, 'click'); Reel.hit(A.desde, 'thud', 0.8);
Reel.hit(A.porque - 0.1, 'whoosh_rev');
Reel.hit(A.busca - 0.05, 'whoosh');
Reel.hit(A.una - 0.1, 'hit');
[A.ensena, A.nada, A.entrar].forEach(t => Reel.hit(t, 'tick'));
Reel.hit(A.cta - 0.3, 'rise');

// ---------- camera: one overhead shot of the counter, it only moves closer or further ----------
// keyframes: [t, scale, tx, ty]
const CAM = [
  [0, 1.30, 0, 150], [A.faltan - 0.05, 1.30, 0, 120],
  [A.faltan + 0.75, 1.0, 0, 0], [A.imp - 0.05, 1.03, 0, -10],
  [A.imp + 0.7, 1.5, -200, -280], [A.porque - 0.1, 1.53, -204, -288],
  [A.porque + 0.6, 1.0, 0, 0], [DUR, 1.03, 0, 0],
];
function cam(t) {
  let i = 0; while (i < CAM.length - 2 && t > CAM[i + 1][0]) i++;
  const a = CAM[i], b = CAM[i + 1];
  const k = E.io(seg(t, a[0], b[0]));
  return [lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3], b[3], k)];
}
// how much the camera is pushed in on box 3 (everything else switches off)
const zoomK = t => inout(t, A.imp - 0.05, A.porque + 0.1, 0.5, 0.5);
const off = z => 1 - clamp(z * 2.5);   // other things switch off fast while the camera is close

// ---------- the world ----------
let world, light, phone, page, ficha, bowl, timer, dial, tag, tablet, rings = [];
const WEB_LINES = ['Soluciones integrales', 'Mantenimiento general', 'Instalaciones', 'Reformas'];
Reel.scene({
  name: 'encimera', z: 10,
  build(root) {
    world = el('div', 'world', root);
    // counter: slate, window light with the frame's shadow, wooden board, linen towel, blurred bowl rim
    el('div', 'slate', world);
    light = el('div', 'winlight', world);
    for (let i = 0; i < 3; i++) { const m = el('div', 'mull', light); m.style.left = 250 + i * 330 + 'px'; }
    el('div', 'mullh', light);
    const board = el('div', 'board', world); el('div', 'hole', board);
    el('div', 'linen', world);
    el('div', 'rimfg', world);
    el('div', 'crumbs', world).innerHTML = Array.from({ length: 26 }, (_, i) => {
      const r = rng(40 + i); return `<i style="left:${r() * 1200}px;top:${r() * 2000}px;width:${3 + r() * 6}px;height:${3 + r() * 5}px"></i>`;
    }).join('');

    // the phone lying on the counter, with a generic plumber site (invented, never a real business)
    phone = Piezas.Movil(world, { x: 330, y: 420, w: 420 });
    phone.img.style.display = 'none';
    page = el('div', 'fweb', phone.screen);
    page.innerHTML = `<div class="fbar"><b></b><span>FONTANERÍA INTEGRAL</span><em></em></div>
      <div class="fhero"><div class="fh1">Soluciones integrales para su hogar</div></div>
      <div class="fp">Profesionales con amplia experiencia, comprometidos con la calidad y la satisfacción de nuestros clientes.</div>
      <div class="fsec">Nuestros servicios</div>
      ${WEB_LINES.map((s, i) => `<div class="fli" style="top:${820 + i * 64}px">· ${s}</div>`).join('')}
      <div class="fp2">Trabajamos con los mejores materiales y un equipo cualificado a su disposición.</div>
      <div class="fimg"></div>
      <div class="ffoot">Contacto: formulario</div>`;

    // recipe card: the hero piece
    ficha = Piezas.Ficha(world, {
      x: 300, y: 440, w: 720, h: 780,
      title: 'LO QUE NECESITA TU WEB',
      items: ['Servicios, en palabras normales', 'Cómo trabaja y cuánto tarda', 'Una idea de lo que cuesta'],
      backTitle: 'COMPRUEBA HOY EN TU WEB',
      back: ['¿Se entiende qué haces?', '¿Dice cómo y cuánto tardas?', '¿Da una idea de precio?'],
    });

    // handwritten note that only shows while the camera is close on box 3
    this.imp = el('div', 'fimp txt', ficha.rows[2].r.parentElement, 'la más importante');

    // ingredient 1: a ceramic bowl with paper tags
    bowl = el('div', 'bowl', world);
    el('div', 'glaze', bowl);
    [['Calderas', 46, 70, -8], ['Fugas', 120, 130, 6], ['Termos', 40, 160, 4], ['Baños', 110, 52, -4]].forEach(([w, x, y, r]) => {
      const p = el('div', 'ptag txt', bowl, w); css(p, { left: x + 'px', top: y + 'px', transform: `rotate(${r}deg)` });
    });
    // ingredient 2: a wind-up kitchen timer
    timer = el('div', 'ktimer', world);
    dial = el('div', 'kdial', timer);
    for (let i = 0; i < 12; i++) { const n = el('div', 'kn', dial, String(i * 5)); n.style.transform = `rotate(${i * 30}deg) translateY(-78px) rotate(${-i * 30}deg)`; }
    el('div', 'kknob', timer); el('div', 'kpoint', timer);
    el('div', 'klab txt', world, 'PLAZOS').id = 'klab';
    // ingredient 3: a paper price tag on twine, no figure
    tag = el('div', 'ptag3', world);
    el('div', 'twine', tag); el('div', 'eye', tag);
    el('div', 'dt txt', tag, 'DESDE'); el('div', 'dv txt', tag, '___ €');

    // the real site in a tablet lying on the counter
    tablet = el('div', 'tablet', world);
    const ts = el('div', 'tscreen', tablet);
    this.timg = el('img', '', ts); this.timg.src = ASSET(Piezas.WEBS.barber.escritorio);
    // rings on what the real site shows at first sight (fractions of the capture)
    [[0.384, 0.698, 0.15, 0.075], [0.5, 0.602, 0.235, 0.05], [0.545, 0.042, 0.07, 0.05]].forEach(([cx, cy, w, h]) => {
      const r = el('div', 'ring', ts); css(r, { left: (cx - w / 2) * 100 + '%', top: (cy - h / 2) * 100 + '%', width: w * 100 + '%', height: h * 100 + '%' });
      rings.push(r);
    });
    this.wlab = el('div', 'wlab glass', root);
    el('div', 'lab txt', this.wlab, 'WEB REAL'); el('div', 'wu txt', this.wlab, 'thebarberkingdom.com');
  },
  update(t) {
    const [s, tx, ty] = cam(t);
    world.style.transform = `translate(${tx + Math.sin(t * .21) * 6}px,${ty + Math.cos(t * .17) * 5}px) scale(${s})`;
    light.style.transform = `translateX(${Math.sin(t * .1) * 20}px) skewX(-18deg)`;
    const z = zoomK(t);
    const gone = E.in2(seg(t, A.cta - 0.5, A.cta - 0.05));
    world.style.opacity = 1 - 0.5 * inout(t, A.porque - 0.1, A.busca - 0.35, .5, .4) - 0.6 * gone;

    // ---- phone: scrolling from frame 0, bottoms out on "No lo supe", then slides away
    const sc = lerp(160, 900, E.io2(seg(t, -0.6, A.noSupe))) + Math.sin(seg(t, A.noSupe, A.noSupe + 0.5) * Math.PI) * -26;
    page.style.transform = `translateY(${-sc}px)`;
    const pk = E.io(seg(t, A.faltan - 0.1, A.faltan + 0.7));
    phone.el.style.transform = `translate(${-400 * pk}px,${500 * pk}px) rotate(${-15 * pk}deg) scale(${1 - 0.36 * pk})`;
    phone.el.style.opacity = 1 - 0.75 * z - 0.6 * seg(t, A.una - 0.4, A.una + 0.2);

    // ---- recipe card: slides in from the right, boxes, fills, flips, then shrinks to the top
    const fk = E.expo(seg(t, A.faltan + 0.05, A.faltan + 0.8));
    const up = E.io(seg(t, A.una - 0.25, A.una + 0.45));
    ficha.el.style.transform = `translate(${(1 - fk) * 820 + up * 160}px,${up * -238}px) rotate(${(1 - fk) * 9 + 2 * (1 - up)}deg) scale(${1 - 0.5 * up})`;
    ficha.update(t, {
      boxes: [A.tres, A.tres + 0.16, A.tres + 0.32],
      fill: [A.palabras - 0.1, A.trabaja - 0.1, A.idea - 0.1],
      tick: [A.normales, A.tarda, A.cuesta],
      flip: A.busca - 0.05,
      backTick: [A.ensena, A.nada, A.entrar],
      dim: [z, z, 0], dimHead: z, focus: z,
    });
    const ik = clamp((z - 0.55) / 0.45);
    this.imp.style.opacity = ik; this.imp.style.transform = `translateY(${(1 - ik) * 20}px) rotate(-3deg)`;

    // ---- bowl and timer drop into the frame on their words
    const bk = E.expo(seg(t, A.serv - 0.25, A.serv + 0.35));
    bowl.style.opacity = bk * off(z) * (1 - up);
    bowl.style.transform = `translate(${(1 - bk) * -320}px,${(1 - bk) * -140}px) rotate(${(1 - bk) * -40 + t * 1.2}deg)`;
    const tk = E.expo(seg(t, A.como - 0.25, A.como + 0.35));
    timer.style.opacity = tk * off(z) * (1 - up);
    timer.style.transform = `translate(${(1 - tk) * -320}px,${(1 - tk) * 120}px) rotate(${(1 - tk) * 50}deg)`;
    dial.style.transform = `rotate(${-200 * E.io(seg(t, A.cuanto - 0.1, A.tarda + 0.3)) - 30}deg)`;
    $('#klab').style.opacity = E.expo(seg(t, A.cuanto, A.cuanto + 0.3)) * off(z) * (1 - up);

    // ---- price tag falls on "desde"
    const gk = E.expo(seg(t, A.desde - 0.15, A.desde + 0.3));
    tag.style.opacity = clamp(gk * 1.4) * (1 - E.io(seg(t, A.busca - 0.3, A.busca + 0.1)));
    tag.style.transform = `translate(${(1 - gk) * -60}px,${(1 - gk) * -260}px) rotate(${-12 + (1 - gk) * -25 + Math.sin((t - A.desde) * 6) * 3 * (1 - seg(t, A.desde, A.desde + 1.2))}deg) scale(${1 + (1 - gk) * 0.25})`;

    // ---- tablet with the real site, three rings on what it shows at first sight
    const tb = E.expo(seg(t, A.una - 0.2, A.una + 0.6));
    tablet.style.opacity = tb;
    tablet.style.transform = `translateY(${(1 - tb) * 900}px) rotate(${(1 - tb) * 6 - 1}deg)`;
    this.timg.style.transform = `scale(${1 + 0.05 * seg(t, A.una, A.cta)})`;
    [A.ensena, A.nada, A.entrar].forEach((t0, i) => {
      const k = clamp(E.back(seg(t, t0 - 0.05, t0 + 0.35)));
      rings[i].style.opacity = seg(t, t0 - 0.05, t0 + 0.1);
      rings[i].style.transform = `scale(${1.25 - 0.25 * k})`;
    });
    const wl = E.expo(seg(t, A.una + 0.2, A.una + 0.7));
    this.wlab.style.opacity = wl * (1 - gone);
    this.wlab.style.transform = `translateX(${(1 - wl) * -80}px)`;
  }
});

// ---------- overlays that are not on the counter ----------
const ASK = 'Hola, ¿cuánto costaría cambiar la caldera?';
let hook, hq, hstrike, hno, comp, ctext, caret;
Reel.scene({
  name: 'paneles', z: 40,
  build(root) {
    hook = el('div', 'hook glass', root);
    el('div', 'lab txt', hook, 'LO QUE BUSCO');
    hq = el('div', 'hq txt', hook, '¿Arregla calderas?');
    hstrike = el('i', 'strike', hook);
    hno = el('div', 'hno txt', hook, 'SIN RESPUESTA');
    comp = el('div', 'comp glass', root);
    el('div', 'lab txt', comp, 'ESCRIBIENDO AL FONTANERO');
    const box = el('div', 'cbox', comp);
    ctext = el('div', 'ctext txt', box); caret = el('i', 'caret', box);
  },
  update(t) {
    // hook panel: there on frame 0, struck out on "No lo supe", leaves with the camera
    const out = E.io(seg(t, A.faltan - 0.1, A.faltan + 0.4));
    hook.style.opacity = 1 - out;
    hook.style.transform = `translateY(${-out * 60}px) scale(${1 + 0.015 * Math.sin(t * 3)})`;
    const st = E.expo(seg(t, A.noSupe - 0.05, A.noSupe + 0.35));
    hstrike.style.transform = `scaleX(${st})`;
    hq.style.opacity = 1 - 0.45 * st;
    const nk = E.expo(seg(t, A.noSupe + 0.15, A.noSupe + 0.5));
    hno.style.opacity = nk; hno.style.transform = `translateY(${(1 - nk) * 16}px)`;

    // message typed and deleted: without a price, people do not even ask
    const ck = inout(t, A.porque - 0.1, A.pregunta + 0.75, .4, .35);
    comp.style.opacity = ck;
    comp.style.transform = `translateY(${(1 - E.expo(seg(t, A.porque - 0.1, A.porque + 0.4))) * 60}px)`;
    const typed = seg(t, A.porque + 0.1, A.pregunta - 0.15);
    const del = seg(t, A.pregunta, A.pregunta + 0.55);
    const n = Math.round(ASK.length * typed * (1 - del));
    ctext.textContent = ASK.slice(0, n);
    caret.style.opacity = Math.floor(t * 2.4) % 2 ? 0.25 : 1;
    const lines = ctext.offsetHeight > 70;
    caret.style.left = (lines ? 34 : 34 + Math.min(ctext.offsetWidth, 780)) + 4 + 'px';
    caret.style.top = lines ? '86px' : '26px';
    if (lines) caret.style.left = 34 + Math.max(0, lastLineWidth(ctext)) + 4 + 'px';
  }
});
function lastLineWidth(e) {
  const r = document.createRange(); r.selectNodeContents(e);
  const rs = [...r.getClientRects()]; if (!rs.length) return 0;
  const last = rs[rs.length - 1]; return last.right - e.getBoundingClientRect().left;
}
