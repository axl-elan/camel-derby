/** Game sound effects. */
import { TIMING } from '../config.js';
import { getContext, getMaster, isSoundEnabled } from './engine.js';
import { clack, doum, riq } from './instruments.js';

function ready() {
  return isSoundEnabled() && getContext() ? getContext() : null;
}

function tone(freq, start, duration, type = 'triangle', volume = 0.15) {
  const ctx = ready();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = 0;
  osc.connect(gain).connect(getMaster());

  const t0 = ctx.currentTime + start;
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.02);
  gain.gain.linearRampToValueAtTime(0, t0 + duration);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

/**
 * Wooden dice shaken in a leather cup, then thrown onto a board:
 * a dense rattle for the length of the dice animation, a few bouncing
 * clacks as they land, and a riq shimmer on the result.
 */
export function playRoll() {
  const ctx = ready();
  if (!ctx) return;
  const out = getMaster();
  const t0 = ctx.currentTime;
  const shake = (TIMING.diceTick * TIMING.diceTicks) / 1000 - 0.15;

  for (let t = 0; t < shake; t += 0.025 + Math.random() * 0.04) {
    clack(out, t0 + t, 0.08 + Math.random() * 0.1, 1500 + Math.random() * 1200);
  }

  const land = t0 + shake;
  [0, 0.09, 0.15, 0.19].forEach((dt, i) => {
    clack(out, land + dt, 0.35 / (i + 1), 2000 + Math.random() * 600);
  });
  doum(out, land, 0.25);
  riq(out, land + 0.19, 0.1, 0.35);
}

/** Soft hoof beat in the sand, one per field. */
export function playStep() {
  const ctx = ready();
  if (!ctx) return;
  const t = ctx.currentTime;
  clack(getMaster(), t, 0.12, 700 + Math.random() * 250);
  doum(getMaster(), t, 0.12);
}

export function playFinish(rank) {
  const notes =
    rank === 1 ? [523, 659, 784, 1047] :
    rank === 2 ? [493, 587, 698] :
    [440, 523];
  notes.forEach((freq, i) => tone(freq, i * 0.13, 0.18, 'triangle', 0.14));
}
