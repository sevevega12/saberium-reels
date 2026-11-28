// =====================================================================
//  11 · Solo Instagram
//  Mundo: galería comercial de día, luz cenital de claraboya, persianas y rótulos.
//  Pieza protagonista: el rótulo colgante (un perfil genérico, nunca la interfaz de
//  Instagram) que otro descuelga y cambia; al final, la web real atornillada en su sitio.
//  La cámara recorre la galería: fachada → directorio → fachada (paneo, sin cortes).
// =====================================================================

const A = {
  web1: W(1, 'web').start, tiene: W(1, 'tiene', 1).start, perfil1: W(1, 'perfil').start,
  ese: W(2, 'ese').start, tuyo: W(2, 'tuyo').start, normas: W(2, 'normas').start,
  pone: W(2, 'pone').start, otro: W(2, 'otro').start,
  cambiar: W(2, 'cambiar').start, sin: W(2, 'sin').start, avisarte: W(2, 'avisarte').start,
  ademas: L(3).start, busca: W(3, 'busca').start, fuera: W(3, 'fuera').start,
  encuentra: W(3, 'encuentra').start, horario: W(3, 'horario').start,
  haces: W(3, 'haces').start, llegar: W(3, 'llegar').start,
  web4: W(4, 'web').start, tuya: W(4, 'tuya').start, nombre: W(4, 'nombre').start,
  servicios: W(4, 'servicios').start, contacto: W(4, 'contacto').start,
  siempre: W(4, 'siempre').start, sitio: W(4, 'sitio').start,
  cta: CTA.start,
};
A.pan1 = A.busca - 0.1;            // camera leaves the shop front
A.pan2 = L(3).end + 0.75;          // camera comes back, carrying your card
Object.entries(A).forEach(([k, v]) => Reel.anchor(k, v));

// ---------- music and sound marks ----------
Reel.section(0, A.ese - 0.25, 'tension');
Reel.section(A.ese - 0.25, A.pan2, 'pulso');
Reel.section(A.pan2, CTA.end + 0.35, 'claro');
Reel.hit(A.web1, 'knock');
Reel.hit(A.tiene - 0.05, 'whoosh');
Reel.hit(A.tuyo, 'thud', 0.8);
Reel.hit(A.normas, 'whoosh');
const TOG = [A.normas + 0.32, A.pone + 0.05, A.otro + 0.1];
TOG.forEach(t => Reel.hit(t, 'tick'));
Reel.hit(A.cambiar, 'whoosh_rev');
Reel.hit(A.sin + 0.35, 'thud');
Reel.hit(A.pan1, 'whoosh');
Reel.hit(A.encuentra, 'click');
[A.horario, A.haces, A.llegar].forEach(t => Reel.hit(t, 'knock'));
Reel.hit(A.pan2, 'whoosh_rev');
Reel.hit(A.web4, 'hit');
const BOLTS = [A.tuya - 0.1, A.tuya + 0.04, A.tuya + 0.18, A.tuya + 0.32];
BOLTS.forEach(t => Reel.hit(t + 0.25, 'click', 0.8));
[A.nombre, A.servicios, A.contacto].forEach(t => Reel.hit(t, 'tick'));
Reel.hit(A.cta - 0.3, 'rise');

// ---------- camera ----------
const PANX = -1170;
function cam(t) {
  const out = E.io(seg(t, A.pan1, A.pan1 + 0.95));
  const back = E.io(seg(t, A.pan2, A.pan2 + 1.0));
  const panX = PANX * out * (1 - back);
  const pull = E.io(seg(t, A.tiene - 0.05, A.tiene + 0.8));              // close-up -> shop front
  const wide = E.io(seg(t, A.siempre, A.siempre + 1.6));                 // "siempre en el mismo sitio"
  let zoom = lerp(1.22, 1.0, pull) - 0.05 * wide;
  zoom -= 0.04 * Math.sin(Math.PI * seg(t, A.pan1, A.pan1 + 0.95)) + 0.04 * Math.sin(Math.PI * seg(t, A.pan2, A.pan2 + 1.0));
  const dx = Math.sin(t * .21) * 8, dy = Math.cos(t * .17) * 6 + lerp(70, 0, pull);
  return { panX, zoom, dx, dy };
}

