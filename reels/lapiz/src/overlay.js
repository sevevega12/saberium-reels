// Type layer: persistent header + progress, kinetic captions, title, frosted counters, CTA, end card.
import { clamp, lerp, prog, eio, eo, eo5, move, smooth, fmt } from './util.js';
import { T } from './timing.js';

// caption markup:  |  = new screen,  *word* = key word (pill),  _word_ = nuance (italic serif)
const CAPS = {
  A: 'Fíjate bien | en la *punta* de este lápiz.',
  B: '# # # # # te explico por qué | tu negocio _no_ está captando | suficientes *clientes.*',
  C: 'La punta es lo _único_ | del lápiz que *toca* el papel.',
  D: 'Y en tu negocio, | lo _primero_ que toca al cliente | ya no es tu *puerta.*',
  E: 'Es tu *web.*',
  F: 'Antes de llamarte, | te *busca* en el móvil.',
  G1: 'Y si tu web | *tarda* en cargar,',
  G2: 'es _igual_ que otras *cien,*',
  G3: 'o lleva *años* sin tocarse,',
  H: 'piensa que _así_ | le vas a *tratar* a él.',
  I: '_No_ te lo dice.',
  J: 'Simplemente se va | con el de *enfrente.*',
  K: 'Y tu trabajo, | por _bueno_ que sea, | no llega a *verlo.*',
  L: 'Una web *cuidada* | dice lo _contrario:_',
  M: 'que cuidas los *detalles* | antes de que entre | por tu *puerta.*',
  N: '# # y te enseñamos _gratis_ | cómo quedaría la tuya.',
};
const el = (tag, cls, html, parent) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e; };

