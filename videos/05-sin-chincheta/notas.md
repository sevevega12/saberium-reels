# 05 · Sin chincheta

- **Publicación:** domingo 22 de noviembre de 2026
- **Problema:** no sales cuando te buscan por tu barrio en el mapa
- **Solución:** web con dirección, barrio y servicios claros, y ficha cuidada (SEO local, sin prometer posiciones)
- **Gancho:** tensión visual · **Cuerpo:** demostración paso a paso
- **Metáfora u objeto:** chinchetas clavadas en un mapa; la de tu negocio no está
- **Mundo visual:** maqueta de ciudad de noche vista desde arriba, calles iluminadas, cámara cenital que baja
- **Pieza protagonista:** chinchetas de cristal azul que caen y se clavan en el mapa

## Guion gráfico (idea)

1. **Primer fotograma:** vista cenital de una maqueta nocturna; varias chinchetas ya clavadas brillan; en tu calle (etiqueta «C/ Mayor, 14») hay un hueco con un círculo vacío que parpadea. Texto: «Tu negocio no».
2. Un punto azul («Alguien · a 2 calles») aparece y traza una búsqueda: las chinchetas que se iluminan son de otros sitios genéricos (sin nombres reales, solo iconos de categoría). Nada de lista de resultados.
3. «No es que no existas»: la cámara baja al hueco y se ve el local real dibujado; luego tres etiquetas flotan en desorden sin conectar con el mapa: «¿Dónde?», «¿Qué hace?», «¿Horario?».
4. Paso a paso: las etiquetas se ordenan como una lista que se marca (Dirección · Barrio · Servicios · Ficha al día) y con el último tic cae por fin la chincheta azul de Saberium en tu calle. Remate con la web real de Amperiza (oficina en Alcúdia) en un portátil.
5. Cierre: la chincheta se convierte en el bloque «WEB».

## Para Instagram

¿Sale tu negocio cuando alguien lo busca desde tu misma calle?

#seolocal #negociolocal #googlemaps #paginaweb

## Guion gráfico definitivo (montaje del 21 de noviembre)

Anclas sacadas de la voz (`out/timing.json`). Voz de 22,7 s repartida en 32 s. Todo ocurre en una sola maqueta de barrio nocturno (SVG dentro de un plano inclinado en 3D); la cámara baja, se acerca y se aleja, sin cortes.

1. **0,0 s · Gancho (`L(1)`).** Primer fotograma: la maqueta vista desde arriba, con farolas, coches y tejados con ventanas encendidas; una chincheta de cristal ya está cayendo. Caen seis chinchetas, una tras otra, hasta `W(1,'mapa')`. Panel de cristal «MAPA · SÁBADO 21:40»: «Tu calle» se marca en `mapa`; «Tu negocio» se queda con la casilla vacía. En `W(1,'tu',1)` aparece un aro rojo discontinuo en C/ Mayor y en `W(1,'no')` la etiqueta «C/ Mayor, 14 · SIN CHINCHETA» y «sin ubicar» en el panel.
2. **5,0 s · «Alguien a dos calles» (`L(2)`).** La cámara se aleja. El panel se convierte en una búsqueda («BÚSQUEDA · A 2 CALLES»): en `W(2,'dos')` aparece el punto azul de esa persona con «ALGUIEN · A 2 CALLES»; en `busca` sale el radar y se escribe «cerca de mí». En `W(2,'otros')` se encienden tres chinchetas ajenas (ámbar) con su ruta trazada por las calles y el contador llega a «3 sitios cerca». Tu aro sigue vacío.
3. **11,3 s · «No es que no existas» (`L(3)`).** La cámara baja hasta tu calle. En `existas` se enciende tu escaparate (existes). En `W(3,'google')` aparece una chincheta fantasma, discontinua, que salta de un sitio a otro sin decidirse. Salen tres etiquetas desordenadas: «¿En qué zona?» (`claro`), «¿Dónde está?» (`dónde`) y «¿Qué hace?» (`qué`).
4. **18,0 s · «Una web bien hecha» (`L(4)`).** La cámara sube un poco. Arriba, en el sitio del panel, entra la web real de Amperiza. En `dirección`, `barrio` y `servicios` una chispa sale de la web y cada pregunta gira y se convierte en respuesta marcada («Dirección», «Barrio», «Servicios»), ordenándose en columna. En `cuida` la chincheta fantasma deja de dudar y se coloca sobre tu calle; en `ficha` aparece «Ficha al día» y la chincheta, ya azul y sólida, cae y se clava con una onda.
5. **24,2 s · «para que te encuentren».** La cámara se aleja: la persona de antes vuelve y su ruta llega ahora a tu chincheta; las demás se apagan un poco.
6. **26,2 s · Cierre.** Velo oscuro, «Comenta WEB…» y tarjeta final del motor.

Enlaces por transformación: aro vacío → chincheta fantasma → chincheta azul; panel del mapa → búsqueda → web real; preguntas → respuestas.

Lecciones de motor (para próximos vídeos con 3D): los elementos que se levantan sobre un plano inclinado (`rotateX` contrario) desaparecen si su sombra o su caja baja por debajo del suelo o si quedan exactamente a ras (se levantan con `translateZ(2px)`); los números muy pequeños se escriben como `1e-15`, que CSS rechaza (se redondean a 0); los textos grandes se ponen en una capa normal colocada sobre la posición en pantalla del punto del mapa, no dentro del 3D.
