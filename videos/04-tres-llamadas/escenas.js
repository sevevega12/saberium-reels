// =====================================================================
//  04 · Tres llamadas perdidas
//  Mundo: mostrador de madera de una tienda a media mañana, luz de escaparate.
//  Pieza protagonista: contador de llamadas perdidas que rueda como un cuentakilómetros
//  (Piezas.Rodillo) y el móvil boca abajo que vibra, se da la vuelta y se tumba
//  para enseñar la web real de Atlantis Charters con su botón de reservar.
// =====================================================================

// ---------- anchors ----------
const A = {
  r2: 0.82, r3: 1.62,                         // the 2nd and 3rd buzz of the hook
  foco: L(2).start - 0.25, manos: W(2, 'manos').start, ocup: W(2, 'ocupadas').start, parar: W(2, 'parar').start,
  cuando: W(2, 'cuando').start, miraste: W(2, 'miraste').start,
  n1: W(2, 'tres').start, n2: W(2, 'llamadas').start + 0.15, n3: W(2, 'perdidas').start + 0.1,
  ningun: W(2, 'ningún').start,
  quien: L(3).start, noEsp: W(3, 'no').start, reserva: W(3, 'reserva').start, primera: W(3, 'primera').start,
  con: L(4).start, elige: W(4, 'elige').start, hueco: W(4, 'hueco').start, cualq: W(4, 'cualquier').start,
  mientras: W(4, 'mientras').start, trab: W(4, 'trabajando').start,
  cta: CTA.start,
};
A.k1 = A.hueco; A.k2 = A.cualq - 0.05; A.k3 = A.mientras + 0.35;
Object.entries(A).forEach(([k, v]) => Reel.anchor(k, v));

// ---------- music and sound marks ----------
Reel.section(0, A.foco, 'tension');
Reel.section(A.foco, A.reserva - 0.2, 'pulso');
Reel.section(A.reserva - 0.2, CTA.end + 0.35, 'claro');
[0.02, A.r2, A.r3].forEach(t => Reel.hit(t, 'knock', 0.9));
Reel.hit(A.foco + 0.1, 'whoosh');
Reel.hit(A.ocup, 'thud', 0.6);
Reel.hit(A.miraste - 0.3, 'whoosh_rev');
[A.n1, A.n2, A.n3].forEach(t => Reel.hit(t, 'knock', 0.8));
Reel.hit(A.noEsp, 'whoosh', 0.7);
Reel.hit(A.reserva, 'hit');
Reel.hit(A.primera, 'click');
Reel.hit(A.con + 0.1, 'whoosh');
[A.k1, A.k2, A.k3].forEach(t => Reel.hit(t, 'tick'));
Reel.hit(A.cta - 0.3, 'rise');

// ---------- the shop: wall, window, shelves, counter, light ----------
let shop, dust = [];
Reel.scene({
  name: 'tienda', z: 1,
  build(root) {
    const r = rng(44);
    shop = el('div', 'shop', root);
    el('div', 'wall', shop); el('div', 'win', shop);
    [[880, 60, 22, 760], [760, 420, 520, 20]].forEach(m => css(el('div', 'mull', shop), { left: m[0] + 'px', top: m[1] + 'px', width: m[2] + 'px', height: m[3] + 'px' }));
    [210, 470, 700].forEach((y, si) => {
      el('div', 'shelf', shop).style.top = y + 'px';
      let x = 60;
      while (x < 620) {
        const w = 50 + r() * 70, h = 70 + r() * 110;
        const tone = ['#c8955a', '#7b4a2a', '#d9b98a', '#5a6a8a', '#a8603a', '#e3d2b0'][Math.floor(r() * 6)];
        css(el('div', 'jar', shop), { left: x + 'px', top: y - h + 'px', width: w + 'px', height: h + 'px',
          background: `linear-gradient(160deg,${tone},rgba(20,10,5,.85))`, opacity: .55 + r() * .35 });
        x += w + 10 + r() * 30;
      }
    });
    el('div', 'counter', shop); el('div', 'edge', shop); el('div', 'pool', shop); el('div', 'beam', shop);
    const dd = el('div', 'dust', shop);
    for (let i = 0; i < 40; i++) {
      const d = el('i', '', dd), s = 3 + r() * 6;
      css(d, { width: s + 'px', height: s + 'px' });
      dust.push({ d, x: 480 + r() * 600, y: r() * 1500, v: 6 + r() * 14, ph: r() * 6 });
    }
  },
  update(t) {
    // slow handheld drift; a gentle push in while the story tightens
    const push = 1.03 + 0.03 * seg(t, 0, A.cta);
    shop.style.transform = `translate(${Math.sin(t * .21) * 12}px,${Math.cos(t * .16) * 9}px) scale(${push})`;
    // rack focus: the shop softens while the parcel or the screen is the subject
    const soft = 2 + 4 * inout(t, A.foco, A.cuando, .6, .6) + 3 * seg(t, A.miraste, A.miraste + 0.8);
    shop.style.filter = `blur(${soft}px)`;
    dust.forEach(p => { p.d.style.left = p.x + Math.sin(t * .5 + p.ph) * 30 + 'px'; p.d.style.top = (p.y - t * p.v + 1600) % 1600 + 'px'; p.d.style.opacity = .3 + .3 * Math.sin(t + p.ph); });
  }
});

