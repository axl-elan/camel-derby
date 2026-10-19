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

/** Game modes chosen on the setup screen. Computer camels always roll the dice. */
export const MODES = {
  dice: 'dice',
  quiz: 'quiz',
};

/**
 * Math mode: fields earned for a correct answer, by answer time.
 * A wrong answer, or no answer within the last limit, earns 0.
 */
export const QUIZ_ZONES = [
  { until: 5, points: 6, color: 'fast' },
  { until: 10, points: 3, color: 'mid' },
  { until: 15, points: 1, color: 'slow' },
];

/** All numbers in a problem, including the result, stay below this. */
export const QUIZ_MAX_NUMBER = 99;

/** Animation and pacing, in milliseconds. */
export const TIMING = {
  diceTick: 70,
  diceTicks: 10,
  /** One gallop bound per field. */
  camelStep: 240,
  afterMove: 350,
  computerThinkMin: 700,
  computerThinkJitter: 500,
  /** How long the quiz shows whether the answer was right before closing. */
  quizFeedback: 1600,
};
