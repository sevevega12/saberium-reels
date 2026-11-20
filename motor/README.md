# Motor de reels de Saberium

Biblioteca para montar los reels de @saberium.studio. Lo que se repite en todos los vídeos se programa una sola vez aquí. Cada vídeo escribe solo sus escenas.

Probado el 18 de noviembre de 2026 con la plantilla `videos/00-plantilla`: borrador en 1,5 minutos y render final en unos minutos, en una máquina de 2 núcleos.

## Lo que pone el motor (igual en todos los vídeos)

- Render fotograma a fotograma a 1080×1920 y 30 fps con Chrome, y codificación H.264 con ffmpeg.
- Tiempos sacados de la voz real: detecta los silencios del MP3 y encaja cada frase del guion en su tramo. Las frases solo se separan dentro de los silencios; nunca se acelera, se estira ni se reordena nada.
- Subtítulos palabra a palabra: pastilla azul claro en la palabra que suena, palabra clave en azul claro y palabra de matiz en cursiva con serifa. Texto de 70 px.
- Logo pequeño en la esquina, frase de cierre literal («Comenta WEB y te enseñamos gratis cómo quedaría la tuya») y tarjeta final con el logo.
- Música original generada en código, con golpes en las transiciones. La voz queda a unos -16 LUFS y la música se aparta cuando suena.
- Control automático (`check.py`): duración de 28 a 35 s, nada de texto en el quinto superior ni en el inferior, ninguna pantalla plana o blanca, cierre literal y tarjeta final visible. Genera la hoja de fotogramas.
- Capturas de las webs reales en `assets/webs/`: `escritorio/` (limpias, del 18 de noviembre) y `movil/` (tienen defectos de captura; recortar lo limpio o usar las de escritorio dentro de un portátil).

## Lo que NO fija

Las escenas, la metáfora, el lugar, la composición y el ritmo son de cada vídeo. Las piezas de `core/piezas.js` (fondo de mesa, móvil, portátil, contador de cristal, contador que rueda como un cuentakilómetros, lista que se marca, reloj) son opcionales. Ningún vídeo está obligado a usarlas, y conviene no repetir la pieza protagonista de los últimos vídeos. Cuando un vídeo invente una pieza buena, se añade a `piezas.js`.

## Cómo se hace un vídeo

1. Crear la carpeta `videos/NN-nombre/` (NN = número siguiente del Registro).
2. Escribir `guion.txt`:

   ```
   duracion: 32
   voz: voz.mp3
   1 | Tu cliente quería [reservar].
   1 | Y no encontró *cómo*.
   2 +0.4 | Abrió tu web / desde el móvil.
   ...
   6 | Comenta [WEB],
   6 | y te enseñamos *gratis* / cómo quedaría la tuya.
   ```

   - Una fila por frase, tal como suena entre dos silencios de la voz. El número es la línea del guion (una idea). Varias filas pueden tener el mismo número.
   - `+0.4` añade aire antes de esa frase (en segundos). El resto del aire lo reparte el motor hasta llegar a `duracion`.
   - `|` abre una pantalla nueva de subtítulos, `/` parte la línea, `[palabra]` va en pastilla y `*palabra*` en cursiva.
   - La última línea es siempre el cierre, dicho entero.
   - Si el número de filas no coincide con los silencios reales, el motor encaja cada corte en el silencio más cercano; ninguna frase se corta por la mitad.
3. Poner la voz como `voz.mp3` (o la ruta que diga `voz:`). Sin voz, el motor usa tiempos sintéticos y avisa.
4. Escribir `escenas.js` (y `escenas.css` si hace falta). Copiar el esqueleto de `videos/00-plantilla/escenas.js`:
   - Anclas: `L(n)` es la línea n con su `start` y `end`; `W(n,'palabra')` es una palabra con su `start` y `end`. Todo movimiento cuelga de la voz.
   - `Reel.scene({name, z, build(root){...}, update(t){...}})` por cada capa o escena.
   - `Reel.section(t0, t1, 'tension'|'pulso'|'calma'|'claro')` para la música, y `Reel.hit(t, 'hit'|'whoosh'|'whoosh_rev'|'click'|'tick'|'thud'|'rise'|'pluck'|'knock')` para los golpes.
   - Todo texto que pongan las escenas lleva la clase `txt`, para que el control de zonas seguras lo vea.
   - Ayudas: `seg`, `mv`, `inout`, `E.expo`, `E.io`, `el`, `css`, `fmt` (coma decimal), `ASSET('webs/...')`, `rng(semilla)`.
5. Borrador y revisión:

   ```
   python3 motor/build.py videos/NN-nombre borrador
   python3 motor/render.py videos/NN-nombre stills /tmp/f 1,3,8,15,22,30   # fotogramas sueltos
   ```

   Mirar `out/hoja.jpg` y los fotogramas. Una sola ronda de correcciones.
6. Render final: `python3 motor/build.py videos/NN-nombre final` → `out/reel.mp4`. Si el control da algún error, el código de salida es 1 y no se envía.
7. Subir al repositorio la carpeta del vídeo (sin `work/`) y el MP4 final en `reels/AAAA-MM-DD-nombre.mp4`.

## Archivos

| Archivo | Qué hace |
|---|---|
| `timing.py` | `guion.txt` + `voz.mp3` → `out/timing.json` |
| `render.py` | monta la página y renderiza fotogramas, vídeo o el informe de cajas de texto |
| `musica.py` | banda sonora en código a partir de las secciones y golpes de las escenas |
| `build.py` | todo el proceso: tiempos, imagen, música, voz, mezcla, control |
| `check.py` | control automático y hoja de fotogramas |
| `core/engine.js` | tiempos, subtítulos, cierre, tarjeta final, logo |
| `core/piezas.js` | piezas opcionales |
| `core/base.css` | estilos de marca y de las piezas |

Necesita Chrome en `/usr/bin/google-chrome` (o la variable `CHROME`), Playwright para Python, ffmpeg, numpy, scipy y las fuentes Poppins, Lora, Inter y DejaVu Sans Mono.

El código del vídeo de la puerta (`codigo/02-la-puerta/`) se queda como ejemplo de un vídeo completo con escenas muy trabajadas, hecho antes del motor.
