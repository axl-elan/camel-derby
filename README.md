# camel-derby 🐫

**Kamelrennen** – ein Würfel-Rennspiel für 2 bis 8 Kamele. Menschen und Computer würfeln abwechselnd; wer zuerst 25 Felder schafft, gewinnt.

## Loslegen

Voraussetzung: [Node.js](https://nodejs.org) 20+

```bash
npm install
npm run dev       # Dev-Server mit Hot Reload (http://localhost:5173)
npm run build     # Produktions-Build nach dist/
npm run preview   # Build lokal testen
```

Der Inhalt von `dist/` ist statisch und läuft auf jedem Webhoster (GitHub Pages, Netlify, …).

## Projektstruktur

```
index.html              Markup aller Screens + <template>s für Zeilen/Bahnen
vite.config.js
src/
  main.js               Einstiegspunkt: verbindet die Screens miteinander
  config.js             Spielkonstanten (Streckenlänge, Farben, Namen, Timing)
  game.js               Spiellogik (Race-Klasse), ohne DOM
  audio/                Alles live synthetisiert (Web Audio API), keine Audiodateien
    index.js            Öffentliche API: Ton an/aus, Musikstart, Effekte
    engine.js           AudioContext und Master-Lautstärke
    instruments.js      Oud, Darbuka (Doum/Tek), Riq, Holzklacken
    music.js            Hintergrundmusik im Maqam Hijaz, Maqsum-Rhythmus
    sfx.js              Würfeln, Schritt, Zieleinlauf
  assets.js             Lädt die Kamel-Bilder
  ui/
    dom.js              DOM-Helfer (Templates, Screenwechsel)
    setupScreen.js      Spielerauswahl
    raceScreen.js       Rennbahn, Würfeln, Computerzüge
    resultScreen.js     Zieleinlauf / Rangliste
  styles/
    main.css            Importiert alle Stylesheets
    tokens.css          Farben, Fonts, Radien (+ Dark Mode)
    base.css            Reset und Grundlayout
    components.css      Buttons, Karten, Header
    setup.css | race.css | results.css
  assets/images/
    backgrounds/        desert.jpg, riders.jpg, sand.jpg
    camels/             camel-1.png … camel-8.png
pics/                   Original-Grafiken (Quellmaterial)
```
