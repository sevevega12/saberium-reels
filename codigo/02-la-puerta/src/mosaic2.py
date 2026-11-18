import numpy as np, sys
from PIL import Image
D='/home/claude/reel-02/ref/fr/'
def load(i): return np.asarray(Image.open(f'{D}{i:03d}.png').convert('RGB')).astype(np.float32)
X0,X1,Y0,Y1,Y2=239,845,425,1040,1400
name,a,b=sys.argv[1],int(sys.argv[2]),int(sys.argv[3])
fr=[load(i) for i in range(a,b+1)]
offs=[0]
for k in range(1,len(fr)):
    p=fr[k-1][560:1030,430:835].mean(2); c=fr[k][560:1030,430:835].mean(2)
    best=(1e9,0)
    for dy in range(-4,90):
        e=np.abs(p[dy:]-c[:len(c)-dy]).mean() if dy>=0 else np.abs(p[:dy]-c[-dy:]).mean()
        if e<best[0]: best=(e,dy)
    offs.append(offs[-1]+best[1])
W=X1-X0; hw=Y1-Y0; H=hw+offs[-1]; HX=Y2-Y0+offs[-1]
masks=[(0,440,420,560)]
stack=np.full((len(fr),H,W,3),np.nan,np.float32)
for k,f in enumerate(fr):
    w=f[Y0:Y1,X0:X1].copy()
    for (mx0,my0,mx1,my1) in masks: w[my0-Y0:my1-Y0,max(mx0-X0,0):mx1-X0]=np.nan
    stack[k,offs[k]:offs[k]+hw]=w
import warnings; warnings.simplefilter('ignore')
clean=np.nanmedian(stack,0)
# lower rows: fit obs=a*clean+b per screen row, x<280 window coords (left of checklist chips)
XL=255; CHIPB=int(sys.argv[4])
ext=np.full((len(fr),HX,W,3),np.nan,np.float32)
for sy in range(Y1,Y2):
    obs=[];ref=[]
    for k,f in enumerate(fr):
        py=sy-Y0+offs[k]
        if py<H:
            r=clean[py,:XL]; 
            if not np.isnan(r).any(): obs.append(f[sy,X0:X0+XL]); ref.append(r)
    if len(obs)<3: A,B=lastA,lastB
    else:
        o=np.concatenate(obs).reshape(-1,3); r=np.concatenate(ref).reshape(-1,3)
        A=np.zeros(3);B=np.zeros(3)
        for ch in range(3):
            A[ch],B[ch]=np.polyfit(r[:,ch],o[:,ch],1)
        lastA,lastB=A,B
    if A.min()<0.25: break
    for k,f in enumerate(fr):
        py=sy-Y0+offs[k]
        ext[k,py,:XL]=(f[sy,X0:X0+XL]-B)/A
        if sy>=CHIPB: ext[k,py,XL:]=(f[sy,X0+XL:X1]-B)/A
print(name,'offs',offs[-1],'stopped at screen row',sy)
extm=np.nanmedian(ext,0)
out=np.full((HX,W,3),np.nan,np.float32); out[:H]=clean
m=np.isnan(out); out[m]=extm[m]
valid=~np.isnan(out).any(2)
# top-left hole (tag chip): smear the neighbouring clean column band
for y in range(10,140):
    out[y,:185]=out[y,186:196].mean(0)
from scipy.ndimage import gaussian_filter

Image.fromarray(np.nan_to_num(out).clip(0,255).astype(np.uint8)).save(f'/home/claude/reel-02/work/site/{name}_x.png')
Image.fromarray((valid*255).astype(np.uint8)).save(f'/home/claude/reel-02/work/site/{name}_valid.png')
