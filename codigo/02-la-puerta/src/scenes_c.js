// ------------------------------------------------------------------
//  camera + door for the street world
// ------------------------------------------------------------------
const world=$('#world'), leaf=$('#leaf'), handW=$('#handW'), ww=$('#worldWrap'), inWrap=$('#inWrap'), inWorld=$('#inWorld');
const phone=$('#phone'), glow=$('#phoneGlow');
let CAM={s:1,sx:540,sy:800,fx:540,fy:800};
function setCam(s,sy,fy=800){CAM={s,sx:540,sy,fx:540,fy};world.style.transform=`translate(${540-540*s}px,${sy-fy*s}px) scale(${s})`;}
const w2s=(x,y)=>({x:CAM.sx+(x-CAM.fx)*CAM.s,y:CAM.sy+(y-CAM.fy)*CAM.s});
function doorAngle1(t){            // act 1: pulled a hand's width, released, swings shut
  if(t<A.pull0)return 0;
  if(t<A.release)return 31*E.out(seg(t,A.pull0,A.open1))+1.5*seg(t,A.open1,A.release);
  if(t<A.shut)return 32.5*(1-Math.pow(seg(t,A.release,A.shut),1.9));
  const k=seg(t,A.shut,A.shut+0.34);return 1.3*Math.sin(Math.PI*k)*(1-k);
}
function doorAngle2(t){            // payoff: one push and it opens wide (inwards); closes for the sign
  const o=seg(t,A.push,A.push+0.85);const open=o<=0?0:1-Math.exp(-6.5*o)*Math.cos(o*7.5);
  const c=E.io(seg(t,A.sign0,A.sign0+0.62));
  const b=seg(t,A.sign0+0.62,A.sign0+0.95);
  return -84*open*(1-c)-1.2*Math.sin(Math.PI*b)*(1-b);
}
function projDoor(x,y,deg){        // leaf-local point -> opening-local projected point
  const th=deg*Math.PI/180;const X=x*Math.cos(th),Z=x*Math.sin(th);const sc=3200/(3200-Z);
  return {x:240+(X-240)*sc,y:500+(y-500)*sc,sc};
}
function streetDoF(s,extra=0){
  // shallow depth of field: focus stays on the door plane; everything behind and in front melts as we get closer
  const k=Math.min(s-1,0.55);
  $('#interior').style.filter=`blur(${3.5+k*26+extra}px)`;
  $('#winInt').style.filter=`blur(${4+k*26+extra}px)`;
  const rb=2.5+k*60+extra;reflD.style.filter=`blur(${rb}px)`;reflW.style.filter=`blur(${rb}px)`;
  const rs=(1+k*0.3)/(1+k);
  reflD.style.transform=`translate(${194*(1-rs)-k*60}px,${454*(1-rs)}px) scale(${rs*1.12})`;
  reflW.style.transform=`translate(${-k*80}px,0) scale(${rs*1.1})`;
  const is=(1+k*0.6)/(1+k);$('#interior').style.transform=`translate(${280*(1-is)}px,${540*(1-is)}px) scale(${is})`;
}
function fgLayer(s,sy,on){
  const fg=$('#fg');if(!on){fg.style.display='none';return;}
  fg.style.display='block';const fs=1+(s-1)*3.4;
  fg.style.transformOrigin='0 0';
  fg.style.transform=`translate(${540-540*fs}px,${sy-800*fs}px) scale(${fs})`;
  fg.style.filter=`blur(${(14+(s-1)*70)/fs}px)`;
}
function setHand(deg,rel,show){
  if(!show||rel>=1){handW.style.display='none';return;}
  const p=projDoor(411,508,deg);
  const hx=300+p.x+rel*640, hy=300+p.y+rel*770;
  handW.style.display='block';
  handW.style.transform=`translate(${hx}px,${hy}px) scale(${p.sc*(1+rel*0.5)}) rotate(${-deg*0.25+rel*6}deg)`;
  handW.style.filter=rel>0.02?`blur(${rel*14}px)`:'none';
  $('#rimWarm').style.opacity=0.25+0.75*clamp(Math.abs(deg)/20);
}

