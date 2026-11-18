// =====================================================================
//  Saberium · Reel 02 · "La puerta" — every motion is anchored to timing.json
// =====================================================================
const A={};   // anchors in seconds, all derived from the voice timing
(function anchors(){
  const l1=L(1),l2=L(2),l3=L(3),l4=L(4),l5=L(5),l6=L(6),l7=L(7),l8=L(8);
  A.pull0=Math.max(0.06,l1.start);            // hand (already on the handle) starts to pull
  A.open1=W(1,'web').end;                     // door a hand's width open
  A.release=W(1,'fue').start;                 // the hand lets go
  A.shut=A.release+0.52;                      // thud
  A.morph0=l2.start-0.80; A.morph1=l2.start+0.25;   // door -> phone
  A.type0=l2.start+0.25; A.type1=W(2,'noche').end;
  A.results=W(2,'Buscaba').start-0.15;
  A.tap1=W(2,'encontró').start+0.10;          // thumb taps "Tu negocio"
  A.page0=l3.start-0.30;                      // row grows into the page
  A.loaded=W(3,'cargó').start;                // page finally there
  A.pinch0=W(3,'ampliar').start-0.15; A.pinch1=W(3,'dedos').end;
  A.tags0=l4.start-0.45;
  A.x1=W(4,'teléfono').start+0.12; A.x2=W(4,'horario').start+0.12; A.x3=W(4,'abierto').start+0.12;
  A.back0=W(5,'volver').start-0.55; A.backTap=W(5,'volver').start+0.05;
  A.giveUp=l5.start+0.75;                     // one last impatient flick back to the top
  A.pick=W(5,'siguiente').start; A.tap2=W(5,'enfrente').start+0.15;
  A.in0=l5.end+0.05; A.in1=A.in0+0.9;         // row -> door glass seen from inside
  A.avisos=W(6,'enteraste').start-0.1;
  A.clockFlip=W(6,'punto').start;             // 22:04 -> 22:05
  A.flip0=l7.start-0.85; A.flip1=l7.start+0.15;     // door turns to its street side
  A.push=W(7,'puerta').start-0.25;            // one push
  A.tick1=W(7,'Que').start-0.1; A.tick2=A.tick1+0.62; A.tick3=A.tick2+0.62;
  A.sign0=l8.start-1.15;                      // door closes, camera to the sign
  A.signFlip=W(8,'WEB').start-0.12;
  A.end0=l8.end+0.35;                         // end card
})();
window.__anchors=A;

