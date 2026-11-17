import sys, json
import numpy as np
from faster_whisper import WhisperModel
model_dir, audio, out = sys.argv[1:4]
m = WhisperModel(model_dir, device="cpu", compute_type="int8")
segs, info = m.transcribe(np.fromfile(audio, dtype=np.float32), language="es", word_timestamps=True, vad_filter=False,
    initial_prompt="Fíjate bien en la punta de este lápiz. Comenta WEB, y te enseñamos gratis cómo quedaría la tuya.")
words = []
for s in segs:
    for w in s.words:
        words.append({"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3)})
json.dump(words, open(out, "w"), ensure_ascii=False, indent=0)
for w in words: print(f'{w["s"]:6.2f} {w["e"]:6.2f} {w["w"]}')
