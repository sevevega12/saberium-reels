// ------------------------------------------------------------------
//  BUILD: phone screens
// ------------------------------------------------------------------
const S={};
(function buildSearch(){
  const r=$('#scrSearch');
  const f=el('div','sField',r,'<svg width="34" height="34" viewBox="0 0 34 34"><circle cx="15" cy="15" r="9" fill="none" stroke="#0A22F1" stroke-width="3.2"/><path d="M22 22l8 8" stroke="#0A22F1" stroke-width="3.2" stroke-linecap="round"/></svg>');
  S.q=el('span','',f,'');S.caret=el('b','',f);
  const ch=el('div','chips',r);let x=0;
  [['Cerca de mí',1],['Abierto ahora',0],['A pie',0]].forEach(([t,on])=>{const c=el('span',on?'on':'',ch,t);c.style.left=x+'px';x+=t.length*12.6+52;});
  S.chips=ch;
  // generic map: invented streets, three pins, "you are here"
  const m=el('div','map',r);S.map=m;
  m.innerHTML=`<svg width="496" height="268" viewBox="0 0 496 268">
   <rect width="496" height="268" fill="#dde6fb"/>
   <path d="M-10 190 L506 120" stroke="#fff" stroke-width="26"/><path d="M120 -10 L170 280" stroke="#fff" stroke-width="20"/>
   <path d="M330 -10 L372 280" stroke="#fff" stroke-width="20"/><path d="M-10 62 L506 30" stroke="#fff" stroke-width="12"/>
   <path d="M-10 250 L506 214" stroke="#fff" stroke-width="10"/>
   <rect x="190" y="52" width="118" height="60" rx="8" fill="#cddaf7" transform="rotate(-7 250 80)"/>
   <rect x="20" y="86" width="84" height="74" rx="8" fill="#cfe6dc" transform="rotate(-7 60 120)"/>
   <rect x="396" y="150" width="90" height="52" rx="8" fill="#cddaf7" transform="rotate(-7 440 176)"/>
   <rect x="196" y="176" width="120" height="52" rx="8" fill="#cddaf7" transform="rotate(-7 250 200)"/>
   <circle cx="250" cy="150" r="30" fill="#0A22F1" opacity=".13"/><circle cx="250" cy="150" r="11" fill="#0A22F1" stroke="#fff" stroke-width="4"/>
  </svg>`;
  S.pins=[[208,118,'T'],[262,196,'E'],[404,92,'O']].map(([px,py,l])=>{const p=el('div','',m,`<svg width="44" height="56" viewBox="0 0 44 56"><path d="M22 54C22 54 4 34 4 21a18 18 0 0 1 36 0c0 13-18 33-18 33z" fill="#0A22F1" stroke="#fff" stroke-width="3"/><text x="22" y="28" text-anchor="middle" font-family="Poppins" font-weight="700" font-size="17" fill="#fff">${l}</text></svg>`);
    css(p,{left:(px-22)+'px',top:(py-54)+'px',width:'44px',height:'56px',transformOrigin:'50% 100%'});return p;});
  S.rows=[['T','Tu negocio','A 300 m'],['E','El de enfrente','A 350 m'],['O','Otro del barrio','A 600 m']].map(([i,t,d],k)=>{
    const row=el('div','row',r);row.style.top=(548+k*166)+'px';
    el('div','ic',row,i);el('div','t',row,t);el('div','m',row,`${d} · <em>Abierto</em>`);el('div','go',row,'Ver web  →');
    const v=el('div','visited',row,'VISTO');return {row,v};});
  S.ring=el('div','',r);css(S.ring,{left:'28px',top:'548px',width:'496px',height:'150px',borderRadius:'26px',boxShadow:'inset 0 0 0 5px #0A22F1,0 0 0 9px rgba(10,34,241,.16)',opacity:0});
  S.fill=el('div','',r);css(S.fill,{left:'28px',top:'714px',width:'496px',height:'150px',borderRadius:'26px',background:'#0A22F1',opacity:0});
})();

