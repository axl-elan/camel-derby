import { isSoundEnabled, toggleSound } from './audio.js';
import { showScreen } from './ui/dom.js';
import { initSetupScreen } from './ui/setupScreen.js';
import { initRaceScreen, startRace, stopRace } from './ui/raceScreen.js';
import { initResultScreen, showResults } from './ui/resultScreen.js';

function renderSoundButtons() {
  const on = isSoundEnabled();
  for (const btn of document.querySelectorAll('[data-sound-toggle]')) {
    btn.textContent =
      btn.dataset.soundToggle === 'icon' ? (on ? '🔊' : '🔈') : on ? '🔊 Ton an' : '🔈 Ton aus';
    btn.setAttribute('aria-pressed', on);
  }
}

function backToSetup() {
  stopRace();
  showScreen('setup');
}

initSetupScreen({
  onStart(entrants) {
    showScreen('race');
    startRace(entrants);
  },
});

initRaceScreen({ onFinish: showResults });

initResultScreen({
  onPlayAgain() {
    showScreen('race');
    startRace();
  },
  onNewPlayers: backToSetup,
});

document.getElementById('backBtn').addEventListener('click', backToSetup);

for (const btn of document.querySelectorAll('[data-sound-toggle]')) {
  btn.addEventListener('click', () => {
    toggleSound();
    renderSoundButtons();
  });
}
renderSoundButtons();
