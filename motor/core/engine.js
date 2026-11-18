// =====================================================================
//  Saberium · motor de reels · núcleo
//  Lo que es igual en todos los vídeos: tiempos, subtítulos palabra a palabra,
//  logo de esquina, frase de cierre literal, tarjeta final, grano y viñeta,
//  marcas para la música y el informe de zonas seguras.
//  Cada vídeo escribe solo sus escenas en escenas.js con Reel.scene(...).
// =====================================================================

// ---------- helpers ----------
const $ = s => document.querySelector(s);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  out: k => 1 - Math.pow(1 - k, 3), out5: k => 1 - Math.pow(1 - k, 5), in: k => k * k * k, in2: k => k * k,
  io: k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2, io2: k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2,
  expo: k => k >= 1 ? 1 : 1 - Math.pow(2, -10 * k), lin: k => k,
  back: k => { const c = 1.70158; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); }
};
// fast-out / slow-in move from a to b that starts at t0 and lasts d
const mv = (t, t0, d, a, b, e = E.expo) => lerp(a, b, e(seg(t, t0, t0 + d)));
// in, hold, out: 0 -> 1 between a and a+fi, 1 until b, 1 -> 0 until b+fo
const inout = (t, a, b, fi = .45, fo = .45, e = E.io) => e(seg(t, a, a + fi)) * (1 - e(seg(t, b, b + fo)));
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function el(tag, cls, parent, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e; }
const css = (e, o) => { for (const k in o) e.style[k] = o[k]; return e; };
const fmt = (v, dec = 1) => v.toFixed(dec).replace('.', ',');   // decimal comma
const ASSET = p => window.ASSETS + '/' + p;                     // repo assets/ folder