const chromeHTML=(url,lockColor)=>`<div class="urlbar"><div class="back"><svg width="24" height="24" viewBox="0 0 24 24" style="left:10px;top:12px"><path d="M15 4l-8 8 8 8" fill="none" stroke="${lockColor}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="u"><svg width="20" height="22" viewBox="0 0 20 22" style="left:-2px;top:3px"><rect x="3" y="9" width="14" height="11" rx="2.5" fill="${lockColor}"/><path d="M6 9V6a4 4 0 0 1 8 0v3" fill="none" stroke="${lockColor}" stroke-width="2.4"/></svg><span style="left:26px;top:0;white-space:nowrap">${url}</span></div></div><div class="loadbar"></div>`;

(function buildPage(){
  const r=$('#scrPage');
  const c=el('div','',r,chromeHTML('tunegocio.es','#5b6388'));c.id='pgChrome';
  S.pgBack=c.querySelector('.back');S.loadbar=c.querySelector('.loadbar');
  const v=el('div','',r);v.id='pgView';const d=el('div','',v);d.id='pgDoc';S.doc=d;
  const T=(x,y,w,txt,st)=>{const e=el('div','',d,txt);e.style.cssText=`left:${x}px;top:${y}px;width:${w}px;${st||''}`;return e;};
  const lorem=['Somos una empresa con amplia experiencia en el sector, comprometida con la calidad y la atención personalizada a cada uno de nuestros clientes.',
   'Ofrecemos una gran variedad de productos y servicios adaptados a sus necesidades. Consulte sin compromiso todas nuestras soluciones.',
   'Nuestro equipo de profesionales trabaja cada día para ofrecerle el mejor servicio, con la confianza y la seriedad que nos caracterizan.',
   'Le invitamos a navegar por las distintas secciones de nuestra página web, donde encontrará toda la información sobre nuestra actividad.'];
  S.parts=[];
  // first thing a slow page shows: raw, unstyled text
  S.fouc=el('div','',v);S.fouc.style.cssText='left:0;top:0;width:552px;height:1028px;background:#fff';
  S.fouc.innerHTML='<div style="left:22px;top:18px;font:700 30px Lora,serif;color:#000;white-space:nowrap">Tu Negocio</div>'+
   ['Inicio','Empresa','Servicios','Galería','Noticias','Enlaces','Contacto'].map((n,i)=>`<div class="fl" style="left:44px;top:${78+i*40}px;font:400 25px Lora,serif;color:#1a0dab;text-decoration:underline;white-space:nowrap">${n}</div><div class="fl" style="left:24px;top:${88+i*40}px;width:8px;height:8px;border-radius:50%;background:#000"></div>`).join('')+
   '<div class="fl" style="left:22px;top:376px;width:500px;font:700 34px/42px Lora,serif;color:#000">Bienvenidos a nuestra página web</div><div class="fl" style="left:22px;top:476px;width:500px;font:400 23px/32px Lora,serif;color:#000">Calidad, confianza y experiencia a su servicio. Somos una empresa con amplia experiencia en el sector…</div>';
  S.foucParts=[...S.fouc.querySelectorAll('.fl')];
  S.spin=el('div','',v);S.spin.style.cssText='left:176px;top:560px;width:200px;height:150px';
  S.spin.innerHTML='<svg width="200" height="150" viewBox="0 0 200 150"><circle cx="100" cy="50" r="30" fill="none" stroke="#c9cfdf" stroke-width="7"/><path id="spArc" d="M100 20 a30 30 0 0 1 30 30" fill="none" stroke="#0A22F1" stroke-width="7" stroke-linecap="round"/><text x="100" y="128" text-anchor="middle" font-family="Inter Display,Inter" font-weight="600" font-size="26" fill="#6a7396">Cargando…</text></svg>';
  // top strip
  let g=el('div','',d);g.style.cssText='left:0;top:0;width:1280px;height:38px;background:#4a4f5c';S.parts.push([g,0.05]);
  S.parts.push([T(24,10,600,'Bienvenidos a nuestra página web','font-size:15px;color:#dcdfe6'),0.12]);
  S.parts.push([T(960,10,300,'Aviso legal &nbsp;|&nbsp; Mapa web &nbsp;|&nbsp; Enlaces','font-size:14px;color:#c4c8d2;text-align:right'),0.2]);
  // header + nav
  g=el('div','',d);g.style.cssText='left:0;top:38px;width:1280px;height:150px;background:linear-gradient(180deg,#fdfcf8,#e7e3d8);border-bottom:3px solid #8a8473';S.parts.push([g,0.05]);
  S.parts.push([T(40,72,90,'','height:90px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#9aa7bd,#56627c);top:68px'),0.34]);
  S.parts.push([T(150,78,500,'TU NEGOCIO','font:700 44px Lora,serif;color:#3f4658;letter-spacing:3px'),0.25]);
  S.parts.push([T(152,134,500,'Calidad y confianza desde siempre','font:italic 18px Lora,serif;color:#7a7f8c'),0.3]);
  ['Inicio','Empresa','Servicios','Galería','Noticias','Enlaces','Contacto'].forEach((n,i)=>{
    S.parts.push([T(600+i*96,96,90,n,'height:38px;font-size:15px;line-height:38px;text-align:center;color:#fff;background:linear-gradient(180deg,#7b8496,#4c5568);border:1px solid #3d4556;border-radius:4px'),0.42+i*0.02]);});
  // hero: generic invented landscape, painted slowly from the top
  const hero=el('div','',d);hero.style.cssText='left:0;top:191px;width:1280px;height:430px;overflow:hidden;background:#cfd6e0';S.hero=hero;
  hero.innerHTML=`<div style="left:0;top:0;width:1280px;height:430px;background:linear-gradient(180deg,#6f89b3 0,#a9bbd3 48%,#d9d3c0 49%,#a59d84 100%)"></div>
   <svg width="1280" height="430" viewBox="0 0 1280 430" style="left:0;top:0"><path d="M0 250 L160 150 L300 222 L470 110 L640 228 L800 160 L960 236 L1100 176 L1280 244 V300 H0Z" fill="#6e7f9c"/><path d="M0 286 L220 226 L420 270 L640 216 L900 276 L1280 226 V330 H0Z" fill="#8795ab"/><circle cx="1040" cy="92" r="46" fill="#f3efe2" opacity=".8"/></svg>
   <div style="left:0;top:0;width:1280px;height:430px;background:rgba(40,46,60,.28)"></div>
   <div style="left:0;top:138px;width:1280px;text-align:center;font:700 54px Lora,serif;color:#fff;text-shadow:0 2px 6px rgba(0,0,0,.5)">Bienvenidos a nuestra página web</div>
   <div style="left:0;top:216px;width:1280px;text-align:center;font:italic 24px Lora,serif;color:#f1f1f1">Calidad, confianza y experiencia a su servicio</div>
   <div style="left:540px;top:276px;width:200px;height:46px;border-radius:5px;background:linear-gradient(180deg,#8d96a8,#596274);border:1px solid #444c5c;color:#fff;font-size:17px;line-height:46px;text-align:center">MÁS INFORMACIÓN</div>`;
  S.parts.push([hero,0.08]);
  // three columns
  ['Sobre nosotros','Nuestros servicios','Últimas noticias'].forEach((h,i)=>{const x=50+i*405;
    S.parts.push([T(x,660,370,h,'font:700 27px Lora,serif;color:#444b5c;border-bottom:2px solid #a8a290;padding-bottom:8px'),0.40+i*0.06]);
    S.parts.push([T(x,718,370,lorem[i]+' '+lorem[(i+1)%4]+'<br><br>'+lorem[(i+2)%4],'font-size:15.5px;line-height:25px;color:#55585f;text-align:justify'),0.52+i*0.08]);
    S.parts.push([T(x,980,370,'Leer más »','font-size:15px;color:#3b5a8a;text-decoration:underline'),0.74]);});
  // band
  g=el('div','',d);g.style.cssText='left:0;top:1040px;width:1280px;height:330px;background:#dfdbcf;border-top:1px solid #bdb7a4;border-bottom:1px solid #bdb7a4';S.parts.push([g,0.62]);
  S.parts.push([T(50,1070,1180,'Nuestra filosofía','font:700 27px Lora,serif;color:#444b5c'),0.70]);
  S.parts.push([T(50,1124,570,lorem[3]+' '+lorem[0]+' '+lorem[1],'font-size:15.5px;line-height:25px;color:#55585f;text-align:justify'),0.80]);
  S.parts.push([T(660,1124,570,lorem[2]+' '+lorem[3]+' '+lorem[0],'font-size:15.5px;line-height:25px;color:#55585f;text-align:justify'),0.80]);
  ['Galería de imágenes','Descargas','Enlaces de interés','Libro de visitas'].forEach((h,i)=>{
    S.parts.push([T(50+i*300,1410,280,h,'height:120px;background:linear-gradient(180deg,#f8f6f0,#dcd7c8);border:1px solid #b5ae9a;border-radius:6px;font:700 20px/120px Lora,serif;color:#4b5263;text-align:center'),0.88]);});
  // footer
  g=el('div','',d);g.style.cssText='left:0;top:1580px;width:1280px;height:820px;background:#4a4f5c';S.parts.push([g,0.34]);
  S.parts.push([T(50,1620,1180,'Inicio &nbsp;|&nbsp; Empresa &nbsp;|&nbsp; Servicios &nbsp;|&nbsp; Galería &nbsp;|&nbsp; Noticias &nbsp;|&nbsp; Enlaces &nbsp;|&nbsp; Aviso legal &nbsp;|&nbsp; Mapa web','font-size:15px;color:#c9cdd6;text-align:center'),0.97]);
  S.parts.push([T(50,1664,1180,'© 2014 Tu Negocio · Todos los derechos reservados','font-size:15px;color:#aeb3bf;text-align:center'),0.98]);
  S.parts.push([T(50,1700,1180,'Página optimizada para una resolución de 1024 × 768','font-size:13px;color:#8f95a3;text-align:center'),0.99]);
})();