// ---------- the parcel being wrapped (the busy hands, without hands) ----------
let parcel, tape, twA, twB, lab;
Reel.scene({
  name: 'paquete', z: 40,
  build(root) {
    parcel = el('div', 'parcel', root);
    parcel.innerHTML = `<svg width="760" height="620" viewBox="0 0 760 620">
      <defs>
        <linearGradient id="kt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9ac74"/><stop offset="1" stop-color="#b8844c"/></linearGradient>
        <linearGradient id="kf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a87444"/><stop offset="1" stop-color="#7c5230"/></linearGradient>
        <linearGradient id="kl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6f4826"/><stop offset="1" stop-color="#8f6138"/></linearGradient>
        <filter id="fib"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="8"/><feColorMatrix values="0 0 0 0 .35 0 0 0 0 .2 0 0 0 0 .08 0 0 0 .22 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
      </defs>
      <ellipse cx="420" cy="590" rx="360" ry="40" fill="rgba(20,8,2,.55)" filter="blur(6px)"/>
      <g id="box">
        <polygon points="140,170 270,320 270,600 140,440" fill="url(#kl)"/>
        <polygon points="270,320 720,250 720,520 270,600" fill="url(#kf)"/>
        <polygon points="140,170 580,120 720,250 270,320" fill="url(#kt)"/>
        <polygon points="140,170 580,120 720,250 270,320" fill="#000" filter="url(#fib)"/>
        <polygon points="270,320 720,250 720,520 270,600" fill="#000" filter="url(#fib)" opacity=".8"/>
        <line x1="270" y1="320" x2="720" y2="250" stroke="rgba(255,230,190,.35)" stroke-width="2"/>
      </g>
      <line id="tape" x1="360" y1="145" x2="495" y2="285" stroke="rgba(236,222,190,.78)" stroke-width="64" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/>
      <path id="twA" d="M205 245 L650 185 L650 400" fill="none" stroke="#efe3c6" stroke-width="6" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/>
      <path id="twB" d="M360 145 L495 285 L495 560" fill="none" stroke="#efe3c6" stroke-width="6" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/>
    </svg>`;
    tape = parcel.querySelector('#tape'); twA = parcel.querySelector('#twA'); twB = parcel.querySelector('#twB');
    lab = el('div', 'label', parcel);
    el('div', 'l1 txt', lab, 'PEDIDO 0412'); el('div', 'l2 txt', lab, 'Recoger 12:30'); el('div', 'bars', lab);
  },
  update(t) {
    // hook: big and blurred in the foreground; on "manos ocupadas" it rises into focus
    const up = E.io(seg(t, A.foco, A.foco + 0.8));
    const down = E.in2(seg(t, A.cuando - 0.1, A.cuando + 0.55));
    const back = E.expo(seg(t, A.mientras - 0.1, A.mientras + 0.7));      // returns at "mientras tú sigues trabajando"
    const out = seg(t, A.cta - 0.5, A.cta);
    let y = lerp(260, -400, up) + down * 700, sc = lerp(1.0, 1.12, up), blur = lerp(9, 0, up) + down * 8, op = 1;
    if (t > A.cuando + 0.6) { y = lerp(760, 140, back); sc = 1.05; blur = lerp(12, 4, back); op = back * (1 - out); }
    parcel.style.transform = `translate(${lerp(-60, 170, up * (1 - down))}px,${y}px) scale(${sc}) rotate(${lerp(-4, 0, up)}deg)`;
    parcel.style.filter = `blur(${blur}px)`;
    parcel.style.opacity = op;
    // tape pulled across, then the string tied both ways
    const tp = E.out(seg(t, A.manos - 0.05, A.ocup + 0.3));
    tape.setAttribute('stroke-dashoffset', 1 - tp);
    twA.setAttribute('stroke-dashoffset', 1 - E.io(seg(t, A.ocup + 0.35, A.parar)));
    twB.setAttribute('stroke-dashoffset', 1 - E.io(seg(t, A.parar - 0.2, A.parar + 0.7)));
    lab.style.opacity = clamp((up - 0.75) * 4) * (1 - clamp(down * 4));
  }
});

