#!/usr/bin/env python3
"""Soundtrack synthesized from code. Every hit is placed from work/anchors.json,
which the renderer derives from out/timing.json — so re-timing the voice re-times the music.
Leaves room for a voice: bed is normalised to about -24 LUFS afterwards (see build.sh)."""
import json, os, sys, wave
import numpy as np
from scipy.signal import butter, sosfilt
HERE=os.path.dirname(os.path.abspath(__file__))
A=json.load(open(os.path.join(HERE,'..','work','anchors.json')))
TM=json.load(open(os.environ.get('TIMING',os.path.join(HERE,'..','out','timing.json'))))
SR=48000; DUR=TM['duration']; N=int(DUR*SR)
rs=np.random.RandomState(7)
L=np.zeros(N); R=np.zeros(N)
def add(sig,t,gain=1.0,pan=0.0):
    i=int(t*SR)
    if i<0: sig=sig[-i:]; i=0
    n=min(len(sig),N-i)
    if n<=0: return
    L[i:i+n]+=sig[:n]*gain*(1-max(pan,0)*0.6); R[i:i+n]+=sig[:n]*gain*(1+min(pan,0)*0.6)
def tt(d): return np.arange(int(d*SR))/SR
def bp(x,lo,hi,order=2):
    if lo<=0: sos=butter(order,hi,btype='low',fs=SR,output='sos')
    elif hi>=SR/2: sos=butter(order,lo,btype='high',fs=SR,output='sos')
    else: sos=butter(order,[lo,hi],btype='band',fs=SR,output='sos')
    return sosfilt(sos,x)
def env(d,a=0.005,r=None):
    t=tt(d); r=r or d-a
    return np.minimum(t/a,1)*np.minimum(1,np.maximum(0,(d-t)/r))
def thud():      # dull, low, short: a door falling shut
    d=0.6; t=tt(d); f=78*np.exp(-t*7)+42
    body=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*8.5)
    knock=bp(rs.randn(len(t)),0,420)*np.exp(-t*38)*1.3
    latch=bp(rs.randn(len(t)),1500,4200)*np.exp(-t*120)*0.12
    return body+knock+latch
def hit(f0=58,dec=7,noise=0.25):   # soft low transition hit
    d=0.7; t=tt(d); f=f0*1.6*np.exp(-t*22)+f0
    return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*dec)+bp(rs.randn(len(t)),0,900)*np.exp(-t*30)*noise
def whoosh(d=0.6,lo=300,hi=5000,rev=False):
    t=tt(d); n=rs.randn(len(t)); k=t/d
    out=np.zeros(len(t)); bands=8
    for b in range(bands):       # moving band-pass, done in slices
        a=int(len(t)*b/bands); e=int(len(t)*(b+1)/bands)+2000
        fc=lo*(hi/lo)**((b+0.5)/bands); seg=bp(n[a:e],fc*0.6,min(fc*1.6,SR/2-100))
        w=np.hanning(len(seg)); out[a:a+len(seg)]+= (seg*w)[:len(out)-a]
    out*=np.sin(np.pi*k)**1.5
    return out[::-1] if rev else out
def click(f=2400,d=0.03):
    t=tt(d); return np.sin(2*np.pi*f*t)*np.exp(-t*160)+bp(rs.randn(len(t)),2000,7000)*np.exp(-t*260)*0.4
def pluck(f,d=1.1,warm=1.0):
    t=tt(d); s=np.sin(2*np.pi*f*t)+0.35*np.sin(2*np.pi*2*f*t)*np.exp(-t*6)+0.12*np.sin(2*np.pi*3*f*t)*np.exp(-t*10)
    return s*np.exp(-t*(4.2/warm))*np.minimum(t/0.004,1)
def tok(f=180):
    t=tt(0.25); return np.sin(2*np.pi*(f*np.exp(-t*9))*t)*np.exp(-t*22)
def pad(freqs,d,cut=900,trem=0.12):
    t=tt(d); s=np.zeros(len(t))
    for i,f in enumerate(freqs):
        for det in (-0.25,0.2):
            ph=rs.rand()*6.28
            s+=np.sin(2*np.pi*(f*(1+det/100))*t+ph)+0.3*np.sign(np.sin(2*np.pi*(f*(1+det/100))*t+ph))
    s=bp(s,0,cut)/len(freqs)
    return s*(1-trem+trem*np.sin(2*np.pi*0.11*t))

