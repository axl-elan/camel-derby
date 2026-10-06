/**
 * Shared Web Audio context with a master bus that the sound toggle controls.
 * Everything fails silently where audio is unavailable.
 */
let context = null;
let master = null;
let noise = null;
let enabled = true;

export function getContext() {
  if (!context) {
    try {
      context = new (window.AudioContext || window.webkitAudioContext)();
      master = context.createGain();
      master.gain.value = enabled ? 1 : 0;
      master.connect(context.destination);
    } catch {
      context = null;
    }
  }
  return context;
}

/** Destination node for all game audio. */
export function getMaster() {
  getContext();
  return master;
}

/** One second of white noise, shared by all percussive sounds. */
export function getNoiseBuffer() {
  const ctx = getContext();
  if (!ctx) return null;
  if (!noise) {
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noise;
}

export function isSoundEnabled() {
  return enabled;
}

export function setSoundEnabled(on) {
  enabled = on;
  if (!context) return;
  master.gain.setTargetAtTime(on ? 1 : 0, context.currentTime, 0.05);
}

/** Browsers only allow audio after a user gesture; call this from one. */
export function resume() {
  const ctx = getContext();
  if (ctx?.state === 'suspended') return ctx.resume().catch(() => {});
  return Promise.resolve();
}

export function suspend() {
  if (context?.state === 'running') context.suspend().catch(() => {});
}