// ---------- the phone: face down, buzzing; it flips, then lies sideways with the web ----------
let ph, phw, shadow, tm, dt, notis = [], nomsg, webl, webimg, tap, lock;
const CALLS = ['11:42', '11:45', '11:49'];
Reel.scene({
  name: 'movil', z: 20,
  build(root) {
    shadow = el('div', 'phshadow', root);
    phw = el('div', 'phwrap', root);
    ph = el('div', 'ph3d', phw);
    const back = el('div', 'face back', ph);
    const cam = el('div', 'cam', back);
    [[16, 16], [94, 16], [16, 94]].forEach(p => css(el('div', 'lens', cam), { left: p[0] + 'px', top: p[1] + 'px' }));
    el('div', 'flash', cam); el('div', 'sheen', back);
    const front = el('div', 'face front', ph); this.front = front; this.back = back;
    const scr = el('div', 'scr', front);
    lock = el('div', '', scr); css(lock, { left: 0, top: 0, width: '436px', height: '936px' });
    el('div', 'wall2', lock);
    dt = el('div', 'date txt', lock, 'sábado, 21 de noviembre');
    tm = el('div', 'time txt', lock, '11:58');
    CALLS.forEach((h, i) => {
      const n = el('div', 'noti', lock); n.style.top = 330 + i * 118 + 'px';
      el('div', 'ic', n, '<svg width="30" height="30" viewBox="0 0 24 24"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" fill="#fff"/></svg>');
      el('div', 'nt txt', n, 'Llamada perdida'); el('div', 'nd txt', n, h + ' · sin guardar');
      notis.push(n);
    });
    nomsg = el('div', 'nomsg', lock); nomsg.style.top = 330 + 3 * 118 + 'px';
    el('div', 'tx txt', nomsg, 'NINGÚN MENSAJE');
    webl = el('div', 'webl', scr);
    webimg = el('img', '', webl); webimg.src = ASSET(Piezas.WEBS.atlantis.escritorio);
    tap = el('div', 'tap', webl); css(tap, { left: '468px', top: '95px' });
    el('div', 'isl', front);
  },
  update(t) {
    // buzzing: three short bursts in the hook, the phone creeps a few millimetres each time
    const buzz = [0, A.r2, A.r3].reduce((a, t0) => a + (t >= t0 - 0.02 && t < t0 + 0.5 ? 1 : 0), 0);
    const crawl = 10 * (E.out(seg(t, 0, 0.5)) + E.out(seg(t, A.r2, A.r2 + 0.5)) + E.out(seg(t, A.r3, A.r3 + 0.5)));
    const jx = buzz ? Math.sin(t * 95) * 6 : 0, jr = buzz ? Math.sin(t * 77) * 0.8 : 0;
    // flip up when you finally look at it
    const f = E.io(seg(t, A.miraste - 0.45, A.miraste + 0.55));
    // lie it sideways for the web
    const s = E.io(seg(t, A.reserva - 0.1, A.reserva + 0.8));
    const out = E.in2(seg(t, A.cta - 0.5, A.cta));
    const ax = lerp(60, 0, f), ay = lerp(180, 0, f), az = lerp(-14 + jr, 0, f) - 90 * s;
    const tx = lerp(jx + crawl, 0, f), ty = lerp(40, 0, f) - 250 * s;
    const sc = lerp(1.0, 0.94, f) * lerp(1, 1 / 0.94, s);
    ph.style.transform = `translate(${tx}px,${ty}px) rotateX(${ax}deg) rotateZ(${az}deg) rotateY(${ay}deg) scale(${sc})`;
    this.front.style.visibility = ay > 90 ? 'hidden' : 'visible'; this.back.style.visibility = ay > 90 ? 'visible' : 'hidden';
    phw.style.opacity = 1 - out;
    // background blur during the parcel close-up, and a little motion blur while it buzzes
    // (the filter goes on the wrapper: a filter on the 3D element itself would flatten it)
    const soft = Math.max(6 * inout(t, A.foco, A.cuando, .6, .5), buzz && f === 0 ? 1.2 : 0);
    phw.style.filter = soft > 0.05 ? `blur(${soft}px)` : '';
    shadow.style.opacity = (1 - f) * 0.9;
    shadow.style.transform = `translateX(${crawl + jx}px)`;
    // lock screen: the time, three missed calls, no message
    [A.n1, A.n2, A.n3].forEach((t0, i) => {
      const k = E.expo(seg(t, t0 - 0.1, t0 + 0.35));
      const gone = E.in2(seg(t, A.noEsp + i * 0.32, A.noEsp + i * 0.32 + 0.4));
      notis[i].style.opacity = k * (1 - gone);
      notis[i].style.transform = `translate(${-gone * 460}px,${(1 - k) * -60}px) scale(${0.94 + 0.06 * k})`;
    });
    const nk = E.expo(seg(t, A.ningun - 0.05, A.ningun + 0.35)), ng = E.in2(seg(t, A.noEsp + 0.96, A.noEsp + 1.36));
    nomsg.style.opacity = nk * (1 - ng); nomsg.style.transform = `translateX(${-ng * 460}px)`;
    // the clock on the lock screen keeps running while nobody books
    tm.textContent = t < A.noEsp + 0.6 ? '11:58' : '12:03';
    tm.style.transform = `translateY(${t >= A.noEsp + 0.6 ? -14 * (1 - E.expo(seg(t, A.noEsp + 0.6, A.noEsp + 1.0))) : 0}px)`;
    // web arrives as the phone turns; a tap on RESERVAR at "a la primera"
    const wk = E.io(seg(t, A.reserva + 0.25, A.reserva + 0.7));
    webl.style.opacity = wk; lock.style.opacity = 1 - wk;
    webimg.style.transform = `translateY(${-mv(t, A.reserva + 0.6, 3.5, 0, 26, E.io)}px)`;
    const tk = seg(t, A.primera, A.primera + 0.6);
    tap.style.opacity = tk > 0 && tk < 1 ? (1 - tk) : 0;
    tap.style.transform = `scale(${0.4 + 0.9 * E.out(tk)})`;
  }
});