// ------------------------------------------------------------------
//  STREET: hook  ·  backdrop of the phone act  ·  payoff  ·  sign
// ------------------------------------------------------------------
function sceneStreet(t){
  const hook=t<A.morph1, back=t>=A.morph1&&t<A.in1+0.3, pay=t>=A.flip0+(A.flip1-A.flip0)*0.5;
  if(!hook&&!back&&!pay){ww.style.display='none';$('#fg').style.display='none';return;}
  ww.style.display='block';ww.style.transform='none';ww.style.opacity=1;
  let deg=0;
  if(hook){
    const kc=seg(t,0,A.morph1);                       // one continuous approach, from frame 0 until the door has become the phone
    const s=1+0.2*(0.55*kc+0.45*E.io2(kc)), sy=800+70*(0.55*kc+0.45*E.io2(kc));
    deg=doorAngle1(t);setCam(s,sy);streetDoF(s);fgLayer(s,sy,true);
    setHand(deg,E.in2(seg(t,A.release,A.release+0.55)),true);
    const mk=E.io(seg(t,A.morph0+0.2,A.morph1));
    ww.style.filter=mk>0?`blur(${mk*22}px) brightness(${1-mk*0.18})`:'none';
    const lf=1-E.io(seg(t,A.morph0+0.3,A.morph1-0.15));
    leaf.style.opacity=lf;$('#jamb').style.opacity=lf;$('#interior').style.opacity=0.45+0.55*lf;
    $('#inPhoneGlow').style.opacity=0;$('#leafDim').style.opacity=0;
    $('#signPlate').style.transform='none';$('#sign').style.transform='none';$('#sign').style.opacity=1;
  }else if(back){
    const k=seg(t,A.morph1,A.in1);setCam(1.2+0.05*k,870);fgLayer(1,0,false);setHand(0,1,false);
    ww.style.filter='blur(22px) brightness(.82)';leaf.style.opacity=0;$('#jamb').style.opacity=0;$('#interior').style.opacity=0.45;
  }else{
    const fk=seg(t,A.flip0,A.flip1);
    const pk=E.io(seg(t,A.push+0.05,A.push+1.7)), ck=E.io(seg(t,A.sign0,A.sign0+1.2));
    const drift=0.03*seg(t,A.push+1.7,A.sign0);
    const s=lerp(lerp(1.0,1.24,pk)+drift,3.4,ck)+0.08*seg(t,A.sign0+1.2,DUR)*(ck>=1?1:0);
    const sy=lerp(lerp(800,786,pk),742,ck), fy=lerp(800,609,ck);
    deg=doorAngle2(t);setCam(s,sy,fy);streetDoF(s);fgLayer(1,0,false);
    leaf.style.opacity=1;$('#jamb').style.opacity=1;
    const he=E.expo(seg(t,A.push-0.62,A.push-0.04)), hx=E.in2(seg(t,A.push+0.10,A.push+0.48));
    setHand(deg,Math.max(1-he,hx),t>A.push-0.62&&t<A.push+0.5);
    const lit=E.io(seg(t,A.push,A.push+0.6))*(1-E.io(seg(t,A.sign0+0.2,A.sign0+0.7)));
    $('#interior').style.opacity=1-0.5*lit;$('#inPhoneGlow').style.opacity=0.55*lit;
    // the sign: swings a little when the door shuts, then turns ABIERTO -> WEB
    const sw=seg(t,A.sign0+0.6,A.sign0+2.4);
    $('#sign').style.transformOrigin='110px 7px';
    $('#sign').style.transform=`rotate(${5*Math.sin(sw*Math.PI*3.2)*(1-sw)*(sw>0?1:0)}deg)`;
    const sf=seg(t,A.signFlip,A.signFlip+0.75);
    $('#signPlate').style.transform=`rotateY(${180*E.back(sf)}deg) scale(${1+0.1*Math.sin(Math.PI*sf)})`;
    // end card: the street goes out of focus
    const ek=E.io(seg(t,A.end0,A.end0+0.9));$('#sign').style.opacity=1-ek;
    const fl=fk<1?`perspective(2400px) rotateY(${90*(1-E.out(seg(fk,0.5,1)))}deg) scale(${1-0.16*Math.sin(Math.PI*fk)})`:'none';
    ww.style.transform=fl;$("#leafDim").style.opacity=0.74*ck;
    ww.style.filter=ek>0?`blur(${ek*24}px) brightness(${1-ek*0.5})`:'none';
  }
  leaf.style.transform=`rotateY(${-deg}deg)`;
  // warm light on the wet pavement through the gap (act 1)
  if(deg>0.05){const pr=projDoor(480,1000,deg);const gl=500+pr.x, gr=980;
    $('#spill').style.clipPath=`polygon(${gl}px 0,${gr+4}px 0,${gr+150+deg*6}px 700px,${gl-240-deg*14}px 700px)`;
    $('#spill').style.opacity=clamp(deg/18);
  }else $('#spill').style.opacity=0;
}

