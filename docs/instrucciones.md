# Saberium · Instrucciones del bucle de vídeos

Última actualización: 18 de noviembre de 2026, noche. Recoge todo lo decidido del 16 al 18 de noviembre, incluido el plan de automatización. Quien retome este trabajo, persona o tarea programada, debe leer este documento entero antes de hacer nada.

Hay dos copias idénticas: `claude/saberium-instrucciones.md` en el proyecto «Seve» y `docs/instrucciones.md` en el repositorio `sevevega12/saberium-reels`. Las tareas programadas leen la del repositorio. Si se cambia una, se cambia la otra en el mismo momento.

## 1. Objetivo

Comprobar si, publicando un reel al día durante un mes, el contenido orgánico de Instagram consigue al menos una conversación real con el dueño de un negocio interesado en una web. Se mide en mensajes y comentarios, no en visitas.

Saberium es un estudio de diseño y desarrollo web (saberium.com). Cuenta de Instagram: @saberium.studio. Público: dueños adultos de negocios locales de toda España. Idioma: solo español de España.

## 2. Decisiones cerradas

- **Ritmo:** un vídeo al día. Nunca más de uno.
- **Duración: de 28 a 35 segundos.** La voz tiene de 70 a 85 palabras contando la frase de cierre. Cinco frases como máximo: gancho, problema, consecuencia, solución y cierre. Lo que puede contar la imagen no lo dice la voz.
- **Nada se publica sin que Seve lo apruebe.** Aprueba los guiones de la semana de una vez y cada vídeo antes de publicarse.
- **Voz:** de mujer, «Sofia - Natural Conversations» de ElevenLabs, el guion entero en un solo MP3. Hace falta un plan de pago (Starter o superior): el gratuito no tiene licencia comercial. Las voces de Higgsfield quedaron descartadas porque sonaban a traducción. Nadie sale en cámara. No se imita la voz de ninguna persona real.
- **Cierre:** «Comenta WEB y te enseñamos gratis cómo quedaría la tuya». Siempre la misma frase, literal, dicha y escrita.
- **Tono:** adulto y serio. Nada infantil: sin objetos con cara, sin colores ni rayos de cómic. Los fondos nunca están vacíos; tienen profundidad.
- **Modelos:** Fable 5.2 escribe los guiones. Opus 5.5 monta los vídeos.
- **Una sola capa:** la sesión que monta el vídeo lo hace ella misma, sin lanzar ni vigilar agentes.
- **Menos repaso:** un borrador en baja resolución, una revisión y el render final.
- **Repositorio público** `sevevega12/saberium-reels`: motor, código, voces y vídeos. Seve lo decidió sabiendo que cualquiera puede verlo.
- **Publica Claude** con el conector Windsor.ai, con una descripción de una sola pregunta corta y de 3 a 5 hashtags concretos.
- **Los comentarios los responde Seve.** Claude solo los lee y los analiza.
- **Revisión de datos** cada lunes, comparando cada vídeo a la misma edad (por ejemplo, a las 72 horas).
- Seve no quiere tener que pasar material. Lo único que aporta es la voz, si el conector de ElevenLabs no puede generarla.
- Se pueden enseñar los proyectos reales: Amperiza, Atlantis Charters y The Barber Kingdom.
- No se depende del ordenador de Seve. Todo vive en la nube, en el proyecto y en el repositorio.
- El reel de prueba del 17 de noviembre se queda en el perfil.

## 3. Regla principal: que ningún vídeo se parezca a otro

- **Cada vídeo cambia el problema, la solución y el concepto,** no solo el gancho.
- **El Registro de vídeos** (`registro.md` en el repositorio) guarda en cada fila el problema, la solución, el tipo de gancho, el tipo de cuerpo, la metáfora u objeto, el lugar o mundo visual y la pieza protagonista.
- **Antes de escribir guiones se comprueba el Registro:** no se repite problema ni metáfora de los últimos 10 vídeos, ni tipo de cuerpo, mundo visual o pieza protagonista de los últimos 3. Si dos guiones de la misma semana se parecen, se cambia uno.
- **Gastados hasta nuevo aviso:** el «se va con el de enfrente» como desenlace, la web lenta como problema principal y la lista de resultados con «Tu negocio» y «El de enfrente».
- **Problemas aún sin usar:** la web no deja reservar o pedir cita; no sale en Google Maps; no da confianza (sin fotos reales ni reseñas); no hay precios ni servicios claros; nadie responde a los mensajes; no explica qué te diferencia; el cliente no encuentra cómo escribir por WhatsApp; no está en su idioma; te escriben fuera de horario y nadie contesta; subes cada piso dos veces, a tu programa y a tu web; tu local está impecable y tu web no se le parece; la web la hizo un conocido y nadie sabe cambiar un horario; las reservas por teléfono se pierden mientras atiendes.
- **Reglas de guion aprendidas:** la primera frase tiene sujeto claro («Alguien abrió tu web», no «Abrió tu web»). El orden de lo que se cuenta tiene que cuadrar en el tiempo.

