#!/usr/bin/env python3
"""Builds out/timing.json FROM THE REAL VOICE (voz/voz-puerta.mp3).
Each phrase = one stretch of speech between two silences of the recording:
  (src_start, src_end)  where it sits in the MP3 (never stretched, never reordered)
  new_start             where it is placed in the video (phrases are only moved apart, cut inside silences)
Word times inside a phrase are estimated by syllable count (no transcription tool installed).
Markup: '|' new caption screen, '/' line break, [word] key word, *word* nuance word."""
import json, re, sys
VOICE="voz/voz-puerta.mp3"
PHRASES=[  # line, src_start, src_end, new_start, text
 (1,  0.12,  1.24,  0.15, "Alguien abrió tu web."),
 (1,  1.66,  2.67,  1.69, "| Y se fue / *sin* [entrar]."),
 (2,  3.23,  4.49,  4.50, "Eran las diez / de la noche."),
 (2,  5.11,  6.72,  6.20, "| Buscaba *justo* / lo que tú haces,"),
 (2,  7.04,  7.61,  8.15, "| y te [encontró]."),
 (3,  8.21,  9.70,  9.60, "Pero tu web / [tardó] en cargar."),
 (3, 10.14, 10.89, 12.20, "| Y cuando cargó,"),
 (3, 11.12, 13.66, 13.25, "| tuvo que ampliar / con los [dedos] | para leer *algo*."),
 (4, 14.33, 15.26, 16.60, "No encontró / el [teléfono]."),
 (4, 15.66, 16.63, 18.10, "| No encontró / el [horario]."),
 (4, 17.09, 18.56, 19.65, "| No supo si / seguías [abierto]."),
 (5, 19.10, 20.50, 21.90, "Así que hizo / lo más *fácil*:"),
 (5, 20.98, 21.70, 23.80, "| [volver] atrás."),
 (5, 22.13, 24.26, 25.10, "| Y el siguiente / de la lista | era el de / [enfrente]."),
 (6, 24.90, 25.68, 28.35, "Tú no te / [enteraste]."),
 (6, 26.22, 28.83, 29.95, "| *Nadie* te avisa / de un cliente | que estuvo *a* *punto* / de [entrar]."),
 (7, 29.64, 31.93, 33.75, "Tu web es / tu [puerta] | cuando tú / *no* estás."),
 (7, 32.40, 33.33, 37.40, "| Que abra / a la [primera]."),
 (8, 33.91, 34.45, 40.60, "Comenta [WEB],"),
 (8, 34.71, 36.91, 41.40, "| y te enseñamos *gratis* / cómo quedaría la tuya."),
]
TAIL=2.7   # end card hold after the last word
def syl(w):
    w=re.sub(r'[^a-záéíóúüñ]','',w.lower())
    if w=='web': return 1.6          # said slowly, as a spelled-out key word
    n=len(re.findall(r'[aeiouáéíóúü]+',w)); n+=len(re.findall(r'[aeo][aeoáéó]|[íú][aeo]|[aeo][íú]',w))
    return max(1,n)+0.35             # +0.35: every word costs a little, however short
out={"fps":30,"note":"Times in seconds, taken from the real voice-over. 'voice.phrases' says which stretch of the MP3 goes where; words are estimated by syllables inside each phrase.",
     "voice":{"file":VOICE,"phrases":[]},"lines":[]}
lines={}
for n,s0,s1,t0,txt in PHRASES:
    L=lines.setdefault(n,{"id":n,"words":[],"screen":0,"row":0,"txt":[]})
    ws=[]
    for tok in txt.split():
        if tok=='|': L["screen"]+=1; L["row"]=0; continue
        if tok=='/': L["row"]+=1; continue
        style='plain'; w=tok
        m=re.match(r'^\[(.+?)\](.*)$',w)
        if m: style='key'; w=m.group(1)+m.group(2)
        m=re.match(r'^\*(.+?)\*(.*)$',w)
        if m: style='nuance'; w=m.group(1)+m.group(2)
        ws.append({"w":w,"screen":L["screen"],"row":L["row"],"style":style})
    tot=sum(syl(x["w"]) for x in ws); t=t0; d=s1-s0
    for x in ws:
        dd=d*syl(x["w"])/tot; x["start"]=round(t,3); x["end"]=round(t+dd,3); t+=dd
    L["words"]+=ws; L["txt"].append(re.sub(r'[\[\]\*]|(^|\s)[|/](?=\s)','',txt).strip())
    out["voice"]["phrases"].append({"line":n,"src_start":s0,"src_end":s1,"start":t0,"end":round(t0+d,3),"text":L["txt"][-1]})
for n in sorted(lines):
    L=lines[n]; out["lines"].append({"id":n,"text":re.sub(r'\s+',' ',' '.join(L["txt"])),"start":L["words"][0]["start"],"end":L["words"][-1]["end"],"words":L["words"]})
out["duration"]=round(out["lines"][-1]["end"]+TAIL,2)
ph=out["voice"]["phrases"]
for a,b in zip(ph,ph[1:]): assert b["start"]-a["end"]>=0.24, ("phrases too close",a,b)
json.dump(out,open(sys.argv[1] if len(sys.argv)>1 else 'out/timing.json','w'),ensure_ascii=False,indent=1)
for l in out["lines"]: print(l["id"],l["start"],l["end"],l["text"])
print("duration",out["duration"])
