/** Tiny Web Audio synth for game sound effects. Fails silently where audio is unavailable. */
let context;
let enabled = true;

function getContext() {
  if (!context) {
    try {
      context = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      // Audio not supported.
    }
  }
  return context;
}

function tone(freq, start, duration, type = 'triangle', volume = 0.15) {
  if (!enabled) return;
  const ctx = getContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = 0;
    osc.connect(gain).connect(ctx.destination);

    const t0 = ctx.currentTime + start;
    gain.gain.linearRampToValueAtTime(volume, t0 + 0.02);
    gain.gain.linearRampToValueAtTime(0, t0 + duration);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  } catch {
    // Ignore playback errors.
  }
}

export function isSoundEnabled() {
  return enabled;
}

export function toggleSound() {
  enabled = !enabled;
  return enabled;
}

export function playRoll() {
  for (let i = 0; i < 5; i++) tone(300 + Math.random() * 300, i * 0.09, 0.08, 'square', 0.08);
}

export function playStep() {
  tone(520, 0, 0.09, 'triangle', 0.12);
}

export function playFinish(rank) {
  const notes =
    rank === 1 ? [523, 659, 784, 1047] :
    rank === 2 ? [493, 587, 698] :
    [440, 523];
  notes.forEach((freq, i) => tone(freq, i * 0.13, 0.18, 'triangle', 0.14));
}
