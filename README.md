# camel-derby 🐫

**Kamelrennen** – ein Würfel-Rennspiel für 2 bis 8 Kamele. Menschen und Computer würfeln abwechselnd; wer zuerst 25 Felder schafft, gewinnt.

**Modus „Rechnen“** (3. Klasse): Statt zu würfeln lösen Menschen eine Aufgabe (Plus, Minus, Einmaleins; alle Zahlen unter 100) und wählen aus drei Antworten. Richtig in unter 5 s: 6 Felder, unter 10 s: 3, unter 15 s: 1; falsch oder zu langsam: 0. Computer-Kamele würfeln weiter.

## Loslegen

Voraussetzung: [Node.js](https://nodejs.org) 20+

```bash
npm install
npm run dev       # Dev-Server mit Hot Reload (http://localhost:5173)
npm run build     # Produktions-Build nach dist/
npm run preview   # Build lokal testen
```

Der Inhalt von `dist/` ist statisch und läuft auf jedem Webhoster (GitHub Pages, Netlify, …).

## Veröffentlichen

Die GitHub Action [Deploy to GitHub Pages](.github/workflows/deploy-pages.yml) baut das Projekt und veröffentlicht es auf GitHub Pages. Sie läuft nur manuell: **Actions → Deploy to GitHub Pages → Run workflow**.

Einmalig nötig: unter **Settings → Pages → Build and deployment** als Source **GitHub Actions** auswählen.

## Projektstruktur

```
index.html              Markup aller Screens + <template>s für Zeilen/Bahnen
vite.config.js
src/
  main.js               Einstiegspunkt: verbindet die Screens miteinander
  config.js             Spielkonstanten (Streckenlänge, Farben, Namen, Timing)
  game.js               Spiellogik (Race-Klasse), ohne DOM
  quiz.js               Rechenaufgaben, falsche Antworten, Punkte nach Zeit, ohne DOM
  audio/                Alles live synthetisiert (Web Audio API), keine Audiodateien
    index.js            Öffentliche API: Ton an/aus, Musikstart, Effekte
    engine.js           AudioContext und Master-Lautstärke
    instruments.js      Oud, Darbuka (Doum/Tek), Riq, Holzklacken
    music.js            Hintergrundmusik im Maqam Hijaz, Maqsum-Rhythmus
    sfx.js              Würfeln, Hufschlag, Uhr-Ticken, richtig/falsch, Zieleinlauf
  assets.js             Lädt die Kamel-Bilder
  ui/
    dom.js              DOM-Helfer (Templates, Screenwechsel)
    setupScreen.js      Spielerauswahl, Moduswahl (Würfeln / Rechnen)
    raceScreen.js       Rennbahn, Würfeln, Computerzüge
    quizDialog.js       Aufgaben-Popup mit Zeitbalken
    resultScreen.js     Zieleinlauf / Rangliste
  styles/
    main.css            Importiert alle Stylesheets
    tokens.css          Farben, Fonts, Radien (+ Dark Mode)
    base.css            Reset und Grundlayout
    components.css      Buttons, Karten, Header
    setup.css | race.css | results.css | quiz.css
  assets/images/
    backgrounds/        desert.jpg, riders.jpg, sand.jpg
    camels/             camel-1.png … camel-8.png
pics/                   Original-Grafiken (Quellmaterial)
```
