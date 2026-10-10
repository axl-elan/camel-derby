import { DICE_FACES, TIMING, TRACK_LENGTH } from '../config.js';
import { Race, progressPercent, rollDie } from '../game.js';
import { playFinish, playRoll, playStep } from '../audio/index.js';
import { $, cloneTemplate, wait } from './dom.js';

let race = null;
let busy = false;
let onFinish = () => {};
/** Bumped on every (re)start so stale computer turns from an abandoned race do nothing. */
let session = 0;

const els = {};

function renderTrack() {
  els.track.replaceChildren(
    ...race.players.map((p, i) => {
      const lane = cloneTemplate('laneTemplate');
      lane.style.setProperty('--player-color', p.color);
      // Lanes further down the list sit further forward; back lanes are drawn darker.
      lane.style.zIndex = i + 1;
      lane.style.setProperty('--depth', race.players.length > 1 ? i / (race.players.length - 1) : 1);
      lane.style.setProperty('--step-ms', `${TIMING.camelStep}ms`);
      // Desynchronise the idle sway so the camels don't move in lockstep.
      lane.style.setProperty('--sway-delay', `${-Math.random() * 3}s`);
      $('.lane__name', lane).textContent = p.name;
      $('.lane__track', lane).style.setProperty('--steps', TRACK_LENGTH);

      const camel = $('.camel', lane);
      camel.id = `camel-${p.id}`;
      camel.style.setProperty('--progress', `${progressPercent(p.position)}%`);
      const img = $('img', camel);
      img.src = p.img;
      img.alt = p.name;
      return lane;
    }),
  );
}

function updateTurn() {
  const p = race.currentPlayer;
  if (!p) return;
  const isHuman = p.type === 'human';
  els.turnLabel.textContent = isHuman ? `${p.name} ist dran` : `${p.name} (Computer) würfelt...`;
  els.turnSub.textContent = isHuman ? 'Klicke auf würfeln.' : 'Einen Moment...';
  els.rollBtn.disabled = !isHuman || busy;

  if (!isHuman && !busy) {
    const current = session;
    wait(TIMING.computerThinkMin + Math.random() * TIMING.computerThinkJitter).then(() => {
      if (current === session) takeTurn(p);
    });
    busy = true;
  }
}

async function animateDice() {
  for (let i = 0; i < TIMING.diceTicks; i++) {
    els.dice.textContent = DICE_FACES[rollDie()];
    await wait(TIMING.diceTick);
  }
  const value = rollDie();
  els.dice.textContent = DICE_FACES[value];
  return value;
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/** Rocking-horse bound: lift off nose-up, land nose-down, settle. */
const BOUND = [
  { transform: 'translateY(0) rotate(0deg)' },
  { transform: 'translateY(-24%) rotate(-7deg)', offset: 0.35 },
  { transform: 'translateY(-10%) rotate(5deg)', offset: 0.7 },
  { transform: 'translateY(0) rotate(0deg)' },
];

/** Moves a camel one field per bound, with a hoof beat on every landing. */
async function gallop(camel, from, to, current) {
  const img = $('img', camel);
  for (let pos = from + 1; pos <= to; pos++) {
    if (current !== session) return;
    camel.style.setProperty('--progress', `${progressPercent(pos)}%`);
    if (!reducedMotion.matches) {
      img.animate(BOUND, { duration: TIMING.camelStep, easing: 'ease-in-out' });
    }
    await wait(TIMING.camelStep * 0.8);
    playStep();
    await wait(TIMING.camelStep * 0.2);
  }
}

async function takeTurn(player) {
  const current = session;
  busy = true;
  els.rollBtn.disabled = true;
  playRoll();

  const value = await animateDice();
  if (current !== session) return;

  const from = player.position;
  race.move(player, value);
  els.turnSub.textContent = `${player.name} würfelt ${value} und läuft ${value} Felder.`;

  const camel = document.getElementById(`camel-${player.id}`);
  await gallop(camel, from, player.position, current);
  if (current !== session) return;

  await wait(TIMING.afterMove);
  if (current !== session) return;

  if (player.finished) {
    const badge = document.createElement('div');
    badge.className = 'finish-badge';
    badge.textContent = `#${player.rank}`;
    camel.closest('.lane__runway').append(badge);
    playFinish(player.rank);
  }

  race.nextTurn();
  busy = false;
  if (race.isOver) onFinish(race.ranking);
  else updateTurn();
}

/** @param {{ onFinish: (ranking: import('../game.js').Player[]) => void }} handlers */
export function initRaceScreen(handlers) {
  onFinish = handlers.onFinish;
  els.track = $('#track');
  els.dice = $('#dice');
  els.turnLabel = $('#turnLabel');
  els.turnSub = $('#turnSub');
  els.rollBtn = $('#rollBtn');

  els.rollBtn.addEventListener('click', () => {
    const p = race?.currentPlayer;
    if (!p || p.type !== 'human' || busy) return;
    takeTurn(p);
  });
}

/** Starts a new race. Pass entrants for a fresh field, or nothing to rerun the last one. */
export function startRace(entrants) {
  session++;
  busy = false;
  if (entrants) race = new Race(entrants);
  else race.reset();

  els.dice.textContent = '🎲';
  renderTrack();
  updateTurn();
}

export function stopRace() {
  session++;
  busy = false;
}
