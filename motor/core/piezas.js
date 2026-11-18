// =====================================================================
//  Saberium · motor de reels · piezas opcionales
//  Ningún vídeo está obligado a usarlas. La tarea de guiones evita repetir la
//  pieza protagonista de los últimos vídeos. Cuando un vídeo invente una pieza
//  buena, se añade aquí con el mismo estilo: Pieza(parent, opciones) -> objeto
//  con .el y métodos que reciben el tiempo t.
// =====================================================================

const Piezas = {};

// Real Saberium sites (captures in assets/webs/). Only these three may be shown.
Piezas.WEBS = {
  amperiza: { movil: 'webs/movil/amperiza.png', escritorio: 'webs/escritorio/amperiza.jpg', url: 'amperizaserviciosinmobiliarios.com', nombre: 'Amperiza' },
  atlantis: { movil: 'webs/movil/atlantis-charters.png', escritorio: 'webs/escritorio/atlantis-charters.jpg', url: 'atlantischarter.com', nombre: 'Atlantis Charters' },
  barber: { movil: 'webs/movil/the-barber-kingdom.png', escritorio: 'webs/escritorio/the-barber-kingdom.jpg', url: 'thebarberkingdom.com', nombre: 'The Barber Kingdom' },
};

// ---------- backgrounds with depth (never a flat or empty background) ----------
// Dark work desk with a grid, a beam of light and out-of-focus lights.
Piezas.Mesa = function (parent, o = {}) {
  const r = rng(o.seed || 5);
  const root = el('div', '', parent); css(root, { left: '-80px', top: '-80px', width: '1240px', height: '2080px' });
  css(el('div', '', root), { left: 0, top: 0, width: '1240px', height: '2080px',
    background: 'radial-gradient(ellipse 70% 45% at 50% 38%,#0e1868,#04051C 75%)' });
  const grid = el('div', '', root);
  css(grid, { left: 0, top: '820px', width: '1240px', height: '1260px', transformOrigin: '50% 0',
    transform: 'perspective(900px) rotateX(58deg)',
    background: 'repeating-linear-gradient(90deg,rgba(156,200,255,.10) 0 2px,transparent 2px 120px),repeating-linear-gradient(0deg,rgba(156,200,255,.08) 0 2px,transparent 2px 120px)',
    WebkitMaskImage: 'linear-gradient(180deg,transparent,#000 25%,#000 70%,transparent)' });
  const beam = el('div', '', root);
  css(beam, { left: '300px', top: '-200px', width: '640px', height: '1800px', transformOrigin: '50% 0', transform: 'rotate(-14deg)',
    background: 'linear-gradient(180deg,rgba(156,200,255,.22),rgba(156,200,255,.06) 55%,transparent)', filter: 'blur(30px)' });
  const bk = el('div', 'bokeh', root); css(bk, { left: 0, top: 0, width: '1240px', height: '2080px' });
  const dots = [];
  for (let i = 0; i < (o.dots || 16); i++) {
    const d = el('i', '', bk); const s = 30 + r() * 120;
    css(d, { left: r() * 1240 + 'px', top: r() * 2080 + 'px', width: s + 'px', height: s + 'px',
      background: `radial-gradient(circle,rgba(${r() < .25 ? '255,190,120' : '156,200,255'},${.10 + r() * .18}),transparent 70%)` });
    dots.push({ d, sp: (r() - .5) * 20 });
  }
  return { el: root, grid, beam,
    update(t, drift = 1) {      // slow parallax so the frame is never still
      root.style.transform = `translate(${Math.sin(t * .23) * 14 * drift}px,${Math.cos(t * .17) * 10 * drift}px)`;
      dots.forEach(p => p.d.style.transform = `translateY(${t * p.sp}px)`);
    } };
};

// ---------- phone with a real site inside ----------
// Piezas.Movil(parent, {x,y,w,web:'amperiza'}) ; .scroll(px) ; .show(img)
Piezas.Movil = function (parent, o = {}) {
  const w = o.w || 576, h = Math.round(w * 2.083);
  const ph = el('div', 'phone', parent); css(ph, { left: (o.x ?? 252) + 'px', top: (o.y ?? 300) + 'px', width: w + 'px', height: h + 'px' });
  el('div', 'glow', ph);
  const sc = el('div', 'screen', ph); el('div', 'island', ph); el('div', 'gl', ph);
  const img = el('img', '', sc); css(img, { left: 0, top: 0, width: '100%' });
  const set = web => { img.src = ASSET(Piezas.WEBS[web] ? Piezas.WEBS[web].movil : web); };
  if (o.web) set(o.web);
  return { el: ph, screen: sc, img, w, h, show: set,
    scroll(px) { img.style.transform = `translateY(${-px}px)`; } };
};

