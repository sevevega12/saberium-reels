// =====================================================================
//  05 · Sin chincheta
//  Mundo: maqueta de un barrio de noche vista desde arriba (cámara cenital
//  inclinada que baja y sube), farolas, coches, tejados con ventanas encendidas.
//  Pieza protagonista: chinchetas de cristal que caen y se clavan en la maqueta.
//  Todas las del barrio están; la tuya no. Al final cae, azul, en tu calle.
// =====================================================================

// ---------- anchors ----------
const A = {
  mapa: W(1, 'mapa').start, tu2: W(1, 'tu', 1).start, no1: W(1, 'no').start,
  l2: L(2).start, dos: W(2, 'dos').start, busca: W(2, 'busca').start, haces2: W(2, 'haces').start,
  mapa2: W(2, 'mapa').start, otros: W(2, 'otros').start,
  l3: L(3).start, existas: W(3, 'existas').start, google: W(3, 'google').start, claro: W(3, 'claro').start,
  donde: W(3, 'dónde').start, que: W(3, 'qué').start,
  l4: L(4).start, dir: W(4, 'dirección').start, barrio: W(4, 'barrio').start, serv: W(4, 'servicios').start,
  cuida: W(4, 'cuida').start, ficha: W(4, 'ficha').start, encuen: W(4, 'encuentren').start,
  cta: CTA.start,
};
A.dive = A.l3 - 0.25; A.up = A.l4 - 0.3; A.land = A.ficha + 0.32;
Object.entries(A).forEach(([k, v]) => Reel.anchor(k, v));

// ---------- music and sound marks ----------
const DROPS = [0.18, 0.46, 0.74, 1.0, 1.22, 1.48];
Reel.section(0, A.l2 - 0.2, 'tension');
Reel.section(A.l2 - 0.2, A.up, 'pulso');
Reel.section(A.up, CTA.end + 0.35, 'claro');
DROPS.forEach(t => Reel.hit(t, 'tick', 0.8));
Reel.hit(A.no1, 'thud', 0.8);
Reel.hit(A.l2 - 0.1, 'whoosh');
Reel.hit(A.busca, 'pluck');
Reel.hit(A.otros, 'knock', 0.8); Reel.hit(A.otros + 0.25, 'knock', 0.7); Reel.hit(A.otros + 0.5, 'knock', 0.6);
Reel.hit(A.dive, 'whoosh_rev');
Reel.hit(A.existas, 'hit', 0.7);
[A.claro, A.donde, A.que].forEach(t => Reel.hit(t, 'click', 0.8));
Reel.hit(A.up + 0.1, 'whoosh');
[A.dir, A.barrio, A.serv].forEach(t => Reel.hit(t, 'tick'));
Reel.hit(A.land, 'hit');
Reel.hit(A.encuen, 'rise', 0.7);

// ---------- the city model (plane coordinates, 1600 x 2200) ----------
const PW = 1600, PH = 2200, PITCH = 280, BLK = 220;
const S = [800, 1195];                       // your spot, on the pavement of C/ Mayor
const P = [380, 1520];                       // the person two streets away
const OTH = [[520, 915], [1080, 915], [520, 1475], [1080, 1475], [240, 1195], [1360, 1195]];
const LIT = [2, 0, 3];                       // the "other places" the map shows
const blocksX = [-2, -1, 0, 1, 2].map(k => 800 + k * PITCH);
const blocksY = [-3, -2, -1, 0, 1, 2, 3].map(m => 1100 + m * PITCH);
const streetsX = [100, 380, 660, 940, 1220, 1500], streetsY = [120, 400, 680, 960, 1240, 1520, 1800, 2080];

