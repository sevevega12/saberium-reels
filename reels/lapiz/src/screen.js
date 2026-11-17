// Everything that lives on the sheet of paper / phone screen. Drawn on a 2D canvas, used as a texture.
import { clamp, lerp, prog, eio, eo, eo5, move, smooth, mulberry, fmt } from './util.js';
import { T, DOT } from './timing.js';
import { SCREEN, PAPER } from './scene.js';

const W = SCREEN.w, H = SCREEN.h, S = SCREEN.scale;
const SANS = '"Plus Jakarta Sans", sans-serif', MONO = '"JetBrains Mono", monospace', GEN = 'Arial, "Liberation Sans", "DejaVu Sans", sans-serif';
const INK = '#2a2c35', BLUE = '#0A22F1', LIGHT = '#9CC8FF', NIGHT = '#04051C';

const loadImg = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
function off(w, h, draw) { const c = document.createElement('canvas'); c.width = Math.round(w * S); c.height = Math.round(h * S); const x = c.getContext('2d'); x.scale(S, S); draw(x); return c; }

// ---- stroke paths (pencil follows these) ----
function mkPath(strokes, upCost = 30) {
  const segs = []; let total = 0;
  strokes.forEach((pts, si) => {
    if (si) { total += upCost; }
    const start = total; let len = 0; const cum = [0];
    for (let i = 1; i < pts.length; i++) { len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); cum.push(len); }
    total += len; segs.push({ pts, start, len, cum });
  });
  const at = (seg, d) => { const { pts, cum } = seg; let i = 1; while (i < cum.length - 1 && cum[i] < d) i++; const f = clamp((d - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1])); return [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]; };
  return {
    segs, total,
    // p in 0..1 -> {x,y,down}
    tip(p) {
      const d = clamp(p) * total;
      for (let i = 0; i < segs.length; i++) {
        const s = segs[i];
        if (d < s.start) { const prev = segs[i - 1]; const a = at(prev, prev.len), b = s.pts[0]; const f = eio(clamp((d - (prev.start + prev.len)) / upCost)); return { x: lerp(a[0], b[0], f), y: lerp(a[1], b[1], f), down: false, lift: Math.sin(f * Math.PI) }; }
        if (d <= s.start + s.len) { const q = at(s, d - s.start); return { x: q[0], y: q[1], down: true, lift: 0 }; }
      }
      const l = segs[segs.length - 1], q = at(l, l.len); return { x: q[0], y: q[1], down: true, lift: 0 };
    },
    draw(c, p, style) {
      const d = clamp(p) * total;
      c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
      for (const pass of style.passes) {
        c.strokeStyle = pass.color; c.lineWidth = pass.w; c.globalAlpha = pass.a;
        for (const s of segs) {
          if (d <= s.start) break;
          const dd = Math.min(s.len, d - s.start);
          c.beginPath(); c.moveTo(s.pts[0][0] + pass.j, s.pts[0][1] + pass.j);
          for (let i = 1; i < s.pts.length; i++) {
            if (s.cum[i] <= dd) c.lineTo(s.pts[i][0] + pass.j, s.pts[i][1] + pass.j);
            else { const q = at(s, dd); c.lineTo(q[0] + pass.j, q[1] + pass.j); break; }
          }
          c.stroke();
        }
      }
      c.restore();
    },
  };
}
const rectPts = (x, y, w, h, r = 0) => {
  if (!r) return [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];
  const p = []; const arc = (cx, cy, a0) => { for (let i = 0; i <= 6; i++) { const a = a0 + (i / 6) * Math.PI / 2; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  p.push([x + r, y]); arc(x + w - r, y + r, -Math.PI / 2); arc(x + w - r, y + h - r, 0); arc(x + r, y + h - r, Math.PI / 2); arc(x + r, y + r, Math.PI); return p;
};
const circlePts = (cx, cy, r, n = 20) => Array.from({ length: n + 1 }, (_, i) => [cx + Math.cos(i / n * 6.283 - 1.2) * r, cy + Math.sin(i / n * 6.283 - 1.2) * r]);
const wob = (pts, amp, seed) => { const r = mulberry(seed); return pts.map(([x, y]) => [x + (r() - 0.5) * amp, y + (r() - 0.5) * amp]); };
const dense = (pts, step = 8) => { const o = [pts[0]]; for (let i = 1; i < pts.length; i++) { const [ax, ay] = pts[i - 1], [bx, by] = pts[i]; const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / step)); for (let k = 1; k <= n; k++) o.push([lerp(ax, bx, k / n), lerp(ay, by, k / n)]); } return o; };

// wireframe of the new site (screen px). Page area starts at y=96.
export const WIRE = mkPath([
  wob(dense(rectPts(22, 112, 346, 262, 14)), 1.2, 1),        // hero frame
  wob(dense([[44, 232], [250, 232]]), 1.0, 2),               // headline 1
  wob(dense([[44, 262], [196, 262]]), 1.0, 3),               // headline 2
  wob(dense(rectPts(44, 300, 132, 44, 22)), 1.0, 4),         // button
  wob(dense(rectPts(22, 396, 166, 150, 12)), 1.2, 5),        // card 1
  wob(dense(rectPts(202, 396, 166, 150, 12)), 1.2, 6),       // card 2
  wob(dense([[22, 580], [300, 580]]), 1.0, 7),
  wob(dense([[22, 610], [230, 610]]), 1.0, 8),
], 46);