// ------------------------------------------------------------------
//  BUILD: street world
// ------------------------------------------------------------------
function buildInterior(root,w,h,seed){
  const r=rng(seed);
  css(root,{background:'linear-gradient(180deg,#ffd9a0 0,#f5b062 18%,#d98236 46%,#8a4416 70%,#3a1a08 100%)'});
  // back wall shelves with stock
  for(let s=0;s<4;s++){
    const y=h*(0.20+s*0.105);
    el('div','',root).style.cssText=`left:${w*0.06}px;top:${y+h*0.07}px;width:${w*0.88}px;height:7px;background:#4b230b`;
    let x=w*0.08;
    while(x<w*0.9){const bw=14+r()*30,bh=h*(0.025+r()*0.04);const c=['#5b2a0c','#7a3d12','#2c1206','#a55a1c','#ffe2b0','#3d1c09'][Math.floor(r()*6)];
      el('div','',root).style.cssText=`left:${x}px;top:${y+h*0.07-bh}px;width:${bw}px;height:${bh}px;background:${c};border-radius:2px`;x+=bw+3+r()*8;}
  }
  // pendant lamps
  [[.28,.115],[.66,.10]].forEach(([px,py])=>{
    el('div','',root).style.cssText=`left:${w*px-2}px;top:0;width:4px;height:${h*py}px;background:#2c1206`;
    el('div','',root).style.cssText=`left:${w*px-150}px;top:${h*py-150}px;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,#fffaf0 0,#ffe7b8 10%,rgba(255,200,120,.55) 26%,rgba(255,180,90,0) 68%)`;
  });
  // counter with a small lamp
  el('div','',root).style.cssText=`left:${w*0.02}px;top:${h*0.63}px;width:${w*0.7}px;height:${h*0.16}px;background:linear-gradient(180deg,#5a2b0e,#2a1206);box-shadow:inset 0 5px 0 #ffcf8f`;
  el('div','',root).style.cssText=`left:${w*0.5}px;top:${h*0.555}px;width:${w*0.09}px;height:${h*0.075}px;background:#1c0c04;border-radius:6px 6px 0 0`;
  // floor gleam
  el('div','',root).style.cssText=`left:0;top:${h*0.79}px;width:${w}px;height:${h*0.21}px;background:linear-gradient(180deg,#b86a26,#5a2a0d 40%,#2a1306)`;
  el('div','',root).style.cssText=`left:${w*0.2}px;top:${h*0.8}px;width:${w*0.6}px;height:${h*0.2}px;background:radial-gradient(ellipse at 50% 0,rgba(255,220,160,.55),transparent 70%)`;
}
function buildRefl(root,w,h,seed,dense){
  const r=rng(seed);const g=el('div','',root);css(g,{left:0,top:0,width:w+'px',height:h+'px'});
  // the neighbour across the street, lit and open: cool windows
  [[.07,.11,.34,.14],[.47,.11,.20,.14],[.09,.275,.12,.20]].forEach(([x,y,ww,hh])=>{
    el('div','',g).style.cssText=`left:${w*x}px;top:${h*y}px;width:${w*ww}px;height:${h*hh}px;background:linear-gradient(180deg,rgba(210,228,255,.60),rgba(156,200,255,.30));border-radius:3px`;});
  // street lamps and far lights
  const cols=['rgba(156,200,255,.75)','rgba(156,200,255,.5)','rgba(60,90,255,.75)','rgba(255,255,255,.6)','rgba(10,34,241,.8)'];
  for(let i=0;i<dense;i++){const d=18+r()*46;const x=r()*w,y=h*(0.03+r()*0.62);
    el('div','',g).style.cssText=`left:${x-d/2}px;top:${y-d/2}px;width:${d}px;height:${d}px;border-radius:50%;background:${cols[Math.floor(r()*cols.length)]}`;}
  // parked car: roof line highlight
  el('div','',g).style.cssText=`left:${-w*0.1}px;top:${h*0.70}px;width:${w*1.0}px;height:${h*0.3}px;border-radius:50% 60% 0 0/40% 46% 0 0;box-shadow:inset 0 5px 0 rgba(156,200,255,.55),inset 0 40px 50px rgba(10,34,241,.22)`;
  el('div','',g).style.cssText=`left:${w*0.58}px;top:${h*0.76}px;width:${w*0.2}px;height:8px;border-radius:4px;background:rgba(200,222,255,.8)`;
  return g;
}
const reflD=buildRefl($('#reflD'),388,824,21,13), reflW=buildRefl($('#reflW'),306,884,5,9);
buildInterior($('#interior'),560,1080,4); buildInterior($('#winInt'),346,924,9);