function citySVG() {
  const r = rng(505); let s = '';
  s += `<defs>
    <radialGradient id="lamp"><stop offset="0" stop-color="#ffd59a" stop-opacity=".55"/><stop offset=".45" stop-color="#ffb866" stop-opacity=".16"/><stop offset="1" stop-color="#ffb866" stop-opacity="0"/></radialGradient>
    <linearGradient id="roof" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#232c6e"/><stop offset="1" stop-color="#121844"/></linearGradient>
    <linearGradient id="roof2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a2f55"/><stop offset="1" stop-color="#151935"/></linearGradient>
  </defs>`;
  s += `<rect width="${PW}" height="${PH}" fill="#0c1030"/>`;
  // asphalt texture: lane marks
  streetsY.forEach(y => { s += `<line x1="0" y1="${y}" x2="${PW}" y2="${y}" stroke="rgba(255,236,200,.10)" stroke-width="2" stroke-dasharray="18 22"/>`; });
  streetsX.forEach(x => { s += `<line x1="${x}" y1="0" x2="${x}" y2="${PH}" stroke="rgba(255,236,200,.10)" stroke-width="2" stroke-dasharray="18 22"/>`; });
  blocksX.forEach(cx => blocksY.forEach(cy => {
    const x0 = cx - BLK / 2, y0 = cy - BLK / 2;
    s += `<rect x="${x0}" y="${y0}" width="${BLK}" height="${BLK}" rx="12" fill="#262a4a"/>`;            // pavement
    s += `<rect x="${x0 + 12}" y="${y0 + 12}" width="${BLK - 24}" height="${BLK - 24}" rx="6" fill="#06081c"/>`;
    if (cx === 800 && cy === 540) {                                                                         // a square with trees
      s += `<rect x="${x0 + 12}" y="${y0 + 12}" width="${BLK - 24}" height="${BLK - 24}" rx="6" fill="#0a1c22"/>`;
      for (let i = 0; i < 14; i++) { const tx = x0 + 34 + r() * 150, ty = y0 + 34 + r() * 150, tr = 14 + r() * 12;
        s += `<circle cx="${tx}" cy="${ty + 6}" r="${tr}" fill="rgba(0,0,0,.45)"/><circle cx="${tx}" cy="${ty}" r="${tr}" fill="#123a35"/><circle cx="${tx - tr * .3}" cy="${ty - tr * .3}" r="${tr * .45}" fill="#1d5248"/>`; }
      return;
    }
    if (cx === 800 && cy === 1100) {                                                                        // your building
      s += building(x0 + 16, y0 + 16, BLK - 32, BLK - 32, r, true); return;
    }
    // split the lot into 2-4 buildings
    const xs = r() < .5 ? [0, 1] : [0, .45 + r() * .2, 1], ys = r() < .6 ? [0, .5 + (r() - .5) * .2, 1] : [0, 1];
    for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < ys.length - 1; j++) {
      const bx = x0 + 16 + xs[i] * (BLK - 32), by = y0 + 16 + ys[j] * (BLK - 32);
      s += building(bx + 3, by + 3, (xs[i + 1] - xs[i]) * (BLK - 32) - 6, (ys[j + 1] - ys[j]) * (BLK - 32) - 6, r, false);
    }
  }));
  // street lamps
  streetsY.forEach(y => { for (let x = 60; x < PW; x += 140) s += `<circle cx="${x + 18}" cy="${y - 26}" r="58" fill="url(#lamp)"/><circle cx="${x + 18}" cy="${y - 26}" r="3.5" fill="#fff1d6"/>`; });
  streetsX.forEach(x => { for (let y = 40; y < PH; y += 140) s += `<circle cx="${x + 26}" cy="${y}" r="52" fill="url(#lamp)"/>`; });
  // street names printed on the model
  s += `<text x="560" y="1252" font-family="DejaVu Sans Mono" font-size="20" letter-spacing="6" fill="rgba(156,200,255,.55)">C/ MAYOR</text>`;
  s += `<text x="1010" y="1252" font-family="DejaVu Sans Mono" font-size="20" letter-spacing="6" fill="rgba(156,200,255,.35)">C/ MAYOR</text>`;
  s += `<text transform="translate(952 760) rotate(90)" font-family="DejaVu Sans Mono" font-size="18" letter-spacing="6" fill="rgba(156,200,255,.32)">C/ DEL HORNO</text>`;
  s += `<text transform="translate(392 1290) rotate(90)" font-family="DejaVu Sans Mono" font-size="18" letter-spacing="6" fill="rgba(156,200,255,.32)">C/ SAN JUAN</text>`;
  return s;
}
function building(x, y, w, h, r, mine) {
  const fh = Math.min(h * .28, 46);                     // south facade, seen because the camera leans
  let s = `<rect x="${x + 6}" y="${y + 8}" width="${w}" height="${h}" fill="rgba(0,0,0,.5)"/>`;
  s += `<rect x="${x}" y="${y + h - fh}" width="${w}" height="${fh}" fill="#0a0d26"/>`;
  // windows on the facade
  const cols = Math.max(2, Math.floor(w / 22));
  for (let i = 0; i < cols; i++) for (let j = 0; j < 2; j++) {
    const lit = r() < (mine ? 0 : .38); const warm = r() < .7;
    s += `<rect x="${x + 6 + i * (w - 12) / cols}" y="${y + h - fh + 8 + j * fh * .42}" width="${(w - 12) / cols - 6}" height="${fh * .26}" fill="${lit ? (warm ? 'rgba(255,205,140,.85)' : 'rgba(156,200,255,.7)') : 'rgba(30,36,80,.9)'}"/>`;
  }
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h - fh}" fill="url(#${r() < .5 ? 'roof' : 'roof2'})" stroke="rgba(156,200,255,.14)" stroke-width="1.5"/>`;
  // roof details: vents, skylights, water tanks
  const n = 1 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const dw = 12 + r() * 22, dh = 10 + r() * 16, dx = x + 8 + r() * Math.max(1, w - dw - 16), dy = y + 8 + r() * Math.max(1, h - fh - dh - 16);
    s += `<rect x="${dx + 3}" y="${dy + 4}" width="${dw}" height="${dh}" fill="rgba(0,0,0,.45)"/><rect x="${dx}" y="${dy}" width="${dw}" height="${dh}" rx="2" fill="#2e3878"/>`;
  }
  if (!mine && r() < .25) s += `<rect x="${x + w * .3}" y="${y + (h - fh) * .3}" width="${w * .3}" height="${(h - fh) * .25}" fill="rgba(255,205,140,.35)"/>`;
  return s;
}

