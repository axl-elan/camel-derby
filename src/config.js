/** Number of steps from start to finish. */
export const TRACK_LENGTH = 25;

export const MAX_PLAYERS = 8;
export const MIN_PLAYERS = 2;

/** Lane colors, one per seat. Indexes match the camel images. */
export const COLORS = [
  '#D6291B', '#1F9D42', '#1D5FC2', '#E8A317',
  '#7A24B5', '#E0447F', '#E85A1C', '#4FADE0',
];

export const COMPUTER_NAMES = [
  'Sandsturm', 'Wüstenblitz', 'Oasenflitzer', 'Dünenhopser',
  'Palmenpfeil', 'Karawanenkönig', 'Glutwind', 'Nomadenstar',
];

export const DICE_FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

/** Animation and pacing, in milliseconds. */
export const TIMING = {
  diceTick: 70,
  diceTicks: 10,
  afterMove: 600,
  computerThinkMin: 700,
  computerThinkJitter: 500,
};
