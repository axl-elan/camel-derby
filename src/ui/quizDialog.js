import { TIMING } from '../config.js';
import { QUIZ_TIME_LIMIT, pointsForTime, zoneForTime } from '../quiz.js';
import { playCorrect, playTick, playWrong } from '../audio/index.js';
import { $, wait } from './dom.js';

const els = {};
/** Set while a problem is open; calling it closes the dialog without scoring. */
let cancelOpen = null;

function init() {
  els.overlay = $('#quizOverlay');
  els.card = $('.quiz-card', els.overlay);
  els.player = $('#quizPlayer');
  els.points = $('#quizPoints');
  els.problem = $('#quizProblem');
  els.feedback = $('#quizFeedback');
  els.options = [...els.overlay.querySelectorAll('.quiz-option')];
}

const fields = (n) => `${n} ${n === 1 ? 'Feld' : 'Felder'}`;

/** Updates the time bar, its colour zone and the label for the elapsed time. */
function renderClock(seconds) {
  const zone = zoneForTime(seconds);
  els.card.dataset.zone = zone ? zone.color : 'none';
  els.card.style.setProperty('--remaining', Math.max(0, 1 - seconds / QUIZ_TIME_LIMIT));
  els.points.textContent = zone
    ? `⏱ noch ${Math.ceil(QUIZ_TIME_LIMIT - seconds)} s · ${fields(zone.points)}`
    : '⏱ Zeit um!';
}

/** Marks the right answer green, a wrong pick red, and dims the rest. */
function revealAnswer(problem, chosen) {
  els.options.forEach((btn) => {
    btn.disabled = true;
    const value = Number(btn.textContent);
    btn.dataset.result = value === problem.answer ? 'right' : value === chosen ? 'wrong' : 'dim';
  });
}

/**
 * Shows a problem with a running clock and waits for an answer.
 * Resolves with the fields earned (0 for wrong or too slow), or null if cancelled.
 * @param {import('../quiz.js').Problem} problem
 * @param {string} playerName
 * @returns {Promise<number | null>}
 */
export function askProblem(problem, playerName) {
  if (!els.overlay) init();

  els.player.textContent = `${playerName}, rechne schnell!`;
  els.problem.textContent = `${problem.text} = ?`;
  els.feedback.textContent = '';
  els.options.forEach((btn, i) => {
    btn.textContent = problem.options[i];
    btn.disabled = false;
    delete btn.dataset.result;
  });
  renderClock(0);
  els.overlay.hidden = false;

  return new Promise((resolve) => {
    const start = performance.now();
    let frame = 0;
    let answered = false;
    let settled = false;
    let nextTick = 1;
    let tickCount = 0;

    const settle = (points) => {
      if (settled) return;
      settled = true;
      answered = true;
      cancelAnimationFrame(frame);
      els.overlay.removeEventListener('click', onClick);
      window.removeEventListener('keydown', onKey);
      cancelOpen = null;
      els.overlay.hidden = true;
      resolve(points);
    };

    const answer = async (chosen) => {
      if (answered) return;
      answered = true;
      cancelAnimationFrame(frame);
      const seconds = (performance.now() - start) / 1000;
      const correct = chosen === problem.answer;
      const points = correct ? pointsForTime(seconds) : 0;

      revealAnswer(problem, chosen);
      if (correct) {
        els.feedback.textContent = `✅ Richtig! +${fields(points)}`;
        playCorrect();
      } else {
        els.feedback.textContent = chosen === null
          ? `⏰ Zeit um! Richtig ist ${problem.answer}.`
          : `❌ Leider falsch. Richtig ist ${problem.answer}.`;
        playWrong();
      }

      await wait(TIMING.quizFeedback);
      settle(points); // no-op if cancelled meanwhile
    };

    const loop = () => {
      const seconds = (performance.now() - start) / 1000;
      if (seconds >= QUIZ_TIME_LIMIT) {
        renderClock(QUIZ_TIME_LIMIT);
        answer(null);
        return;
      }
      renderClock(seconds);
      // Tick-tock every second, twice as fast in the last zone.
      if (seconds >= nextTick) {
        const urgent = zoneForTime(seconds)?.color === 'slow';
        playTick(tickCount++ % 2 === 1, urgent);
        nextTick += urgent ? 0.5 : 1;
      }
      frame = requestAnimationFrame(loop);
    };

    const onClick = (e) => {
      const btn = e.target.closest('.quiz-option');
      if (btn && !btn.disabled) answer(Number(btn.textContent));
    };

    // Keys 1–3 pick an answer, handy on a computer.
    const onKey = (e) => {
      const i = ['1', '2', '3'].indexOf(e.key);
      if (i >= 0) answer(Number(els.options[i].textContent));
    };

    els.overlay.addEventListener('click', onClick);
    window.addEventListener('keydown', onKey);
    cancelOpen = () => settle(null);
    frame = requestAnimationFrame(loop);
  });
}

/** Closes an open problem without scoring it, e.g. when leaving the race. */
export function cancelProblem() {
  cancelOpen?.();
}