// helpers to place things standing up on the plane
let TILT = 42, SC = 1;
function bb(parent, x, y, cls = '') { const d = el('div', 'bb ' + cls, parent); css(d, { left: x + 'px', top: y + 'px' }); return d; }
// (tiny numbers print as 1e-15, which CSS rejects: round them to 0)
function stand(d, extra = '') { d.style.transform = `translateZ(2px) rotateX(${-TILT}deg) ${extra}`.replace(/-?[\d.]+e-?\d+/g, '0'); }
function pinEl(parent, mine) {
  const p = el('div', 'pin' + (mine ? ' mine' : ''), parent);
  el('div', 'halo', p); el('div', 'needle', p); el('div', 'head', p); el('div', 'spec', p);
  return p;
}

// camera keys: [t, focusX, focusY, scale, tilt, dy]
const CAM = [
  [0, 800, 1150, 0.98, 42, -40],
  [A.no1 + 0.4, 800, 1160, 1.04, 42, -30],
  [A.l2 - 0.15, 800, 1160, 1.04, 42, -30],
  [A.l2 + 0.75, 620, 1330, 0.86, 40, 10],
  [A.dive, 640, 1310, 0.9, 40, 10],
  [A.dive + 0.95, 800, 1195, 1.85, 52, -60],
  [A.up, 800, 1195, 1.9, 52, -60],
  [A.up + 0.9, 800, 1180, 1.2, 46, 160],
  [A.encuen - 0.4, 800, 1180, 1.22, 46, 160],
  [A.encuen + 0.6, 700, 1260, 1.02, 44, 70],
];
function camAt(t) {
  let a = CAM[0], b = CAM[0];
  for (let i = 0; i < CAM.length; i++) { if (t >= CAM[i][0]) { a = CAM[i]; b = CAM[i + 1] || CAM[i]; } }
  const k = b === a ? 0 : E.io(seg(t, a[0], b[0]));
  return a.map((v, i) => lerp(v, b[i], k));
}