(function buildSite(){
  const r=$('#scrSite');
  const v=el('div','',r);v.id='stView';S.stImg=el('img','',v);S.stImg.id='stImg';S.stImg.src='amperiza.jpg';
  const c=el('div','',r,chromeHTML('amperizaserviciosinmobiliarios.com','#3f4a70'));c.id='stChrome';S.stLoad=c.querySelector('.loadbar');
  const b=el('div','',r);b.style.cssText='left:0;top:1090px;width:552px;height:86px;background:#f7f8fb;box-shadow:0 -1px 0 #d9deea';
  b.innerHTML=`<svg width="552" height="86" viewBox="0 0 552 86" style="left:0;top:0"><g fill="none" stroke="#3f4a70" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M74 26l-11 11 11 11"/><path d="M176 26l11 11-11 11" opacity=".35"/><path d="M276 22v22M266 31l10-10 10 10M262 38v12h28V38"/><rect x="368" y="24" width="24" height="26" rx="4"/><rect x="462" y="22" width="20" height="20" rx="4"/><rect x="470" y="30" width="20" height="20" rx="4" fill="#f7f8fb"/></g></svg>`;
})();

// ------------------------------------------------------------------
//  BUILD: digits (clean lit silhouettes)
// ------------------------------------------------------------------
function mkDigit(kind){
  const d=el('div','digit',$('#digits'));css(d,{left:0,top:0,width:0,height:0,display:'none'});
  const thumb=kind==='thumb';
  const body=thumb
   ? 'M-47 54 C-49 14 -29 -3 0 -3 C29 -3 49 14 47 54 L54 160 C60 230 70 300 96 380 C150 540 300 640 420 900 L520 1700 L-420 1700 C-330 1200 -150 800 -90 520 C-66 400 -58 280 -53 160 Z'
   : 'M-38 46 C-39 10 -23 -3 0 -3 C23 -3 39 10 38 46 L41 168 C45 196 43 214 43 250 L46 350 C52 440 170 470 214 640 C250 800 280 1200 260 1700 L-340 1700 L-196 640 C-120 500 -52 440 -46 350 L-43 250 C-43 214 -45 196 -41 168 Z';
  const nail=thumb?'<rect x="-31" y="9" width="62" height="76" rx="27" fill="url(#gNail)" stroke="rgba(156,200,255,.55)" stroke-width="1.6"/>'
                  :'<rect x="-24" y="8" width="48" height="62" rx="21" fill="url(#gNail)" stroke="rgba(156,200,255,.55)" stroke-width="1.6"/>';
  const cr=thumb?'<path d="M-42 172 q42 15 86 0 M-40 190 q40 12 82 0" stroke="#05061a" stroke-width="2.4" fill="none" opacity=".55"/>'
                :'<path d="M-34 168 q34 12 70 0 M-33 184 q33 10 68 0 M-36 330 q36 13 76 0" stroke="#05061a" stroke-width="2.2" fill="none" opacity=".5"/>';
  d.innerHTML=`<svg width="10" height="10" style="overflow:visible;left:0;top:0">
     <path d="${body}" fill="url(#gDig)"/>
     <path d="${body}" fill="none" stroke="#9CC8FF" stroke-width="2.2" opacity=".5"/>${nail}${cr}</svg>`;
  return d;
}
function setDigit(d,x,y,ang,sc=1,op=1,mirror=1,blur=0){
  if(op<=0.001){d.style.display='none';return;}
  d.style.display='block';d.style.opacity=op;
  d.style.transform=`translate(${x}px,${y}px) rotate(${ang}deg) scale(${sc*mirror},${sc})`;
  d.style.filter=`drop-shadow(-16px 22px 20px rgba(2,3,20,.5))`+(blur>0.3?` blur(${blur}px)`:'');
}
const DG={thumbR:mkDigit('thumb'),index:mkDigit('index'),thumbL:mkDigit('thumb')};
const ripple=el('div','',$('#digits'));css(ripple,{left:'-60px',top:'-60px',width:'120px',height:'120px',borderRadius:'50%',boxShadow:'inset 0 0 0 5px rgba(10,34,241,.9),0 0 30px rgba(10,34,241,.5)',opacity:0});
function setRipple(t,t0,x,y){const k=seg(t,t0,t0+0.5);if(k<=0||k>=1)return false;ripple.style.opacity=(1-k)*0.9;ripple.style.transform=`translate(${x}px,${y}px) scale(${0.3+1.3*E.out(k)})`;return true;}

