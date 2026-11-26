// =====================================================================
//  09 · Cada piso dos veces
//  Mundo: oficina de inmobiliaria al anochecer. Escaparate con fichas pegadas al
//  cristal, calle en hora azul, flexo encendido y cajetín de llaves con etiquetas.
//  Pieza protagonista: ficha de inmueble que se calca en papel de calco y contador
//  que rueda con las fichas copiadas a mano.
//  El programa de gestión y la web «de antes» son genéricos e inventados.
//  La web real del remate es Amperiza (inmobiliaria, cliente de Saberium).
// =====================================================================

const A = {
  inmo: W(1, 'inmobiliaria').start, dos: W(1, 'dos').start,
  prog: L(2).start, gestion: W(2, 'gestión').start,
  fotos: W(2, 'fotos').start, metros: W(2, 'metros').start, precio: W(2, 'precio').start,
  luego: W(2, 'luego').start, web: W(2, 'web').start, mano: W(2, 'mano').start,
  tarde: L(3).start, vatarde: W(3, 'tarde').start,
  vendidos: W(3, 'vendidos').start, siguen: W(3, 'siguen').start,
  novedades: W(3, 'novedades').start, nosalen: W(3, 'no').start,
  pero: L(4).start, leer: W(4, 'leer').start, programa: W(4, 'programa').start,
  subes: W(4, 'subes').start, una: W(4, 'una').start,
  aparece: W(4, 'aparece').start, marcas: W(4, 'marcas').start,
  vendido: W(4, 'vendido').start, desaparece: W(4, 'desaparece').start,
  cta: CTA.start,
};
Object.entries(A).forEach(([k, v]) => Reel.anchor(k, v));
const OUT = [A.cta - 0.55, A.cta - 0.15];          // every scene text leaves before the close

// ---------- music and sound marks ----------
Reel.section(0, A.prog - 0.2, 'tension');
Reel.section(A.prog - 0.2, A.tarde - 0.15, 'pulso');
Reel.section(A.tarde - 0.15, A.pero - 0.3, 'tension');
Reel.section(A.pero - 0.3, CTA.end + 0.35, 'claro');
Reel.hit(A.dos, 'thud', 0.9);
Reel.hit(A.prog - 0.05, 'whoosh');
[A.fotos, A.metros, A.precio].forEach(t => Reel.hit(t, 'knock', 0.8));
Reel.hit(A.luego - 0.1, 'whoosh');
Reel.hit(A.mano, 'tick');
Reel.hit(A.tarde - 0.05, 'whoosh_rev');
Reel.hit(A.vendidos, 'thud', 0.9); Reel.hit(A.siguen + 0.1, 'thud', 0.7);
Reel.hit(A.nosalen, 'knock');
Reel.hit(A.pero - 0.1, 'hit');
Reel.hit(A.leer, 'rise', 0.6);
Reel.hit(A.una, 'click');
Reel.hit(A.aparece, 'pluck');
Reel.hit(A.vendido, 'click');
Reel.hit(A.desaparece, 'whoosh_rev', 0.7);
Reel.hit(A.cta - 0.3, 'rise');

// ---------- a photo of a flat, drawn in code (light, wall, window, floor, sofa, plant) ----------
const PAL = [
  { wall: '#d9cdb8', wall2: '#bfae94', floor: '#8a6a4c', sofa: '#5d6b7a', sky: '#cfe1f5' },
  { wall: '#e3dccf', wall2: '#c6bba8', floor: '#9b7b5a', sofa: '#8a5e48', sky: '#f2d6b0' },
  { wall: '#cfd5d6', wall2: '#aeb6b8', floor: '#6f5a46', sofa: '#3f4a5c', sky: '#d6e6f2' },
  { wall: '#e6d9c4', wall2: '#cbb898', floor: '#7d6048', sofa: '#6b7a5a', sky: '#f5e3c4' },
];
function foto(parent, v = 0, cls = '') {
  const p = PAL[v % PAL.length];
  const f = el('div', 'foto ' + cls, parent);
  f.innerHTML = `<i class="fw" style="background:linear-gradient(90deg,${p.wall2},${p.wall} 40%,${p.wall})"></i>
    <i class="fwin" style="background:linear-gradient(180deg,${p.sky},#fff8ec)"></i><i class="fbeam"></i>
    <i class="ffl" style="background:linear-gradient(180deg,${p.floor},#3b2b1e)"></i><i class="frug"></i>
    <i class="fsofa" style="background:linear-gradient(180deg,${p.sofa},#1d2230)"></i><i class="farm" style="background:${p.sofa}"></i>
    <i class="fpot"></i><i class="fleaf"></i>`;
  return f;
}