## 4. Cómo se trabaja (desde el 19 de noviembre)

Tres tareas programadas, sin agente jefe ni subagentes. Se pasan el trabajo por el repositorio: `registro.md`, las carpetas `videos/NN-nombre/` y los MP4 de `reels/`.

1. **Estrategia y guiones, los lunes a las 9:12.** Lee las estadísticas de Instagram, compara los vídeos a la misma edad y escribe los 7 guiones de la semana (de martes a lunes). Crea sus carpetas con `guion.txt` y `notas.md`, añade las filas al Registro con estado «guion pendiente» y deja el resumen en `semanas/AAAA-MM-DD.md`.
2. **Producción, cada día a las 10:47.** Coge el guion aprobado con la fecha de publicación más cercana, consigue la voz, monta el vídeo con el motor y lo sube a `reels/`. Estado «vídeo pendiente».
3. **Publicación, cada día a las 18:40.** Si el vídeo del día está en «vídeo aprobado», lo publica con Windsor, lo apunta en el Registro y pasa a «publicado». Si no está aprobado, no hace nada y avisa.

**Estados del Registro:** guion pendiente → guion aprobado → vídeo pendiente → vídeo aprobado → publicado. También: rechazado, aplazado, falta voz.

**Cómo aprueba Seve:** lo dice en cualquier chat del proyecto («apruebo los guiones», «apruebo el 05», «el 07 cámbialo así…»). Ese chat cambia el estado en `registro.md` y lo sube al repositorio. Si Seve pide cambios en un guion, el chat edita `guion.txt` y deja el estado en «guion aprobado» cuando Seve lo confirme. Si pide cambios en un vídeo, el chat vuelve a montarlo con el motor.

**Voz:** si el conector de ElevenLabs funciona, la tarea de producción genera el MP3 con Sofia (antes pide el coste, que no gasta nada). Si no funciona, Seve genera la voz en la web de ElevenLabs y la adjunta en un chat del proyecto, que la sube como `videos/NN-nombre/voz.mp3`. Sin voz no se monta: la fila pasa a «falta voz» y se avisa.

## 5. El motor

Está en `motor/` del repositorio. Las instrucciones completas están en `motor/README.md` y el modelo de vídeo, en `videos/00-plantilla/`. El texto para montar un vídeo está en `docs/produccion.md`.

- **Lo que fija:** render a 1080×1920 y 30 fps; tiempos sacados de la voz real; subtítulos palabra a palabra; logo de esquina; frase de cierre literal y tarjeta final; música generada en código y mezcla con la voz a unos -16 LUFS; control automático (de 28 a 35 s, nada de texto en zonas tapadas, ninguna pantalla en blanco, cierre completo) y hoja de fotogramas. Capturas de las tres webs reales en `assets/webs/`.
- **Lo que no fija:** las escenas, la metáfora, el lugar, la composición y el ritmo. Las piezas (móvil, portátil, paneles de cristal, contadores, reloj, lista que se marca, fondo de mesa) son opcionales. Cuando un vídeo invente una pieza buena, se añade al motor.
- **Tiempos medidos el 18 de noviembre:** borrador en 1,5 minutos y render final en 2,5 minutos para un vídeo de 32 segundos.
- El código del vídeo de la puerta se guarda en `codigo/02-la-puerta/` como ejemplo de escenas muy trabajadas, hecho antes del motor. Del vídeo del lápiz y las tijeras solo queda el MP4.

## 6. Publicación y herramientas (probado)

- Instagram necesita un enlace público al MP4. Se usa el enlace directo del repositorio: `https://raw.githubusercontent.com/sevevega12/saberium-reels/main/reels/AAAA-MM-DD-nombre.mp4`.
- Conector de Instagram: Windsor.ai for Social Media, cuenta `saberium.studio`. Publica reels (`create_video_post`), historias y carruseles, y lee estadísticas y comentarios. No puede editar el perfil.
- Windsor.ai está en periodo de prueba. Si caduca sin plan de pago, se pierde la publicación y la lectura de estadísticas.
- El entorno de Claude no puede descargar ni enviar archivos de Higgsfield.
- Claude no puede escuchar el audio. Si una voz suena natural lo juzga Seve.
- Investigar otras cuentas de Instagram solo es posible con la extensión de Chrome conectada, y solo para mirar.

## 7. Identidad visual