// ------------------------------------------------------------------
//  PHONE: search -> slow page -> pinch -> back -> list     (and the payoff screen)
// ------------------------------------------------------------------
const Z0=552/1280, Z1=1.02;
const PAN=[{tx:0,ty:0,z:Z0},{tx:18,ty:414,z:Z1},{tx:739,ty:24,z:Z1},{tx:380,ty:1030,z:Z1},{tx:370,ty:1390,z:Z1},{tx:60,ty:20,z:Z1}];
function pageView(t){
  let v={...PAN[0]};
  const k1=E.io(seg(t,A.pinch0,A.pinch0+1.05));
  v={tx:lerp(PAN[0].tx,PAN[1].tx,k1),ty:lerp(PAN[0].ty,PAN[1].ty,k1),z:lerp(Z0,Z1,k1)};
  [[A.x1,2],[A.x2,3],[A.x3,4],[A.giveUp,5]].forEach(([tt,i])=>{const k=E.expo(seg(t,tt-0.62,tt+0.25));v.tx=lerp(v.tx,PAN[i].tx,k);v.ty=lerp(v.ty,PAN[i].ty,k);});
  return v;
}
function scenePhone(t){
  const act=t>=A.morph0+0.25&&t<A.in1+0.3, pay=t>=A.push-0.05&&t<A.sign0+0.75;
  if(!act&&!pay){phone.style.display='none';glow.style.display='none';$('#digits').style.display='none';return;}
  phone.style.display='block';glow.style.display='block';$('#digits').style.display=act?'block':'none';
  const sS=$('#scrSearch'), sP=$('#scrPage'), sT=$('#scrSite');
  if(act){
    // door leaf -> phone (same rectangle, corners round off, glass becomes screen)
    const mk=E.io(seg(t,A.morph0+0.3,A.morph1-0.1));
    const c=w2s(540,800);const sc=t<A.morph1?CAM.s/1.2:1;
    const bob=t>A.morph1?Math.sin((t-A.morph1)*0.9)*4:0;
    phone.style.opacity=mk;phone.style.transform=`translate(0,${(t<A.morph1?c.y-870:0)+bob}px) scale(${sc})`;
    phone.style.borderRadius=lerp(6,78,E.out(seg(t,A.morph0+0.3,A.morph1+0.1)))+'px';
    $('#screen').style.borderRadius=lerp(2,66,E.out(seg(t,A.morph0+0.3,A.morph1+0.1)))+'px';
    phone.style.clipPath='none';
    glow.style.opacity=mk*0.9;glow.style.transform='none';
    sT.style.display='none';
    // ---- search screen
    sS.style.display='block';
    const txt='cerca de mí';const n=Math.round(txt.length*seg(t,A.type0,A.type1));
    S.q.textContent=txt.slice(0,n);S.q.style.color='#0b0f33';
    S.caret.style.left=(76+n*16.2)+'px';S.caret.style.opacity=(t<A.type1+1.2&&Math.floor(t*2.2)%2===0)||t<A.type1?1:0;
    if(n===0){S.q.textContent='Buscar';S.q.style.color='#9aa3c7';S.caret.style.left='70px';}
    const tspan=A.type1-A.type0;
    S.pins.forEach((p,i)=>{const k=E.back(seg(t,A.type0+tspan*(0.45+i*0.14),A.type0+tspan*(0.45+i*0.14)+0.4));p.style.transform=`scale(${k})`;p.style.opacity=k>0?1:0;});
    const pb=Math.sin(Math.PI*seg(t,A.results+0.1,A.results+0.7));S.pins[0].style.transform+=` translateY(${-12*pb}px) scale(${1+0.25*pb})`;
    const after=t>A.backTap;
    S.rows.forEach((o,i)=>{const t0=A.morph1-0.25+i*0.2;const k=E.expo(seg(t,t0,t0+0.5));
      o.row.style.opacity=k*(after&&i===0?0.5:1);o.row.style.transform=`translateY(${(1-k)*46}px)`;o.v.style.opacity=after&&i===0?1:0;});
    const rk=after?E.io(seg(t,A.pick,A.pick+0.5)):0;
    const ringOn=after?E.out(seg(t,A.backTap+0.4,A.backTap+0.7)):E.out(seg(t,W(2,'y').start-0.1,W(2,'y').start+0.25));
    S.ring.style.opacity=ringOn*(t<A.page0+0.2||after?1:0);S.ring.style.transform=`translateY(${166*rk}px) scale(${1+0.02*Math.sin(t*5)*(1-seg(t,A.tap1,A.tap1+0.01))})`;
    S.fill.style.opacity=E.out(seg(t,A.tap2,A.tap2+0.3));
    // ---- the slow page
    const pOn=t>=A.page0&&t<A.backTap+0.5;sP.style.display=pOn?'block':'none';
    if(pOn){
      const k=E.expo(seg(t,A.page0,A.page0+0.6));
      const bk=E.expo(seg(t,A.backTap+0.04,A.backTap+0.5));
      sP.style.clipPath=`inset(${lerp(548,0,k)}px ${lerp(28,0,k)}px ${lerp(1176-698,0,k)}px ${lerp(28,0,k)}px round ${lerp(26,0,k)}px)`;
      sP.style.transformOrigin='52px 105px';sP.style.transform=`scale(${1-bk*0.93})`;sP.style.opacity=1-E.in2(seg(bk,0.55,1));
      sP.style.borderRadius=(bk*300)+'px';
      const lp=seg(t,A.page0+0.3,A.loaded);
      const done=seg(t,A.loaded,A.loaded+0.25);
      S.loadbar.style.width=(552*(0.8*(1-Math.pow(1-lp,2.4))+0.2*done))+'px';S.loadbar.style.opacity=1-seg(t,A.loaded+0.3,A.loaded+0.6);
      const lp2=seg(lp,0.36,1);
      S.fouc.style.opacity=1-seg(lp,0.36,0.40);S.foucParts.forEach((e,i)=>{e.style.opacity=lp>0.03+i*0.012?1:0;});
      S.parts.forEach(([e,th])=>{e.style.opacity=clamp((lp2-th*0.96)/0.03);});
      const hp=Math.min(1,Math.floor(seg(lp2,0.08,0.9)*11)/10);S.hero.style.clipPath=`inset(0 0 ${(1-hp)*100}% 0)`;
      S.spin.style.opacity=(1-seg(t,A.loaded-0.15,A.loaded))*seg(t,A.page0+0.3,A.page0+0.6);S.spin.querySelector('#spArc').setAttribute('transform',`rotate(${t*300} 100 50)`);S.spin.style.top=(lerp(600,760,E.io2(seg(lp,0.36,0.9))))+'px';
      const v=pageView(t);S.doc.style.transform=`scale(${v.z}) translate(${-v.tx}px,${-v.ty}px)`;
      const press=Math.sin(Math.PI*seg(t,A.backTap-0.05,A.backTap+0.3));S.pgBack.style.background=`rgba(10,34,241,${0.25*press})`;
    }
    // ---- digits
    let rp=false;
    { // right thumb taps "Tu negocio"
      const a=E.expo(seg(t,A.tap1-0.8,A.tap1-0.08)), o=E.in2(seg(t,A.tap1+0.22,A.tap1+0.72));
      const pr=Math.sin(Math.PI*seg(t,A.tap1-0.08,A.tap1+0.2));
      // and later "El de enfrente"
      const a2=E.expo(seg(t,A.tap2-0.8,A.tap2-0.08)), o2=E.in2(seg(t,A.tap2+0.25,A.tap2+0.75));
      const pr2=Math.sin(Math.PI*seg(t,A.tap2-0.08,A.tap2+0.2));
      // and the pinch (thumb half)
      const pa=E.expo(seg(t,A.pinch0-0.65,A.pinch0-0.02)), pk=E.io(seg(t,A.pinch0,A.pinch0+1.05)), po=E.in2(seg(t,A.pinch1+0.1,A.pinch1+0.6));
      if(t<A.tap1+0.8)setDigit(DG.thumbR,lerp(900,612,a)+o*330,lerp(1900,925,a)+o*820+pr*5,-24-o*8,1-pr*0.03,t>A.tap1-0.8?1:0,1,o*12);
      else if(t<A.pinch1+0.7)setDigit(DG.thumbR,lerp(700,lerp(490,400,pk),pa)+po*260,lerp(1900,lerp(1000,1130,pk),pa)+po*760,-14-pk*8,0.92,t>A.pinch0-0.65?1:0,1,po*12);
      else setDigit(DG.thumbR,lerp(900,612,a2)+o2*330,lerp(1900,1090,a2)+o2*820+pr2*5,-24-o2*8,1-pr2*0.03,t>A.tap2-0.8?1:0,1,o2*12);
      rp=setRipple(t,A.tap1,612,925)||setRipple(t,A.tap2,612,1090)||setRipple(t,A.backTap,316,388);
      // index: the other half of the pinch, then drags the page around looking for something
      if(t<A.pinch1+0.7){
        setDigit(DG.index,lerp(1300,lerp(604,700,pk),pa)+po*520,lerp(560,lerp(872,740,pk),pa)+po*-60,-64+pk*6,0.92,t>A.pinch0-0.65?1:0,1,po*12);
      }else{
        // three flicks, one per thing he does not find
        let x=1300,y=1500,op=0,bl=0;
        const fl=[[A.x1,[560,840],[420,1010]],[A.x2,[600,1040],[640,760]],[A.x3,[610,1050],[630,790]],[A.giveUp,[600,760],[660,1060]]];
        fl.forEach(([tt,p0,p1],i)=>{const st=tt-0.62;const a=E.expo(seg(t,st-0.5,st));const d=E.out(seg(t,st,st+0.3));const o=E.in2(seg(t,st+0.32,st+0.75));
          if(t>=st-0.5&&t<st+0.78){x=lerp(1000,lerp(p0[0],p1[0],d),a)+o*380;y=lerp(1700,lerp(p0[1],p1[1],d),a)+o*560;op=1;bl=o*10;}});
        setDigit(DG.index,x,y,-34,0.95,op,1,bl);
      }
      // left thumb: presses the back arrow and lets go (the same release as the hand on the door)
      const la=E.expo(seg(t,A.back0-0.25,A.backTap-0.04)), lo=E.in2(seg(t,A.backTap+0.2,A.backTap+0.75));
      const lpz=Math.sin(Math.PI*seg(t,A.backTap-0.06,A.backTap+0.2));
      setDigit(DG.thumbL,lerp(-360,318,la)-lo*620,lerp(1500,392,la)+lo*560+lpz*4,56+lo*8,1-lpz*0.03,t>A.back0-0.25&&t<A.backTap+0.8?1:0,-1,lo*14);
    }
    if(!rp)ripple.style.opacity=0;
  }else{
    // ---- payoff: the phone stands in the doorway, the real site scrolls
    const c=w2s(552,800);const sc=0.70*CAM.s;
    phone.style.opacity=1;phone.style.borderRadius='78px';$('#screen').style.borderRadius='66px';
    phone.style.transform=`translate(${c.x-540}px,${c.y-870}px) scale(${sc})`;
    const deg=doorAngle2(t);const e=w2s(300+projDoor(480,500,deg).x,800);
    const left=c.x-288*sc;const cl=clamp((e.x-left)/sc+4,0,600);
    phone.style.clipPath=`inset(-200px -200px -200px ${cl}px)`;
    const vis=clamp(1-cl/560);
    glow.style.opacity=0.8*vis*(1-seg(t,A.sign0,A.sign0+0.4));glow.style.transform=`translate(${c.x-540}px,${c.y-870}px) scale(${sc})`;
    sS.style.display='none';sP.style.display='none';sT.style.display='block';
    const sk=E.io2(seg(t,A.push+0.7,A.sign0-0.15));
    S.stImg.style.transform=`translateY(${-sk*S.maxScroll}px)`;
    const lb=seg(t,A.push+0.1,A.push+0.45);S.stLoad.style.width=(552*E.out(lb))+'px';S.stLoad.style.opacity=1-seg(t,A.push+0.5,A.push+0.75);
  }
}
S.maxScroll=1372*552/606-942;