// ---------- the listing sheet (top sheet) and its carbon copy ----------
function hoja(parent, copia) {
  const h = el('div', 'hoja' + (copia ? ' copia' : ''), parent);
  const c = el('div', 'hin', h);
  el('div', 'hk txt', c, 'FICHA DE INMUEBLE');
  el('div', 'hr txt', c, 'REF. 0412');
  if (copia) { const s = el('div', 'fsk', c); s.innerHTML = '<svg width="500" height="290" viewBox="0 0 500 290"><g fill="none" stroke="#34398f" stroke-width="3" stroke-linecap="round"><path d="M4 6 L496 4 L494 286 L6 284 Z"/><path d="M300 30 L462 28 L460 150 L302 152 Z"/><path d="M8 210 L494 206"/><path d="M60 250 L60 190 L250 186 L252 250"/><path d="M380 210 L384 120 M370 130 L400 104 M384 140 L410 128"/></g></svg>'; }
  else foto(c, 0, 'big');
  el('div', 'ht txt', c, 'Piso · C/ Alfarería, 14');
  el('div', 'hd txt', c, '3 hab · 92 m² · 2 baños');
  el('div', 'hp txt', c, 'PRECIO');
  el('div', 'hpv', c);
  return { h, c };
}

// ---------- the office at dusk ----------
let office, keys = [];
Reel.scene({
  name: 'oficina', z: 1,
  build(root) {
    const r = rng(9);
    office = el('div', 'office', root);
    el('div', 'wall', office);
    const win = el('div', 'escap', office);
    el('div', 'sky', win);
    const bl = el('div', 'blds', win);
    for (let i = 0; i < 9; i++) {
      const b = el('i', 'bld', bl); const w = 90 + r() * 120, h = 220 + r() * 300;
      css(b, { left: i * 130 - 30 + 'px', width: w + 'px', height: h + 'px', bottom: '330px' });
      for (let k = 0; k < 7; k++) { const l = el('b', 'lw', b); css(l, { left: 10 + r() * (w - 30) + 'px', top: 20 + r() * (h - 50) + 'px', opacity: r() < .55 ? .9 : .15 }); }
    }
    el('div', 'street', win);
    for (let i = 0; i < 9; i++) { const d = el('i', 'lamp', win); const s = 40 + r() * 70; css(d, { left: r() * 1100 + 'px', top: 640 + r() * 260 + 'px', width: s + 'px', height: s + 'px', opacity: .5 + r() * .5 }); }
    // listing sheets taped to the window, seen from inside
    for (let i = 0; i < 8; i++) {
      const s = el('div', 'tape', win); css(s, { left: 40 + (i % 4) * 270 + r() * 30 + 'px', top: 160 + Math.floor(i / 4) * 330 + r() * 30 + 'px', transform: `rotate(${(r() - .5) * 4}deg)` });
      el('i', 'tph', s); el('i', 'tl1', s); el('i', 'tl2', s);
    }
    for (let i = 0; i < 4; i++) { const m = el('div', 'mull', win); m.style.left = 280 * i + 270 + 'px'; }
    el('div', 'reflect', win);
    // key cabinet with tagged keys
    const cab = el('div', 'cajetin', office);
    for (let i = 0; i < 12; i++) {
      const k = el('div', 'key', cab); css(k, { left: 30 + (i % 3) * 82 + 'px', top: 40 + Math.floor(i / 3) * 128 + 'px' });
      el('i', 'hook', k); el('i', 'ring', k); el('i', 'kb', k);
      const tg = el('i', 'ktag', k); tg.style.transform = `rotate(${(r() - .5) * 18}deg)`;
      keys.push(k);
    }
    // flexo: head and the warm pool of light
    el('div', 'pool', office);
    const fx = el('div', 'flexo', office); el('i', 'arm', fx); el('i', 'arm2', fx); el('i', 'head', fx); el('i', 'bulb', fx);
    el('div', 'desk', office);
    el('div', 'mug', office);
    this.r = r;
  },
  update(t) {
    const zoom = 1.08 - 0.08 * E.io(seg(t, A.dos - 0.2, A.prog + 0.4));
    office.style.transform = `translate(${Math.sin(t * .21) * 12}px,${Math.cos(t * .16) * 8}px) scale(${zoom + 0.015 * seg(t, 0, DUR)})`;
    office.style.opacity = 1 - 0.25 * inout(t, A.tarde - 0.2, A.pero - 0.2, .5, .5);
    // the key of flat 0412 swings when it comes back, at the end
    keys.forEach((k, i) => { k.style.transform = `rotate(${Math.sin(t * 1.3 + i) * 1.2}deg)`; });
  }
});

