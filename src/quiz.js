/**
 * Math problems for 3rd grade (German primary school), free of any DOM code:
 * addition, subtraction and times tables with all numbers below 100.
 */
import { QUIZ_MAX_NUMBER, QUIZ_ZONES } from './config.js';

/**
 * @typedef {{ text: string, answer: number, options: number[] }} Problem
 */

const MAX = QUIZ_MAX_NUMBER;

const randInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
const pick = (list) => list[Math.floor(Math.random() * list.length)];

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Swaps tens and ones, e.g. 47 → 74. */
const swapDigits = (n) => (n >= 10 ? (n % 10) * 10 + Math.floor(n / 10) : n);

/** a + b with a two-digit first number and a sum of at most 99. */
function addition() {
  const a = randInt(11, MAX - 9);
  const b = randInt(2, MAX - a);
  const answer = a + b;
  const carried = (a % 10) + (b % 10) >= 10;
  return {
    text: `${a} + ${b}`,
    answer,
    // Typical mistakes: forgot the carry, off by one or ten, digits swapped.
    mistakes: [carried ? answer - 10 : answer + 10, answer + 1, answer - 1, answer - 10, answer + 10, swapDigits(answer)],
  };
}

/** a − b with a positive result. */
function subtraction() {
  const a = randInt(20, MAX);
  const b = randInt(2, a - 1);
  const answer = a - b;
  const borrowed = a % 10 < b % 10;
  // Classic borrow mistake: subtract the smaller ones digit from the bigger one, 52 − 17 → 45.
  const noBorrow = borrowed
    ? (Math.floor(a / 10) - Math.floor(b / 10)) * 10 + (b % 10 - a % 10)
    : answer + 10;
  return {
    text: `${a} − ${b}`,
    answer,
    mistakes: [noBorrow, answer + 1, answer - 1, answer + 10, answer - 10, swapDigits(answer)],
  };
}

/** Times tables 2–10 with a product below 100. */
function multiplication() {
  let a;
  let b;
  do {
    a = randInt(2, 10);
    b = randInt(2, 10);
  } while (a * b > MAX);
  const answer = a * b;
  return {
    text: `${a} · ${b}`,
    answer,
    // Neighbouring table results are the most believable wrong answers.
    mistakes: [(a - 1) * b, (a + 1) * b, a * (b - 1), a * (b + 1), answer + 1, answer - 1, answer + 2],
  };
}

const GENERATORS = [addition, subtraction, multiplication];

/** @returns {Problem} A random problem with the right answer and two believable wrong ones. */
export function createProblem() {
  const { text, answer, mistakes } = pick(GENERATORS)();
  const wrong = shuffle([...new Set(mistakes)].filter((n) => n !== answer && n >= 0 && n <= MAX)).slice(0, 2);
  // Fallback, in case too few mistakes survive the filter.
  for (let d = 2; wrong.length < 2; d++) {
    for (const n of [answer + d, answer - d]) {
      if (wrong.length < 2 && n >= 0 && n <= MAX && !wrong.includes(n)) wrong.push(n);
    }
  }
  return { text, answer, options: shuffle([answer, ...wrong]) };
}

/** Fields earned for a correct answer after `seconds`; 0 when too slow. */
export function pointsForTime(seconds) {
  return QUIZ_ZONES.find((zone) => seconds < zone.until)?.points ?? 0;
}

/** The timing zone `seconds` falls into, or null when time is up. */
export function zoneForTime(seconds) {
  return QUIZ_ZONES.find((zone) => seconds < zone.until) ?? null;
}

/** Total time allowed per problem, in seconds. */
export const QUIZ_TIME_LIMIT = QUIZ_ZONES.at(-1).until;