const CSS = `
.hdr{position:absolute;left:64px;right:64px;top:392px;height:30px;display:flex;align-items:center;gap:16px;font:500 19px "JetBrains Mono";letter-spacing:.16em;color:rgba(255,255,255,.92);text-shadow:0 0 16px rgba(4,5,28,.95),0 1px 3px rgba(4,5,28,.9)}
.hdr img{height:24px;opacity:.95}
.hdr .bar{flex:1;display:flex;gap:6px;align-items:center;margin:0 6px}
.hdr .seg{flex:1;height:3px;border-radius:2px;background:rgba(255,255,255,.26);overflow:hidden;box-shadow:0 0 10px rgba(4,5,28,.7)}
.hdr .seg i{display:block;height:100%;width:0;background:#9CC8FF}
.hdr .n{color:#9CC8FF}
.shade{position:absolute;left:0;right:0;bottom:0;height:820px;background:linear-gradient(180deg,rgba(4,5,28,0) 0%,rgba(4,5,28,.62) 45%,rgba(4,5,28,.9) 100%)}
.capShade{position:absolute;left:0;right:0;top:1180px;bottom:0;background:linear-gradient(180deg,rgba(4,5,28,0) 0%,rgba(4,5,28,.86) 26%,rgba(4,5,28,.96) 100%)}
.shadeTop{position:absolute;left:0;right:0;top:0;height:520px;background:linear-gradient(0deg,rgba(4,5,28,0) 0%,rgba(4,5,28,.55) 60%,rgba(4,5,28,.8) 100%)}
.cap{position:absolute;left:70px;right:70px;top:1368px;height:168px;display:flex;align-items:center;justify-content:center;text-align:center}
.cap .chunk{position:absolute;left:0;right:0;font:800 62px/1.24 "Plus Jakarta Sans";letter-spacing:-.022em;text-shadow:0 2px 18px rgba(4,5,28,.75)}
.w{display:inline-block;margin:0 .13em;white-space:nowrap;will-change:transform}
.w.it{font:italic 400 76px/1 "Instrument Serif";letter-spacing:0;color:#9CC8FF;margin:0 .1em;transform-origin:50% 80%}
.w.pill{background:#9CC8FF;color:#04051C;border-radius:.42em;padding:.0em .26em .04em;margin:0 .1em;text-shadow:none;box-shadow:0 8px 30px rgba(10,34,241,.45)}
.title{position:absolute;left:70px;right:70px;top:1090px;text-align:left}
.title .ln{display:block;overflow:hidden;padding:0 0 .12em}
.title .ln span{display:inline-block}
.title .l1{font:700 62px/1.1 "Plus Jakarta Sans";letter-spacing:-.02em;color:rgba(255,255,255,.92)}
.title .l2{font:800 124px/1.04 "Plus Jakarta Sans";letter-spacing:-.04em;margin-top:6px}
.title .l2 .pill{background:#9CC8FF;color:#04051C;border-radius:.24em;padding:0 .14em .05em;margin-left:-.06em}
.title .l2 em{font:italic 400 132px/1 "Instrument Serif";letter-spacing:-.01em;color:#9CC8FF}
.glass{position:absolute;border-radius:28px;background:linear-gradient(160deg,rgba(52,84,214,.58),rgba(8,14,76,.74));backdrop-filter:blur(26px) saturate(1.3);-webkit-backdrop-filter:blur(26px) saturate(1.3);box-shadow:0 24px 60px rgba(2,3,20,.55),inset 0 0 0 1.5px rgba(200,225,255,.30),inset 0 1.5px 0 rgba(255,255,255,.45);transform-origin:0 0;overflow:hidden}
.glass .lab{font:500 19px "JetBrains Mono";letter-spacing:.16em;color:rgba(214,230,255,.9);white-space:nowrap}
.glass .val{font:700 86px/1 "JetBrains Mono";letter-spacing:-.04em;color:#fff;white-space:nowrap;margin-top:10px}
.glass .val small{font:500 34px "JetBrains Mono";letter-spacing:0;color:#9CC8FF;margin-left:10px}
.glass .sub{font:700 22px "Plus Jakarta Sans";color:rgba(255,255,255,.82);margin-top:8px;white-space:nowrap}
.pad{padding:26px 30px 26px}
.meter{height:6px;border-radius:3px;background:rgba(255,255,255,.16);margin-top:18px;overflow:hidden}
.meter i{display:block;height:100%;background:#9CC8FF;border-radius:3px}
.tag{position:absolute;font:500 22px "JetBrains Mono";letter-spacing:.14em;color:#04051C;background:#9CC8FF;border-radius:10px;padding:8px 14px;white-space:nowrap;box-shadow:0 10px 30px rgba(2,3,20,.5)}
.leader{position:absolute;height:1.5px;background:#9CC8FF;transform-origin:0 50%}
.ring{position:absolute;width:44px;height:44px;margin:-22px;border-radius:50%;border:1.5px solid #9CC8FF}
.chk{display:flex;align-items:center;gap:18px;padding:17px 28px 17px 18px;font:800 38px "Plus Jakarta Sans";letter-spacing:-.015em;white-space:nowrap}
.chk .box{width:44px;height:44px;border-radius:14px;background:rgba(255,255,255,.14);box-shadow:inset 0 0 0 1.5px rgba(200,225,255,.4);display:grid;place-items:center;flex:none}
.chk svg{width:26px;height:26px}
.site{display:flex;flex-direction:column;gap:5px;padding:16px 22px}
.site b{font:800 30px "Plus Jakarta Sans";letter-spacing:-.01em;white-space:nowrap}
.site span{font:500 17px "JetBrains Mono";letter-spacing:.14em;color:#9CC8FF;white-space:nowrap}
.cta{position:absolute;left:0;right:0;top:880px;text-align:center;color:#04051C}
.cta .a{display:inline-block;overflow:hidden;padding-bottom:.1em}
.cta .a>span{display:inline-block;font:800 104px/1.05 "Plus Jakarta Sans";letter-spacing:-.04em}
.cta .web{display:inline-block;background:#0A22F1;color:#fff;border-radius:.24em;padding:0 .16em .04em;margin-left:.12em;box-shadow:0 14px 40px rgba(10,34,241,.4)}
.endc{position:absolute;inset:0;backdrop-filter:blur(28px);background:radial-gradient(120% 70% at 50% 45%,rgba(10,34,241,.42),rgba(4,5,28,.93) 62%);display:flex;flex-direction:column;align-items:center}
.endc .logo{position:absolute;top:640px;width:640px;left:220px}
.endc .line{position:absolute;top:842px;left:0;right:0;text-align:center;font:700 40px "Plus Jakarta Sans";letter-spacing:-.015em}
.endc .line em{font:italic 400 50px "Instrument Serif";color:#9CC8FF}
.endc .btn{position:absolute;top:1010px;left:50%;white-space:nowrap;font:800 46px "Plus Jakarta Sans";letter-spacing:-.02em;background:#9CC8FF;color:#04051C;border-radius:44px;padding:20px 44px;box-shadow:0 18px 50px rgba(10,34,241,.5)}
.endc .btn b{background:#0A22F1;color:#fff;border-radius:14px;padding:0 14px 3px;margin:0 4px}
.endc .urls{position:absolute;top:1180px;left:0;right:0;text-align:center;font:500 25px "JetBrains Mono";letter-spacing:.14em;color:rgba(255,255,255,.85)}
.endc .urls i{font-style:normal;color:#9CC8FF;margin:0 14px}
`;