// ---------- the counter: listings copied by hand ----------
let rod;
Reel.scene({
  name: 'contador', z: 40,
  build(root) {
    rod = Piezas.Rodillo(root, { x: 690, y: 404, w: 420, label: 'COPIADAS A MANO', digits: 2 });
    rod.el.classList.add('rmini');
  },
  update(t) {
    const k = E.expo(seg(t, A.dos - 0.15, A.dos + 0.35));
    const o = 1 - E.io(seg(t, OUT[0], OUT[1]));
    rod.el.style.opacity = k * o;
    rod.el.style.transform = `translateY(${(1 - k) * -30}px) scale(.75)`;
    // 1 on the hook, 2 on "dos veces"; it piles up while copying by hand; down to 0 when connected
    const steps = [[0, 1], [A.dos, 2]];
    for (let i = 0; i < 5; i++) steps.push([A.mano + i * 0.22, 4 + i * 2]);
    steps.push([A.una, 0]);
    rod.update(t, steps, 0.5);
    const z = t > A.una + 0.6;
    rod.el.classList.toggle('zero', z);
  }
});

// ---------- hook: the sheet is being traced onto carbon paper ----------
let hTop, cop, pen;
Reel.scene({
  name: 'calco', z: 30,
  build(root) {
    cop = hoja(root, true);
    el('div', 'stampC txt', cop.h, 'COPIA');
    hTop = hoja(root, false);
    pen = el('div', 'pen', root); el('i', 'barrel', pen); el('i', 'grip', pen); el('i', 'tip', pen); el('i', 'clip', pen);
  },
  update(t) {
    // the copy is being revealed line by line, top to bottom, as the pen traces
    const p = clamp(seg(t, -1.6, A.dos - 0.1));
    cop.c.style.clipPath = `inset(0 0 ${(1 - p) * 100}% 0)`;
    const sp = E.io(seg(t, A.dos - 0.1, A.dos + 0.5));            // the two sheets come apart
    const go = E.in2(seg(t, A.prog - 0.15, A.prog + 0.45));          // top sheet leaves into the program
    const cgo = E.io(seg(t, A.luego - 0.15, A.luego + 0.45));        // copy leaves into the web
    // top sheet
    const tx = lerp(250, 40, sp), ty = lerp(470, 560, sp), ts = lerp(1, 0.85, sp);
    hTop.h.style.transform = `translate(${lerp(tx, 120, go)}px,${lerp(ty, 600, go)}px) rotate(${lerp(-2.5, -4, sp) * (1 - go)}deg) scale(${lerp(ts, 0.3, go)})`;
    hTop.h.style.opacity = 1 - seg(t, A.prog + 0.25, A.prog + 0.45);
    // copy, under the top sheet, then on its own
    const cx = lerp(370, 554, sp), cy = lerp(530, 600, sp), cs = lerp(1, 0.85, sp);
    const wx = lerp(cx, 640, E.io(seg(t, A.prog, A.prog + 0.6))), wy = lerp(cy, 930, E.io(seg(t, A.prog, A.prog + 0.6)));
    const ws = lerp(cs, 0.55, E.io(seg(t, A.prog, A.prog + 0.6)));
    cop.h.style.transform = `translate(${lerp(wx, 110, cgo)}px,${lerp(wy, 950, cgo)}px) rotate(${lerp(2, 3, sp) * (1 - cgo)}deg) scale(${lerp(ws, 0.36, cgo)})`;
    cop.h.style.opacity = 1 - seg(t, A.luego + 0.3, A.luego + 0.5);
    cop.h.querySelector('.stampC').style.opacity = E.expo(seg(t, A.dos + 0.2, A.dos + 0.5));
    // the pen draws a zig-zag line by line, then lifts away
    const line = p * 9, fr = line - Math.floor(line);
    const px = 250 + 60 + (Math.floor(line) % 2 ? 1 - fr : fr) * 420, py = 470 + 70 + p * 640;
    const lift = E.in2(seg(t, A.dos - 0.1, A.dos + 0.4));
    pen.style.transform = `translate(${px + lift * 500}px,${py - lift * 300}px) rotate(32deg)`;
    pen.style.opacity = 1 - lift;
  }
});