# ---------- 1. hook: quiet night street, tension ----------
hookEnd=A['morph0']+0.4
d=hookEnd+0.6; t=tt(d)
air=bp(rs.randn(len(t)),180,2600)*(0.55+0.45*np.sin(2*np.pi*0.23*t+1))
air+=bp(rs.randn(len(t)),3000,9000)*0.12        # faint wet-street hiss
drone=np.sin(2*np.pi*55*t)+0.6*np.sin(2*np.pi*55.4*t)+0.35*np.sin(2*np.pi*82.6*t)
tens=(np.sin(2*np.pi*659.3*t)+np.sin(2*np.pi*662.1*t)+0.6*np.sin(2*np.pi*987.8*t))*np.minimum(t/2.2,1)
e=np.minimum(t/0.15,1)*np.minimum(1,(d-t)/0.9)
add(air*e,0,0.045); add(drone*e,0,0.11); add(tens*e,0,0.012,0.3)
add(click(1500,0.05),A['pull0'],0.10,-0.3)               # latch as the hand pulls
add(whoosh(0.5,200,1500),A['release']-0.05,0.05,-0.2)    # the door swinging back
add(thud(),A['shut'],0.95)                                # dull thud
# ---------- 2. pulse sections: beat grid restarts on every transition ----------
BEAT=0.6
def pulse(t0,t1,chord,level=1.0,arp=None,hat=True):
    n=int((t1-t0)/BEAT)+1
    for b in range(n):
        tb=t0+b*BEAT
        if tb>=t1-0.05: break
        add(hit(52,11,0.08),tb,0.20*level)
        if hat: add(bp(rs.randn(int(0.05*SR)),5000,11000)*np.exp(-tt(0.05)*90),tb+BEAT/2,0.022*level,0.3 if b%2 else -0.3)
        if arp: add(pluck(arp[b%len(arp)],0.9,1.3),tb+BEAT/2,0.035*level,-0.25 if b%2 else 0.25)
    p=pad(chord,t1-t0+0.8,1100)
    pe=np.minimum(tt(t1-t0+0.8)/0.6,1)*np.minimum(1,(t1-t0+0.8-tt(t1-t0+0.8))/0.8)
    add(p*pe,t0,0.085*level)
Am=[110.0,164.81,220.0,261.63]; Fm=[87.31,174.61,220.0,261.63]; Dm=[73.42,146.83,220.0,293.66]
Amaj=[110.0,164.81,277.18,329.63]; Dmaj=[73.42,146.83,220.0,369.99]; Emaj=[82.41,164.81,246.94,329.63]
secs=[(A['morph1'],A['page0'],Am,1.0,None),(A['page0'],A['tags0'],Fm,1.0,None),(A['tags0'],A['backTap'],Dm,1.0,None),(A['backTap'],A['in0']+0.2,Am,1.0,None)]
for (a,b,ch,lv,arp) in secs: pulse(a,b,ch,lv,arp)
# interior: the pulse stops — an empty room, just a held chord and room tone
d=A['flip0']-A['in1']+0.6; t=tt(d)
add(pad([73.42,110.0,174.61,220.0],d,700,0.2)*np.minimum(t/0.8,1)*np.minimum(1,(d-t)/0.7),A['in1']-0.2,0.10)
add(bp(rs.randn(len(t)),120,900)*np.minimum(t/0.8,1)*np.minimum(1,(d-t)/0.7),A['in1']-0.2,0.02)
# payoff: warmer lift (major), gentle arpeggio
pulse(A['push'],A['sign0'],Amaj,1.05,[440.0,554.37,659.25,554.37])
pulse(A['sign0'],A['signFlip'],Dmaj,0.9,[369.99,440.0,587.33,440.0],hat=False)
pulse(A['signFlip'],A['end0'],Emaj,0.95,[493.88,659.25,830.61,659.25])
# end card: resolve and let it ring
d=DUR-A['end0']; t=tt(d)
add(pad([110.0,220.0,277.18,329.63,440.0],d,1400,0.08)*np.minimum(t/0.25,1)*np.minimum(1,(d-t)/1.3),A['end0'],0.13)
add(hit(55,5,0.1),A['end0'],0.42); add(pluck(880.0,1.6,1.6),A['end0'],0.06); add(pluck(1108.73,1.6,1.6),A['end0']+0.12,0.045,0.3)
# ---------- 3. hits exactly on the transitions ----------
add(whoosh(0.75,250,4200),A['morph1']-0.75,0.085); add(hit(58,6,0.2),A['morph1'],0.50)
for k,ch in enumerate('cerca de mí'):
    if ch!=' ': add(click(2100+rs.rand()*500,0.02),A['type0']+(A['type1']-A['type0'])*(k+1)/11,0.035,rs.rand()*0.6-0.3)