// handwritten "WEB" in millimetres on the sheet (origin = sheet centre, y down)
const hw = (pts, seed) => wob(dense(pts, 1.2), 0.22, seed);
const bez = (p0, p1, p2, p3, n = 14) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]; });
export const WEBPATH = mkPath([
  hw([[-41, -34], [-33.5, -6], [-26, -27], [-19, -6], [-11, -35]], 11),                                        // W
  hw([[13, -33.5], [-2.5, -32.5], [-3.5, -7], [13.5, -8]], 12), hw([[-3, -20.5], [9.5, -21.5]], 13),           // E
  hw([[21.5, -34], [22.5, -6.5]], 14),
  wob([...bez([21.5, -33.5], [37, -37], [38, -22], [23, -21]), ...bez([23, -21], [42, -23], [43, -5], [22.5, -6.5])], 0.15, 15), // B
  hw([[-41, 2.5], [-10, 1.2], [14, 2.2], [40, 0.6]], 16),                                                       // underline
], 9);

export async function createScreen() {
  const canvas = document.createElement('canvas'); canvas.width = W * S; canvas.height = H * S;
  const c = canvas.getContext('2d');
  const [amp, atl, bar] = await Promise.all(['amperiza', 'atlantis', 'barber'].map((n) => loadImg(`captures/crop-${n}.png`)));
  const SITES = [
    { img: amp, host: 'amperizaserviciosinmobiliarios.com', scroll: 330, chrome: '#ffffff', dark: false },
    { img: atl, host: 'atlantischarter.com', scroll: 335, from: 150, chrome: '#c4564a', dark: true },
    { img: bar, host: 'thebarberkingdom.com', scroll: 640, chrome: '#0b0b0b', dark: true },
  ];

  // paper fibre
  const paperTex = off(W, H, (x) => {
    x.fillStyle = '#f5f3ed'; x.fillRect(0, 0, W, H);
    const r = mulberry(21);
    for (let i = 0; i < 5000; i++) { x.fillStyle = `rgba(${r() > 0.5 ? '255,255,255' : '120,110,90'},${r() * 0.05})`; x.fillRect(r() * W, r() * H, 0.6 + r() * 2.5, 0.5 + r() * 0.8); }
  });

  // ---- chrome ----
  function statusBar(x, dark, a = 1) {
    x.save(); x.globalAlpha *= a; x.fillStyle = dark ? '#fff' : '#111';
    x.font = `700 15px ${SANS}`; x.textBaseline = 'middle'; x.textAlign = 'left'; x.fillText('10:24', 30, 25);
    // signal + battery (generic)
    for (let i = 0; i < 4; i++) x.fillRect(296 + i * 6, 30 - 4 - i * 2.5, 4, 4 + i * 2.5);
    rr(x, 330, 18, 27, 13, 4); x.lineWidth = 1.2; x.strokeStyle = dark ? '#fff' : '#111'; x.stroke(); rr(x, 332, 20, 19, 9, 2); x.fill(); x.fillRect(358.5, 22, 2, 5);
    x.fillStyle = '#000'; rr(x, 150, 12, 90, 26, 13); x.fill(); // camera island
    x.restore();
  }
  function addressBar(x, text, opts = {}) {
    const { dark = false, bg = '#fff', progress = -1, lock = true } = opts;
    x.fillStyle = bg; x.fillRect(0, 0, W, 96);
    statusBar(x, dark);
    rr(x, 16, 50, W - 32, 38, 19); x.fillStyle = dark ? 'rgba(255,255,255,.14)' : '#eef0f5'; x.fill();
    x.fillStyle = dark ? 'rgba(255,255,255,.92)' : '#1b1d27'; x.font = `500 14.5px ${SANS}`; x.textAlign = 'center'; x.textBaseline = 'middle';
    let s = text; while (x.measureText(s).width > 270) s = s.slice(0, -2); if (s !== text) s += '…';
    const tw = x.measureText(s).width;
    x.fillText(s, W / 2 + (lock ? 7 : 0), 69.5);
    if (lock) { const lx = W / 2 - tw / 2 - 9; x.fillRect(lx - 4, 67, 9, 7); x.lineWidth = 1.5; x.strokeStyle = x.fillStyle; x.beginPath(); x.arc(lx + 0.5, 67, 3, Math.PI, 0); x.stroke(); }
    if (progress >= 0) { x.fillStyle = BLUE; x.fillRect(0, 93, W * progress, 3); }
    x.fillStyle = dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.08)'; x.fillRect(0, 95.5, W, 0.5);
  }

  // ---- the generic "bad" site ----
  const BADH = 1250;
  const bad = off(W, BADH, (x) => {
    x.fillStyle = '#f3f1ec'; x.fillRect(0, 0, W, BADH);
    // header
    x.fillStyle = '#fff'; x.fillRect(0, 0, W, 54); x.fillStyle = '#6b6f76'; x.font = `bold 17px ${GEN}`; x.textBaseline = 'middle'; x.textAlign = 'left'; x.fillText('TU NEGOCIO', 18, 28);
    for (let i = 0; i < 3; i++) x.fillRect(346, 19 + i * 8, 26, 3);
    // hero "stock photo": generic skyline at dusk
    const g = x.createLinearGradient(0, 54, 0, 354); g.addColorStop(0, '#7f97a8'); g.addColorStop(0.6, '#b9b3a0'); g.addColorStop(1, '#8c8473'); x.fillStyle = g; x.fillRect(0, 54, W, 300);
    const r = mulberry(4); x.fillStyle = 'rgba(60,66,74,.75)';
    let bx = -10; while (bx < W) { const bw = 22 + r() * 40, bh = 50 + r() * 130; x.fillRect(bx, 354 - bh, bw, bh); x.fillStyle = 'rgba(230,220,180,.35)'; for (let k = 0; k < 6; k++) x.fillRect(bx + 4 + r() * (bw - 10), 354 - bh + 8 + r() * (bh - 16), 3, 4); x.fillStyle = `rgba(${55 + r() * 20},${62 + r() * 20},${72 + r() * 20},.78)`; bx += bw + 2; }
    x.fillStyle = 'rgba(40,44,52,.45)'; x.fillRect(0, 54, W, 300);
    x.fillStyle = '#fff'; x.textAlign = 'center'; x.font = `bold 27px ${GEN}`; x.fillText('Bienvenidos a', W / 2, 160); x.fillText('nuestra página web', W / 2, 194);
    x.font = `15px ${GEN}`; x.fillStyle = 'rgba(255,255,255,.85)'; x.fillText('Calidad, confianza y experiencia', W / 2, 232);
    x.fillStyle = '#4f8a8b'; rr(x, W / 2 - 88, 262, 176, 42, 4); x.fill(); x.fillStyle = '#fff'; x.font = `bold 13px ${GEN}`; x.fillText('MÁS INFORMACIÓN', W / 2, 284);
    // services
    x.fillStyle = '#555a61'; x.font = `bold 21px ${GEN}`; x.fillText('Nuestros servicios', W / 2, 400);
    x.fillStyle = '#4f8a8b'; x.fillRect(W / 2 - 24, 418, 48, 3);
    ['Calidad', 'Confianza', 'Experiencia'].forEach((s, i) => {
      const cx = 70 + i * 125; x.fillStyle = '#fff'; rr(x, cx - 54, 446, 108, 132, 4); x.fill(); x.strokeStyle = '#dcd8cf'; x.lineWidth = 1; x.stroke();
      x.strokeStyle = '#4f8a8b'; x.lineWidth = 2.5; x.beginPath(); x.arc(cx, 492, 21, 0, 6.3); x.stroke();
      x.beginPath(); if (i === 0) { x.moveTo(cx - 9, 492); x.lineTo(cx - 2, 499); x.lineTo(cx + 10, 485); } else if (i === 1) { x.arc(cx, 487, 6, 0, 6.3); x.moveTo(cx - 11, 503); x.quadraticCurveTo(cx, 490, cx + 11, 503); } else { x.moveTo(cx, 480); x.lineTo(cx, 493); x.lineTo(cx + 8, 498); } x.stroke();
      x.fillStyle = '#555a61'; x.font = `bold 13.5px ${GEN}`; x.fillText(s, cx, 540); x.fillStyle = '#9a9da2'; x.font = `11px ${GEN}`; x.fillText('Lorem ipsum', cx, 558);
    });
    // about
    x.fillStyle = '#555a61'; x.font = `bold 21px ${GEN}`; x.fillText('Sobre nosotros', W / 2, 640);
    x.fillStyle = '#8b8e94'; x.font = `14px ${GEN}`;
    ['Somos una empresa líder en el sector', 'con muchos años de experiencia.', 'Nuestro compromiso es su satisfacción.', 'Contacte con nosotros sin compromiso.'].forEach((l, i) => x.fillText(l, W / 2, 676 + i * 23));
    x.fillStyle = '#4f8a8b'; rr(x, W / 2 - 70, 780, 140, 40, 4); x.fill(); x.fillStyle = '#fff'; x.font = `bold 13px ${GEN}`; x.fillText('CONTACTO', W / 2, 801);
    // news block that dates the site
    x.fillStyle = '#e7e3da'; x.fillRect(0, 856, W, 176);
    x.fillStyle = '#555a61'; x.font = `bold 18px ${GEN}`; x.textAlign = 'left'; x.fillText('Últimas noticias', 22, 890);
    x.fillStyle = '#8b8e94'; x.font = `13.5px ${GEN}`; x.fillText('Estrenamos nueva página web', 22, 926); x.fillText('Horario especial de verano', 22, 972);
    x.fillStyle = '#b0aca2'; x.font = `12px ${GEN}`; x.fillText('Publicado hace mucho tiempo', 22, 945); x.fillText('Publicado hace mucho tiempo', 22, 991);
    // footer (year drawn live)
    x.fillStyle = '#3d4046'; x.fillRect(0, 1032, W, BADH - 1032);
    x.fillStyle = '#a9adb3'; x.font = `12px ${GEN}`; x.textAlign = 'center'; x.fillText('Inicio   |   Servicios   |   Contacto   |   Aviso legal', W / 2, 1076);
    x.fillStyle = '#777b82'; x.font = `11px ${GEN}`; x.fillText('Plantilla Básica n.º 3', W / 2, 1206);
  });
  const FOOT_Y = 1136; // baseline of the © line inside `bad`
  function badPage(x, scroll, year, yearRoll, loadP = 1) { // draws page area (y>=96) of the bad site
    x.save(); x.beginPath(); x.rect(0, 96, W, H - 96); x.clip();
    x.fillStyle = '#fff'; x.fillRect(0, 96, W, H - 96);
    const vis = (H - 96) * clamp(loadP);
    if (vis > 0) x.drawImage(bad, 0, scroll * S, W * S, vis * S, 0, 96, W, vis);
    // footer line with rolling year
    const fy = 96 + FOOT_Y - scroll;
    if (fy > 96 && fy < H + 30 && loadP >= 1) {
      x.font = `bold 15.5px ${GEN}`; x.textBaseline = 'middle'; x.textAlign = 'left';
      const pre = '© ', post = ' · Todos los derechos reservados';
      const wPre = x.measureText(pre).width, wY = x.measureText('2016').width, wPost = x.measureText(post).width;
      let x0 = W / 2 - (wPre + wY + wPost) / 2;
      x.fillStyle = '#d5d8dd'; x.fillText(pre, x0, fy); x.fillText(post, x0 + wPre + wY, fy);
      // year: rolling digits
      x.save(); x.beginPath(); x.rect(x0 + wPre - 2, fy - 11, wY + 4, 22); x.clip();
      x.fillStyle = '#fff';
      x.fillText(String(year), x0 + wPre, fy + yearRoll * 20); x.fillText(String(year - 1), x0 + wPre, fy - 20 + yearRoll * 20);
      x.restore();
      x.strokeStyle = 'rgba(156,200,255,.9)'; x.lineWidth = 1.5; rr(x, x0 + wPre - 6, fy - 14, wY + 12, 27, 6); x.stroke();
    }
    x.restore();
  }
  const badFull = document.createElement('canvas'); badFull.width = W * S; badFull.height = H * S; // one full phone page of the bad site (tile)
  { const x = badFull.getContext('2d'); x.scale(S, S); addressBar(x, 'tunegocio.es'); badPage(x, 0, 2026, 0); }

  // ---- search screen ----
  const ROWS = [{ y: 352, name: 'Tu negocio', d: 'A 300 m' }, { y: 478, name: 'El de enfrente', d: 'A 350 m' }, { y: 604, name: 'Otro del barrio', d: 'A 600 m' }];
  const mapTile = off(W - 32, 176, (x) => {
    const w = W - 32, h = 176; rr(x, 0, 0, w, h, 18); x.clip();
    x.fillStyle = '#e4ebf5'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#d3e3d6'; rr(x, 228, 96, 130, 90, 10); x.fill(); x.fillStyle = '#cfe0f4'; rr(x, -20, 120, 120, 70, 14); x.fill();
    x.strokeStyle = '#fff'; x.lineCap = 'round';
    x.lineWidth = 15; x.beginPath(); x.moveTo(-10, 88); x.lineTo(w + 10, 70); x.stroke();
    x.lineWidth = 9; for (const [a, b, d, e] of [[60, -5, 82, h + 5], [176, -5, 190, h + 5], [292, -5, 300, h + 5], [-5, 30, w + 5, 22], [-5, 150, w + 5, 140]]) { x.beginPath(); x.moveTo(a, b); x.lineTo(d, e); x.stroke(); }
    const pin = (px, py, col, lab) => { x.fillStyle = 'rgba(0,0,0,.18)'; x.beginPath(); x.ellipse(px, py + 2, 7, 3, 0, 0, 6.3); x.fill(); x.fillStyle = col; x.beginPath(); x.arc(px, py - 17, 10, Math.PI * 0.85, Math.PI * 0.15); x.lineTo(px, py); x.closePath(); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(px, py - 17, 4, 0, 6.3); x.fill(); };
    pin(128, 70, BLUE); pin(222, 108, '#1c1f2e'); pin(318, 56, '#8a90a3');
    x.fillStyle = BLUE; x.beginPath(); x.arc(172, 92, 6, 0, 6.3); x.fill(); x.strokeStyle = 'rgba(10,34,241,.25)'; x.lineWidth = 8; x.beginPath(); x.arc(172, 92, 10, 0, 6.3); x.stroke();
  });
  function row(x, r, o = {}) {
    const { a = 1, dy = 0, press = 0, state = '' , openP = 0 } = o;
    x.save(); x.globalAlpha *= a; x.translate(0, dy);
    const grey = state === 'unseen';
    x.shadowColor = 'rgba(20,30,80,.10)'; x.shadowBlur = 16; x.shadowOffsetY = 4;
    rr(x, 16, r.y, W - 32, 112, 18); x.fillStyle = grey ? '#eceef2' : press ? '#eaf0ff' : '#fff'; x.fill(); x.shadowColor = 'transparent';
    if (state === 'open') { x.strokeStyle = BLUE; x.lineWidth = 2; rr(x, 16, r.y, W - 32, 112, 18); x.stroke(); }
    // letter avatar
    x.fillStyle = grey ? '#d5d8df' : r.name === 'Tu negocio' ? '#dfe6ff' : '#e8eaf0'; rr(x, 30, r.y + 18, 46, 46, 12); x.fill();
    x.fillStyle = grey ? '#a4a8b3' : r.name === 'Tu negocio' ? BLUE : '#3b4052'; x.font = `800 20px ${SANS}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(r.name[0], 53, r.y + 42);
    x.textAlign = 'left'; x.fillStyle = grey ? '#9a9eaa' : '#12141f'; x.font = `800 19px ${SANS}`; x.fillText(r.name, 90, r.y + 32);
    x.font = `500 14px ${SANS}`; x.fillStyle = grey ? '#a9adb8' : '#5a6072'; x.fillText(r.d + '  ·', 90, r.y + 56);
    const dw = x.measureText(r.d + '  ·  ').width; x.fillStyle = grey ? '#a9adb8' : '#16864b'; x.font = `700 14px ${SANS}`; x.fillText('Abierto', 90 + dw, r.y + 56);
    // web button
    const bx = 90, by = r.y + 74;
    if (state === 'open') { rr(x, bx, by, 150, 26, 13); x.fillStyle = '#e6ecff'; x.fill(); x.save(); rr(x, bx, by, 150, 26, 13); x.clip(); x.fillStyle = BLUE; x.fillRect(bx, by, 150 * openP, 26); x.restore(); x.fillStyle = openP > 0.5 ? '#fff' : BLUE; x.font = `700 13px ${SANS}`; x.fillText('Abriendo su web…', bx + 14, by + 13.5); }
    else if (grey) { rr(x, bx, by, 112, 26, 13); x.fillStyle = '#dfe1e7'; x.fill(); x.fillStyle = '#8e93a1'; x.font = `700 13px ${SANS}`; x.fillText('Sin visitar', bx + 34, by + 13.5); x.strokeStyle = '#8e93a1'; x.lineWidth = 1.6; x.beginPath(); x.ellipse(bx + 18, by + 13, 7, 4.2, 0, 0, 6.3); x.stroke(); x.beginPath(); x.moveTo(bx + 11, by + 20); x.lineTo(bx + 25, by + 6); x.stroke(); }
    else { rr(x, bx, by, 98, 26, 13); x.fillStyle = '#eef1f8'; x.fill(); x.fillStyle = BLUE; x.font = `700 13px ${SANS}`; x.fillText('Ver su web', bx + 14, by + 13.5); }
    x.strokeStyle = grey ? '#c3c6cf' : '#9aa0b4'; x.lineWidth = 2; x.lineCap = 'round'; x.beginPath(); x.moveTo(346, r.y + 48); x.lineTo(353, r.y + 56); x.lineTo(346, r.y + 64); x.stroke();
    x.restore();
  }
  function searchScreen(x, typed, resP, o = {}) {
    x.fillStyle = '#f4f6fb'; x.fillRect(0, 0, W, H);
    statusBar(x, false);
    // search field
    x.save(); x.shadowColor = 'rgba(20,30,80,.12)'; x.shadowBlur = 14; x.shadowOffsetY = 3; rr(x, 16, 50, W - 32, 46, 23); x.fillStyle = '#fff'; x.fill(); x.restore();
    x.strokeStyle = '#5a6072'; x.lineWidth = 2.2; x.beginPath(); x.arc(40, 72, 7, 0, 6.3); x.moveTo(45.5, 77.5); x.lineTo(50, 82); x.stroke();
    x.font = `500 16.5px ${SANS}`; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillStyle = '#12141f';
    const q = 'negocio cerca de mí'.slice(0, typed); x.fillText(q, 62, 73.5);
    if (o.caret) { x.fillStyle = BLUE; x.fillRect(62 + x.measureText(q).width + 2, 62, 2, 22); }
    if (resP <= 0) return;
    const a0 = eo(clamp(resP * 2.2));
    x.save(); x.globalAlpha = a0;
    // chips
    x.font = `700 12.5px ${SANS}`;
    [['Cerca de ti', true], ['Abierto ahora', false], ['Mejor valorados', false]].reduce((cx, [l, on]) => { const w = x.measureText(l).width + 26; rr(x, cx, 108, w, 28, 14); x.fillStyle = on ? '#12141f' : '#e7eaf2'; x.fill(); x.fillStyle = on ? '#fff' : '#4a5063'; x.fillText(l, cx + 13, 122.5); return cx + w + 8; }, 16);
    x.drawImage(mapTile, 16, 148 + (1 - a0) * 16, W - 32, 176);
    x.restore();
    x.fillStyle = `rgba(90,96,114,${a0})`; x.font = `500 11.5px ${MONO}`; x.fillText('3 RESULTADOS', 20, 340);
    ROWS.forEach((r, i) => { const p = eo5(clamp(resP * 2.4 - 0.5 - i * 0.28)); if (p > 0) row(x, r, { a: p, dy: (1 - p) * 40, press: o.press === i ? 1 : 0, state: o.states?.[i] || '', openP: o.openP || 0 }); });
  }

  // ---- real sites ----
  function realSite(x, i, scroll, dx = 0) {
    const s = SITES[i];
    x.save(); x.translate(dx, 0); x.beginPath(); x.rect(0, 0, W, H); x.clip();
    if (s.img) x.drawImage(s.img, 0, scroll * 3, 1170, (H - 96) * 3, 0, 96, W, H - 96);
    addressBar(x, s.host, { dark: s.dark, bg: s.chrome });
    x.restore();
  }

  // ---- touch point (the graphite dot grown into the customer's touch) ----
  function touch(x, px, py, a, press, ripple) {
    if (a <= 0) return;
    x.save(); x.globalAlpha = a;
    const r = 19 - press * 4;
    x.shadowColor = 'rgba(4,5,28,.35)'; x.shadowBlur = 14; x.shadowOffsetY = 5;
    x.fillStyle = 'rgba(10,34,241,.22)'; x.beginPath(); x.arc(px, py, r, 0, 6.3); x.fill(); x.shadowColor = 'transparent';
    x.strokeStyle = 'rgba(10,34,241,.9)'; x.lineWidth = 2; x.stroke();
    x.fillStyle = INK; x.beginPath(); x.arc(px, py, 4.2, 0, 6.3); x.fill();
    if (ripple > 0 && ripple < 1) { x.globalAlpha = a * (1 - ripple); x.strokeStyle = BLUE; x.lineWidth = 2.5; x.beginPath(); x.arc(px, py, 19 + eo(ripple) * 44, 0, 6.3); x.stroke(); }
    x.restore();
  }

  const GRAPHITE = { passes: [{ color: INK, w: 2.6, a: 0.85, j: 0 }, { color: '#4a4d58', w: 1.2, a: 0.5, j: 0.7 }] };
  const GRAPHITE_MM = { passes: [{ color: INK, w: 1.5, a: 0.9, j: 0 }, { color: '#55585f', w: 0.7, a: 0.5, j: 0.3 }] };

  const state = { touchPos: null };
  function draw(t, slabSize) {
    c.setTransform(S, 0, 0, S, 0, 0);
    c.globalAlpha = 1;
    const mmx = W / slabSize.sw, mmy = H / slabSize.sh; // px per mm on each axis
    const paper = () => { c.drawImage(paperTex, 0, 0, W, H); };
    const mmSpace = (fn) => { c.save(); c.translate(W / 2, H / 2); c.scale(mmx, mmy); fn(); c.restore(); };
    const dotMM = { x: (DOT.x - W / 2) / (W / 66.4), y: (DOT.y - H / 2) / (H / 146) };
    state.touch = null;

    if (t < T.wake) {
      paper();
      if (t >= T.touch) mmSpace(() => { const k = eo(prog(t, T.touch, T.touch + 0.25)); c.fillStyle = INK; c.beginPath(); c.arc(dotMM.x, dotMM.y, 0.75 * k, 0, 6.3); c.fill(); c.globalAlpha = 0.35; c.beginPath(); c.arc(dotMM.x + 0.1, dotMM.y + 0.1, 1.0 * k, 0, 6.3); c.fill(); });
      return;
    }
    // --- browser shell with the dot (wake) ---
    if (t < T.search0) {
      const a = eo(prog(t, T.wake, T.wake + 0.45));
      c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); c.globalAlpha = 1 - a; paper(); c.globalAlpha = a;
      addressBar(c, 'tunegocio.es'); c.globalAlpha = 1;
      // the page grows out of the dot: first point of contact -> the website itself
      const k = eio(prog(t, T.wake + 0.12, T.wake + 0.95));
      if (k > 0) {
        const rad = 12 + k * 760;
        c.save(); c.beginPath(); c.arc(DOT.x, DOT.y, rad, 0, 6.3); c.clip(); badPage(c, 0, 2026, 0); c.restore();
        if (k < 1) { c.strokeStyle = `rgba(10,34,241,${0.55 * (1 - k)})`; c.lineWidth = 2.5; c.beginPath(); c.arc(DOT.x, DOT.y, rad, 0, 6.3); c.stroke(); }
        c.save(); c.beginPath(); c.rect(0, 0, W, 96); c.clip(); addressBar(c, 'tunegocio.es'); c.restore();
      }
      touch(c, DOT.x, DOT.y, 1, 0, 0);
      return;
    }
    // touch path helper
    const P = (x, y) => ({ x, y });
    const mix = (a, b, f) => P(lerp(a.x, b.x, f), lerp(a.y, b.y, f));

    // --- search, tap "Tu negocio" ---
    if (t < T.load0 + 0.35) {
      const typed = Math.round(lerp(0, 19, prog(t, T.search0 + 0.15, T.typed)));
      const resP = prog(t, T.results, T.results + 0.75);
      const press = t > T.tap1 - 0.05 ? 0 : -1;
      const slide = move(t, T.load0, T.load0 + 0.35);
      c.save(); c.translate(-slide * W * 0.3, 0);
      searchScreen(c, typed, resP, { caret: t < T.typed + 0.2 && Math.floor(t * 3) % 2 === 0, press });
      // shell -> search cross-fade at the start
      const a = 1 - prog(t, T.search0, T.search0 + 0.3);
      if (a > 0) { c.globalAlpha = a; badPage(c, 0, 2026, 0); addressBar(c, 'tunegocio.es'); c.globalAlpha = 1; }
      const target = P(250, ROWS[0].y + 60);
      const pos = mix(P(DOT.x, DOT.y), target, smooth(t, T.results + 0.1, T.tap1 - 0.12));
      touch(c, pos.x, pos.y, 1 - prog(t, T.load0, T.load0 + 0.2), prog(t, T.tap1 - 0.08, T.tap1) * (1 - prog(t, T.tap1 + 0.1, T.tap1 + 0.25)), prog(t, T.tap1, T.tap1 + 0.5));
      c.restore();
      if (slide > 0) { c.save(); c.translate((1 - slide) * W, 0); c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); addressBar(c, 'tunegocio.es', { progress: 0.04 }); c.restore(); }
      if (t < T.load0 + 0.35) return;
    }
    // --- loading ---
    if (t < T.grid0) {
      const lp = prog(t, T.load0, T.loadEnd);
      const bar = 0.04 + 0.7 * (1 - Math.pow(1 - lp, 3)) + (t > T.loadEnd - 0.25 ? 0.26 * prog(t, T.loadEnd - 0.25, T.loadEnd) : 0);
      c.fillStyle = '#fff'; c.fillRect(0, 0, W, H);
      const loaded = prog(t, T.loadEnd - 0.5, T.loadEnd);
      badPage(c, 0, 2026, 0, Math.floor(loaded * 6) / 6 + (loaded >= 1 ? 1 : 0));
      addressBar(c, 'tunegocio.es', { progress: bar < 1 ? bar : -1 });
      if (loaded < 1) { // spinner: ring + orbiting graphite dot
        const cy = 440 + loaded * 260, a = 1 - loaded;
        c.globalAlpha = a; c.strokeStyle = '#e3e6ee'; c.lineWidth = 4; c.beginPath(); c.arc(W / 2, cy, 24, 0, 6.3); c.stroke();
        const ang = t * 5.2; c.strokeStyle = BLUE; c.lineCap = 'round'; c.beginPath(); c.arc(W / 2, cy, 24, ang, ang + 1.5); c.stroke();
        c.fillStyle = '#8b90a0'; c.font = `500 14px ${SANS}`; c.textAlign = 'center'; c.fillText('Cargando…', W / 2, cy + 56); c.globalAlpha = 1;
      }
      return;
    }
    // --- x100 grid and back into the footer ---
    if (t < T.back0 + 0.4) {
      const zo = smooth(t, T.grid0, T.grid1), zi = smooth(t, T.foot0, T.foot1);
      const k = zo * (1 - zi);                       // 0 = single page, 1 = 10x10 grid
      const s = 1 / lerp(1, 10, k);
      const scroll = zi * (BADH - (H - 96));
      const yr = prog(t, T.foot1 + 0.1, T.yearEnd); const yv = 2026 - 10 * (1 - Math.pow(1 - yr, 2.2));
      const year = Math.ceil(yv - 1e-6), roll = year - yv;
      if (k < 0.002) { c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); badPage(c, scroll, year, roll); addressBar(c, 'tunegocio.es'); }
      else {
        c.fillStyle = '#0b0e24'; c.fillRect(0, 0, W, H);
        const gap = 0.07 * k; const cw = W * s, ch = H * s;
        const ox = lerp(-4 * cw, 0, k), oy = lerp(-4 * ch, 0, k); // cell (4,4) is the page we were looking at
        for (let j = 0; j < 10; j++) for (let i = 0; i < 10; i++) {
          const sx = ox + i * cw, sy = oy + j * ch;
          if (sx > W || sy > H || sx + cw < 0 || sy + ch < 0) continue;
          const px = cw * gap * 0.5, py = ch * gap * 0.5;
          if (zi > 0 && i === 4 && j === 4) { c.save(); c.translate(sx + px, sy + py); c.scale(s * (1 - gap), s * (1 - gap)); c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); badPage(c, scroll, 2026, 0); addressBar(c, 'tunegocio.es'); c.restore(); }
          else c.drawImage(badFull, sx + px, sy + py, cw * (1 - gap), ch * (1 - gap));
        }
      }
      // dim for the summary beat
      const dim = smooth(t, T.sum0, T.sum0 + 0.4) * 0.5; if (dim > 0) { c.fillStyle = `rgba(4,5,28,${dim})`; c.fillRect(0, 0, W, H); }
      if (t < T.back0) return;
    }
    // --- back to results, hesitation, tap "El de enfrente" ---
    if (t < T.blank0 + 0.5) {
      const slide = move(t, T.back0, T.back0 + 0.4);
      const after = t >= T.tap2;
      const openP = prog(t, T.tap2 + 0.1, T.blank0 - 0.3);
      const unseen = prog(t, T.tap2 + 0.5, T.tap2 + 0.9);
      c.save(); c.translate(-(1 - slide) * W * 0.3, 0);
      searchScreen(c, 19, 10, { press: -1, states: [unseen > 0.5 ? 'unseen' : '', after ? 'open' : '', ''], openP });
      c.restore();
      if (slide < 1) { c.save(); c.translate(slide * W, 0); c.drawImage(canvasCopy, 0, 0, W, H); c.restore(); }
      // touch: appears, drifts to "Tu negocio", hesitates, leaves for "El de enfrente"
      const A = P(300, 720), B = P(262, ROWS[0].y + 62), C = P(262, ROWS[1].y + 62);
      let pos = mix(A, B, smooth(t, T.back0 + 0.35, T.hes0));
      const hes = prog(t, T.hes0, T.hes0 + 0.85);
      if (hes > 0) { pos = P(B.x + Math.sin(hes * 9) * 5 * (1 - hes), B.y + Math.sin(hes * 6.3) * 7 * Math.sin(hes * Math.PI) ); }
      const press0 = Math.sin(clamp(hes) * Math.PI) * 0.45; // almost taps
      const go = smooth(t, T.hes0 + 0.85, T.tap2 - 0.1); if (go > 0) pos = mix(pos, C, go);
      touch(c, pos.x, pos.y, prog(t, T.back0 + 0.3, T.back0 + 0.6) * (1 - prog(t, T.tap2 + 0.55, T.tap2 + 0.85)), after ? 1 - prog(t, T.tap2 + 0.1, T.tap2 + 0.3) : Math.max(press0 * (go > 0 ? 0 : 1), prog(t, T.tap2 - 0.08, T.tap2)), prog(t, T.tap2, T.tap2 + 0.55));
      // fade to a clean blank page
      const bl = smooth(t, T.blank0, T.blank0 + 0.5);
      if (bl > 0) { c.globalAlpha = bl; blank(c, 0); c.globalAlpha = 1; }
      if (t < T.blank0 + 0.5) return;
    }
    // --- the pencil draws the new site; it resolves into real work ---
    if (t < T.out0 + 0.8) {
      const dp = prog(t, T.draw0, T.draw1);
      blank(c, dp);
      const rs = smooth(t, T.real0, T.real0 + 0.55);
      if (rs > 0) {
        const s1 = move(t, T.site2, T.site2 + 0.5), s2 = move(t, T.site3, T.site3 + 0.5);
        const sc = (i, a, b) => lerp(SITES[i].from || 0, SITES[i].scroll, eio(prog(t, a, b)));
        c.save(); c.globalAlpha = rs;
        if (s1 < 1) realSite(c, 0, sc(0, T.real0 + 0.5, T.site2 + 0.3), -s1 * W);
        if (s1 > 0 && s2 < 1) realSite(c, 1, sc(1, T.site2 + 0.35, T.site3 + 0.3), (1 - s1) * W - s2 * W);
        if (s2 > 0) realSite(c, 2, sc(2, T.site3 + 0.35, T.out0 + 0.5), (1 - s2) * W);
        c.restore();
      }
      const out = smooth(t, T.out0, T.out0 + 0.8);
      if (out > 0) { c.globalAlpha = out; paper(); c.globalAlpha = 1; }
      return;
    }
    // --- sheet again: handwritten WEB ---
    paper();
    mmSpace(() => { WEBPATH.draw(c, prog(t, T.write0, T.write1), GRAPHITE_MM); });
  }
  function blank(x, dp) {
    x.fillStyle = '#fbfbfd'; x.fillRect(0, 0, W, H);
    x.strokeStyle = 'rgba(10,34,241,.07)'; x.lineWidth = 1; x.beginPath();
    for (let gx = 22; gx < W; gx += 28.8) { x.moveTo(gx, 96); x.lineTo(gx, H); } for (let gy = 112; gy < H; gy += 28.8) { x.moveTo(0, gy); x.lineTo(W, gy); } x.stroke();
    addressBar(x, 'tunegocio.es');
    if (dp > 0) WIRE.draw(x, dp, GRAPHITE);
  }
  // snapshot of the bad page with summary dim, used while sliding back to results
  const canvasCopy = document.createElement('canvas'); canvasCopy.width = W * S; canvasCopy.height = H * S;
  { const x = canvasCopy.getContext('2d'); x.scale(S, S); x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); badPage(x, BADH - (H - 96), 2016, 0); addressBar(x, 'tunegocio.es'); x.fillStyle = 'rgba(4,5,28,.5)'; x.fillRect(0, 0, W, H); }

  return { canvas, draw, SITES, ROWS };
}
