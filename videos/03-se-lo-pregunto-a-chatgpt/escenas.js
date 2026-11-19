// =====================================================================
//  03 · Se lo preguntó a ChatGPT
//  Mundo: salón de noche, luz de lámpara cálida y luz fría de pantalla.
//  Pieza protagonista: tarjetas de recomendación que caen (y el hueco de la tuya).
//  El chat es neutro y dibujado en código: nunca el logo ni la interfaz de ChatGPT.
// =====================================================================

const A = {
  envia: W(1, 'fisio').start,
  piensa: L(1).end + 0.1,
  tres: W(2, 'tres').start,
  c1: W(2, 'nombres').start, c2: W(2, 'dirección').start, c3: W(2, 'horario').start,
  tuyo: W(2, 'tuyo').start, noEst: W(2, 'estaba').start,
  gente: W(3, 'gente').start,
  ia: W(3, 'inteligencia').start, entiende: W(3, 'entiende').start,
  web: W(4, 'web').start, google: W(4, 'Google').start, iaw: W(4, 'inteligencia').start,
  que: W(4, 'qué').start, donde: W(4, 'dónde').start, quien: W(4, 'quién').start,
  cta: CTA.start,
};
Object.entries(A).forEach(([k, v]) => Reel.anchor(k, v));

Reel.section(0, A.tres - 0.3, 'tension');
Reel.section(A.tres - 0.3, A.web - 0.4, 'pulso');
Reel.section(A.web - 0.4, CTA.end + 0.35, 'claro');
Reel.hit(A.envia + 0.25, 'click');
Reel.hit(A.c1, 'knock'); Reel.hit(A.c2, 'knock'); Reel.hit(A.c3, 'knock');
Reel.hit(A.noEst, 'thud', 0.8);
Reel.hit(A.gente - 0.1, 'whoosh');
Reel.hit(A.ia, 'whoosh_rev');
Reel.hit(A.web, 'hit');
[A.que, A.donde, A.quien].forEach(t => Reel.hit(t, 'tick'));
Reel.hit(A.cta - 0.3, 'rise');

// ---------- the room: night, a lamp, the city through a window ----------
let room;
Reel.scene({
  name: 'salon', z: 1,
  build(root) {
    const r = rng(31);
    room = el('div', 'room', root);
    el('div', 'wall', room); el('div', 'lamp', room); el('div', 'window', room);
    const city = el('div', 'city', room);
    for (let i = 0; i < 70; i++) {
      const d = el('i', '', city); const s = 6 + r() * 16;
      css(d, { left: r() * 420 + 'px', top: r() * 520 + 'px', width: s + 'px', height: s + 'px',
        opacity: .25 + r() * .6, background: r() < .7 ? '#ffd29a' : '#9CC8FF' });
    }
    el('div', 'sofa', room); el('div', 'cushion', room); el('div', 'screenglow', room);
    this.r = r;
  },
  update(t) {
    room.style.transform = `translate(${Math.sin(t * .2) * 12}px,${Math.cos(t * .15) * 8}px) scale(${1.04 + 0.02 * seg(t, 0, 30)})`;
    // the room dims when the camera pulls back into the "many people" moment
    room.style.opacity = 1 - 0.35 * inout(t, A.gente - 0.3, A.web - 0.6, .6, .6);
  }
});

