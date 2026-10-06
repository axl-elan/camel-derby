import { isSoundEnabled, resume, setSoundEnabled, suspend } from './engine.js';
import { isMusicPlaying, startMusic, stopMusic } from './music.js';

export { isSoundEnabled } from './engine.js';
export { playRoll, playStep, playFinish } from './sfx.js';

/** Turns all game audio (music and effects) on or off. Call from a user gesture. */
export function toggleSound() {
  const on = !isSoundEnabled();
  setSoundEnabled(on);
  if (on) resume().then(startMusic);
  else stopMusic();
  return on;
}

/**
 * Starts the music on the first user interaction (browsers block audio before that)
 * and pauses all audio while the tab is hidden.
 */
export function initAudio() {
  const unlock = () => {
    if (isSoundEnabled() && !isMusicPlaying()) resume().then(startMusic);
  };
  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) suspend();
    else if (isSoundEnabled()) resume();
  });
}
