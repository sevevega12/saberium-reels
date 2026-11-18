// ---------- helpers ----------
const $=s=>document.querySelector(s);
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const lerp=(a,b,k)=>a+(b-a)*k;
const seg=(t,a,b)=>clamp((t-a)/(b-a));
const E={
  out:k=>1-Math.pow(1-k,3), out5:k=>1-Math.pow(1-k,5), in:k=>k*k*k, in2:k=>k*k,
  io:k=>k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2, io2:k=>k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,
  expo:k=>k>=1?1:1-Math.pow(2,-10*k), lin:k=>k,
  back:k=>{const c=1.70158;return 1+(c+1)*Math.pow(k-1,3)+c*Math.pow(k-1,2);}
};
// fast-out / slow-in move from a to b that starts at t0 and lasts d
const mv=(t,t0,d,a,b,e=E.expo)=>lerp(a,b,e(seg(t,t0,t0+d)));
function rng(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function el(tag,cls,parent,html){const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;if(parent)parent.appendChild(e);return e;}
const css=(e,o)=>{for(const k in o)e.style[k]=o[k];};

// ---------- timing ----------
const TM=window.TIMING;
const L=n=>TM.lines.find(l=>l.id===n);
// word lookup: W(3,'cargó') -> first word in line 3 whose text starts with it (nth = occurrence)
function W(n,txt,nth=0){const ws=L(n).words.filter(w=>w.w.toLowerCase().replace(/[.,:]/g,'').startsWith(txt.toLowerCase()));return ws[nth]||ws[0];}
const DUR=TM.duration;

// ---------- kinetic captions ----------
// one "screen" of words at a time; each line rises from behind a mask; the word being said sits in a light-blue pill
const capScreens=[];
function buildCaptions(skipLines){
  const root=$('#caps');
  TM.lines.forEach((line,li)=>{
    if(skipLines.includes(line.id))return;
    const screens={};
    line.words.forEach(w=>{(screens[w.screen]=screens[w.screen]||[]).push(w);});
    const keys=Object.keys(screens).map(Number).sort((a,b)=>a-b);
    keys.forEach((k,ki)=>{
      const ws=screens[k];const box=el('div','cap',root);const rows={};
      ws.forEach(w=>{
        if(!rows[w.row]){const ln=el('div','ln',box);rows[w.row]={ln,inn:el('span','in',ln),first:w.start};}
        const wd=el('span','wd'+(w.style==='nuance'?' nu':''),rows[w.row].inn);
        w._pill=el('span','pill',wd);w._tx=el('span','tx',wd,w.w);w._el=wd;
      });
      capScreens.push({box,ws,rows:Object.values(rows),t0:ws[0].start-0.14,end:ws[ws.length-1].end});
    });
  });
  // a screen leaves exactly when the next one arrives (both roll together inside the same masks)
  capScreens.forEach((s,i)=>{const n=capScreens[i+1];
    if(n&&n.t0-s.end<0.75){s.t1=n.t0;s.roll=true;}else{s.t1=s.end+0.55;s.roll=false;}});
}
function updateCaptions(t){
  for(const s of capScreens){
    const on=t>=s.t0&&t<s.t1+0.45;
    s.box.style.display=on?'flex':'none';if(!on)continue;
    const outK=s.roll?E.expo(seg(t,s.t1,s.t1+0.34)):E.in2(seg(t,s.t1,s.t1+0.25));
    s.rows.forEach((r,i)=>{
      const k=E.expo(seg(t,s.t0,s.t0+0.34));
      r.inn.style.transform=`translateY(${(1-k)*105-outK*105}%)`;
    });
    s.ws.forEach((w,i)=>{
      const nxt=s.ws[i+1];const endT=nxt?nxt.start:Math.min(w.end+0.25,s.t1);
      const cur=t>=w.start&&t<endT;const said=t>=w.start;
      const a=cur?E.out(seg(t,w.start,w.start+0.10)):(said?1-seg(t,endT,endT+0.10):0);
      w._pill.style.opacity=a>0?a:0;
      w._pill.style.transform=`scale(${0.86+0.14*a})`;
      const base=said?(w.style==='key'?'#9CC8FF':'#fff'):'#fff';
      w._tx.style.color=a>0.5?'#04051C':base;
      w._tx.style.opacity=said?1:0.68;
      w._tx.style.textShadow=a>0.5?'none':'';
    });
  }
}

// ---------- glass counter helper ----------
function fmt(v,dec=1){return v.toFixed(dec).replace('.',',');}
