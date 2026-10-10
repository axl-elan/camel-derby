import { COLORS, COMPUTER_NAMES, MAX_PLAYERS, MIN_PLAYERS } from '../config.js';
import { CAMEL_IMAGES } from '../assets.js';
import { $, cloneTemplate } from './dom.js';

const rows = Array.from({ length: MAX_PLAYERS }, (_, i) => ({
  active: i < 2,
  type: i < 2 ? 'human' : 'computer',
  name: '',
}));

const defaultName = (row, i) => (row.type === 'human' ? `Spieler ${i + 1}` : COMPUTER_NAMES[i]);

function render() {
  const list = $('#playerList');
  list.replaceChildren(
    ...rows.map((row, i) => {
      const el = cloneTemplate('playerRowTemplate');
      el.dataset.index = i;

      const toggle = $('[data-action="toggle"]', el);
      toggle.setAttribute('aria-pressed', row.active);
      toggle.textContent = row.active ? '✓' : '—';

      const input = $('[data-action="name"]', el);
      input.value = row.name;
      input.placeholder = defaultName(row, i);
      input.disabled = row.type === 'computer' || !row.active;
      input.setAttribute('aria-label', `Name Kamel ${i + 1}`);

      const typeBtn = $('[data-action="type"]', el);
      const isHuman = row.type === 'human';
      typeBtn.dataset.type = row.type;
      typeBtn.textContent = isHuman ? '👤' : '🤖';
      typeBtn.title = isHuman ? 'Mensch – tippen für Computer' : 'Computer – tippen für Mensch';
      typeBtn.setAttribute('aria-label', `Kamel ${i + 1}: ${typeBtn.title}`);
      $('.player-row__color', el).style.setProperty('--player-color', COLORS[i]);
      return el;
    }),
  );

  const activeCount = rows.filter((r) => r.active).length;
  $('#startBtn').disabled = activeCount < MIN_PLAYERS;
  $('#setupHint').textContent =
    activeCount < MIN_PLAYERS
      ? `Mindestens ${MIN_PLAYERS} aktive Kamele nötig.`
      : `${activeCount} Kamele bereit zum Start.`;
}

/** Entrants for a new race, built from the active rows. */
function buildEntrants() {
  return rows.flatMap((row, i) =>
    row.active
      ? [{
          id: i,
          name: row.name.trim() || defaultName(row, i),
          type: row.type,
          color: COLORS[i],
          img: CAMEL_IMAGES[i],
        }]
      : [],
  );
}

/** @param {{ onStart: (entrants: ReturnType<typeof buildEntrants>) => void }} handlers */
export function initSetupScreen({ onStart }) {
  const list = $('#playerList');

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const index = btn.closest('.player-row').dataset.index;
    const row = rows[index];
    const action = btn.dataset.action;
    if (action === 'toggle') row.active = !row.active;
    else if (action === 'type') row.type = row.type === 'human' ? 'computer' : 'human';
    render();
    // render() replaces the rows; keep keyboard focus on the button that was pressed.
    $(`.player-row[data-index="${index}"] [data-action="${action}"]`)?.focus();
  });

  list.addEventListener('input', (e) => {
    if (e.target.dataset.action !== 'name') return;
    rows[e.target.closest('.player-row').dataset.index].name = e.target.value;
  });

  $('#startBtn').addEventListener('click', () => onStart(buildEntrants()));

  render();
}