// ------------------------------------------------------------------
//  INTERIOR: the tapped row opens into your own door, seen from inside
// ------------------------------------------------------------------
function sceneInterior(t){
  if(t<A.in0||t>=A.flip0+(A.flip1-A.flip0)*0.5){inWrap.style.display='none';return;}
  inWrap.style.display='block';inWrap.style.opacity=1;
  const k=E.io(seg(t,A.in0+0.2,A.in1+0.2));
  const R={x:292,y:996,w:496,h:150};
  inWrap.style.clipPath=`inset(${lerp(R.y,0,k)}px ${lerp(1080-R.x-R.w,0,k)}px ${lerp(1920-R.y-R.h,0,k)}px ${lerp(R.x,0,k)}px round ${lerp(26,0,k)}px)`;
  const zk=E.io(seg(t,A.in0+0.2,A.in0+2.1));
  const s=lerp(1.46,1.0,zk)+0.05*seg(t,A.in0+2.1,A.flip1), fy=lerp(690,820,zk), sy=lerp(1071,820,zk);
  inWorld.style.transform=`translate(${540-540*s}px,${sy-fy*s}px) scale(${s})`;
  S.counter.style.transform=`translate(${(s-1)*-300+ (1-zk)*240}px,${(1-zk)*300}px) scale(${1+(s-1)*2})`;
  const fk=seg(t,A.flip0,A.flip1);
  inWrap.style.transform=fk>0?`perspective(2400px) rotateY(${-90*E.in2(seg(fk,0,0.5))}deg) scale(${1-0.16*Math.sin(Math.PI*fk)})`:'none';
}