let cam, plane, cars = [], pins = [], shadows = [], ripples = [], ring, addr, me, meShadow, meRipple, ghost,
  pdot, ptag, radar, radar2, routes = [], myRoute, myBuildLit, tagsBB, anchorDot;
Reel.scene({
  name: 'ciudad', z: 1,
  build(root) {
    el('div', 'sky', root);
    cam = el('div', 'cam', root);
    plane = el('div', 'plane', cam);
    plane.innerHTML = `<svg width="${PW}" height="${PH}" viewBox="0 0 ${PW} ${PH}">${citySVG()}</svg>`;
    // your building: storefront and windows that light up on "existas"
    myBuildLit = el('div', 'mylit', plane);
    css(myBuildLit, { left: 706 + 'px', top: 1206 - 16 - 46 + 'px', width: 188 + 'px', height: 46 + 'px' });
    // route lines and radar (drawn on the ground)
    const rs = el('div', '', plane); css(rs, { left: 0, top: 0, width: PW + 'px', height: PH + 'px' });
    const path = (pts) => 'M' + pts.map(p => p.join(' ')).join(' L');
    const R = [
      [P, [380, 1475], [520, 1475]],
      [P, [380, 960], [520, 960], [520, 915]],
      [P, [940, 1520], [1080, 1520], [1080, 1475]],
    ];
    rs.innerHTML = `<svg width="${PW}" height="${PH}">${R.map(p => `<path d="${path(p)}" fill="none" stroke="#e8f0ff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1" opacity=".85"/>`).join('')}
      <path id="myr" d="${path([P, [380, 1240], [800, 1240], S])}" fill="none" stroke="#9CC8FF" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/></svg>`;
    routes = [...rs.querySelectorAll('path')].slice(0, 3); myRoute = rs.querySelector('#myr');
    radar = el('div', 'radar', plane); radar2 = el('div', 'radar', plane);
    // cars: two headlights each, moving along the streets
    [[1240, 0, 1, 90], [960, 1, 1, 70], [1520, 0, -1, 80], [660, 1, -1, 60], [940, 2, 1, 75], [1220, 2, -1, 65]].forEach(([line, dir, sgn, v], i) => {
      const c = el('div', 'car', plane); el('i', 'l1', c); el('i', 'l2', c); el('i', 'glow', c);
      cars.push({ c, line, dir, sgn, v, ph: i * 377 });
    });
    // empty ring where your pin should be
    ring = el('div', 'ring', plane); css(ring, { left: S[0] + 'px', top: S[1] + 'px' });
    // the other pins
    OTH.forEach(o => {
      const sh = el('div', 'pshadow', plane); css(sh, { left: o[0] + 'px', top: o[1] + 'px' }); shadows.push(sh);
      const rp = el('div', 'ripple', plane); css(rp, { left: o[0] + 'px', top: o[1] + 'px' }); ripples.push(rp);
      const b = bb(plane, o[0], o[1]); pins.push({ b, p: pinEl(b, false) });
    });
    // the person two streets away
    pdot = el('div', 'pdot', plane); css(pdot, { left: P[0] + 'px', top: P[1] + 'px' }); el('i', '', pdot); el('b', '', pdot);
    ptag = bb(plane, P[0], P[1]); const pt = el('div', 'ptag', ptag); el('div', 'a txt', pt, 'ALGUIEN · A 2 CALLES');
    // your pin (arrives at the end) and the ghost pin that hovers, unsure
    meShadow = el('div', 'pshadow big', plane); css(meShadow, { left: S[0] + 'px', top: S[1] + 'px' });
    meRipple = el('div', 'ripple big', plane); css(meRipple, { left: S[0] + 'px', top: S[1] + 'px' });
    me = bb(plane, S[0], S[1] + 4); pinEl(me, true);
    ghost = bb(plane, S[0], S[1] + 2); pinEl(ghost, true).classList.add('ghost');
    // address tag over the empty ring
    addr = bb(plane, S[0], S[1] - 2);
    const at = el('div', 'addr', addr); el('div', 'a txt', at, 'C/ Mayor, 14'); el('div', 'b txt', at, 'SIN CHINCHETA');
    // anchor for the question tags (screen-sized, standing at your spot)
    tagsBB = bb(plane, S[0], S[1]); anchorDot = el('div', 'adot', tagsBB);
  },
  update(t) {
    const [, fx, fy, sc, tilt, dy] = camAt(t);
    TILT = tilt; SC = sc;
    plane.style.transform = `translateY(${dy}px) rotateX(${tilt}deg) scale(${sc}) translate(${800 - fx}px,${1100 - fy}px)`;
    // cars
    cars.forEach(q => {
      const run = ((t * q.v * 4 + q.ph) % 1900) - 150;
      if (q.dir === 1) css(q.c, { left: q.line + 'px', top: (q.sgn > 0 ? run : PH - run) + 'px', transform: `rotate(${q.sgn > 0 ? 90 : -90}deg)` });
      else css(q.c, { left: (q.sgn > 0 ? run : PW - run) + 'px', top: q.line + (q.sgn > 0 ? 12 : -12) + 'px', transform: `rotate(${q.sgn > 0 ? 0 : 180}deg)` });
    });
    // the others' pins drop in the hook (one is already falling in the first frame)
    pins.forEach((q, i) => {
      const t0 = DROPS[i], k = seg(t, t0 - 0.42, t0);
      const fall = (1 - E.in2(k)) * 520, bounce = t > t0 ? Math.sin(seg(t, t0, t0 + 0.3) * Math.PI) * 18 : 0;
      const lit = LIT.indexOf(i) >= 0 ? E.expo(seg(t, A.otros + LIT.indexOf(i) * 0.25, A.otros + LIT.indexOf(i) * 0.25 + 0.4)) * (1 - seg(t, A.dive, A.dive + 0.6)) : 0;
      const dim = 0.55 * seg(t, A.encuen, A.encuen + 0.5);
      stand(q.b, `translateY(${-fall - bounce}px) scale(${1 + 0.18 * lit})`);
      q.b.style.opacity = (k > 0 ? 1 : 0) * (1 - dim);
      q.p.classList.toggle('lit', lit > 0.5);
      shadows[i].style.opacity = k * 0.8 * (1 - dim);
      const rk = seg(t, t0, t0 + 0.7);
      ripples[i].style.opacity = rk > 0 && rk < 1 ? 1 - rk : 0;
      ripples[i].style.transform = `translate(-50%,-50%) scale(${0.3 + 1.6 * E.out(rk)})`;
    });
    // empty ring: pulses from "Tu negocio", stays until your pin lands
    const rk = E.expo(seg(t, A.tu2 - 0.1, A.tu2 + 0.4)) * (1 - seg(t, A.land - 0.05, A.land + 0.1));
    ring.style.opacity = rk * (t > A.otros ? 0.5 : 1);
    ring.style.transform = `translate(-50%,-50%) scale(${1 + 0.08 * Math.sin(t * 5)})`;
    const ak = E.expo(seg(t, A.no1 - 0.1, A.no1 + 0.35)) * (1 - E.io(seg(t, A.l2 + 0.2, A.l2 + 0.6)));
    addr.style.opacity = ak; stand(addr, `translateY(${(1 - ak) * 30}px)`);
    // the person and the search radius
    const pk = E.expo(seg(t, A.dos - 0.15, A.dos + 0.35));
    const pOut = seg(t, A.dive, A.dive + 0.5), pBack = E.expo(seg(t, A.cuida, A.cuida + 0.5));
    pdot.style.opacity = pk * (1 - pOut) + pBack;
    pdot.style.transform = `translate(-50%,-50%) scale(${1 + 0.06 * Math.sin(t * 6)})`;
    ptag.style.opacity = pk * (1 - seg(t, A.otros + 0.9, A.otros + 1.3)); stand(ptag);
    const rad = (el_, t0) => { const k = seg(t, t0, t0 + 1.6); el_.style.opacity = k > 0 && k < 1 ? 0.9 * (1 - k) : 0;
      el_.style.transform = `translate(-50%,-50%) scale(${0.05 + E.out(k)})`; };
    rad(t < A.encuen - 0.5 ? radar : radar, t < A.encuen - 0.5 ? A.busca : A.encuen - 0.3);
    rad(radar2, t < A.encuen - 0.5 ? A.busca + 0.7 : A.encuen + 0.4);
    css(radar, { left: P[0] + 'px', top: P[1] + 'px' }); css(radar2, { left: P[0] + 'px', top: P[1] + 'px' });
    // routes to the other places, then (at the end) to yours
    routes.forEach((r, i) => {
      const t0 = A.otros + i * 0.25;
      r.setAttribute('stroke-dashoffset', 1 - E.io(seg(t, t0 - 0.1, t0 + 0.5)));
      r.style.opacity = 0.85 * (1 - seg(t, A.dive - 0.2, A.dive + 0.4));
    });
    myRoute.setAttribute('stroke-dashoffset', 1 - E.io(seg(t, A.encuen - 0.2, A.encuen + 0.8)));
    // your shop exists: the storefront lights up
    myBuildLit.style.opacity = E.expo(seg(t, A.existas - 0.1, A.existas + 0.5));
    // ghost pin: hovers, jumping between places (nobody is sure where you are)
    const spots = [[-150, -10], [130, -60], [40, 70], [-90, 50]];
    const g0 = A.google - 0.1, gIn = E.expo(seg(t, g0, g0 + 0.4));
    let gx = 0, gy = 0;
    if (t > g0) {
      const step = 0.62, n = Math.floor((t - g0) / step), f = E.expo(seg(t - g0 - n * step, 0, 0.35));
      const a = spots[n % 4], b = spots[(n + 1) % 4];
      gx = lerp(a[0], b[0], f); gy = lerp(a[1], b[1], f);
    }
    const settle = E.io(seg(t, A.cuida - 0.1, A.ficha));               // it stops hesitating and goes to your spot
    gx *= 1 - settle; gy *= 1 - settle;
    const hover = 130 + 12 * Math.sin(t * 4);
    const drop = E.in2(seg(t, A.ficha, A.land));
    css(ghost, { left: S[0] + gx + 'px', top: S[1] + 2 + gy + 'px' });
    stand(ghost, `translateY(${-hover * (1 - drop)}px)`);
    ghost.style.opacity = gIn * 0.55 * (1 - seg(t, A.ficha - 0.1, A.ficha + 0.1));
    // your pin: the ghost becomes solid and drops into C/ Mayor
    const vis = t > A.ficha - 0.1 ? 1 : 0;
    const bounce = t > A.land ? Math.sin(seg(t, A.land, A.land + 0.35) * Math.PI) * 26 : 0;
    me.style.opacity = vis * seg(t, A.ficha - 0.1, A.ficha + 0.1);
    stand(me, `translateY(${-hover * (1 - drop) - bounce}px) scale(1.15)`);
    meShadow.style.opacity = vis * (0.3 + 0.6 * drop);
    const mr = seg(t, A.land, A.land + 0.9);
    meRipple.style.opacity = mr > 0 && mr < 1 ? 1 - mr : 0;
    meRipple.style.transform = `translate(-50%,-50%) scale(${0.3 + 2.2 * E.out(mr)})`;
    me.querySelector('.pin').classList.toggle('glow', t > A.land);
    // question tags anchor: screen sized
    stand(tagsBB);
    cam.style.opacity = 1 - 0.35 * seg(t, A.cta - 0.4, A.cta + 0.3);
  }
});