export function createOverlay(root, TL) {
  el('style', null, CSS, document.head);
  const shadeTop = el('div', 'shadeTop', '', root), shade = el('div', 'shade', '', root), capShade = el('div', 'capShade', '', root);

  // ---------- frosted panels ----------
  const panel = (html, w) => { const p = el('div', 'glass', html, root); p.style.width = w + 'px'; p.style.opacity = 0; return p; };
  const place = (p, x, y, s, a, extra = '') => { p.style.opacity = a; p.style.visibility = a <= 0.001 ? 'hidden' : 'visible'; p.style.transform = `translate(${x}px,${y}px) scale(${s}) ${extra}`; };
  const pDist = panel(`<div class="pad"><div class="lab">DISTANCIA AL CORTE</div><div class="val"><span class="v">14,0</span><small>mm</small></div><div class="meter"><i></i></div></div>`, 470);
  const fails = [
    { p: panel(`<div class="pad"><div class="lab">TIEMPO DE CARGA</div><div class="val"><span class="v">0,0</span><small>s</small></div><div class="sub">Tarda en cargar</div></div>`, 400), t0: T.load0 + 0.1 },
    { p: panel(`<div class="pad"><div class="lab">MISMA PLANTILLA</div><div class="val"><small style="margin:0 6px 0 0">×</small><span class="v">1</span></div><div class="sub">Igual que otras cien</div></div>`, 400), t0: T.grid0 - 0.1 },
    { p: panel(`<div class="pad"><div class="lab">ÚLTIMA ACTUALIZACIÓN</div><div class="val"><span class="v">2026</span></div><div class="sub">Años sin tocarse</div></div>`, 400), t0: T.foot0 + 0.1 },
  ];
  const tick = `<svg viewBox="0 0 26 26"><path d="M5 13.5l5.5 5.5L21 8" fill="none" stroke="#04051C" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>`;
  const checks = ['Carga al instante', 'Diseño propio', 'Siempre al día'].map((s) => panel(`<div class="chk"><div class="box">${tick}</div>${s}</div>`, 0));
  checks.forEach((c) => { c.style.width = 'auto'; c.style.borderRadius = '26px'; });
  const CHK_T = [T.real0 + 1.15, T.site2 + 0.55, T.site3 + 0.5];
  const sites = [['Amperiza', 'INMOBILIARIA'], ['Atlantis Charters', 'RESERVAS'], ['The Barber Kingdom', 'BRANDING']].map(([a, b]) => { const p = panel(`<div class="site"><span>WEB REAL · ${b}</span><b>${a}</b></div>`, 0); p.style.width = 'auto'; p.style.borderRadius = '22px'; return p; });
  const SITE_T = [T.real0 + 0.3, T.site2 + 0.15, T.site3 + 0.15, T.out0 + 0.1];

  // dot label
  const ring = el('div', 'ring', '', root), leader = el('div', 'leader', '', root), tag = el('div', 'tag', 'PRIMER PUNTO DE CONTACTO', root);
  const tag2 = el('div', 'tag', 'TU TRABAJO · SIN VER', root);
  const ring3 = el('div', 'ring', '', root), leader3 = el('div', 'leader', '', root), tag3 = el('div', 'tag', 'SE HA PARADO A 0,2 mm', root);

  // ---------- title ----------
  const title = el('div', 'title', `<span class="ln l1"><span>Ahora que tengo</span></span><span class="ln l2"><span>tu <span class="pill">atención</span><em>…</em></span></span>`, root);
  const tl1 = title.querySelector('.l1 span'), tl2 = title.querySelector('.l2 > span');

  // ---------- captions ----------
  const cap = el('div', 'cap', '', root);
  const chunks = [];
  for (const seg of TL.segments) {
    const toks = CAPS[seg.id].split(/\s+/); let wi = 0, cur = null;
    for (const tk of toks) {
      if (tk === '|') { cur = null; continue; }
      const w = seg.words[wi++]; if (tk === '#') { cur = null; continue; }
      if (!cur) { cur = { el: el('div', 'chunk', '', cap), words: [], seg }; chunks.push(cur); }
      const m = tk.match(/^([*_]?)(.*?)([*_]?)$/); const kind = m[1] === '*' ? 'pill' : m[1] === '_' ? 'it' : '';
      let txt = m[2]; let tail = '';
      if (kind) { const pm = txt.match(/^(.*?)([.,:…]+)$/); if (pm) { txt = pm[1]; tail = pm[2]; } }
      const e = el('span', 'w ' + kind, txt, cur.el);
      if (tail) { const te = el('span', 'w', tail, cur.el); te.style.marginLeft = '-.1em'; cur.words.push({ e: te, s: w.s + 0.02, e2: w.e, kind: '' }); }
      cur.words.push({ e, s: w.s, e2: w.e, kind });
    }
  }
  chunks.forEach((c) => { c.s = Math.min(...c.words.map((w) => w.s)); });
  chunks.forEach((c, i) => {
    const last = Math.max(...c.words.map((w) => w.e2));
    const nxt = chunks[i + 1]; c.out = nxt && nxt.s - last < 1.0 ? nxt.s - 0.2 : last + 0.75;
    c.el.style.visibility = 'hidden';
  });

  // ---------- CTA + end card ----------
  const cta = el('div', 'cta', `<span class="a"><span>Comenta<span class="web">WEB</span></span></span>`, root);
  const ctaIn = cta.querySelector('.a > span');
  const endc = el('div', 'endc', `<img class="logo" src="../../assets/logo-blanco.png"><div class="line">Tu web, <em>antes</em> que tu puerta.</div><div class="btn">Comenta <b>WEB</b> y te la enseñamos</div><div class="urls">saberium.com<i>·</i>@saberium.studio</div>`, root);
  const eLogo = endc.querySelector('.logo'), eLine = endc.querySelector('.line'), eBtn = endc.querySelector('.btn'), eUrls = endc.querySelector('.urls');

  // ---------- header ----------
  const hdr = el('div', 'hdr', `<img src="../../assets/icono-blanco.png"><span>SABERIUM</span><div class="bar"></div><span class="n">01</span><span>/ 07</span>`, root);
  const bar = hdr.querySelector('.bar'), num = hdr.querySelector('.n');
  const lineT = []; for (const s of TL.segments) { if (!lineT[s.line - 1]) lineT[s.line - 1] = { s: s.start, e: s.end }; lineT[s.line - 1].e = s.end; }
  const segs = lineT.map(() => el('div', 'seg', '<i></i>', bar).firstChild);
  const bounds = lineT.map((l, i) => [i === 0 ? 0 : (lineT[i - 1].e + l.s) / 2, i === lineT.length - 1 ? TL.duration : (l.e + lineT[i + 1].s) / 2]);

  function update(t, info) {
    // header / progress
    let cur = 0; bounds.forEach(([a, b], i) => { const p = prog(t, a, b); segs[i].style.width = p * 100 + '%'; if (t >= a) cur = i; });
    num.textContent = String(cur + 1).padStart(2, '0');
    const endP = smooth(t, T.end0, T.end0 + 0.7);
    hdr.style.opacity = 1 - endP * 0.0;
    const paperTop = smooth(t, T.out0 + 0.3, T.paper1);
    shade.style.opacity = lerp(1, 0.85, info.m); capShade.style.opacity = info.big;

    // distance counter
    {
      const out = smooth(t, T.freeze + 0.3, T.freeze + 0.6);
      const a = (1 - out) * (0.0 + eo(prog(t, -0.4, 0.2)));
      pDist.querySelector('.v').textContent = fmt(info.dist, 1);
      pDist.querySelector('.meter i').style.width = (info.dist / 14) * 100 + '%';
      const hit = t >= T.freeze ? 1 - prog(t, T.freeze, T.freeze + 0.35) : 0;
      place(pDist, 70 + noiseX(t, 1) , 1096 - out * 30, 1 + hit * 0.04, a);
      pDist.querySelector('.v').style.color = t >= T.freeze ? '#9CC8FF' : '#fff';
    }
    // title
    {
      const i1 = move(t, T.freeze + 0.32, T.freeze + 0.85), i2 = move(t, T.freeze + 0.62, T.freeze + 1.2);
      const out = smooth(t, T.unfreeze - 0.2, T.unfreeze + 0.3);
      title.style.visibility = t > T.freeze + 0.3 && out < 1 ? 'visible' : 'hidden';
      title.style.opacity = 1 - out; title.style.transform = `translateY(${-out * 40}px)`;
      tl1.style.transform = `translateY(${(1 - i1) * 110}%)`; tl2.style.transform = `translateY(${(1 - i2) * 110}%)`;
    }
    // captions
    for (const c of chunks) {
      const on = t >= c.s - 0.06 && t < c.out + 0.14;
      c.el.style.visibility = on ? 'visible' : 'hidden'; if (!on) continue;
      const o = prog(t, c.out - 0.04, c.out + 0.14);
      c.el.style.opacity = 1 - o; c.el.style.transform = `translateY(${-o * 16}px)`;
      const ink = t > T.paper1 - 0.2 && t < T.end0 ? 0 : 0;
      for (const w of c.words) {
        const p = eo5(prog(t, w.s - 0.03, w.s + 0.2)); const active = t >= w.s - 0.03 && t < w.e2 + 0.04;
        const past = t >= w.e2 + 0.04 ? clamp((t - w.e2 - 0.04) / 0.25) : 0;
        w.e.style.opacity = p * (w.kind ? 1 : lerp(1, 0.74, past));
        const pop = active ? 1 + 0.05 * Math.sin(prog(t, w.s, w.s + 0.22) * Math.PI) : 1;
        w.e.style.transform = `translateY(${(1 - p) * 26}px) scale(${(w.kind === 'pill' ? lerp(0.86, 1, p) : 1) * pop})`;
      }
    }
    // dot label
    {
      const a = eo(prog(t, T.touch + 0.25, T.touch + 0.6)) * (1 - smooth(t, T.morph1 - 0.5, T.morph1));
      const vis = a > 0.001 ? 'visible' : 'hidden';
      ring.style.visibility = leader.style.visibility = tag.style.visibility = vis;
      if (a > 0) {
        const { x, y } = info.dot; const kk = smooth(t, T.rise + 0.4, T.morph0); const lx = x - lerp(330, 150, kk), ly = y + lerp(-200, 110, kk);
        ring.style.left = x + 'px'; ring.style.top = y + 'px'; ring.style.opacity = a; ring.style.transform = `scale(${lerp(2.2, 1, a)})`;
        const dx = lx + 150 - x, dy = ly - y, len = Math.hypot(dx, dy) - 24;
        leader.style.left = x + (dx / Math.hypot(dx, dy)) * 24 + 'px'; leader.style.top = y + (dy / Math.hypot(dx, dy)) * 24 + 'px'; leader.style.width = len * a + 'px'; leader.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`; leader.style.opacity = a;
        tag.style.left = lx + 'px'; tag.style.top = ly + 'px'; tag.style.opacity = prog(a, 0.5, 1);
      }
      const f3 = eo(prog(t, T.unfreeze + 0.1, T.unfreeze + 0.5)) * (1 - smooth(t, T.withdraw - 0.1, T.withdraw + 0.3));
      ring3.style.visibility = leader3.style.visibility = tag3.style.visibility = f3 > 0.001 ? 'visible' : 'hidden';
      if (f3 > 0) {
        const { x, y } = info.cut; const lx = 96, ly = y + 250; const ax = lx + 150, dx = ax - x, dy = ly - y, L = Math.hypot(dx, dy);
        ring3.style.left = x + 'px'; ring3.style.top = y + 'px'; ring3.style.opacity = f3; ring3.style.transform = `scale(${lerp(3, 1.6, f3)})`;
        leader3.style.left = x + (dx / L) * 36 + 'px'; leader3.style.top = y + (dy / L) * 36 + 'px'; leader3.style.width = (L - 36) * f3 + 'px'; leader3.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`; leader3.style.opacity = f3;
        tag3.style.left = lx + 'px'; tag3.style.top = ly + 'px'; tag3.style.opacity = prog(f3, 0.5, 1);
      }
      const b = eo(prog(t, T.tap2 + 0.9, T.tap2 + 1.3)) * (1 - smooth(t, T.blank0 - 0.1, T.blank0 + 0.3));
      tag2.style.visibility = b > 0.001 ? 'visible' : 'hidden';
      if (b > 0) { tag2.style.left = info.row0.x - 120 + (1 - b) * 30 + 'px'; tag2.style.top = info.row0.y - 86 + 'px'; tag2.style.opacity = b; }
    }
    // failure counters: active (right of phone) -> chip (left column) -> verdict stack -> out
    fails.forEach((f, i) => {
      const tIn = f.t0, tChip = [T.grid0 - 0.25, T.foot0 - 0.1, T.sum0][i];
      const a = eo(prog(t, tIn, tIn + 0.35)) * (1 - smooth(t, T.back0 - 0.1 + i * 0.05, T.back0 + 0.3 + i * 0.05));
      const k1 = i < 2 ? move(t, tChip, tChip + 0.5) : 0, k2 = move(t, T.sum0 + i * 0.07, T.sum0 + 0.55 + i * 0.07);
      const A = { x: 628, y: 560 + i * 40, s: 1 }, B = { x: 34, y: 520 + i * 150, s: 0.62 }, C = { x: 300 - 60, y: 566 + i * 232, s: 1.5 * 0.83 };
      let x = lerp(A.x, B.x, k1), y = lerp(A.y, B.y, k1), s = lerp(A.s, B.s, k1);
      x = lerp(x, C.x, k2); y = lerp(y, C.y, k2); s = lerp(s, C.s, k2);
      const inn = eo5(prog(t, tIn, tIn + 0.5));
      place(f.p, x + (1 - inn) * 60, y + Math.sin(t * 0.9 + i) * 3 * (1 - k2) - smooth(t, T.back0 - 0.1, T.back0 + 0.3) * 40, s, a);
      const v = f.p.querySelector('.v');
      if (i === 0) { const p = prog(t, T.load0 + 0.1, T.loadEnd); v.textContent = fmt(8.4 * (1 - Math.pow(1 - p, 2.4)), 1); }
      if (i === 1) { const p = smooth(t, T.grid0, T.grid1); v.textContent = String(Math.round(lerp(1, 100, p * p * (3 - 2 * p)))); }
      if (i === 2) { const p = prog(t, T.foot1 + 0.1, T.yearEnd); v.textContent = String(Math.round(2026 - 10 * (1 - Math.pow(1 - p, 2.2)))); }
    });
    // real-site labels + checklist
    sites.forEach((p, i) => { const a = eo5(prog(t, SITE_T[i], SITE_T[i] + 0.4)), o = smooth(t, SITE_T[i + 1] - 0.25, SITE_T[i + 1] + 0.1); place(p, 74 + (1 - a) * -40 + o * 40, 452, 1, a * (1 - o)); });
    checks.forEach((p, i) => {
      const a = eo5(prog(t, CHK_T[i] - 0.35, CHK_T[i] + 0.1)), o = smooth(t, T.out0 - 0.1 + i * 0.06, T.out0 + 0.3 + i * 0.06);
      place(p, 520 + (1 - a) * 70 + o * 60, 1050 + i * 96, 1, a * (1 - o));
      const k = eo(prog(t, CHK_T[i], CHK_T[i] + 0.3));
      p.querySelector('path').setAttribute('stroke-dashoffset', 1 - k);
      p.querySelector('.box').style.background = `rgba(156,200,255,${lerp(0.14, 1, k)})`;
      p.querySelector('.box').style.transform = `scale(${1 + Math.sin(k * Math.PI) * 0.18})`;
    });
    // CTA on the sheet
    {
      const a = move(t, T.write0 + 0.15, T.write0 + 0.7), o = smooth(t, T.end0 - 0.15, T.end0 + 0.3);
      cta.style.visibility = a > 0 && o < 1 ? 'visible' : 'hidden'; cta.style.opacity = 1 - o;
      ctaIn.style.transform = `translateY(${(1 - a) * 110}%)`;
    }
    // end card
    {
      const a = smooth(t, T.end0, T.end0 + 0.6);
      endc.style.visibility = a > 0 ? 'visible' : 'hidden'; endc.style.opacity = a;
      const r = (e, d, dy = 30) => { const k = eo5(prog(t, T.end0 + d, T.end0 + d + 0.6)); e.style.opacity = k; e.style.transform = (e === eBtn ? 'translateX(-50%) ' : '') + `translateY(${(1 - k) * dy}px)`; };
      r(eLogo, 0.15); r(eLine, 0.35); r(eBtn, 0.55); r(eUrls, 0.75, 16);
      shade.style.opacity = shade.style.opacity * (1 - a); shadeTop.style.opacity = 1 - a * 0.5;
    }
  }
  const noiseX = () => 0;
  return { update };
}