add(pluck(659.25,0.5),A['results']+0.1,0.035)
add(click(1800,0.04),A['tap1'],0.16); add(tok(150),A['tap1'],0.20)
add(whoosh(0.45,300,3000),A['page0']-0.1,0.06); add(hit(55,7,0.15),A['page0']+0.3,0.36)
# slow load: a low tone that hangs and sinks, released when the page finally arrives
d=A['loaded']-A['page0']-0.3; t=tt(d)
add(np.sin(2*np.pi*np.cumsum(196-18*(t/d))/SR)*np.minimum(t/0.4,1)*np.minimum(1,(d-t)/0.1)*(0.6+0.4*np.sin(2*np.pi*3.3*t)),A['page0']+0.3,0.035,0.2)
add(tok(120),A['loaded'],0.28); add(pluck(392.0,0.5),A['loaded'],0.04)
add(whoosh(0.9,400,2600),A['pinch0'],0.04,0.2)
add(hit(56,8,0.12),A['tags0']+0.1,0.30)
for k,key in enumerate(['x1','x2','x3']):      # three things not found: three falling knocks
    add(tok(230-30*k),A[key],0.34); add(pluck([311.13,293.66,261.63][k],0.45),A[key],0.05,-0.3)
    add(whoosh(0.3,500,2500),A[key]-0.55,0.03,0.3)
add(click(1700,0.04),A['backTap'],0.16); add(tok(140),A['backTap'],0.22)
add(whoosh(0.45,3000,300),A['backTap']+0.02,0.06,-0.3); add(hit(56,8,0.12),A['backTap']+0.45,0.26)
add(pluck(523.25,0.4),A['pick'],0.035)
add(click(1800,0.04),A['tap2'],0.16); add(tok(150),A['tap2'],0.20)
add(whoosh(0.9,250,3600),A['in0']+0.1,0.075); add(hit(50,4.5,0.2),A['in1']+0.2,0.50)
add(pluck(220.0,0.9),A['avisos']+0.05,0.05); add(tok(110),A['avisos']+0.05,0.2)
add(click(900,0.05),A['clockFlip']+0.1,0.14,0.4); add(click(700,0.06),A['clockFlip']+0.62,0.20,0.4); add(pluck(659.25,0.8),A['clockFlip']+0.62,0.03,0.4)
add(whoosh(0.9,200,5000),A['flip0'],0.09); add(hit(58,6,0.2),A['flip1'],0.46)
add(whoosh(0.7,300,2400),A['push'],0.07); add(tok(130),A['push'],0.26); add(pluck(440.0,1.4,1.5),A['push']+0.1,0.06)
for k,key in enumerate(['tick1','tick2','tick3']):   # three ticks: a rising major triad
    add(pluck([554.37,659.25,880.0][k],1.0,1.4),A[key],0.085,0.3); add(click(2600,0.02),A[key],0.05,0.3)
add(whoosh(0.6,2500,250),A['sign0'],0.06); add(thud(),A['sign0']+0.62,0.32)      # the door closes gently this time
add(whoosh(0.4,600,4000),A['signFlip']-0.05,0.06); add(hit(62,7,0.15),A['signFlip']+0.35,0.36); add(pluck(659.25,1.2,1.5),A['signFlip']+0.35,0.07)
# ---------- master ----------
fade=np.minimum(1,(DUR-np.arange(N)/SR)/1.1); L*=fade; R*=fade
pk=max(np.abs(L).max(),np.abs(R).max()); print('peak',pk)
g=0.5/pk; L*=g; R*=g
out=sys.argv[1] if len(sys.argv)>1 else os.path.join(HERE,'..','work','music_raw.wav')
w=wave.open(out,'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((np.stack([L,R],1)*32767).astype('<i2').tobytes()); w.close(); print('wrote',out,DUR)