// ---------- timing ----------
const TM = window.TIMING;
const DUR = TM.duration;
const L = n => TM.lines.find(l => l.id === n);
// W(3,'cargó') -> first word of line 3 that starts with it (nth = occurrence)
function W(n, txt, nth = 0) {
  const norm = s => s.toLowerCase().replace(/[.,:;¿?¡!"«»]/g, '');
  const ws = L(n).words.filter(w => norm(w.w).startsWith(norm(txt)));
  if (!ws.length) throw new Error(`W(${n},'${txt}'): esa palabra no está en la línea ${n}`);
  return ws[nth] || ws[0];
}
const CTA = L(TM.cta_line);

// ---------- the Reel object: scenes register here ----------
const Reel = {
  scenes: [], hits: [], sections: [], anchors: {}, skipCaps: [],
  opts: { capsBottom: 400, logo: true, grain: true },
  config(o) { Object.assign(this.opts, o); },
  // a scene: {name, build(root), update(t, root), z}
  scene(s) { this.scenes.push(s); },
  // sound marks for the music: kind = hit | whoosh | click | tick | thud | rise | pluck
  hit(t, kind = 'hit', gain = 1) { this.hits.push({ t: +t.toFixed(3), kind, gain }); },
  // music mood between t0 and t1: tension | pulso | calma | claro
  section(t0, t1, mood) { this.sections.push({ t0: +t0.toFixed(3), t1: +t1.toFixed(3), mood }); },
  anchor(name, t) { this.anchors[name] = +t.toFixed(3); return t; },
  // hide the running captions for these line ids (when the scene shows the text itself)
  noCaptions(...ids) { this.skipCaps.push(...ids); },
};
window.Reel = Reel;

// ---------- kinetic captions ----------
const capScreens = [];
function buildCaptions() {
  const root = $('#caps');
  root.style.setProperty('--caps-bottom', Reel.opts.capsBottom + 'px');
  TM.lines.forEach(line => {
    if (line.id === TM.cta_line || Reel.skipCaps.includes(line.id)) return;
    const screens = {};
    line.words.forEach(w => { (screens[w.screen] = screens[w.screen] || []).push(w); });
    Object.keys(screens).map(Number).sort((a, b) => a - b).forEach(k => {
      const ws = screens[k]; const box = el('div', 'cap txt', root); const rows = {};
      ws.forEach(w => {
        if (!rows[w.row]) { const ln = el('div', 'ln', box); rows[w.row] = { ln, inn: el('span', 'in', ln) }; }
        const wd = el('span', 'wd' + (w.style === 'nuance' ? ' nu' : ''), rows[w.row].inn);
        w._pill = el('span', 'pill', wd); w._tx = el('span', 'tx', wd, w.w); w._el = wd;
      });
      box.dataset.text = ws.map(w => w.w).join(' ');
      capScreens.push({ box, ws, rows: Object.values(rows), t0: ws[0].start - 0.14, end: ws[ws.length - 1].end });
    });
  });
  capScreens.forEach((s, i) => {
    const n = capScreens[i + 1];
    if (n && n.t0 - s.end < 0.75) { s.t1 = n.t0; s.roll = true; } else { s.t1 = s.end + 0.55; s.roll = false; }
  });
}
function updateCaptions(t) {
  for (const s of capScreens) {
    const on = t >= s.t0 && t < s.t1 + 0.45;
    s.box.style.display = on ? 'flex' : 'none'; if (!on) continue;
    const outK = s.roll ? E.expo(seg(t, s.t1, s.t1 + 0.34)) : E.in2(seg(t, s.t1, s.t1 + 0.25));
    const k = E.expo(seg(t, s.t0, s.t0 + 0.34));
    s.rows.forEach(r => { r.inn.style.transform = `translateY(${(1 - k) * 105 - outK * 105}%)`; });
    s.ws.forEach((w, i) => {
      const nxt = s.ws[i + 1]; const endT = nxt ? nxt.start : Math.min(w.end + 0.25, s.t1);
      const cur = t >= w.start && t < endT; const said = t >= w.start;
      const a = cur ? E.out(seg(t, w.start, w.start + 0.10)) : (said ? 1 - seg(t, endT, endT + 0.10) : 0);
      w._pill.style.opacity = a > 0 ? a : 0;
      w._pill.style.transform = `scale(${0.86 + 0.14 * a})`;
      w._tx.style.color = a > 0.5 ? '#04051C' : (said && w.style === 'key' ? '#9CC8FF' : '#fff');
      w._tx.style.opacity = said ? 1 : 0.68;
      w._tx.style.textShadow = a > 0.5 ? 'none' : '';
    });
  }
}

// ---------- call to action, word for word, and end card ----------
// The screen text is fixed (TM.cta_screen); each word lights up when the voice says it.
const ctaWords = [];
function buildCTA() {
  const root = $('#cta');
  const said = CTA.words; const norm = s => s.toLowerCase().replace(/[.,:;]/g, '');
  const rows = [['Comenta', 'WEB'], ['y', 'te', 'enseñamos', 'gratis'], ['cómo', 'quedaría', 'la', 'tuya']];
  let si = 0;
  rows.forEach((r, ri) => {
    const ln = el('div', 'ctaLn txt', root); ln.style.top = (Reel.opts.ctaTop || 760) + ri * 128 + 'px';
    const inn = el('span', 'in', ln); ln.dataset.text = r.join(' ');
    r.forEach(word => {
      while (si < said.length && norm(said[si].w) !== norm(word)) si++;
      const w = said[si] || said[said.length - 1]; si++;
      const wd = el('span', 'wd' + (word === 'gratis' ? ' nu' : ''), inn);
      const pill = el('span', 'pill' + (word === 'WEB' ? ' web' : ''), wd); el('span', 'tx', wd, word);
      ctaWords.push({ w, wd, pill, web: word === 'WEB', row: ri, inn });
    });
  });
  const ec = $('#endcard');
  el('img', '', ec).src = ASSET('logo-blanco.png');
  el('div', 'url', ec, 'saberium.com · @saberium.studio');
  Reel.anchor('cta0', CTA.start); Reel.anchor('end0', CTA.end + 0.35);
}
function updateCTA(t) {
  const c0 = CTA.start - 0.3, e0 = Reel.anchors.end0;
  $('#cta').style.display = t > c0 ? 'block' : 'none';
  const rowsIn = [0, 0, 0];
  ctaWords.forEach(q => {
    const k = E.expo(seg(t, q.w.start - 0.08, q.w.start + 0.38));
    rowsIn[q.row] = Math.max(rowsIn[q.row], k);
    const i = CTA.words.indexOf(q.w); const nxt = CTA.words[i + 1]; const endT = nxt ? nxt.start : q.w.end + 0.3;
    const cur = t >= q.w.start && t < endT;
    let pk = cur ? E.out(seg(t, q.w.start, q.w.start + 0.12)) : (t >= endT ? 1 - seg(t, endT, endT + 0.12) : 0);
    if (q.web) pk = clamp(E.back(seg(t, q.w.start + 0.02, q.w.start + 0.4)));
    q.pill.style.opacity = pk > 0.02 ? (q.web ? 1 : pk) : 0;
    q.pill.style.transform = q.web ? `scaleX(${pk})` : `scale(${0.9 + 0.1 * pk})`;
    q.wd.querySelector('.tx').style.color = (!q.web && pk > 0.5) ? '#04051C' : '#fff';
    q.wd.style.opacity = t >= q.w.start - 0.05 ? 1 : 0.55;
  });
  ctaWords.forEach(q => { q.inn.style.transform = `translateY(${(1 - rowsIn[q.row]) * 105}%)`; });
  // the CTA moves up a little when the logo arrives; it stays on screen to the end
  const ek = E.io(seg(t, e0, e0 + 0.8));
  $('#cta').style.transform = `translateY(${-ek * 300}px)`;
  const ec = $('#endcard'); ec.style.display = ek > 0 ? 'block' : 'none';
  const img = ec.querySelector('img');
  img.style.clipPath = `inset(0 ${(1 - E.expo(seg(t, e0 + 0.2, e0 + 1.0))) * 100}% 0 0)`;
  img.style.transform = `translateY(${(1 - E.expo(seg(t, e0 + 0.2, e0 + 1.0))) * 30}px)`;
  ec.querySelector('.url').style.opacity = E.out(seg(t, e0 + 0.7, e0 + 1.2));
  $('#ctaScrim').style.opacity = E.io(seg(t, c0 - 0.2, c0 + 0.5));
}

// ---------- corner logo ----------
function buildChrome() {
  const b = $('#brand');
  if (Reel.opts.logo) { el('img', '', b).src = ASSET('icono-blanco.png'); el('span', '', b, 'SABERIUM'); }
  const g = $('#grain');
  g.innerHTML = '<svg width="1080" height="1920"><filter id="grainF"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 .7  0 0 0 0 .78  0 0 0 0 1  0 0 0 .55 0"/></filter><rect width="1080" height="1920" filter="url(#grainF)"/></svg>';
  g.style.display = Reel.opts.grain ? 'block' : 'none';
}

// ---------- start ----------
function start() {
  const stage = $('#stage');
  Reel.scenes.forEach((s, i) => {
    s.root = el('div', 'scene', stage); s.root.dataset.scene = s.name || ('s' + i);
    s.root.style.zIndex = s.z != null ? s.z : 10 + i;
    if (s.build) s.build(s.root);
  });
  buildCaptions(); buildCTA(); buildChrome();
  // default music plan when the scenes give none
  if (!Reel.sections.length) {
    const hookEnd = TM.lines[1] ? TM.lines[1].start - 0.2 : 3;
    Reel.section(0, hookEnd, 'tension'); Reel.section(hookEnd, Reel.anchors.end0, 'pulso');
  }
  Reel.section(Reel.anchors.end0, DUR, 'final');
  window.__anchors = Object.assign({}, Reel.anchors, { _hits: Reel.hits, _sections: Reel.sections });
  window.__seek(0);
}
window.__seek = function (ms) {
  const t = ms / 1000;
  for (const s of Reel.scenes) if (s.update) s.update(t, s.root);
  updateCaptions(t); updateCTA(t);
};
// layout report for the safe-zone check: every visible text box at time t
window.__layout = function (ms) {
  window.__seek(ms);
  const out = [];
  const vis = e => { for (let n = e; n && n !== document.body; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return false; } return true; };
  document.querySelectorAll('#stage .txt').forEach(e => {
    if (!vis(e)) return;
    const ins = e.querySelectorAll('.in'); let r = e.getBoundingClientRect();
    if (ins.length) { const rs = [...ins].map(i => i.getBoundingClientRect());
      r = { left: Math.min(...rs.map(q => q.left)), right: Math.max(...rs.map(q => q.right)), top: r.top, bottom: r.bottom, width: r.width, height: r.height }; }
    if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > 1920) return;
    out.push({ txt: (e.dataset.text || e.textContent).trim().slice(0, 60), top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right) });
  });
  return out;
};
