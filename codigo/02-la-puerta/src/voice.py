#!/usr/bin/env python3
"""Lays the real voice on the video timeline as timing.json says: each phrase is copied untouched
(no speed or pitch change), cut only inside the silences around it, with short fades."""
import json, subprocess, sys, wave, numpy as np, os
tm=json.load(open('out/timing.json')); v=tm['voice']; SR=48000
subprocess.run(['ffmpeg','-v','error','-y','-i',v['file'],'-ac','1','-ar',str(SR),'work/voz_src.wav'],check=True)
w=wave.open('work/voz_src.wav'); x=np.frombuffer(w.readframes(w.getnframes()),'<i2').astype(np.float64)/32768
out=np.zeros(int(tm['duration']*SR)); ph=v['phrases']
for i,p in enumerate(ph):
    prev_end=ph[i-1]['src_end'] if i else 0.0; next_start=ph[i+1]['src_start'] if i+1<len(ph) else len(x)/SR
    pre=min(0.09,(p['src_start']-prev_end)/2); post=min(0.14,(next_start-p['src_end'])/2)   # stay inside the silences
    a=int((p['src_start']-pre)*SR); b=int((p['src_end']+post)*SR); s=x[a:b].copy()
    f=int(0.025*SR); s[:f]*=np.linspace(0,1,f); s[-f:]*=np.linspace(1,0,f)
    o=int((p['start']-pre)*SR); out[o:o+len(s)]+=s
ww=wave.open('work/voice_raw.wav','wb'); ww.setnchannels(1); ww.setsampwidth(2); ww.setframerate(SR)
ww.writeframes((np.clip(out,-1,1)*32767).astype('<i2').tobytes()); ww.close(); print('voice laid:',len(ph),'phrases')
