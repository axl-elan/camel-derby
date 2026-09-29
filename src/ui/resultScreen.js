import { $, cloneTemplate } from './dom.js';

const MEDALS = ['🥇', '🥈', '🥉'];

/** @param {{ onPlayAgain: () => void, onNewPlayers: () => void }} handlers */
export function initResultScreen({ onPlayAgain, onNewPlayers }) {
  $('#playAgainBtn').addEventListener('click', onPlayAgain);
  $('#newPlayersBtn').addEventListener('click', onNewPlayers);
}

/** @param {import('../game.js').Player[]} ranking */
export function showResults(ranking) {
  $('#rankList').replaceChildren(
    ...ranking.map((p, i) => {
      const row = cloneTemplate('rankRowTemplate');
      $('.ranking__medal', row).textContent = MEDALS[i] ?? '🐫';
      $('.ranking__name', row).textContent = p.name;
      return row;
    }),
  );
  $('#resultOverlay').hidden = false;
  $('#playAgainBtn').focus();
}