// ---------- the chat panel: question, thinking, three cards, the empty slot ----------
const Q = 'Busco un buen fisio en Gràcia. ¿Cuál me recomiendas?';
const CARDS = [
  { t: 'Fisioterapia · C/ de Verdi', d: 'A 400 m · Abierto hasta las 20:00' },
  { t: 'Fisioterapia · Pl. del Sol', d: 'A 650 m · Abierto hasta las 21:00' },
  { t: 'Fisioterapia · C/ d’Astúries', d: 'A 800 m · Abierto hasta las 19:30' },
];
let hello, chat, typed, caret, sent, dots, intro, cards = [], slot, slotFill;
Reel.scene({
  name: 'chat', z: 20,
  build(root) {
    chat = el('div', 'chat glass', root);
    const hd = el('div', 'hd', chat); el('i', '', hd); el('div', 'lab txt', hd, 'ASISTENTE DE IA');
    // typing box at the bottom of the panel, then the sent bubble at the top
    hello = el('div', 'hello txt', chat, '¿En qué puedo ayudarte?'); 
    const box = el('div', 'box', chat); typed = el('div', 'typed txt', box); caret = el('i', 'caret', box);
    sent = el('div', 'bubble me txt', chat, Q);
    dots = el('div', 'dots', chat); for (let i = 0; i < 3; i++) el('i', '', dots);
    intro = el('div', 'bubble ai txt', chat, 'Te recomiendo estas tres, cerca de ti:');
    CARDS.forEach((c, i) => {
      const k = el('div', 'card', chat); k.style.top = 300 + i * 124 + 'px';
      el('div', 'pin', k, '<svg width="26" height="34" viewBox="0 0 26 34"><path d="M13 33s11-12.6 11-20A11 11 0 0 0 2 13c0 7.4 11 20 11 20z" fill="#0A22F1"/><circle cx="13" cy="13" r="4.5" fill="#fff"/></svg>');
      el('div', 'ct txt', k, c.t); el('div', 'cd txt', k, c.d);
      cards.push(k);
    });
    slot = el('div', 'slot', chat); slot.style.top = 300 + 3 * 124 + 'px';
    el('div', 'st txt', slot, 'Tu negocio'); el('div', 'sd txt', slot, 'no aparece');
    slotFill = el('div', 'card fill', chat); slotFill.style.top = slot.style.top;
    el('div', 'ct txt', slotFill, 'Tu negocio'); el('div', 'cd txt', slotFill, 'Qué haces · Dónde · Para quién');
  },
  update(t) {
    // the panel is there from frame 0; it shrinks back while "more people" ask, then leaves
    const back = E.io(seg(t, A.gente - 0.3, A.gente + 0.3));
    const leave = back;
    const ret = E.expo(seg(t, A.quien + 0.3, A.quien + 0.8));
    const out = E.in2(seg(t, A.cta - 0.6, A.cta - 0.1));
    const sc = 1 - 0.08 * back;
    chat.style.opacity = (1 - leave) + ret * (1 - out);
    const sc2 = ret > 0 ? lerp(0.85, 0.92, ret) : sc;
    chat.style.transform = `translateY(${ret > 0 ? lerp(120, 40, ret) : -back * 60}px) scale(${sc2})`;
    // typing: already mid-sentence on the first frame
    const n = Math.round(Q.length * clamp(seg(t, -2.2, A.envia)));
    const isSent = t >= A.envia + 0.2;
    typed.textContent = isSent ? '' : Q.slice(Math.max(0, n - 30), n);
    hello.style.opacity = 1 - E.io(seg(t, A.envia + 0.1, A.envia + 0.5));
    typed.parentElement.style.opacity = 1 - E.io(seg(t, A.envia + 0.2, A.envia + 0.6));
    caret.style.opacity = isSent ? 0 : (Math.floor(t * 2.2) % 2 ? 0.2 : 1);
    caret.style.left = 40 + Math.min(typed.offsetWidth, 760) + 6 + 'px';
    const sk = E.expo(seg(t, A.envia + 0.2, A.envia + 0.7));
    sent.style.opacity = sk; sent.style.transform = `translateY(${(1 - sk) * 520}px)`;
    // thinking dots
    const dk = inout(t, A.piensa, A.tres - 0.35, .25, .2);
    dots.style.opacity = dk;
    [...dots.children].forEach((d, i) => d.style.transform = `translateY(${-10 * Math.max(0, Math.sin(t * 7 - i * 0.9))}px)`);
    const ik = E.expo(seg(t, A.tres - 0.3, A.tres + 0.2)); intro.style.opacity = ik;
    intro.style.transform = `translateY(${(1 - ik) * 30}px)`;
    // the three cards fall in, one per beat
    [A.c1, A.c2, A.c3].forEach((t0, i) => {
      const k = E.expo(seg(t, t0 - 0.12, t0 + 0.4));
      cards[i].style.opacity = k;
      cards[i].style.transform = `translateY(${(1 - k) * -90}px) rotate(${(1 - k) * (i % 2 ? 3 : -3)}deg)`;
    });
    // the empty slot: appears on "el tuyo", shakes on "no estaba"
    const sl = E.expo(seg(t, A.tuyo - 0.1, A.tuyo + 0.35));
    const sh = Math.sin((t - A.noEst) * 38) * 9 * (1 - seg(t, A.noEst, A.noEst + 0.5)) * (t > A.noEst ? 1 : 0);
    slot.style.opacity = sl * (1 - E.io(seg(t, A.quien + 0.75, A.quien + 1.0)));
    slot.style.transform = `translateX(${sh}px) scale(${0.96 + 0.04 * sl})`;
    // at the end the slot fills with a card that explains what you do, where, for whom
    const fk = E.back(seg(t, A.quien + 0.75, A.quien + 1.15));
    slotFill.style.opacity = clamp(fk); slotFill.style.transform = `scale(${0.9 + 0.1 * clamp(fk)})`;
  }
});

// ---------- many people ask like this ----------
const ASKS = ['dentista abierto hoy cerca', 'taller de coches en mi zona', 'peluquería en Ruzafa',
  'inmobiliaria en Alcúdia', 'restaurante para 8 en Triana', 'academia de inglés en Getafe',
  'veterinario de urgencias', 'reformas de baño en Bilbao'];
