import numpy as np, sys
from PIL import Image
D='/home/claude/reel-02/ref/fr/'
def load(i): return np.asarray(Image.open(f'{D}{i:03d}.png').convert('RGB')).astype(np.float32)
X0,X1,Y0,Y1=239,845,425,1040
def run(name,a,b,masks):
    fr=[load(i) for i in range(a,b+1)]
    offs=[0]
    for k in range(1,len(fr)):
        p=fr[k-1][560:1030,430:835].mean(2); c=fr[k][560:1030,430:835].mean(2)
        best=(1e9,0)
        for dy in range(-4,90):
            if dy>=0: e=np.abs(p[dy:]-c[:len(c)-dy]).mean()
            else: e=np.abs(p[:dy]-c[-dy:]).mean()
            if e<best[0]: best=(e,dy)
        offs.append(offs[-1]+best[1])
    print(name,offs)
    H=Y1-Y0+offs[-1]; W=X1-X0
    stack=np.full((len(fr),H,W,3),np.nan,np.float32)
    for k,f in enumerate(fr):
        w=f[Y0:Y1,X0:X1].copy()
        for (mx0,my0,mx1,my1) in masks: w[my0-Y0:my1-Y0,max(mx0-X0,0):mx1-X0]=np.nan
        stack[k,offs[k]:offs[k]+Y1-Y0]=w
    m=np.nanmedian(stack,0); m=np.nan_to_num(m)
    Image.fromarray(m.clip(0,255).astype(np.uint8)).save(f'/home/claude/reel-02/work/site/{name}.png')
    print(m.shape)
a,b=int(sys.argv[2]),int(sys.argv[3])
run(sys.argv[1],a,b,[(0,440,420,560),(500,1035,1080,1200)])