// ---------- laptop with a real site (desktop capture) ----------
Piezas.Portatil = function (parent, o = {}) {
  const w = o.w || 900, h = Math.round(w * 0.6);
  const root = el('div', 'laptop', parent); css(root, { left: (o.x ?? 90) + 'px', top: (o.y ?? 560) + 'px', width: w + 'px', height: h + 40 + 'px' });
  const lid = el('div', 'lid', root); css(lid, { left: 0, top: 0, width: w + 'px', height: h + 'px' });
  const sc = el('div', 'screen', lid);
  const img = el('img', '', sc); css(img, { left: 0, top: 0, width: '100%' });
  css(el('div', 'base', root), { left: '-50px', top: h + 'px', width: w + 100 + 'px' });
  if (o.web) img.src = ASSET(Piezas.WEBS[o.web].escritorio);
  return { el: root, screen: sc, img, show(web) { img.src = ASSET(Piezas.WEBS[web].escritorio); } };
};

// ---------- frosted glass counter: a number that eases to its value ----------
// Piezas.Contador(parent,{x,y,w,label:'TIEMPO DE RESPUESTA',unit:'h',dec:0})
Piezas.Contador = function (parent, o = {}) {
  const g = el('div', 'glass', parent); css(g, { left: (o.x ?? 120) + 'px', top: (o.y ?? 520) + 'px', width: (o.w || 520) + 'px', height: '210px' });
  const lab = el('div', 'lab txt', g, o.label || ''); css(lab, { left: '34px', top: '30px' });
  const num = el('div', 'num txt', g, '0'); css(num, { left: '30px', top: '70px' });
  const unit = el('div', 'unit', g, o.unit || '');
  const bar = el('div', 'bar', g); css(bar, { left: '34px', right: '34px', bottom: '28px' }); const bi = el('i', '', bar);
  return { el: g,
    // value goes from a to b between t0 and t0+d; returns the shown value
    update(t, t0, d, a, b, max) {
      const v = lerp(a, b, E.out5(seg(t, t0, t0 + d)));
      num.textContent = fmt(v, o.dec ?? 0);
      css(unit, { left: 30 + num.offsetWidth + 12 + 'px', top: '112px' });
      bi.style.width = clamp(v / (max || Math.max(a, b))) * 100 + '%';
      return v;
    } };
};

// ---------- list that ticks itself ----------
// Piezas.Lista(parent,{x,y,w,items:['Reserva online','Teléfono a la vista']})
Piezas.Lista = function (parent, o = {}) {
  const root = el('div', '', parent); css(root, { left: (o.x ?? 120) + 'px', top: (o.y ?? 600) + 'px', width: (o.w || 840) + 'px', height: '10px' });
  const rows = (o.items || []).map((txt, i) => {
    const r = el('div', 'check glass', root); css(r, { left: 0, top: i * 120 + 'px', width: (o.w || 840) + 'px' });
    el('div', 'box', r); const tk = el('div', 'tick', r);
    tk.innerHTML = '<svg width="32" height="28" viewBox="0 0 32 28"><path d="M3 15 L12 24 L29 4" fill="none" stroke="#04051C" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    el('div', 'tx txt', r, txt); return { r, tk };
  });
  return { el: root, rows,
    // times: when each row enters and ticks
    update(t, enter, ticks) {
      rows.forEach((q, i) => {
        const k = E.expo(seg(t, enter[i], enter[i] + 0.5));
        q.r.style.opacity = k; q.r.style.transform = `translateX(${(1 - k) * 60}px)`;
        const c = clamp(E.back(seg(t, ticks[i], ticks[i] + 0.35)));
        q.tk.style.opacity = seg(t, ticks[i], ticks[i] + 0.1); q.tk.style.transform = `scale(${c})`;
      });
    } };
};

// ---------- clock chip: hh:mm that rolls to the next minute ----------
Piezas.Reloj = function (parent, o = {}) {
  const c = el('div', 'chip glass', parent); css(c, { left: (o.x ?? 806) + 'px', top: (o.y ?? 396) + 'px', width: '212px' });
  el('i', '', c); const tx = el('div', 'tx txt', c, o.hora || '22:04');
  return { el: c, set(h) { tx.textContent = h; } };
};

window.Piezas = Piezas;