// ---------- glass panel: map status in the hook, then the search ----------
let pan, rowA, rowB, srch, cnt, typed, caret;
Reel.scene({
  name: 'panel', z: 40,
  build(root) {
    pan = el('div', 'glass mpanel', root);
    rowA = el('div', 'grp', pan);
    el('div', 'lab txt', rowA, 'MAPA · SÁBADO 21:40');
    const r1 = el('div', 'row r1', rowA); this.t1 = el('div', 'box', r1); el('div', 'tx txt', r1, 'Tu calle');
    this.t1.innerHTML = '<svg width="30" height="26" viewBox="0 0 32 28"><path d="M3 15 L12 24 L29 4" fill="none" stroke="#04051C" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const r2 = el('div', 'row r2', rowA); this.t2 = el('div', 'box empty', r2); el('div', 'tx txt', r2, 'Tu negocio');
    this.no = el('div', 'no txt', r2, 'sin ubicar');
    srch = el('div', 'grp', pan);
    el('div', 'lab txt', srch, 'BÚSQUEDA · A 2 CALLES');
    const q = el('div', 'q', srch); el('div', 'ico', q, '<svg width="34" height="34" viewBox="0 0 24 24"><circle cx="10" cy="10" r="6.5" fill="none" stroke="#9CC8FF" stroke-width="2.4"/><path d="M15 15 L21 21" stroke="#9CC8FF" stroke-width="2.6" stroke-linecap="round"/></svg>');
    typed = el('div', 'qt txt', q, ''); caret = el('i', 'caret', q);
    const c = el('div', 'res', srch); cnt = el('div', 'n txt', c, '0'); el('div', 'u txt', c, 'sitios cerca');
  },
  update(t) {
    const out = E.io(seg(t, A.dive - 0.3, A.dive + 0.2));
    const inK = E.expo(seg(t, -0.2, 0.4));
    pan.style.opacity = inK * (1 - out);
    pan.style.transform = `translateY(${(1 - inK) * -30 - out * 40}px)`;
    // hook: the street ticks, your business stays empty
    const sw = E.io(seg(t, A.l2 - 0.2, A.l2 + 0.3));
    rowA.style.opacity = 1 - sw; srch.style.opacity = sw;
    rowA.style.transform = `translateY(${-sw * 30}px)`; srch.style.transform = `translateY(${(1 - sw) * 30}px)`;
    const tk = clamp(E.back(seg(t, A.mapa, A.mapa + 0.35)));
    this.t1.style.background = t > A.mapa ? '#9CC8FF' : ''; this.t1.querySelector('svg').style.transform = `scale(${tk})`;
    const nk = E.expo(seg(t, A.no1 - 0.05, A.no1 + 0.3));
    this.no.style.opacity = nk; this.no.style.transform = `translateX(${(1 - nk) * 30}px)`;
    this.t2.style.boxShadow = `inset 0 0 0 2px rgba(255,120,120,${0.25 + 0.55 * nk * (0.6 + 0.4 * Math.sin(t * 7))})`;
    // search: typed text, then the count of places eases up to 3
    const full = 'cerca de mí', n = Math.round(full.length * seg(t, A.busca, A.haces2 + 0.2));
    typed.textContent = full.slice(0, n);
    caret.style.left = 64 + typed.offsetWidth + 6 + 'px';
    caret.style.opacity = Math.floor(t * 3) % 2 ? 1 : 0.15;
    const v = lerp(0, 3, E.out5(seg(t, A.otros - 0.05, A.otros + 0.9)));
    cnt.textContent = Math.round(v);
    cnt.style.transform = `translateY(${(Math.round(v) - v) * 20}px)`;
  }
});

