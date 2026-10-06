/**
 * Procedural background music in maqam Hijaz on D:
 * an oud melody over a drone, with darbuka playing the maqsum rhythm.
 */
import { getContext, getMaster } from './engine.js';
import { doum, oud, riq, tek } from './instruments.js';

const BPM = 96;
const EIGHTH = 60 / BPM / 2;
const LOOKAHEAD = 0.15; // seconds scheduled ahead of the clock
const TICK_MS = 30;

const ROOT = 293.66; // D4
// Hijaz: D Eb F# G A Bb C D
const SCALE = [0, 1, 4, 5, 7, 8, 10, 12];
const noteFreq = (degree) => ROOT * 2 ** (SCALE[degree] / 12);

// Melody phrases: 16 eighth notes each (2 bars), scale degrees or null for rest.
const _ = null;
const PHRASES = [
  [4, _, 5, 4, 3, _, 2, 1, 2, _, _, _, 1, 0, _, _],
  [0, 1, 2, 3, 4, _, 4, 5, 4, 3, 2, _, 1, 2, 0, _],
  [7, _, 6, 5, 4, _, 5, 4, 3, 2, 1, 2, 0, _, _, _],
  [4, 4, 5, 7, 6, 5, 4, _, 3, 4, 2, 1, 0, _, _, _],
];
// Maqsum over one bar of 8 eighths: D T . T D . T .
const MAQSUM = ['D', 'T', _, 'T', 'D', _, 'T', _];

let bus = null;
let drone = null;
let timer = null;
let step = 0;
let nextTime = 0;

function scheduleStep(t) {
  const bar = step % 8;
  const phrase = PHRASES[Math.floor(step / 16) % PHRASES.length];
  const degree = phrase[step % 16];

  const hit = MAQSUM[bar];
  if (hit === 'D') doum(bus, t);
  else if (hit === 'T') tek(bus, t);
  else tek(bus, t, 0.06); // soft ghost note
  if (bar === 0 && step % 32 === 0) riq(bus, t, 0.08, 0.4);

  if (degree !== null) {
    oud(bus, t, noteFreq(degree), { slide: degree === 2 || degree === 5 });
  }
}

function schedule() {
  const ctx = getContext();
  while (nextTime < ctx.currentTime + LOOKAHEAD) {
    scheduleStep(nextTime);
    nextTime += EIGHTH;
    step++;
  }
}

function startDrone(ctx) {
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 380;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 2);

  // Slow filter sweep so the drone breathes.
  const lfo = ctx.createOscillator();
  const lfoDepth = ctx.createGain();
  lfo.frequency.value = 0.08;
  lfoDepth.gain.value = 120;
  lfo.connect(lfoDepth).connect(filter.frequency);

  const oscs = [ROOT / 4, (ROOT / 4) * 1.5].map((freq) => {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    osc.connect(filter);
    return osc;
  });
  filter.connect(gain).connect(bus);
  [lfo, ...oscs].forEach((o) => o.start());
  return { gain, nodes: [lfo, ...oscs] };
}

export function isMusicPlaying() {
  return timer !== null;
}

export function startMusic() {
  const ctx = getContext();
  if (!ctx || timer) return;
  if (!bus) {
    bus = ctx.createGain();
    bus.gain.value = 0.42;
    bus.connect(getMaster());
  }
  drone = startDrone(ctx);
  step = 0;
  nextTime = ctx.currentTime + 0.1;
  timer = setInterval(schedule, TICK_MS);
}

export function stopMusic() {
  if (!timer) return;
  clearInterval(timer);
  timer = null;
  const ctx = getContext();
  const { gain, nodes } = drone;
  const now = ctx.currentTime;
  // Pin the current level first so the fade starts from where the drone actually is.
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.linearRampToValueAtTime(0, now + 0.8);
  nodes.forEach((n) => n.stop(ctx.currentTime + 1));
  drone = null;
}