// ---------- the management program (invented, generic) ----------
let prog, thumbs = [], fM, fP, rows = [], newRow, tog, togL;
Reel.scene({
  name: 'programa', z: 25,
  build(root) {
    prog = el('div', 'prog glass', root);
    const hd = el('div', 'phd', prog); el('i', '', hd); el('div', 'lab txt', hd, 'PROGRAMA DE GESTIÓN');
    // form view (scene 2)
    const form = el('div', 'pform', prog); this.form = form;
    el('div', 'pref txt', form, 'REF. 0412 · C/ ALFARERÍA, 14');
    el('div', 'pl pl1 txt', form, 'FOTOS');
    for (let i = 0; i < 3; i++) { const th = el('div', 'thumb', form); th.style.left = 34 + i * 156 + 'px'; foto(th, i); thumbs.push(th); }
    el('div', 'pl pl2 txt', form, 'METROS'); fM = el('div', 'pv pv1 txt', form, '92 m²');
    el('div', 'pl pl3 txt', form, 'PRECIO'); fP = el('div', 'pv pv2 txt', form, '•••••• €');
    // list view (scene 4): listings and the sold switch
    const list = el('div', 'plist', prog); this.list = list;
    [['REF. 0411', 'Bajo · 1 hab · 54 m²']].forEach((q, i) => {
      const rr = el('div', 'prow', list); rr.style.top = 76 + i * 78 + 'px';
      el('div', 'pr1 txt', rr, q[0]); el('div', 'pr2 txt', rr, q[1]); rows.push(rr);
    });
    newRow = el('div', 'prow new', list); newRow.style.top = 76 + 78 + 'px';
    foto(el('div', 'pth', newRow), 0);
    el('div', 'pr1 txt', newRow, 'REF. 0413'); el('div', 'pr2 txt', newRow, 'Piso · 3 hab · 92 m²');
    tog = el('div', 'tog', newRow); el('i', '', tog); togL = el('div', 'togl txt', newRow, 'VENDIDO');
  },
  update(t) {
    // scene 2: big, at the top; leaves left on "Por eso"; back small on "Pero tu web"
    const inK = E.expo(seg(t, A.prog - 0.1, A.prog + 0.5));
    const outK = E.in2(seg(t, A.tarde - 0.1, A.tarde + 0.4));
    const back = E.expo(seg(t, A.pero + 0.05, A.pero + 0.65));
    const o2 = 1 - E.io(seg(t, OUT[0], OUT[1]));
    const small = t > A.pero;
    prog.classList.toggle('small', small);
    this.form.style.display = small ? 'none' : 'block';
    this.list.style.display = small ? 'block' : 'none';
    if (!small) {
      prog.style.opacity = inK * (1 - seg(t, A.tarde + 0.2, A.tarde + 0.4));
      prog.style.transform = `translate(${-outK * 1100}px,${(1 - inK) * 60}px) scale(${0.94 + 0.06 * inK})`;
    } else {
      prog.style.opacity = back * o2;
      prog.style.transform = `translate(${(1 - back) * -700}px,0)`;
    }
    thumbs.forEach((th, i) => { const k = E.back(seg(t, A.fotos - 0.1 + i * 0.12, A.fotos + 0.25 + i * 0.12)); th.style.opacity = clamp(k * 3); th.style.transform = `scale(${0.6 + 0.4 * clamp(k)})`; });
    [[fM, A.metros], [fP, A.precio]].forEach(([e, t0]) => { const k = E.expo(seg(t, t0 - 0.05, t0 + 0.35)); e.style.opacity = k; e.style.transform = `translateY(${(1 - k) * 24}px)`; });
    // scene 4: new listing typed once, then marked as sold
    const nk = E.expo(seg(t, A.subes - 0.05, A.subes + 0.4));
    newRow.style.opacity = nk; newRow.style.transform = `translateY(${(1 - nk) * -40}px)`;
    const fl = inout(t, A.una - 0.05, A.una + 0.5, .15, .5);
    newRow.style.boxShadow = `0 0 0 ${3 * fl}px #9CC8FF, 0 0 ${40 * fl}px rgba(156,200,255,${.6 * fl})`;
    const on = E.io(seg(t, A.vendido - 0.15, A.vendido + 0.2));
    tog.style.background = `rgba(156,200,255,${0.18 + 0.82 * on})`;
    tog.firstChild.style.transform = `translateX(${on * 44}px)`;
    togL.style.color = on > .5 ? '#fff' : 'rgba(156,200,255,.55)';
  }
});