// ------------------------------------------------------------------
//  BUILD: persistent UI
// ------------------------------------------------------------------
const P={};  // panels
(function buildPanels(){
  const root=$('#panels');
  // TIEMPO DENTRO
  let p=el('div','glass',root);css(p,{left:'56px',top:'930px',width:'356px',height:'190px'});
  el('div','lab',p,'TIEMPO DENTRO').style.cssText='left:28px;top:26px';
  P.insideNum=el('div','num',p,'0,0');css(P.insideNum,{left:'24px',top:'54px'});
  el('div','unit',p,'s').style.cssText='left:186px;top:102px';
  const b=el('div','bar',p);css(b,{left:'28px',top:'160px',width:'300px'});P.insideBar=el('i','',b);
  P.inside=p;
  // TIEMPO DE CARGA
  p=el('div','glass',root);css(p,{left:'624px',top:'480px',width:'400px',height:'190px'});
  el('div','lab',p,'TIEMPO DE CARGA').style.cssText='left:28px;top:26px';
  P.loadNum=el('div','num',p,'0,0');css(P.loadNum,{left:'24px',top:'54px'});
  el('div','unit',p,'s').style.cssText='left:186px;top:102px';
  const b2=el('div','bar',p);css(b2,{left:'28px',top:'160px',width:'344px'});P.loadBar=el('i','',b2);
  P.load=p;
  // tags (struck in act 1, ticked in the payoff)
  const icons={
    tel:'<svg width="52" height="52" viewBox="0 0 52 52"><path d="M19 13h-4a3 3 0 0 0-3 3c0 13 11 24 24 24a3 3 0 0 0 3-3v-4l-7-3-3 3c-4-2-7-5-9-9l3-3z" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></svg>',
    hor:'<svg width="52" height="52" viewBox="0 0 52 52"><circle cx="26" cy="26" r="13" fill="none" stroke="#fff" stroke-width="3"/><path d="M26 18v9l6 4" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>',
    ab:'<svg width="52" height="52" viewBox="0 0 52 52"><path d="M17 40V13h18v27M13 40h26" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="30" cy="27" r="2" fill="#fff"/></svg>',
    res:'<svg width="52" height="52" viewBox="0 0 52 52"><rect x="13" y="15" width="26" height="24" rx="4" fill="none" stroke="#fff" stroke-width="3"/><path d="M13 23h26M20 11v7M32 11v7" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>'};
  const mk=(key,txt,ic,x,y,w)=>{const t=el('div','glass tag',root);css(t,{left:x+'px',top:y+'px',width:w+'px'});
    const i=el('div','ico',t,icons[ic]);const c=el('div','chk',t,'<svg width="52" height="52" viewBox="0 0 52 52"><path d="M15 27l8 8 15-17" fill="none" stroke="#04051C" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1"/></svg>');
    const tx=el('div','tx',t,txt);const s=el('div','strike',t);P[key]={t,i,c,tx,s,w,chk:c.querySelector('path')};};
  mk('t1','Teléfono','tel',596,812,330); mk('t2','Horario','hor',654,922,306); mk('t3','¿Abierto ahora?','ab',560,1032,452);
  mk('c1','Teléfono','tel',600,820,330); mk('c2','Horario','hor',652,930,306); mk('c3','Reserva','res',626,1040,300);
  // Avisos
  p=el('div','glass',root);css(p,{left:'580px',top:'880px',width:'440px',height:'236px'});
  el('div','lab',p,'ESTA NOCHE').style.cssText='left:30px;top:26px';
  el('div','',p,'Visitas').style.cssText='left:30px;top:66px;font:500 44px Poppins;color:#cfe0ff';
  P.visNum=el('div','num',p,'0');css(P.visNum,{right:'32px',top:'50px',fontSize:'70px'});
  el('div','',p).style.cssText='left:30px;top:140px;width:380px;height:2px;background:rgba(156,200,255,.25)';
  el('div','',p,'Avisos').style.cssText='left:30px;top:152px;font:700 50px Poppins;color:#fff';
  P.avNum=el('div','num',p,'0');css(P.avNum,{right:'32px',top:'136px',fontSize:'78px',color:'#9CC8FF'});
  P.av=p;
  // WEB REAL tag
  p=el('div','glass',root);css(p,{left:'60px',top:'470px',width:'300px',height:'104px',borderRadius:'22px'});
  el('div','lab',p,'WEB REAL').style.cssText='left:24px;top:20px;font-size:19px';
  el('div','',p,'Amperiza').style.cssText='left:24px;top:46px;font:700 36px Poppins;white-space:nowrap';
  P.real=p;
})();
// clock digits (chip + phone status bar roll together)
function mkClock(root,w,h){root.innerHTML='';const out={};
  ['2','2',':','0'].forEach((c,i)=>{const b=el('b','',root,c);css(b,{left:(i*w)+'px',top:0,width:w+'px',textAlign:'center'});});
  const roll=el('b','',root);css(roll,{left:(4*w)+'px',top:0,width:w+'px',height:h+'px',overflow:'hidden'});
  out.a=el('b','',roll,'4');out.b=el('b','',roll,'5');css(out.a,{left:0,top:0,width:w+'px',textAlign:'center'});css(out.b,{left:0,top:h+'px',width:w+'px',textAlign:'center'});out.h=h;return out;}