// ------------------------------------------------------------------
//  BUILD: interior of the shop (seen from inside, door closed)
// ------------------------------------------------------------------
(function buildIn(){
  const w=$('#inWorld');const r=rng(77);
  const add=(st,html,par)=>{const e=el('div','',par||w,html);e.style.cssText=st;return e;};
  // walls, ceiling, floor
  add('left:-300px;top:-300px;width:1680px;height:1620px;background:linear-gradient(180deg,#080924 0,#0d0f33 20%,#15163f 60%,#101132 100%)');
  add('left:-300px;top:-300px;width:1680px;height:560px;background:linear-gradient(180deg,#05061a,#0a0b28 80%,rgba(10,11,40,0))');
  // warm pools on the back wall from the pendants
  [[230,330],[540,270],[850,330]].forEach(([x,y])=>add(`left:${x-420}px;top:${y-200}px;width:840px;height:1300px;background:radial-gradient(ellipse 50% 50% at 50% 30%,rgba(255,180,94,.62),rgba(255,160,70,.22) 50%,transparent 78%);mix-blend-mode:screen`));
  // --- what is outside: the street at night and the neighbour across, lit and open
  const outside=(x,y,ww,hh,ox)=>{const c=add(`left:${x}px;top:${y}px;width:${ww}px;height:${hh}px;overflow:hidden;background:#050720`);
    const o=add(`left:${-ox}px;top:${420-y}px;width:800px;height:900px;filter:blur(2.4px)`,'',c);
    add('left:0;top:0;width:800px;height:470px;background:linear-gradient(180deg,#070a2a,#0b0f36)','',o);              // building across
    add('left:0;top:92px;width:800px;height:44px;background:linear-gradient(180deg,#141a4a,#0a0d2e);box-shadow:0 8px 14px rgba(0,0,0,.5)','',o);
    add('left:60px;top:146px;width:330px;height:250px;background:linear-gradient(180deg,#eef5ff,#b9d4ff 60%,#8fb6f5);box-shadow:0 0 70px 20px rgba(156,200,255,.45)','',o); // lit window
    [206,268,330].forEach(y=>add(`left:60px;top:${y}px;width:330px;height:5px;background:rgba(40,64,150,.45)`,'',o));
    for(let i=0;i<14;i++){const sx=72+((i*53)%300),sy=[206,268,330][i%3];const hh=22+((i*17)%26);add(`left:${sx}px;top:${sy-hh}px;width:${14+((i*7)%14)}px;height:${hh}px;background:rgba(40,64,150,.5);border-radius:2px`,'',o);}
    add('left:40px;top:120px;width:370px;height:22px;background:linear-gradient(180deg,#1c2560,#0c1036);box-shadow:0 6px 10px rgba(0,0,0,.4)','',o);
    add('left:420px;top:146px;width:128px;height:310px;background:linear-gradient(180deg,#f4f8ff,#c9defe);box-shadow:0 0 60px 16px rgba(156,200,255,.5)','',o); // their door, open
    add('left:548px;top:146px;width:20px;height:310px;background:#1a2156','',o);
    add('left:610px;top:170px;width:150px;height:200px;background:linear-gradient(180deg,#141b52,#0b0f36);box-shadow:inset 0 0 0 5px #1a2156','',o);
    add('left:690px;top:20px;width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,rgba(200,222,255,.95),rgba(156,200,255,.3) 30%,transparent 68%)','',o); // street lamp
    add('left:0;top:470px;width:800px;height:430px;background:linear-gradient(180deg,#0a0e33,#04051c 70%)','',o);     // wet road
    add('left:50px;top:474px;width:340px;height:300px;background:linear-gradient(180deg,rgba(190,215,255,.55),transparent 90%);filter:url(#wet)','',o);
    add('left:410px;top:474px;width:150px;height:330px;background:linear-gradient(180deg,rgba(215,232,255,.7),transparent 92%);filter:url(#wet)','',o);
    // the parked car at our kerb
    add('left:-60px;top:560px;width:560px;height:360px;border-radius:44% 56% 0 0/52% 60% 0 0;background:linear-gradient(180deg,#0a0e3a,#02030f 40%);box-shadow:inset 0 4px 0 rgba(156,200,255,.5)','',o);
    add('left:30px;top:604px;width:330px;height:110px;border-radius:40% 60% 0 0/80% 90% 0 0;background:linear-gradient(180deg,rgba(156,200,255,.20),rgba(10,34,241,.06))','',o);
    add(`left:0;top:0;width:${ww}px;height:${hh}px;background:linear-gradient(118deg,rgba(255,190,110,.10) 0,rgba(255,190,110,.03) 30%,transparent 30.3%,transparent 64%,rgba(255,190,110,.05) 80%,transparent 92%)`,'',c);
    return c;};
  // side window (to the right when seen from inside)
  add('left:806px;top:404px;width:400px;height:800px;background:#191c44;box-shadow:0 0 0 1px rgba(156,200,255,.2)');
  outside(820,418,400,772,590);
  add('left:806px;top:1204px;width:400px;height:96px;background:linear-gradient(180deg,#1a1b48,#0e0f30);box-shadow:inset 0 2px 0 rgba(255,190,110,.25)');
  // door from inside
  add('left:326px;top:386px;width:428px;height:914px;background:#12153a;box-shadow:0 0 0 1px rgba(156,200,255,.22)');
  const leafIn=add('left:340px;top:400px;width:400px;height:900px;background:linear-gradient(90deg,#1a1f48,#2d3462 5%,#191d42 10%,#191d42 90%,#2b3158 95%,#14173a);box-shadow:inset 0 0 0 1px rgba(156,200,255,.25)');
  outside(380,440,320,720,150).style.boxShadow='0 0 0 3px #090b22,0 0 0 4.5px rgba(255,190,110,.3)';
  add('left:1px;top:764px;width:398px;height:135px;background:repeating-linear-gradient(0deg,rgba(255,255,255,.035) 0 1px,transparent 1px 3px),linear-gradient(180deg,#2c3260,#191c40 30%,#111336);box-shadow:inset 0 2px 0 rgba(255,190,110,.3)','',leafIn);
  add('left:36px;top:250px;width:20px;height:330px;border-radius:10px;background:linear-gradient(90deg,#3a4264,#b7c1da 34%,#f6f2e8 52%,#ffcb8c 80%,#8a6a48);box-shadow:8px 10px 14px rgba(0,0,0,.5)','',leafIn);
  add('left:42px;top:286px;width:24px;height:14px;background:#2a3058;border-radius:3px','',leafIn);add('left:42px;top:530px;width:24px;height:14px;background:#2a3058;border-radius:3px','',leafIn);
  // back of the hanging sign
  add('left:120px;top:140px;width:160px;height:150px','<svg width="160" height="150" viewBox="0 0 160 150"><path d="M80 6 L18 62 M80 6 L142 62" stroke="#c9d6f5" stroke-width="2" fill="none" opacity=".8"/><circle cx="80" cy="7" r="6" fill="#aab6d8"/><rect x="6" y="58" width="148" height="66" rx="8" fill="#2a3160" stroke="#4a5596" stroke-width="2"/><rect x="18" y="70" width="124" height="42" rx="4" fill="none" stroke="#3b4580" stroke-width="2"/></svg>',leafIn);
  // left wall: shelving with stock
  const sh=add('left:-40px;top:400px;width:330px;height:900px;background:linear-gradient(90deg,#0a0b28,#15173f);box-shadow:inset -3px 0 0 #23265a,0 0 0 1px rgba(255,190,110,.12)');
  for(let s=0;s<6;s++){const y=110+s*132;add(`left:0;top:${y}px;width:330px;height:9px;background:linear-gradient(180deg,#ffc98a,#5a3a22 60%,#23265a)`,'',sh);
    let x=50;while(x<300){const bw=18+r()*34,bh=40+r()*62;const c=['#1b1f52','#272c6a','#10122f','#323a86','#161944'][Math.floor(r()*5)];
      add(`left:${x}px;top:${y-bh}px;width:${bw}px;height:${bh}px;background:${c};border-radius:3px 3px 0 0;box-shadow:inset 0 3px 0 rgba(255,196,128,.55),inset -3px 0 0 rgba(0,0,0,.25)`,'',sh);x+=bw+5+r()*10;}}
  // floor
  const fl=add('left:-300px;top:1300px;width:1680px;height:1000px;overflow:hidden;background:linear-gradient(180deg,#191a45 0,#0c0d2c 30%,#05061a 75%)');
  add('left:0;top:0;width:1680px;height:1000px;background:repeating-linear-gradient(90deg,rgba(156,200,255,.05) 0 2px,transparent 2px 210px);transform-origin:50% 0;transform:perspective(600px) rotateX(58deg) scale(2.2)','',fl);
  [[530,0,660,.7],[1140,0,600,.6],[840,10,800,.8]].forEach(([x,y,ww,a])=>add(`left:${x-ww/2}px;top:${y}px;width:${ww}px;height:520px;background:radial-gradient(ellipse 50% 60% at 50% 0,rgba(255,186,100,${a}),transparent 72%);mix-blend-mode:screen;filter:url(#wet)`,'',fl));
  add('left:650px;top:16px;width:380px;height:70px;clip-path:polygon(6% 0,94% 0,100% 100%,0 100%);background:repeating-linear-gradient(90deg,#070818 0 5px,#12142e 5px 9px)','',fl);
  // two empty stools
  [[190,1180],[60,1230]].forEach(([x,y],i)=>{const sc=i?1.12:1;const st=add(`left:${x}px;top:${y}px;width:150px;height:330px;transform:scale(${sc})`);
    st.innerHTML='<svg width="150" height="330" viewBox="0 0 150 330"><ellipse cx="75" cy="26" rx="62" ry="20" fill="#1c2058"/><path d="M14 24 q61 -30 122 0" stroke="#ffc88a" stroke-width="3.5" fill="none"/><path d="M38 40 L20 320 M112 40 L130 320 M75 46 L75 320 M26 220 H124" stroke="#0b0d2c" stroke-width="9" stroke-linecap="round"/><path d="M40 44 L23 318" stroke="#ffc88a" stroke-width="2" opacity=".5"/></svg>';});
  // pendant lamps
  [[230,330],[540,270],[850,330]].forEach(([x,y])=>{
    add(`left:${x-2}px;top:-300px;width:4px;height:${y+262}px;background:#02030f`);
    add(`left:${x-190}px;top:${y-170}px;width:380px;height:380px;border-radius:50%;background:radial-gradient(circle,rgba(255,244,220,.9) 0,rgba(255,206,130,.55) 14%,rgba(255,180,94,.18) 40%,transparent 68%);mix-blend-mode:screen`);
    add(`left:${x-64}px;top:${y-58}px;width:128px;height:66px;border-radius:64px 64px 8px 8px/60px 60px 8px 8px;background:linear-gradient(180deg,#1a1d50,#07081f);box-shadow:inset 0 -5px 0 #ffd9a0`);
    add(`left:${x-22}px;top:${y+2}px;width:44px;height:26px;border-radius:0 0 22px 22px;background:#fff3d8;box-shadow:0 0 40px 14px rgba(255,200,120,.8)`);});
  // foreground counter, out of focus
  const ct=add('left:470px;top:1500px;width:900px;height:700px;filter:blur(9px)');S.counter=ct;
  add('left:0;top:0;width:900px;height:700px;border-radius:26px 0 0 0;background:linear-gradient(180deg,#1c1f55,#070820 30%);box-shadow:inset 0 8px 0 #ffcf94,inset 8px 0 0 rgba(255,200,130,.25)','',ct);
  add('left:150px;top:-120px;width:130px;height:124px;border-radius:14px 14px 0 0;background:linear-gradient(180deg,#232864,#0b0d2e);box-shadow:inset 0 4px 0 rgba(255,206,140,.7)','',ct);
  add('left:380px;top:-56px;width:110px;height:60px;border-radius:55px 55px 0 0;background:linear-gradient(180deg,#ffe0b0,#b8773a)','',ct);
})();
