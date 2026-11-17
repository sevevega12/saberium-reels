# Reel 01 · El lápiz y las tijeras

Vídeo vertical 1080×1920, 30 fps, 51 s. Una sola idea: antes de entrar en tu negocio, el cliente mira tu web.

## Entregables (`out/`)
- `saberium-reel-lapiz.mp4` — corte final (H.264, yuv420p, AAC).
- `contact-sheet.jpg` — hoja de contactos con los fotogramas clave.
- `tiempos.json` — inicio y fin de cada línea de la locución en el vídeo.
- `caption.txt` — texto y hashtags para Instagram.

## Cómo se genera
Todo sale de código, fotograma a fotograma (sin grabación de pantalla):

```bash
npm install                                   # three.js y tipografías
python3 tools/timeline.py                     # plan.json + palabras de la voz -> src/timeline.json y out/tiempos.json
python3 tools/audio.py                        # corta la voz en los silencios, sintetiza la música y mezcla
tools/render-all.sh 1 frames 4                # 1530 PNG con Chromium headless (WebGL por software)
tools/encode.sh frames png out/saberium-reel-lapiz.mp4 17
```

- `plan.json` — dónde cae cada frase de la locución (solo se corta dentro de silencios; no se cambia velocidad ni tono).
- `src/timing.js` — los golpes visuales, derivados de la voz.
- `src/scene.js` — escena 3D (lápiz, tijeras, mesa, hoja/móvil, polvo, profundidad de campo).
- `src/screen.js` — lo que ocurre en la hoja y en la pantalla del móvil.
- `src/director.js` — cámara y coreografía. `src/overlay.js` — subtítulos, contadores y cierre.
- `captures/crop-*.png` — capturas reales (ancho de móvil) de Amperiza, Atlantis Charters y The Barber Kingdom, hechas con `tools/capture-sites.mjs`.
- `audio/voz-original.mp3` — la locución entregada, sin modificar.
