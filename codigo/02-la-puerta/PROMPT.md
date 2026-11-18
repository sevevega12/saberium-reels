ROLE
You are a senior motion designer and creative director. Work fully autonomously:
plan, build, render, review your own output and iterate. Do not ask me questions;
make the best call and note your decisions at the end.

CONTEXT
Saberium is a web design and development studio in Spain (saberium.com,
Instagram @saberium.studio). It builds custom websites for local businesses:
own design, connection to the tools the business already uses, local SEO and an
automatic WhatsApp assistant. Real projects we are allowed to show: Amperiza
(real estate), Atlantis Charters (bookings) and The Barber Kingdom (branding).

We are testing whether one organic Reel per day can start at least one real
conversation with a business owner. The viewer is an ADULT owner of a local
business in Spain who does not know us, is scrolling with the sound off and
decides in under three seconds. Tone: serious, clear, crafted. Never childish:
no objects with faces, no cartoon colours, no comic speed lines.

FILES AND ENVIRONMENT
- Work in /home/claude/reel-02 (create it). Put deliverables in
  /home/claude/reel-02/out/.
- Logo: /home/claude/saberium-reels/assets/logo-blanco.png (white on
  transparent) and assets/icono-blanco.png (the mark alone).
- Yesterday's approved Reel: /mnt/user-data/uploads/saberium-reel-lapiz.mp4
  (read-only). The client liked it a lot. Extract frames and study it: your
  video must belong to the same visual system (palette, type, glass panels,
  caption style, phone mockup), but be clearly a different video. Fix what the
  client disliked in it, listed under CLIENT CORRECTIONS.
- Installed: ffmpeg, google-chrome, Python Playwright; fonts Poppins,
  Inter Display, Lora, DejaVu Sans Mono. Package installs do not work; use what
  is installed.
- Internet is probably blocked except GitHub. Try once to open saberium.com and
  the project sites. If you cannot, do not retry in other ways.
- There is NO voice-over file yet (see TECHNICAL SPEC, Voice).

GOAL
Create a 45-55 second vertical Reel that communicates EXACTLY ONE idea:

1. Your website is your door when you are not there, and customers open it and
   leave without you ever knowing.

Hook type: mid-action. Body type: customer point of view.
Viewer's sector: any local business.

VOICE-OVER SCRIPT (Spanish; source for the captions)
1. Alguien abrió tu web. Y se fue sin entrar.
2. Eran las diez de la noche. Buscaba justo lo que tú haces, y te encontró.
3. Pero tu web tardó en cargar. Y cuando cargó, tuvo que ampliar con los dedos
   para leer algo.
4. No encontró el teléfono. No encontró el horario. No supo si seguías abierto.
5. Así que hizo lo más fácil: volver atrás. Y el siguiente de la lista era el
   de enfrente.
6. Tú no te enteraste. Nadie te avisa de un cliente que estuvo a punto de
   entrar.
7. Tu web es tu puerta cuando tú no estás. Que abra a la primera.
8. Comenta WEB, y te enseñamos gratis cómo quedaría la tuya.

STRUCTURE (suggested, improve it if you can)
- 0-4s    Hook: a street at night, the glass door of a small local shop, warm
          light inside. A hand already holds the door handle in the first
          frame. The door opens a hand's width, light spills onto the pavement,
          the hand lets go and the door swings shut. A glass panel
          "TIEMPO DENTRO" counts and settles at 0,0 s. A clock reads 22:04.
          Line 1 is said and written before second 3.
- 4-10s   The door frame becomes a phone. Search "cerca de mí", result
          "Tu negocio · A 300 m · Abierto". The thumb taps it.
- 10-18s  The failure: a slow loading bar with a counter climbing in seconds,
          then a desktop-style page with tiny text; two fingers pinch to zoom.
- 18-25s  Three glass labels appear and are struck through one by one:
          "Teléfono", "Horario", "¿Abierto ahora?".
- 25-32s  The thumb taps the back arrow: the same letting-go gesture as the
          hand on the door. In the list, "El de enfrente · A 350 m · Abierto"
          is tapped.
- 32-38s  The viewer's shop from inside: empty, lights on, door closed. A glass
          panel "Avisos: 0". The clock turns to 22:05.
- 38-47s  Payoff: the door opens at the first push and what is inside is a
          phone with a REAL Saberium site, scrolling. Checklist ticks:
          "Teléfono", "Horario", "Reserva".
- last 5s The hanging sign on the door flips from "ABIERTO" to "WEB". On
          screen, word for word: "Comenta WEB y te enseñamos gratis cómo
          quedaría la tuya". Saberium end card.

MANDATORY MOTION ELEMENTS (all five, each one must carry meaning, not decoration)
[ ] One continuous camera move with real depth of field: the approach to the
    door in the hook, street lights blurring behind.
[ ] Numbers: time inside (0,0 s), load time climbing, "Avisos: 0", and the
    clock 22:04 -> 22:05 as the thread of the whole piece: it all happens in
    one minute.
[ ] Shape becomes other shape: door frame -> phone -> page -> back arrow ->
    list -> door again -> hanging sign "WEB".
[ ] Real screen material inside a device: real Saberium site in a phone with
    glass, reflection and a soft screen glow.
[ ] Kinetic captions: word by word, current word highlighted. The big title
    moment is "se fue sin entrar".

