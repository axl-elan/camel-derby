/** Synthesized instruments. Each function schedules one hit at time `t` on `out`. */
import { getContext, getNoiseBuffer } from './engine.js';

function noiseSource(ctx) {
  const src = ctx.createBufferSource();
  src.buffer = getNoiseBuffer();
  return src;
}

/** Plucked oud-like note: bright attack that darkens quickly. */
export function oud(out, t, freq, { volume = 0.18, length = 0.6, slide = false } = {}) {
  const ctx = getContext();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 2;
  filter.frequency.setValueAtTime(3200, t);
  filter.frequency.exponentialRampToValueAtTime(500, t + 0.25);

  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + length);

  for (const [type, detune] of [['sawtooth', -6], ['square', 5]]) {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.detune.value = detune;
    // A short slide up from a quarter tone below, like a left-hand ornament.
    if (slide) {
      osc.frequency.setValueAtTime(freq * 0.97, t);
      osc.frequency.exponentialRampToValueAtTime(freq, t + 0.07);
    } else {
      osc.frequency.setValueAtTime(freq, t);
    }
    osc.connect(filter);
    osc.start(t);
    osc.stop(t + length + 0.05);
  }
  filter.connect(gain).connect(out);
}

/** Darbuka "doum": deep center hit. */
export function doum(out, t, volume = 0.55) {
  const ctx = getContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(140, t);
  osc.frequency.exponentialRampToValueAtTime(58, t + 0.12);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
  osc.connect(gain).connect(out);
  osc.start(t);
  osc.stop(t + 0.4);
}

/** Darbuka "tek"/"ka": sharp rim hit. */
export function tek(out, t, volume = 0.22) {
  const ctx = getContext();
  const src = noiseSource(ctx);
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  filter.type = 'bandpass';
  filter.frequency.value = 3800;
  filter.Q.value = 1.2;
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
  src.connect(filter).connect(gain).connect(out);
  src.start(t, Math.random() * 0.5, 0.08);
}

/** Wooden click, e.g. a die hitting another die or a board. */
export function clack(out, t, volume = 0.3, pitch = 2400) {
  const ctx = getContext();
  const src = noiseSource(ctx);
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  filter.type = 'bandpass';
  filter.frequency.value = pitch;
  filter.Q.value = 9;
  // The narrow band filter removes most of the noise energy; make up for it.
  gain.gain.setValueAtTime(volume * 8, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
  src.connect(filter).connect(gain).connect(out);
  src.start(t, Math.random() * 0.5, 0.06);
}

/** Riq (tambourine) jingles: bright, metallic shimmer. */
export function riq(out, t, volume = 0.12, length = 0.25) {
  const ctx = getContext();
  const src = noiseSource(ctx);
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  filter.type = 'highpass';
  filter.frequency.value = 6500;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
  src.connect(filter).connect(gain).connect(out);
  src.start(t, Math.random() * 0.5, length + 0.02);
}