// ---------- the gallery world ----------
let world, back, sign, hang, owner, normas, spot, holes = [], slab, dirS = {}, webp = {}, chips = [], beams = [], motes = [];
Reel.scene({
  name: 'galeria', z: 5,
  build(root) {
    const r = rng(11);
    world = el('div', 'world', root);
    // back layer (slower parallax): ceiling with skylights, far wall, corridor, shutters
    back = el('div', 'world', world);
    el('div', 'ceil', back);
    for (let i = 0; i < 6; i++) { const s = el('div', 'sky', back); css(s, { left: (-160 + i * 470) + 'px', width: '380px' }); }
    el('div', 'backwall', back);
    const cor = el('div', 'corridor', back); css(cor, { left: '980px', top: '380px', width: '820px', height: '1020px' });
    for (let i = 0; i < 7; i++) {
      const k = Math.pow(0.82, i), w = 300 * k, h = 420 * k, y = 300 - h * 0.25;
      const fl = el('div', 'far', cor); css(fl, { left: (40 + (1 - k) * 330) + 'px', top: y + 'px', width: w * 0.42 + 'px', height: h + 'px', opacity: .75 * k });
      const fr = el('div', 'far', cor); css(fr, { left: (780 - (1 - k) * 330 - w * 0.42) + 'px', top: y + 'px', width: w * 0.42 + 'px', height: h + 'px', opacity: .75 * k });
      const lp = el('div', 'lamp', cor); css(lp, { left: (402) + 'px', top: (60 + (1 - k) * 160) + 'px', transform: `scale(${k})` });
    }
    [[-330, 300], [1830, 360], [2230, 360]].forEach(([x, w]) => {
      const sb = el('div', 'sbar', back); css(sb, { left: x + 'px', top: '470px', width: w + 'px', height: '60px' });
      css(el('i', '', sb), { width: w * 0.5 + 'px' });
      const sh = el('div', 'shutter', back); css(sh, { left: x + 'px', top: '550px', width: w + 'px', height: '840px' });
    });
    // floor (full speed)
    const fl = el('div', 'floor', world); el('div', 'tz', fl); el('div', 'joint', fl);
    const rf = el('div', 'refl', fl); css(rf, { left: '440px', width: '780px', background: 'linear-gradient(180deg,rgba(156,200,255,.35),transparent)' });
    const rf2 = el('div', 'refl', fl); css(rf2, { left: '1460px', width: '900px', background: 'linear-gradient(180deg,rgba(10,34,241,.45),transparent)' });
    // pillar between the shop and the corridor
    const pl = el('div', 'pillar', world); css(pl, { left: '1066px', top: '360px', width: '120px', height: '1040px' });
    // your shop front
    const fc = el('div', 'facade', world); el('div', 'lip', fc);
    spot = el('div', 'spot', fc);
    [[26, 26], [812, 26], [26, 467], [812, 467]].forEach(([x, y]) => { const h = el('i', 'hole', spot); css(h, { left: x + 'px', top: y + 'px' }); holes.push(h); });
    slab = el('div', 'slab txt', spot, 'SIN RÓTULO PROPIO');
    const vt = el('div', 'vitrina', fc); const ins = el('div', 'inside', vt);
    for (let i = 0; i < 14; i++) {
      const d = el('i', '', ins); const s = 30 + r() * 70;
      css(d, { left: r() * 820 + 'px', top: 110 + r() * 200 + 'px', width: s + 'px', height: s + 'px',
        background: r() < .6 ? 'rgba(255,214,160,.55)' : 'rgba(156,200,255,.45)' });
    }
    for (let i = 0; i < 3; i++) css(el('div', 'streak', vt), { left: (90 + i * 300) + 'px' });
    el('div', 'roll', vt); el('div', 'door', vt); el('div', 'handle', vt);
    // the rail and the hanging profile sign
    const rail = el('div', 'rail', world);
    css(el('i', '', rail), { left: '40px' }); css(el('i', '', rail), { left: '680px' });
    hang = el('div', 'hang', world);
    css(el('div', 'chain', hang), { left: '70px' }); css(el('div', 'chain', hang), { left: '520px' });
    sign = el('div', 'sign', hang);
    const av = el('div', 'av', sign); const ai = el('i', '', av); el('b', '', ai); el('s', '', ai);
    el('div', 'hd txt', sign, '@tu.negocio');
    el('div', 'tag txt', sign, 'PERFIL · 9 FOTOS');
    [0, 1].forEach(i => css(el('div', 'bio', sign), { top: (176 + i * 26) + 'px', width: (i ? 240 : 360) + 'px' }));
    const TILES = [
      ['#c98b4a', '#f0c58a', 50, 55], ['#3b2a26', '#a06a4a', 45, 40], ['#a8566a', '#f2a7b5', 60, 50],
      ['#355e52', '#8cc0a8', 40, 60], ['#d9b49a', '#fff0e2', 55, 45], ['#5d6588', '#c7cde8', 50, 50]];
    TILES.forEach((c, i) => {
      const tl = el('div', 'tile', sign); css(tl, { left: (30 + (i % 3) * 184) + 'px', top: (232 + Math.floor(i / 3) * 154) + 'px', height: '142px',
        background: `linear-gradient(160deg,${c[0]},${c[1]})` });
      const o = el('i', '', tl); css(o, { left: c[2] + 'px', top: c[3] + 'px', width: '78px', height: '62px', background: `radial-gradient(circle at 40% 35%,${c[1]},${c[0]} 70%)`, boxShadow: '0 10px 18px rgba(0,0,0,.25)' });
    });
    el('div', 'sheen', sign);
    sign._stamp = el('div', 'stamp txt', sign, 'CAMBIADO SIN AVISO');
    sign._txt = [...sign.querySelectorAll('.txt')];
    // owner tag on the rail
    owner = el('div', 'owner', world); el('div', 'str', owner);
    const oc = el('div', 'card', owner); el('div', 'txt', oc, 'LAS NORMAS<br>LAS PONE OTRO');
    // rules panel
    normas = el('div', 'normas glass', world);
    el('div', 'lab txt', normas, 'NORMAS DEL PERFIL');
    normas._rows = ['Qué se ve', 'Quién lo ve', 'Cuándo cambia'].map((s, i) => {
      const rw = el('div', 'row', normas); rw.style.top = (86 + i * 78) + 'px';
      el('div', 'tx txt', rw, s); const sw = el('div', 'sw', rw); const k = el('i', '', sw);
      return { sw, k };
    });
    // the gallery directory (a totem in the corridor)
    const tm = el('div', 'totem', world); dirS.tm = tm;
    css(el('div', 'post', tm), { left: '220px' }); css(el('div', 'post', tm), { left: '674px' });
    el('div', 'frame', tm);
    const dir = el('div', 'dir glass', tm); dirS.dir = dir;
    el('div', 'lab txt', dir, 'DIRECTORIO · GALERÍA');
    const sb = el('div', 'search', dir);
    sb.insertAdjacentHTML('beforeend', '<svg width="40" height="40" viewBox="0 0 40 40"><circle cx="17" cy="17" r="11" fill="none" stroke="#9CC8FF" stroke-width="4"/><path d="M26 26 L36 36" stroke="#9CC8FF" stroke-width="4" stroke-linecap="round"/></svg>');
    dirS.q = el('div', 'q txt', sb, ''); dirS.caret = el('i', 'caret', sb);
    dirS.res = [['LOCAL 06', 'Óptica'], ['LOCAL 07', 'Tu negocio'], ['LOCAL 08', 'Floristería']].map((x, i) => {
      const rw = el('div', 'res' + (i === 1 ? ' me' : ''), dir); rw.style.top = (206 + i * 96) + 'px';
      el('div', 'n txt', rw, x[0]); el('div', 't txt', rw, x[1]); return rw;
    });
    dirS.fld = ['HORARIO', 'QUÉ HACE', 'CÓMO LLEGAR'].map((k, i) => {
      const f = el('div', 'fld', dir); f.style.top = (506 + i * 96) + 'px';
      const kk = el('div', 'k txt', f, k); el('i', 'dash', f); const qm = el('div', 'qm txt', f, '?');
      return { f, kk, qm };
    });
    // your web: the card lifts out of the directory and is screwed to the shop front
    webp.el = el('div', 'webp', world);
    const bar = el('div', 'bar', webp.el);
    [22, 44, 66].forEach(x => css(el('i', '', bar), { left: x + 'px' }));
    webp.url = el('div', 'url txt', bar, 'atlantischarter.com');
    const shot = el('div', 'shot', webp.el); const img = el('img', '', shot); img.src = ASSET(Piezas.WEBS.atlantis.escritorio);
    webp.hl = [[396, 4, 72, 36], [82, 6, 152, 32], [100, 66, 660, 44]].map(([x, y, w, h]) => {
      const b = el('i', 'hl', shot); css(b, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' }); return b;
    });
    webp.shot = shot; webp.img = img;
    webp.blank = el('div', 'blank', webp.el);
    webp.bolts = [[10, 10], [806, 10], [10, 461], [806, 461]].map(([x, y]) => {
      const b = el('div', 'bolt', world); el('b', '', b); el('b', '', b).style.transform = 'rotate(90deg)'; b._x = 110 + x; b._y = 500 + y; return b;
    });
    const CH = [['NOMBRE', 130], ['SERVICIOS', 386], ['CONTACTO', 697]];
    chips = CH.map(([s, x]) => {
      const c = el('div', 'chipw txt', world, s); css(c, { left: x + 'px', top: '1048px' });
      const ck = el('i', 'ck', c); ck.innerHTML = '<svg width="26" height="22" viewBox="0 0 26 22"><path d="M2 12 L9 19 L24 3" fill="none" stroke="#04051C" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      return c;
    });
  },
  update(t) {
    const c = cam(t);
    world.style.transform = `translate(${c.panX + c.dx}px,${c.dy}px) scale(${c.zoom})`;
    back.style.transform = `translateX(${-0.45 * c.panX}px)`;

    // --- empty spot for a sign of your own: the four holes flash on "web"
    const fl = inout(t, A.web1 - 0.05, A.web1 + 0.6, .15, .5);
    holes.forEach(h => h.style.boxShadow = `0 0 0 3px rgba(156,200,255,${.2 + .8 * fl}),0 0 ${30 * fl}px rgba(156,200,255,${fl})`);
    slab.style.opacity = inout(t, A.cambiar + 0.35, A.sin + 0.25, .3, .25);

    // --- the hanging sign: swings from frame 0, pulled up on "cambiar", dropped back changed
    const up1 = E.in2(seg(t, A.cambiar, A.cambiar + 0.45));
    const down = E.out(seg(t, A.sin + 0.05, A.sin + 0.4));
    const up2 = E.in2(seg(t, A.pan2 - 0.2, A.pan2 + 0.3));
    const changed = t >= A.sin + 0.05;
    const yUp = changed ? lerp(-1150, 0, down) - 1250 * up2 : -1150 * up1;
    const swing = 7 * Math.exp(-t * 0.55) * Math.sin(t * 2.4 + 0.6) + 1.2 * Math.sin(t * 1.3)
      + (changed ? 6 * Math.exp(-(t - A.sin - 0.4) * 1.4) * Math.sin((t - A.sin) * 6) * (t > A.sin + 0.4 ? 1 : 0) : 0);
    const sc = changed ? 0.8 : 1, rot = changed ? 8 : 0;
    hang.style.transform = `translate(${changed ? 70 : 0}px,${yUp}px) rotate(${swing + rot}deg) scale(${sc})`;
    hang.style.display = up2 >= 1 ? 'none' : 'block';
    sign._txt.forEach(e => e.style.visibility = yUp < -60 ? 'hidden' : 'visible');
    sign.style.filter = changed ? 'grayscale(.85) brightness(.82) contrast(.9)' : `brightness(${1 - 0.15 * inout(t, A.normas, A.cambiar, .4, .3)})`;
    const stK = clamp(E.back(seg(t, A.avisarte + 0.1, A.avisarte + 0.45)));
    sign._stamp.style.opacity = changed ? seg(t, A.avisarte + 0.1, A.avisarte + 0.2) : 0;
    sign._stamp.style.transform = `rotate(-9deg) scale(${lerp(1.6, 1, stK)})`;

    // --- owner tag drops onto the rail on "tuyo"
    const ok = E.out(seg(t, A.tuyo - 0.05, A.tuyo + 0.35));
    owner.style.opacity = seg(t, A.tuyo - 0.05, A.tuyo + 0.1) * (up1 > 0.08 ? 0 : 1);
    owner.style.transform = `translateY(${(1 - ok) * -120 - 1150 * up1}px) rotate(${(1 - ok) * 25 + 5 * Math.exp(-(t - A.tuyo) * 1.5) * Math.sin((t - A.tuyo) * 7) * (t > A.tuyo ? 1 : 0)}deg)`;
    owner.style.display = up1 >= 1 ? 'none' : 'block';

    // --- rules panel: three switches flip by themselves
    const nk = E.expo(seg(t, A.normas - 0.1, A.normas + 0.45)), no = E.in2(seg(t, A.cambiar - 0.15, A.cambiar + 0.25));
    normas.style.opacity = nk * (1 - no);
    normas.style.transform = `translateX(${(1 - nk) * 380 + no * 420}px) rotate(${(1 - nk) * 4}deg)`;
    normas._rows.forEach((q, i) => {
      const k = E.back(seg(t, TOG[i], TOG[i] + 0.3));
      q.k.style.transform = `translateX(${clamp(k, 0, 1.08) * 40}px)`;
      q.sw.style.background = k > 0.5 ? 'rgba(156,200,255,.18)' : '#0A22F1';
      q.sw.style.boxShadow = k > 0.5 ? 'inset 0 0 0 2px rgba(156,200,255,.4)' : 'inset 0 0 0 2px #9CC8FF';
    });

    // --- directory: someone searches you outside the profile
    dirS.tm.style.display = c.panX < -250 ? 'block' : 'none';
    const Q = 'tu negocio';
    const n = Math.round(Q.length * seg(t, A.pan1 + 0.45, A.pan1 + 1.25));
    dirS.q.textContent = Q.slice(0, n);
    dirS.caret.style.left = 88 + dirS.q.offsetWidth + 6 + 'px';
    dirS.caret.style.opacity = Math.floor(t * 2.4) % 2 ? 0.25 : 1;
    const lift = seg(t, A.pan2, A.pan2 + 0.05) > 0 ? 1 : 0;
    dirS.res.forEach((rw, i) => {
      const k = E.expo(seg(t, A.pan1 + 1.3 + i * 0.12, A.pan1 + 1.75 + i * 0.12));
      rw.style.opacity = k * (i === 1 && lift ? 0 : 1); rw.style.transform = `translateY(${(1 - k) * 30}px)`;
    });
    [A.horario, A.haces, A.llegar].forEach((t0, i) => {
      const f = dirS.fld[i];
      const k = E.expo(seg(t, A.encuentra + i * 0.12, A.encuentra + 0.45 + i * 0.12));
      f.f.style.opacity = k * (lift ? 0 : 1); f.f.style.transform = `translateY(${(1 - k) * 30}px)`;
      const p = clamp(E.back(seg(t, t0, t0 + 0.35)));
      const on = t >= t0;
      f.qm.style.transform = `scale(${on ? lerp(0.6, 1, p) + 0.25 * (1 - seg(t, t0 + 0.35, t0 + 0.9)) : 0.6})`;
      f.qm.style.background = on ? '#0A22F1' : 'rgba(156,200,255,.12)';
      f.qm.style.color = on ? '#fff' : '#9CC8FF';
      f.kk.style.color = on ? '#fff' : '#9CC8FF';
    });

    // --- your web: the card flies from the directory to the empty spot and is screwed in
    const fk = E.io(seg(t, A.pan2, A.pan2 + 1.0));
    const fromX = 1250 + 22 + 40, fromY = 440 + 22 + 302, fromW = 796, fromH = 584;
    webp.el.style.display = t >= A.pan2 ? 'block' : 'none';
    css(webp.el, { left: lerp(fromX, 110, fk) + 'px', top: lerp(fromY, 500, fk) + 'px', width: lerp(fromW, 860, fk) + 'px', height: lerp(fromH, 515, fk) + 'px' });
    webp.el.style.transform = `scale(${1 + 0.06 * Math.sin(Math.PI * fk)})`;
    webp.blank.style.opacity = 1 - E.io(seg(t, A.web4 - 0.1, A.web4 + 0.4));
    webp.img.style.transform = `scale(${1 + 0.03 * seg(t, A.web4, A.sitio + 1.5)})`;
    webp.img.style.transformOrigin = '50% 0';
    webp.bolts.forEach((b, i) => {
      const k = E.out(seg(t, BOLTS[i], BOLTS[i] + 0.4));
      css(b, { left: b._x + 'px', top: b._y + 'px' });
      b.style.opacity = seg(t, BOLTS[i], BOLTS[i] + 0.08);
      b.style.transform = `scale(${lerp(1.8, 1, k)}) rotate(${lerp(-300, 0, k)}deg)`;
    });
    [A.nombre, A.servicios, A.contacto].forEach((t0, i) => {
      const k = clamp(E.back(seg(t, t0 - 0.05, t0 + 0.35)));
      const hk = E.out(seg(t, t0 - 0.05, t0 + 0.25));
      const settle = 1 - 0.45 * seg(t, t0 + 0.9, t0 + 1.4);
      webp.hl[i].style.opacity = hk * settle;
      webp.hl[i].style.transform = `scale(${lerp(1.3, 1, hk)})`;
      chips[i].style.opacity = seg(t, t0 - 0.05, t0 + 0.1);
      chips[i].style.transform = `translateY(${(1 - k) * 40}px) scale(${0.85 + 0.15 * k})`;
    });
  }
});

// ---------- daylight from the skylights: beams and dust (time-lapse on "siempre") ----------
Reel.scene({
  name: 'luz', z: 40,
  build(root) {
    const r = rng(5);
    [[180, 300, -16], [560, 260, -12], [900, 340, -18]].forEach(([x, w, a]) => {
      const b = el('div', 'beam', root); css(b, { left: x + 'px', top: '-120px', width: w + 'px', height: '1900px' });
      beams.push({ b, a, x });
    });
    for (let i = 0; i < 26; i++) {
      const m = el('i', 'mote', root);
      motes.push({ m, x: r() * 1080, y: 300 + r() * 1100, sp: 6 + r() * 14, ph: r() * 6 });
    }
  },
  update(t) {
    const c = cam(t);
    const sweep = E.io(seg(t, A.siempre - 0.2, A.cta - 0.2));       // the sun moves; the web stays
    beams.forEach((q, i) => {
      const a = q.a + sweep * 30 + Math.sin(t * .3 + i) * 1.5;
      q.b.style.transform = `translateX(${0.3 * c.panX + sweep * -260}px) rotate(${a}deg)`;
      q.b.style.opacity = 0.85 - 0.35 * sweep + 0.25 * Math.sin(Math.PI * sweep);
    });
    motes.forEach(q => {
      const y = ((q.y - t * q.sp) % 1100 + 1100) % 1100 + 300;
      q.m.style.transform = `translate(${q.x + Math.sin(t * .7 + q.ph) * 18 + 0.3 * c.panX}px,${y}px)`;
      q.m.style.opacity = 0.5 + 0.4 * Math.sin(t * 1.3 + q.ph);
    });
    this.root.style.opacity = 1 - 0.6 * seg(t, A.cta - 0.4, A.cta + 0.3);
  }
});