// ---------- the website: first an old, hand-kept page; then the real one, connected ----------
const CARDS = [
  { t: 'Piso · 3 hab · 92 m²', s: 'C/ ALFARERÍA, 14', v: 0 },
  { t: 'Ático · 2 hab · 68 m²', s: 'C/ MAYOR, 7', v: 1 },
  { t: 'Bajo · 1 hab · 54 m²', s: 'C/ DEL SOL, 22', v: 2 },
];
let wp, cards = [], typed, caret, stamps = [], slot, nuevo, lap, thread, tpath, chip;
Reel.scene({
  name: 'web', z: 22,
  build(root) {
    wp = el('div', 'wp', root);
    const bar = el('div', 'wbar', wp);
    el('div', 'wlogo txt', bar, 'Inmobiliaria'); el('div', 'wnav txt', bar, 'Inicio · Pisos · Contacto');
    el('div', 'wurl txt', wp, 'ÚLTIMA ACTUALIZACIÓN: HACE 3 SEMANAS');
    CARDS.forEach((c, i) => {
      const k = el('div', 'wcard', wp); css(k, { left: (i % 2 ? 485 : 30) + 'px', top: (i < 2 ? 112 : 402) + 'px' });
      if (i === 0) {
        // the copy lands here: outline photo from the carbon and text typed by hand
        const sk = el('div', 'wsk', k); sk.innerHTML = cop ? cop.c.querySelector('.fsk').innerHTML : '';
        typed = el('div', 'wt txt', k, ''); caret = el('i', 'wcaret', k);
        el('div', 'ws txt', k, c.s);
      } else {
        foto(k, c.v, 'wf');
        el('div', 'wt txt', k, c.t); el('div', 'ws txt', k, c.s);
        const st = el('div', 'stamp txt', k, 'VENDIDO'); stamps.push(st);
      }
      cards.push(k);
    });
    slot = el('div', 'wslot', wp); css(slot, { left: '485px', top: '402px' });
    el('div', 'wsl txt', slot, 'Novedad'); el('div', 'wsd txt', slot, 'SIN SUBIR');
    // the new listing that does not get in
    nuevo = el('div', 'nuevo', root); foto(nuevo, 3, 'nf');
    el('div', 'nk txt', nuevo, 'NUEVO'); el('div', 'nt txt', nuevo, 'REF. 0413');

    // the real site (Amperiza) in a laptop, and the light thread from the program
    lap = Piezas.Portatil(root, { x: 190, y: 830, w: 700, web: 'amperiza' });
    this.ulab = el('div', 'ulab glass', root); el('div', 'lab txt', this.ulab, 'TU WEB');
    thread = el('div', 'thread', root);
    thread.innerHTML = '<svg width="1080" height="1920"><path id="tp" d="M690 700 C 820 700, 900 760, 870 870 S 760 980, 640 1000" fill="none" stroke="#9CC8FF" stroke-width="5" stroke-linecap="round"/><path id="tp2" d="M690 700 C 820 700, 900 760, 870 870 S 760 980, 640 1000" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-dasharray="14 34"/></svg>';
    tpath = thread.querySelector('#tp'); this.tp2 = thread.querySelector('#tp2');
    this.tlen = tpath.getTotalLength();
    chip = el('div', 'chipw glass', root); foto(el('div', 'cth', chip), 0);
    el('div', 'ck txt', chip, 'EN TU WEB'); el('div', 'ct txt', chip, 'Piso · 3 hab · 92 m²');
  },
  update(t) {
    // scene 2 (bottom, short) -> scene 3 (tall, the whole page) -> leaves into the laptop
    const inK = E.expo(seg(t, A.luego - 0.2, A.luego + 0.4));
    const grow = E.io(seg(t, A.tarde - 0.1, A.tarde + 0.6));
    const toLap = E.io(seg(t, A.pero - 0.1, A.pero + 0.5));
    wp.style.opacity = inK * (1 - seg(t, A.pero + 0.2, A.pero + 0.5));
    const y = lerp(lerp(1240, 858, inK), 560, grow), h = lerp(372, 680, grow);
    wp.style.top = y + 'px'; wp.style.height = h + 'px';
    wp.style.transform = `translate(${toLap * 80}px,${toLap * 260}px) scale(${1 - 0.17 * toLap})`;
    // the copy is typed in by hand
    const n = Math.round(CARDS[0].t.length * seg(t, A.mano - 0.2, A.mano + 0.9));
    typed.textContent = CARDS[0].t.slice(0, n);
    caret.style.left = 24 + Math.min(typed.offsetWidth, 380) + 4 + 'px';
    caret.style.opacity = (t > A.mano - 0.3 && t < A.tarde + 0.6) ? (Math.floor(t * 2.4) % 2 ? .2 : 1) : 0;
    cards[0].querySelector('.wsk').style.opacity = E.expo(seg(t, A.luego + 0.2, A.luego + 0.6));
    // sold flats that are still there
    [A.vendidos, A.siguen + 0.1].forEach((t0, i) => {
      const k = clamp(E.back(seg(t, t0 - 0.05, t0 + 0.3)));
      stamps[i].style.opacity = seg(t, t0 - 0.05, t0 + 0.05);
      stamps[i].style.transform = `rotate(-12deg) scale(${2.2 - 1.2 * k})`;
    });
    // the new listing waits outside and bumps against the page
    const sk = E.expo(seg(t, A.novedades - 0.15, A.novedades + 0.4));
    slot.style.opacity = E.expo(seg(t, A.tarde + 0.2, A.tarde + 0.6));
    slot.style.borderColor = `rgba(10,34,241,${0.35 + 0.5 * inout(t, A.nosalen, A.nosalen + 0.3, .1, .4)})`;
    const bump = t > A.nosalen ? Math.sin((t - A.nosalen) * 30) * 14 * (1 - seg(t, A.nosalen, A.nosalen + 0.6)) : 0;
    nuevo.style.opacity = sk * (1 - E.io(seg(t, A.pero - 0.2, A.pero + 0.2)));
    nuevo.style.transform = `translate(${(1 - sk) * 300 + bump + Math.max(0, -bump) * 0}px,0) rotate(${-4 + bump * 0.3}deg)`;
    // scene 4: the real site, the thread and the listing that appears and disappears by itself
    const lk = E.expo(seg(t, A.pero + 0.1, A.pero + 0.7));
    const lo = 1 - E.io(seg(t, OUT[0], OUT[1]));
    lap.el.style.opacity = lk * lo;
    lap.el.style.transform = `translateY(${(1 - lk) * 120}px) scale(${0.94 + 0.06 * lk})`;
    lap.img.style.transform = `scale(${1.02 + 0.04 * seg(t, A.pero, A.cta)})`;
    this.ulab.style.opacity = E.expo(seg(t, A.pero + 0.4, A.pero + 0.8)) * lo;
    const dr = E.io(seg(t, A.leer - 0.1, A.programa + 0.3));
    tpath.style.strokeDasharray = this.tlen; tpath.style.strokeDashoffset = this.tlen * (1 - dr);
    tpath.style.opacity = 0.6;
    this.tp2.style.opacity = dr > 0.98 ? 0.9 : 0; this.tp2.style.strokeDashoffset = -t * 90;
    thread.style.opacity = lo;
    const ck = seg(t, A.aparece - 0.1, A.aparece + 0.5);
    const pt = tpath.getPointAtLength(this.tlen * E.io(ck));
    const land = E.back(seg(t, A.aparece + 0.45, A.aparece + 0.85)), lp = E.io(seg(t, A.aparece + 0.45, A.aparece + 0.85));
    const gone = E.io(seg(t, A.desaparece - 0.05, A.desaparece + 0.5));
    chip.style.opacity = (ck > 0 ? 1 : 0) * (1 - gone);
    chip.style.left = lerp(pt.x - 240, 250, lp) + 'px'; chip.style.top = lerp(pt.y - 66, 1000, lp) + 'px';
    chip.style.transform = `scale(${lerp(0.32, 1, clamp(land)) * (1 - 0.3 * gone)})`;
    chip.style.filter = `blur(${gone * 14}px)`;
  }
});