// ---------- hook panel: missed calls rolling up, and the clock ----------
let rod, clock;
Reel.scene({
  name: 'contador', z: 30,
  build(root) {
    rod = Piezas.Rodillo(root, { x: 90, y: 470, w: 640, label: 'LLAMADAS PERDIDAS', sub: 'sin contestar', dot: true });
    clock = Piezas.Reloj(root, { x: 790, y: 470, hora: '11:42' });
  },
  update(t) {
    rod.update(t, [[0, 1], [A.r2, 2], [A.r3, 3]], 0.42);
    const out = E.io(seg(t, A.miraste - 0.5, A.miraste));
    const pulse = [0, A.r2, A.r3].reduce((a, t0) => a + Math.max(0, 1 - Math.abs(t - t0 - 0.1) / 0.25), 0);
    rod.el.style.opacity = 1 - out;
    rod.el.style.transform = `translateY(${-out * 60}px) scale(${1 + 0.025 * pulse})`;
    rod.el.style.filter = inout(t, A.foco, A.cuando, .6, .5) > 0.05 ? `blur(${5 * inout(t, A.foco, A.cuando, .6, .5)}px)` : '';
    // the clock: the morning runs on; later it shows the hours the web takes bookings
    const hrs = [[0, '11:42'], [A.parar, '11:51'], [A.cuando, '11:58'],
      [A.k1, '22:15'], [A.k2, '07:30'], [A.k3, '15:00']];
    let h = hrs[0][1], t0 = 0; hrs.forEach(([a, v]) => { if (t >= a) { h = v; t0 = a; } });
    clock.set(h);
    const roll = t0 > 0 ? 1 - E.expo(seg(t, t0, t0 + 0.4)) : 0;
    const vis = (1 - out) + E.expo(seg(t, A.con + 0.3, A.con + 0.8)) * (1 - E.in2(seg(t, A.cta - 0.5, A.cta)));
    clock.el.style.opacity = vis;
    clock.el.style.transform = `translateY(${roll * -16}px)`;
    clock.el.style.left = t > A.con ? '434px' : '790px';
    clock.el.style.top = t > A.con ? '396px' : '470px';
  }
});

