#!/usr/bin/env python3
"""Builds out/timing.json: the ONE timing file that drives the whole video.
Markup in SCRIPT:  '|' new caption screen, '/' line break inside a screen,
[word] key word (light-blue), *word* nuance word (italic serif).
'start' is the second where each line begins (air between scenes lives here)."""
import json, re, sys
PACE=2.6        # words per second
PAUSE=0.40      # pause between sentences
SCRIPT=[
 (1, 0.05, "Alguien abrió tu web. | Y se fue / *sin* [entrar]."),
 (2, 4.55, "Eran las diez / de la noche. | Buscaba *justo* / lo que tú haces, | y te [encontró]."),
 (3, 11.15,"Pero tu web / [tardó] en cargar. | Y cuando cargó, | tuvo que ampliar / con los [dedos] | para leer *algo*."),
 (4, 19.20,"No encontró / el [teléfono]. | No encontró / el [horario]. | No supo si / seguías [abierto]."),
 (5, 25.60,"Así que hizo / lo más *fácil*: | [volver] atrás. | Y el siguiente / de la lista | era el de / [enfrente]."),
 (6, 33.70,"Tú no te / [enteraste]. | *Nadie* te avisa / de un cliente | que estuvo *a* *punto* / de [entrar]."),
 (7, 40.90,"Tu web es / tu [puerta] | cuando tú / *no* estás. | Que abra / a la [primera]."),
 (8, 48.20,"Comenta [WEB], | y te enseñamos *gratis* / cómo quedaría la tuya."),
]
PACE_OVERRIDE={1:3.5}   # the hook is said a touch faster: line 1 must be over before second 3
out={"fps":30,"note":"Times in seconds. Replace start/end of every word (and line) with the real voice alignment and re-render.","lines":[]}
for n,start,txt in SCRIPT:
    pace=PACE_OVERRIDE.get(n,PACE)
    words=[]; screen=0; row=0; t=start
    for tok in txt.split():
        if tok=='|': screen+=1; row=0; continue
        if tok=='/': row+=1; continue
        style='plain'; w=tok
        m=re.match(r'^\[(.+?)\](.*)$',w)
        if m: style='key'; w=m.group(1)+m.group(2)
        m=re.match(r'^\*(.+?)\*(.*)$',w)
        if m: style='nuance'; w=m.group(1)+m.group(2)
        words.append({"w":w,"screen":screen,"row":row,"style":style})
    # sentence-wise durations
    i=0
    while i<len(words):
        j=i
        while j<len(words) and not re.search(r'[.:]$',words[j]["w"]): j+=1
        sent=words[i:j+1]; dur=len(sent)/pace
        wsum=sum(len(re.sub(r'\W','',x["w"]))+3 for x in sent)
        for x in sent:
            d=dur*(len(re.sub(r'\W','',x["w"]))+3)/wsum
            x["start"]=round(t,3); x["end"]=round(t+d,3); t+=d
        t+=(0.25 if n==1 else PAUSE); i=j+1
    out["lines"].append({"id":n,"text":re.sub(r'[\[\]\*]|\s[|/]','',txt),"start":words[0]["start"],"end":words[-1]["end"],"words":words})
out["duration"]=round(out["lines"][-1]["end"]+2.7,2)
p=sys.argv[1] if len(sys.argv)>1 else '/home/claude/reel-02/out/timing.json'
json.dump(out,open(p,'w'),ensure_ascii=False,indent=1)
for l in out["lines"]: print(l["id"],l["start"],l["end"],l["text"])
print("duration",out["duration"])
