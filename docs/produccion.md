# Cómo se monta un reel de Saberium (prompt maestro, versión corta)

Versión 3, 18 de noviembre de 2026. Sustituye a la plantilla larga de la versión 2.1: ya no se escribe un prompt por vídeo ni se ejecuta en otro chat. La sesión que monta el vídeo sigue este texto con el motor del repositorio.

Hay dos copias idénticas: `claude/prompt-maestro-reel.md` en el proyecto y `docs/produccion.md` en el repositorio. Si se cambia una, se cambia la otra.

## Lo que recibes

- La carpeta `videos/NN-nombre/` con `guion.txt` (ya aprobado por Seve), `notas.md` (idea visual, metáfora, mundo visual, pieza protagonista, descripción y hashtags) y `voz.mp3`.
- El motor (`motor/README.md`) y el modelo `videos/00-plantilla/`. Léelos antes de escribir nada.
- `docs/instrucciones.md`: identidad visual, reglas que no se saltan y lo que ya se probó.

## Lo que haces (una sola capa: tú misma, sin agentes)

1. **Ajusta `guion.txt` a la voz.** Una fila por frase, tal como suena entre silencios. Ejecuta `python3 motor/timing.py videos/NN-nombre` y comprueba que cada línea cae donde debe y que la duración queda entre 28 y 35 segundos. Si sobra o falta, cambia `duracion:` o el aire `+X` de alguna frase. Nunca se toca la velocidad de la voz.
2. **Guion gráfico en `notas.md`:** un plano por idea, con su ancla en la voz (`W(línea,'palabra')`). Escribe qué se ve en el primer fotograma, qué número sube o baja, qué forma se convierte en otra y cómo se enlaza cada escena con la siguiente.
3. **Escribe `escenas.js` y `escenas.css`.** Todo movimiento cuelga de una palabra de la voz. Marca las transiciones con `Reel.hit` y la música con `Reel.section`. Todo texto propio lleva la clase `txt`.
4. **Borrador:** `python3 motor/build.py videos/NN-nombre borrador`. Mira `out/hoja.jpg` y saca fotogramas sueltos de los momentos clave con `motor/render.py ... stills`.
5. **Una revisión, como directora creativa:** legibilidad, huecos vacíos en el encuadre, pantallas en blanco, transiciones flojas, subtítulos tapando lo importante, cualquier cosa que parezca plantilla o dibujo infantil, y si se parece a un vídeo anterior del Registro. Corrige.
6. **Render final:** `python3 motor/build.py videos/NN-nombre final`. Si el control da un error, arréglalo y repite. No se entrega un vídeo con errores.
7. **Entrega:** copia `out/reel.mp4` a `reels/AAAA-MM-DD-nombre.mp4` (la fecha es la de publicación), sube la carpeta del vídeo y el MP4 al repositorio y apunta en `registro.md` la carpeta, el enlace directo y el estado «vídeo pendiente».

## Nivel de oficio

- **Un solo sistema visual** del primer al último fotograma: una paleta, una familia tipográfica, un tipo de panel, una forma de moverse.
- **Las escenas se enlazan por transformación,** no por corte: un elemento de una escena crece, se desliza o se convierte en el protagonista de la siguiente. Como mucho un corte seco en todo el vídeo.
- **Paneles de cristal esmerilado** de verdad: desenfoque del fondo, borde fino de luz, sombra suave y un poco de paralaje.
- **Los números se acercan a su valor y se asientan;** nunca saltan.
- **Movimiento rápido al salir y lento al llegar,** medio segundo por movimiento, y luego al menos 1,2 segundos quieto para que se lea.
- **Objetos reales y concretos:** material, acabado, desgaste, cómo les da la luz. «Un lápiz» da un dibujo; «lacado en azul, facetas hexagonales, veta de madera, nombre en dorado» da un objeto.
- **Lugar y hora concretos:** una calle de noche, un reloj que marca las 23:07, una notificación a las 09:02.
- **Webs reales de Saberium** en el remate, desde `assets/webs/`. Nunca un esquema gris en su lugar.
- **Fondos con profundidad:** primer plano, sujeto y fondo. Nunca un fondo plano o vacío. Ningún tercio de la zona útil queda vacío.
- Algo cambia en pantalla cada 2 a 4 segundos.

## Lo que no se hace

- Barra de progreso, contador de pasos o línea de tiempo.
- Objetos con cara, colores de cómic o rayos de velocidad.
- Lemas inventados. La tarjeta final lleva el logo y el cierre, nada más.
- Usar o imitar la web, el logo o la interfaz de un negocio o una aplicación real. La web «mala» es genérica e inventada.
- Inventar clientes, reseñas, cifras o resultados; prometer ventas o posiciones en Google; dar precios.
- Generar otra voz, cambiar su velocidad o su tono, o reordenar sus palabras.
- Publicar o gastar créditos de pago. Publicar es trabajo de la tarea de las 14:00, y solo con el vídeo aprobado.