let asks = [];
Reel.scene({
  name: 'muchos', z: 15,
  build(root) {
    const r = rng(7);
    ASKS.forEach((q, i) => {
      const b = el('div', 'bubble mini txt', root, q);
      const col = i % 2, row = Math.floor(i / 2);
      if (col) b.style.right = (70 + r() * 50) + 'px'; else b.style.left = (70 + r() * 50) + 'px';
      asks.push({ b, y: 470 + row * 190 + col * 80, d: i * 0.13 });
    });
  },
  update(t) {
    asks.forEach(a => {
      const k = E.expo(seg(t, A.gente - 0.1 + a.d, A.gente + 0.4 + a.d));
      const o = 1 - E.in2(seg(t, A.ia - 0.3, A.ia + 0.2));
      a.b.style.opacity = k * o * 0.92;
      a.b.style.top = a.y + (1 - k) * 40 - (t - A.gente) * 6 + 'px';
    });
  }
});

// ---------- what the AI "reads": a messy page turns to noise, then the real site ----------
let messy, lines = [], scan, readC, lap, chips = [];
Reel.scene({
  name: 'lectura', z: 25,
  build(root) {
    messy = el('div', 'messy', root);
    el('div', 'mtitle txt', messy, 'Bienvenidos a nuestra web');
    const r = rng(12);
    for (let i = 0; i < 11; i++) {
      const l = el('div', 'mline', messy); css(l, { top: 150 + i * 46 + 'px', width: 380 + r() * 300 + 'px' });
      lines.push(l);
    }
    el('div', 'mimg', messy);
    scan = el('div', 'scan', messy);
    readC = el('div', 'dudas glass', root);
    el('div', 'lab txt', readC, 'NO LE QUEDA CLARO');
    this.qs = ['¿Qué hace?', '¿Dónde?', '¿Para quién?'].map((q, i) => { const d = el('div', 'dq txt', readC, q); d.style.left = [34, 330, 565][i] + 'px'; return d; });
    lap = Piezas.Portatil(root, { x: 90, y: 540, w: 900, web: 'amperiza' });
    [['QUÉ HACES', 'Agencia inmobiliaria'], ['DÓNDE', 'Alcúdia y Mallorca'], ['PARA QUIÉN', 'Comprar, vender, alquilar']].forEach((c, i) => {
      const k = el('div', 'chipk glass', root); css(k, { left: '90px', top: '985px' });
      el('div', 'kl txt', k, c[0]); el('div', 'kv txt', k, c[1]); chips.push(k);
    });
  },
  update(t) {
    // messy page, scanned and scrambled
    const mk = E.expo(seg(t, A.ia - 0.2, A.ia + 0.4));
    const mo = 1 - E.io(seg(t, A.web - 0.3, A.web + 0.3));
    messy.style.opacity = mk * mo;
    messy.style.transform = `translateY(${(1 - mk) * 120}px) scale(${0.96 + 0.04 * mk})`;
    const sp = seg(t, A.ia + 0.2, A.entiende + 0.3);
    scan.style.top = 40 + sp * 560 + 'px'; scan.style.opacity = sp > 0 && sp < 1 ? 1 : 0;
    lines.forEach((l, i) => {
      const hit = sp * 12 > i;
      l.style.background = hit ? 'repeating-linear-gradient(90deg,rgba(80,86,120,.55) 0 18px,transparent 18px 26px)' : '#c9c5bb';
      l.style.transform = hit ? `translateX(${Math.sin(i * 3.1 + t * 9) * 6}px)` : '';
    });
    readC.style.opacity = E.expo(seg(t, A.ia + 0.3, A.ia + 0.8)) * mo;
    this.qs.forEach((q, i) => { const k = E.expo(seg(t, A.ia + 0.6 + i * 0.55, A.ia + 1.0 + i * 0.55)); q.style.opacity = k; q.style.transform = `translateY(${(1 - k) * 20}px)`; });
    // the real site arrives in a laptop, and the three things it makes clear
    const lk = E.expo(seg(t, A.web - 0.2, A.web + 0.6));
    const lo = 1 - E.in2(seg(t, A.quien + 0.1, A.quien + 0.45));
    lap.el.style.opacity = lk * lo;
    lap.el.style.transform = `translateY(${(1 - lk) * 200 - (1 - lo) * 80}px) scale(${0.92 + 0.08 * lk})`;
    lap.img.style.transform = `scale(${1 + 0.06 * seg(t, A.web, A.quien)})`;
    [A.que, A.donde, A.quien].forEach((t0, i) => {
      const k = E.expo(seg(t, t0 - 0.05, t0 + 0.35));
      const prev = [A.donde, A.quien, A.quien + 0.6][i];
      const up = E.io(seg(t, prev - 0.05, prev + 0.3));
      chips[i].style.opacity = k * (1 - up) * lo;
      chips[i].style.transform = `translateY(${(1 - k) * 40 - up * 40}px)`;
    });
  }
});
