// =====================================================================
//  00 · Plantilla del motor (no se publica)
//  Enseña cómo se escribe un vídeo: anclas sacadas de la voz, escenas con
//  build() y update(t), marcas de sonido y secciones de música.
//  Todo lo demás (subtítulos, cierre literal, tarjeta final, logo) lo pone el motor.
// =====================================================================

// ---------- 1. anchors: every motion hangs from a word of the voice ----------
const A = {
  hook: L(1).start,
  noCo: W(1, 'cómo').start,
  movil0: L(2).start - 0.5,
  tel: W(2, 'teléfono').start,
  foto: W(3, 'foto').start,
  form: W(3, 'formulario').start,
  cierra: W(4, 'pestaña').start,
  giro: L(5).start - 0.6,
  l1: W(5, 'haces').start, l2: W(5, 'dónde').start, l3: W(5, 'reservar').start,
};
Object.entries(A).forEach(([k, v]) => Reel.anchor(k, v));

// ---------- 2. music plan and sound marks ----------
Reel.section(0, A.movil0, 'tension');
Reel.section(A.movil0, A.giro, 'pulso');
Reel.section(A.giro, Reel.anchors.end0 || CTA.end + 0.35, 'claro');
Reel.hit(A.movil0 + 0.5, 'hit');
Reel.hit(A.tel, 'knock'); Reel.hit(A.foto, 'knock'); Reel.hit(A.form, 'knock');
Reel.hit(A.cierra, 'whoosh_rev');
Reel.hit(A.giro + 0.6, 'hit');
[A.l1, A.l2, A.l3].forEach(t => Reel.hit(t, 'tick'));

// ---------- 3. scenes ----------
let mesa, movil, cont, lista, nota;
Reel.scene({
  name: 'fondo', z: 1,
  build(root) { mesa = Piezas.Mesa(root, { seed: 9 }); },
  update(t) { mesa.update(t); }
});

Reel.scene({
  name: 'movil', z: 20,
  build(root) {
    movil = Piezas.Movil(root, { x: 252, y: 330, w: 576, web: 'amperiza' });
    // a generic "bad" page drawn in code, shown before the real site (never a real business)
    nota = el('div', 'malaweb', movil.screen);
    nota.innerHTML = '<div class="mh">Bienvenidos</div><div class="mi"></div><div class="mt">Somos una empresa con más de 20 años de experiencia en el sector, comprometidos con la calidad y el servicio...</div><div class="mf">Contacto: formulario</div>';
    cont = Piezas.Contador(root, { x: 140, y: 470, w: 800, label: 'BUSCANDO CÓMO RESERVAR', unit: 's', dec: 1 });
  },
  update(t) {
    // hook: the counter is already running in the first frame
    const hookOut = E.io(seg(t, A.movil0 - 0.2, A.movil0 + 0.4));
    cont.el.style.opacity = 1 - hookOut;
    cont.el.style.transform = `translateY(${-hookOut * 80}px) scale(${1 + 0.04 * Math.sin(t * 3)})`;
    cont.update(t, 0, A.movil0, 0.4, 41.0, 45);
    // phone rises from below, with the bad page; then it closes
    const inK = E.expo(seg(t, A.movil0, A.movil0 + 0.7));
    const outK = E.in2(seg(t, A.cierra, A.cierra + 0.5));
    movil.el.style.opacity = inK * (1 - seg(t, A.cierra + 0.3, A.cierra + 0.5));
    movil.el.style.transform = `translateY(${(1 - inK) * 500 + outK * 90}px) scale(${1 - outK * 0.12}) rotate(${(1 - inK) * -6}deg)`;
    nota.style.transform = `translateY(${-mv(t, A.tel - 0.4, 2.2, 0, 380)}px)`;
    nota.style.filter = t > A.form ? 'grayscale(.4)' : '';
  }
});

Reel.scene({
  name: 'giro', z: 30,
  build(root) {
    lista = Piezas.Lista(root, { x: 120, y: 560, w: 840, items: ['Qué haces', 'Dónde estás', 'Reserva en un toque'] });
    this.real = Piezas.Movil(root, { x: 330, y: 960, w: 420, web: 'amperiza' });
  },
  update(t) {
    const k = E.expo(seg(t, A.giro, A.giro + 0.8));
    this.root.style.opacity = k * (1 - seg(t, CTA.start - 0.4, CTA.start));
    lista.update(t, [A.giro + 0.2, A.giro + 0.4, A.giro + 0.6], [A.l1, A.l2, A.l3]);
    this.real.el.style.transform = `translateY(${(1 - k) * 400}px)`;
    this.real.scroll(mv(t, A.l1, 2.6, 0, 260, E.io));
  }
});