// ------------------------------------------------------------------
//  UI: glass panels, numbers, clock, title, CTA, end card
// ------------------------------------------------------------------
function panelIn(p,t,t0,t1,dx=60,dy=0){
  const a=E.expo(seg(t,t0,t0+0.55)), o=E.in2(seg(t,t1,t1+0.3));
  const v=Math.min(1,a*1.6)*(1-o);p.style.opacity=v;p.style.display=v<=0.001?'none':'block';
  p.style.transform=`translate(${(1-a)*dx-o*dx*0.6}px,${(1-a)*dy}px)`;
  return v;
}
['t1','t2','t3'].forEach(k=>P[k].t.style.left='58px');
function ui(t){
  // --- TIEMPO DENTRO: follows the door, eases back and settles at 0,0
  const deg=doorAngle1(t);const v=0.6*clamp(deg/32.5);
  const o=E.in2(seg(t,A.morph0,A.morph0+0.35));
  P.inside.style.opacity=1-o;P.inside.style.display=o>=1?'none':'block';P.inside.style.transform=`translate(${-o*70}px,0)`;
  P.insideNum.textContent=fmt(v);P.insideBar.style.width=(300*v/0.6)+'px';
  const settle=seg(t,A.shut,A.shut+0.5);
  P.insideNum.style.transformOrigin='0 60%';P.insideNum.style.transform=`scale(${1+0.07*Math.sin(Math.PI*settle)})`;
  P.insideNum.style.color=t>A.shut?'#9CC8FF':'#fff';
  // --- title (line 1)
  const tout=E.in2(seg(t,A.morph0+0.02,A.morph0+0.32));
  $('#title').style.display=t<A.morph0+0.4?'block':'none';
  TITLE.forEach(q=>{const k=E.expo(seg(t,q.w.start-0.06,q.w.start+0.36));
    q.inn.style.transform=`translateY(${(1-k)*105-tout*105}%)`;
    const isKey=q.w.style==='key';const pk=isKey?clamp(E.back(seg(t,q.w.start+0.04,q.w.start+0.42)))*(1-tout):0;
    q.pill.style.opacity=pk>0.02?1-tout:0;q.pill.style.transform=`scaleX(${pk})`;q.pill.style.transformOrigin='0 50%';
    q.inn.style.color=isKey&&pk>0.5?'#04051C':'#fff';q.inn.style.textShadow=isKey&&pk>0.5?'none':'';});
  // --- TIEMPO DE CARGA
  const lp=seg(t,A.page0+0.3,A.loaded);
  panelIn(P.load,t,A.page0+0.25,A.tags0-0.15,-60);
  const lv=6.8*(1-Math.pow(1-lp,2.2));P.loadNum.textContent=fmt(lv);P.loadBar.style.width=(344*lv/6.8)+'px';
  P.loadNum.style.color=t>A.loaded?'#9CC8FF':'#fff';
  P.loadNum.style.transformOrigin='0 60%';P.loadNum.style.transform=`scale(${1+0.07*Math.sin(Math.PI*seg(t,A.loaded,A.loaded+0.5))})`;
  // --- three things he does not find
  [['t1',A.x1],['t2',A.x2],['t3',A.x3]].forEach(([k,tx],i)=>{const g=P[k];
    panelIn(g.t,t,A.tags0+i*0.13,L(5).start-0.2+i*0.07,-70);
    const sk=E.expo(seg(t,tx,tx+0.4));g.s.style.width=(sk*(g.w-104))+'px';
    g.tx.style.opacity=1-0.42*sk;g.i.style.opacity=1-0.5*sk;g.c.style.opacity=0;
    g.t.style.transform+=` translateX(${Math.sin(Math.PI*seg(t,tx,tx+0.3))*-8}px)`;});
  // --- payoff checklist
  [['c1',A.tick1],['c2',A.tick2],['c3',A.tick3]].forEach(([k,tx],i)=>{const g=P[k];
    panelIn(g.t,t,tx-0.3,A.sign0-0.05+i*0.06,70);
    const ck=E.out(seg(t,tx,tx+0.35));g.c.style.opacity=ck;g.c.style.transform=`scale(${0.6+0.4*E.back(seg(t,tx,tx+0.35))})`;
    g.chk.style.strokeDashoffset=1-E.out(seg(t,tx+0.08,tx+0.4));g.i.style.opacity=1-ck;g.s.style.width='0px';});
  panelIn(P.real,t,A.push+0.9,A.sign0-0.1,-70);
  // --- this night: 1 visit, 0 notices
  panelIn(P.av,t,A.avisos,A.flip0-0.2,70);
  const vk=E.out5(seg(t,A.avisos+0.55,A.avisos+1.3));P.visNum.textContent=Math.round(vk);
  P.avNum.style.transformOrigin='100% 60%';P.avNum.style.transform=`scale(${1+0.14*Math.sin(Math.PI*seg(t,W(6,'avisa').start,W(6,'avisa').start+0.6))})`;
  // --- clock: 22:04 -> 22:05 (chip and phone status bar roll together)
  const ck=E.io(seg(t,A.clockFlip,A.clockFlip+0.7));
  [CK,CKs].forEach(c=>{c.a.style.transform=`translateY(${-ck*c.h}px)`;c.b.style.transform=`translateY(${-ck*c.h}px)`;});
  const pulse=Math.sin(Math.PI*seg(t,A.clockFlip+0.45,A.clockFlip+1.05));
  const ce=E.io(seg(t,A.end0,A.end0+0.5));
  $('#clock').style.transform=`scale(${1+0.12*pulse})`;$('#clock').style.opacity=1-ce;
  $('#clock i').style.opacity=0.5+0.5*Math.pow(Math.sin(t*Math.PI*0.5),2);
  $('#clock').style.boxShadow=pulse>0.05?`0 14px 34px rgba(1,2,18,.5),inset 0 1.5px 0 rgba(255,255,255,.34),inset 0 0 0 ${1.5+2*pulse}px rgba(156,200,255,${0.3+0.6*pulse})`:'';
  // --- CTA, word for word
  $('#cta').style.display=t>L(8).start-0.3?'block':'none';
  CTA.forEach(q=>{const k=E.expo(seg(t,q.w.start-0.06,q.w.start+0.4));
    q.inn.style.transform=`translateY(${(1-k)*105}%)`;
    const nxt=L(8).words[L(8).words.indexOf(q.w)+1];const endT=nxt?nxt.start:q.w.end+0.3;
    const cur=t>=q.w.start&&t<endT;
    let pk=cur?E.out(seg(t,q.w.start,q.w.start+0.12)):(t>=endT?1-seg(t,endT,endT+0.12):0);
    if(q.web)pk=clamp(E.back(seg(t,q.w.start+0.02,q.w.start+0.4)));
    q.pill.style.opacity=pk>0.02?(q.web?1:pk):0;q.pill.style.transform=q.web?`scaleX(${pk})`:`scale(${0.9+0.1*pk})`;q.pill.style.transformOrigin=q.web?'0 50%':'50% 50%';
    q.inn.style.color=(!q.web&&pk>0.5)?'#04051C':'#fff';q.inn.style.textShadow=pk>0.5?'none':'';});
  // --- end card
  const ek=E.io(seg(t,A.end0+0.1,A.end0+0.9));
  const ec=$('#endcard');ec.style.display=ek>0?'block':'none';ec.style.opacity=1;
  $('#endLogo').style.clipPath=`inset(0 ${(1-E.expo(seg(t,A.end0+0.2,A.end0+1.0)))*100}% 0 0)`;
  $('#endLogo').style.transform=`translateY(${(1-E.expo(seg(t,A.end0+0.2,A.end0+1.0)))*30}px)`;
  $('#endUrl').style.opacity=E.out(seg(t,A.end0+0.7,A.end0+1.2));
  // scrim: lighter in the interior and payoff so the floor and doorway still read
  $('#scrim').style.opacity=1;
  $('#scrim2').style.opacity=E.io(seg(t,A.morph0+0.5,A.morph1+0.2))*(1-E.io(seg(t,A.in0+0.3,A.in1+0.3)));
}

// ------------------------------------------------------------------
//  master clock
// ------------------------------------------------------------------
window.__seek=function(ms){
  const t=ms/1000;
  sceneStreet(t);sceneInterior(t);scenePhone(t);ui(t);updateCaptions(t);
};
window.__seek(0);