// ---------- the RESERVAR button lifts off the web and becomes the booking panel ----------
const SLOTS = [['Sábado', '22:15'], ['Domingo', '07:30'], ['Lunes', '15:00']];
let fly, panel, rows = [];
Reel.scene({
  name: 'reservas', z: 35,
  build(root) {
    fly = el('div', 'btnfly txt', root, 'RESERVAR →');
    panel = el('div', 'glass reservas', root);
    el('div', 'lab txt', panel, 'RESERVAS DESDE LA WEB'); el('div', 'web txt', panel, 'atlantischarter.com');
    SLOTS.forEach((s, i) => {
      const r = el('div', 'slotr', panel); r.style.top = 82 + i * 82 + 'px';
      el('div', 'd txt', r, s[0]); el('div', 'h txt', r, s[1]);
      const ok = el('div', 'ok', r);
      ok.innerHTML = '<svg width="26" height="22" viewBox="0 0 32 28"><path d="M3 15 L12 24 L29 4" fill="none" stroke="#04051C" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      el('span', 'txt', ok, 'Reservado');
      rows.push({ r, ok });
    });
  },
  update(t) {
    // the button: starts exactly over the web's button, flies down and widens into the panel header
    const a = E.io(seg(t, A.con - 0.05, A.con + 0.75));
    const vis = seg(t, A.con - 0.1, A.con) * (1 - seg(t, A.con + 0.7, A.con + 0.95));
    const x0 = 183, y0 = 556, w0 = 715, h0 = 44, x1 = 90, y1 = 968, w1 = 900, h1 = 80;
    css(fly, { left: lerp(x0, x1, a) + 'px', top: lerp(y0, y1, a) + 'px', width: lerp(w0, w1, a) + 'px', height: lerp(h0, h1, a) + 'px',
      lineHeight: lerp(h0, h1, a) + 'px', opacity: vis, fontSize: lerp(26, 30, a) + 'px' });
    const pk = E.expo(seg(t, A.con + 0.55, A.con + 1.1));
    const out = E.in2(seg(t, A.cta - 0.5, A.cta));
    panel.style.opacity = pk * (1 - out);
    panel.style.transform = `scaleY(${0.3 + 0.7 * pk})`;
    rows.forEach((q, i) => {
      const k = E.expo(seg(t, A.elige - 0.3 + i * 0.18, A.elige + 0.2 + i * 0.18));
      q.r.style.opacity = k; q.r.style.transform = `translateX(${(1 - k) * 50}px)`;
      const tk = [A.k1, A.k2, A.k3][i];
      const c = clamp(E.back(seg(t, tk, tk + 0.35)));
      q.ok.style.opacity = seg(t, tk, tk + 0.1); q.ok.style.transform = `scale(${c})`;
      q.r.style.boxShadow = t > tk ? `inset 0 0 0 2px rgba(156,200,255,${0.25 + 0.5 * (1 - seg(t, tk, tk + 1))})` : '';
    });
  }
});