// ---------- question tags that become answers, and the real web ----------
const QS = [
  { q: '¿Dónde está?', a: 'Dirección', at: A.donde, fl: A.dir, from: [-356, -200] },
  { q: '¿En qué zona?', a: 'Barrio', at: A.claro, fl: A.barrio, from: [67, -311] },
  { q: '¿Qué hace?', a: 'Servicios', at: A.que, fl: A.serv, from: [-370, -89] },
];
let tags = [], ficha, web, wimg, sparks = [], tagsScr;
Reel.scene({
  name: 'datos', z: 45,
  build(root) {
    web = el('div', 'glass webcard', root);
    const bar = el('div', 'bar', web); [0, 1, 2].forEach(i => css(el('i', '', bar), { left: 18 + i * 20 + 'px' }));
    el('div', 'url txt', bar, Piezas.WEBS.amperiza.url);
    const sc = el('div', 'shot', web); wimg = el('img', '', sc); wimg.src = ASSET(Piezas.WEBS.amperiza.escritorio);
    tagsScr = el('div', 'tagscr', root);
    QS.forEach((d, i) => {
      const g = el('div', 'tag', tagsScr);
      const q = el('div', 'qq txt', g, d.q);
      const a = el('div', 'aa', g); const b = el('div', 'tk', a);
      b.innerHTML = '<svg width="24" height="20" viewBox="0 0 32 28"><path d="M3 15 L12 24 L29 4" fill="none" stroke="#04051C" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      el('div', 'at txt', a, d.a);
      tags.push({ g, q, a, d, jit: (i - 1) * 4 });
      sparks.push(el('div', 'spark', root));
    });
    ficha = el('div', 'tag', tagsScr);
    const a = el('div', 'aa', ficha); el('div', 'tk', a).innerHTML = tags[0].a.querySelector('.tk').innerHTML;
    el('div', 'at txt', a, 'Ficha al día'); a.style.opacity = 1;
  },
  update(t) {
    // web card: arrives where the map panel was, on "Una web bien hecha"
    const wk = E.expo(seg(t, A.l4 - 0.1, A.l4 + 0.6)), wout = E.in2(seg(t, A.cta - 0.5, A.cta));
    web.style.opacity = wk * (1 - wout);
    web.style.transform = `translateY(${(1 - wk) * -40}px) scale(${0.94 + 0.06 * wk})`;
    wimg.style.transform = `translateY(${-mv(t, A.l4 + 0.6, 5, 0, 60, E.io)}px)`;
    const tOut = E.in2(seg(t, A.cta - 0.5, A.cta));
    const ab = anchorDot.getBoundingClientRect(), kk = lerp(1.35, 1.15, seg(t, A.up, A.up + 0.9));
    css(tagsScr, { left: ab.left + 'px', top: ab.top + 'px', transform: `scale(${kk})` });
    tags.forEach((q, i) => {
      const inK = E.expo(seg(t, q.d.at - 0.1, q.d.at + 0.35));
      const mvK = E.io(seg(t, q.d.fl - 0.35, q.d.fl + 0.15));
      const slot = [52, -348 + i * 80];
      const wob = (1 - mvK) * 6 * Math.sin(t * 2.2 + i * 2);
      const x = lerp(q.d.from[0], slot[0], mvK), y = lerp(q.d.from[1], slot[1], mvK) + wob;
      // flip: question -> answer at its word
      const f = seg(t, q.d.fl - 0.05, q.d.fl + 0.25), half = f < 0.5;
      const sy = Math.abs(Math.cos(f * Math.PI));
      q.q.style.opacity = half ? 1 : 0; q.a.style.opacity = half ? 0 : 1;
      q.g.classList.toggle('ans', !half);
      css(q.g, { left: x + 'px', top: y + 'px', opacity: inK * (1 - tOut) });
      q.g.style.transform = `rotate(${(1 - mvK) * q.jit}deg) scaleY(${f > 0 && f < 1 ? Math.max(sy, 0.05) : 1}) scale(${0.85 + 0.15 * inK})`;
      // a spark travels from the web to the tag as it flips
      const sk = seg(t, q.d.fl - 0.4, q.d.fl);
      const sx0 = 300, sy0 = 700, sx1 = ab.left + (slot[0] + 20) * kk, sy1 = ab.top + (slot[1] + 32) * kk;
      css(sparks[i], { left: lerp(sx0, sx1, E.io(sk)) + 'px', top: lerp(sy0, sy1, E.io(sk)) - 60 * Math.sin(sk * Math.PI) + 'px', opacity: sk > 0 && sk < 1 ? 1 : 0 });
    });
    const fk = E.expo(seg(t, A.ficha - 0.1, A.ficha + 0.35));
    css(ficha, { left: 52 + (1 - fk) * 40 + 'px', top: -348 + 3 * 80 + 'px', opacity: fk * (1 - tOut) });
    ficha.classList.add('ans');
  }
});