const CK=mkClock($('#clockT'),23,44);
$('#sbTime').innerHTML='';css($('#sbTime'),{width:'90px',height:'30px'});const CKs=mkClock($('#sbTime'),15.5,30);
buildCaptions([1,8]);

// title (line 1) : lead-in + punch line, each word rises from behind its mask
const TITLE=[];
(function(){
  const root=$('#title');const ws=L(1).words;
  const rows=[{y:1186,h:86,font:"500 64px/86px 'Poppins'",ws:ws.filter(w=>w.screen===0)},
              {y:1268,h:112,font:"700 88px/112px 'Poppins'",ws:ws.filter(w=>w.screen===1&&w.row===0)},
              {y:1362,h:172,font:"700 140px/172px 'Poppins'",ws:ws.filter(w=>w.screen===1&&w.row===1)}];
  rows.forEach((r,ri)=>{const ln=el('div','tl',root);css(ln,{top:r.y+'px',height:r.h+'px'});
    r.ws.forEach(w=>{const m=el('span','',ln);css(m,{position:'relative',display:'inline-block',overflow:'hidden',height:r.h+'px',verticalAlign:'top',padding:'0 '+(ri===2?16:9)+'px'});
      const pill=el('span','',m);css(pill,{left:'0',right:'0',top:ri===2?'22px':'10px',bottom:ri===2?'18px':'8px',borderRadius:ri===2?'30px':'16px',background:'#9CC8FF',opacity:0});
      const inn=el('span','in',m,w.w);css(inn,{font:w.style==='nuance'?`italic 600 ${ri===2?150:92}px/${r.h}px 'Lora',serif`:r.font,letterSpacing:ri===2?'-4px':'-1px'});
      TITLE.push({w,inn,pill,ri});});});
})();
// CTA (line 8): full sentence, word for word
const CTA=[];
(function(){
  const root=$('#cta');const ws=L(8).words;
  const rows=[{y:1070,h:150,font:"700 112px/150px 'Poppins'",ws:ws.filter(w=>w.screen===0)},
              {y:1232,h:96,font:"700 66px/96px 'Poppins'",ws:ws.filter(w=>w.screen===1&&w.row===0)},
              {y:1326,h:96,font:"700 66px/96px 'Poppins'",ws:ws.filter(w=>w.screen===1&&w.row===1)}];
  rows.forEach((r,ri)=>{const ln=el('div','tl',root);css(ln,{top:r.y+'px',height:r.h+'px'});
    r.ws.forEach(w=>{const txt=w.w.replace(',','');const m=el('span','',ln);css(m,{position:'relative',display:'inline-block',overflow:'hidden',height:r.h+'px',verticalAlign:'top',padding:'0 '+(ri===0?18:10)+'px'});
      const pill=el('span','',m);css(pill,{left:'0',right:'0',top:ri===0?'18px':'12px',bottom:ri===0?'14px':'10px',borderRadius:ri===0?'28px':'18px',background:txt==='WEB'?'#0A22F1':'#9CC8FF',opacity:0,boxShadow:txt==='WEB'?'inset 0 0 0 4px rgba(255,255,255,.9)':'none'});
      const inn=el('span','in',m,txt);css(inn,{font:w.style==='nuance'?`italic 600 72px/${r.h}px 'Lora',serif`:r.font,letterSpacing:ri===0?'-3px':'-1px'});
      CTA.push({w,inn,pill,ri,web:txt==='WEB'});});});
})();