- Colores: azul noche (#04051C), azul eléctrico (#0A22F1), azul claro para resaltar (#9CC8FF) y blanco.
- Tipografía: letra gruesa de palo seco para el texto (Poppins) y cursiva con serifa para la palabra de matiz (Lora). La palabra clave va en una pastilla azul claro. Etiquetas técnicas en letra de máquina.
- Estilo aprobado: técnico y serio. Mesa de trabajo oscura con cuadrícula, haz de luz, contadores con números y paneles de cristal esmerilado. No es obligatorio en cada vídeo: el mundo visual cambia para no repetirse.
- Logo pequeño en la esquina durante todo el vídeo. **Sin barra de progreso ni contador de pasos (01 / 07).**
- Subtítulos palabra a palabra, grandes y con contraste pleno.
- Logo blanco de Saberium en el cierre, sin lemas inventados.
- El texto nunca va en el quinto superior ni en el quinto inferior de la pantalla.
- Ninguna pantalla de móvil vacía o en blanco más de un segundo. La composición ocupa la zona útil entera.

## 8. Reglas para que un vídeo funcione

- Una sola idea por plano y un hilo que acompaña todo el vídeo.
- El primer fotograma ya muestra algo pasando, con un objeto muy de cerca, y se entiende parado.
- El giro se dice y se ve antes del segundo 3. El gancho tiene tres capas: imagen, voz y texto en pantalla.
- No lo cuentes, enséñalo: números que suben o bajan, objetos que hacen cosas.
- Cosas reales: lugares, horas y nombres concretos, webs de verdad.
- Un solo sistema visual de principio a fin. Las escenas se enlazan por transformación, no por corte. Como mucho un corte seco.
- Algo cambia en pantalla cada 2 a 4 segundos.
- La promesa del gancho se cumple en el vídeo, y el objeto del gancho significa algo en el mensaje.

## 9. Formatos

Se combina cómo empieza el vídeo con cómo se cuenta.

Ganchos: tensión visual, problema directo, en mitad de la acción, idea contraria, espectador nombrado («si tienes una clínica...»), prueba real (solo si se hace de verdad).

Cuerpos: historia con monigote, tipografía en movimiento, conversación en pantalla, comparación en pantalla partida, lista de señales, antes y después con una web real, fallo típico sin nombrar al negocio, demostración paso a paso, punto de vista del cliente buscando en el móvil.

Pruebas hechas antes del motor: el lápiz que se dobla y las tijeras gustaron mucho (vídeo 01); la conversación de WhatsApp a las 23:07 es la que menos gustó; «Tu web no es fea» y el monigote con dos puertas gustan. Ganchos pendientes de la idea del socio (tu web refleja el cuidado que pones en tu marca): «Nadie juzga tu web. Te juzgan a ti por ella», «Si cuidas tu local pero no tu web…», «Antes de entrar a un negocio, miro su web», «Mira lo que ve tu cliente antes de entrar». Versión inmobiliaria: «Iba a pedirte una visita. Vio tu web y dudó», «Si tu web está descuidada, ¿cómo cuidarás mi piso?», «Si tienes una inmobiliaria, tu escaparate ya no es el cristal».

## 10. Lo aprendido de las referencias

- @resultaaquee: la primera palabra ya es contenido; descripciones de una sola pregunta corta, sin listas de hashtags; lo que más mueve un vídeo es que se envíe a otra persona. Sus temas interesan a todo el mundo y vender webs a muy poca gente, así que sus cifras no son una meta realista.
- Otras referencias (HappyWeb, LeadQualify, Astrom Level, Lynx Studios): letras enormes, un color por sección, pregunta «¿Qué haces? A o B», listas que se marcan, contador en pantalla.
- Skills de Vyral (sin comprobar): pedir «comenta tal palabra» puede jugar en contra frente a que el vídeo se envíe; los hashtags apenas dan alcance; si se ve la interfaz de otra aplicación, Instagram puede tratar el vídeo como no original.

## 11. Reglas de Saberium que no se saltan

- No se inventan clientes, reseñas, cifras ni resultados.
- No se prometen ventas ni posiciones en Google.
- No se dan precios.
- No se enseña ni se nombra un negocio real sin su permiso. Para la web «mala» se inventa una genérica.
- No se envían mensajes ni se responde a comentarios de forma automática.
- No se publica más de un vídeo al día.

## 12. Pendientes y riesgos

- **ElevenLabs:** el conector no termina de conectar (la página de autorización se queda en «Cargando…», fallo de ElevenLabs) y hace falta pasar a un plan de pago. Seve lo resuelve la noche del 18 o la mañana del 19.
- **Capturas de móvil:** las de `assets/webs/movil/` tienen defectos de captura. Las de escritorio están limpias.
- Las tareas programadas no dejan elegir el modelo: corren con el que asigne la plataforma, no necesariamente Fable para los guiones.
- El perfil de Instagram tenía el nombre y el enlace vacíos al comprobarlo el 17 de noviembre.