REAL-WORLD MATERIAL
The video must contain real things, not only colours and abstract shapes:
- Real site footage for the payoff. First choice: capture the live sites of
  Atlantis Charters or Amperiza at phone width (find them through
  saberium.com). If the network is blocked, extract the real site footage from
  the payoff section of yesterday's Reel (it is our own material: Amperiza and
  The Barber Kingdom appear inside the phone), upscale it cleanly and place it
  in your phone. Do not fake or redraw their content.
- The door is a real shop door: dark aluminium frame, glass with reflections of
  street lamps, a brushed-steel handle, a small hanging sign, a doormat, wet
  pavement reflecting the warm light. No shop name on it.
- The hand and thumb: realistic adult hand, rendered as a clean lit silhouette
  with a shirt cuff, never a cartoon hand. No face, no full person.
- The street is a real place at night: lamp glow, a parked car's bokeh, a
  neighbouring shopfront across the street that is lit and open.
- Interface text in Spanish with believable details: search "cerca de mí",
  "Tu negocio · A 300 m · Abierto", "El de enfrente · A 350 m · Abierto",
  status bar clock matching the scene clock.
- The "bad" website is clearly generic and invented. Never resemble a real
  business's site.
- No grey placeholder boxes. No device screen stays blank or plain white for
  more than one second.

CLIENT CORRECTIONS FROM YESTERDAY'S REEL (mandatory)
- NO progress bar, no step counter ("01 / 07"), no timeline of any kind. The
  small Saberium logo in the top-left corner stays.
- Captions were too small and sometimes faint: make them larger and solid.
- The end card shortened the call to action and added a tagline nobody asked
  for. Use the full sentence, and no taglines or slogans.
- The phone stayed blank for seconds; the lower third was often empty.

CRAFT LEVEL TO MATCH
- One small story with a concrete place and time.
- One visual system from the first frame to the last. Nothing looks borrowed.
- Scenes hand off by transformation, not by cutting.
- Interface panels are frosted glass: background blur, thin light edge, soft
  shadow, slight parallax.
- Numbers ease towards their final value and settle; they never jump.
- Type enters from behind a mask, with weight contrast between lead-in and
  punch line. Key word in a light-blue pill, nuance word in italic serif.
- Motion is fast out and slow in, about half a second per move, then a hold of
  at least 1,2 seconds so the text can be read.
- Sound hits land exactly on the transitions.

VISUAL IDENTITY
Night blue (#04051C), electric blue (#0A22F1), light blue for highlights
(#9CC8FF), white; one warm accent only for the shop's interior light. Bold sans
for text, italic serif for the nuance word. Technical labels in a monospaced
face. Backgrounds always have depth: foreground, subject and background. Use
the whole safe area; no scene leaves the lower third of the safe area empty.

LANGUAGE
All on-screen text in Spanish (Spain), short and natural, informal "tú".
Maximum ~7 words per screen. Proper accents. Decimal comma (0,0 s).

ASSETS AND HONESTY RULES
- No invented clients, reviews, figures or results. Numbers inside the demo are
  illustrative interface values.
- No promises of sales or Google positions. No prices.
- Do not name or show a real business without permission; only the three
  projects listed above.
- Do not reproduce other companies' logos or official interface artwork; draw
  clean generic screens.
- Do not generate any voice. Do not publish anything, do not push to any
  repository and do not spend paid credits.

TECHNICAL SPEC
- 1080x1920, 30 fps, 45-55 s, MP4 (H.264, yuv420p), under 50 MB.
- Render deterministically from code: frame-by-frame capture, then encode with
  ffmpeg. No screen recording, no dropped frames.
- Instagram safe zones: no text or key element in the top fifth or the bottom
  fifth of the frame. The first frame's key content sits in the upper two
  thirds, because the profile grid crops to 3:4.
- Captions: word by word, current word highlighted, at least 64 px tall on the
  1080-wide frame, full-opacity white with a soft shadow. Words not yet spoken
  never below 50 % opacity. Fully understandable with the sound off.
- Voice: there is no voice file yet. Time every line at a natural reading pace
  (about 2,6 words per second, 0,4 s pause between sentences, extra air where
  the scene needs it). Drive the whole animation from ONE timing file
  (timing.json: start and end of every line and word), so that when the real
  voice arrives the video can be re-timed by replacing that file and
  re-rendering. Explain in the summary how to do that.
- Soundtrack synthesized in code: quiet night-street tension in the hook, a
  dull thud when the door shuts, then a soft modern pulse with hits on the
  transitions, and a warmer lift at the payoff. Leave room for a voice on top
  (music around -24 LUFS). No copyrighted music. If audio fails, deliver a
  silent cut.
- Something changes on screen every 2 to 4 seconds. At most one hard cut.

PROCESS
1. Study yesterday's Reel frames, then write a shot-by-shot storyboard with
   timings before coding.
2. Build the scenes, render a low-res draft, extract frames and look at them.
3. Critique your own draft like a creative director: legibility, caption size,
   pacing, dead time, blank screens, empty areas, weak transitions, anything
   that looks like a template or a children's cartoon. Fix it.
4. Do at least two full review-and-improve passes before the final render.
5. Deliver in /home/claude/reel-02/out/: saberium-reel-puerta.mp4, a contact
   sheet (contact-sheet.jpg), timing.json, and summary.md with 5 lines of
   creative decisions plus anything you could not achieve or verify.
   Your final message: the file paths and that summary.

QUALITY BAR
Treat this as a paid pitch for a real client where a large contract depends on
it. Every second must earn its place. Prefer one confident visual system over
many effects. If something is merely "fine", redo it.
