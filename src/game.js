import { TRACK_LENGTH } from './config.js';

/**
 * @typedef {'human' | 'computer'} PlayerType
 * @typedef {{ id: number, name: string, type: PlayerType, color: string, img: string,
 *             position: number, finished: boolean, rank: number }} Player
 */

export function rollDie() {
  return 1 + Math.floor(Math.random() * 6);
}

/** Race state and rules, free of any DOM code. */
export class Race {
  /** @param {Omit<Player, 'position' | 'finished' | 'rank'>[]} entrants */
  constructor(entrants) {
    /** @type {Player[]} */
    this.players = entrants.map((p) => ({ ...p, position: 0, finished: false, rank: 0 }));
    this.reset();
  }

  reset() {
    this.turn = 0;
    this.finishCount = 0;
    for (const p of this.players) {
      p.position = 0;
      p.finished = false;
      p.rank = 0;
    }
  }

  /** The next player in rotation who has not finished yet, or null when the race is over. */
  get currentPlayer() {
    const n = this.players.length;
    for (let i = 0; i < n; i++) {
      const p = this.players[(this.turn + i) % n];
      if (!p.finished) return p;
    }
    return null;
  }

  get isOver() {
    return this.finishCount === this.players.length;
  }

  /** Players ordered by finishing rank. */
  get ranking() {
    return [...this.players].sort((a, b) => a.rank - b.rank);
  }

  /** Moves a player forward; marks them finished when they reach the end. */
  move(player, steps) {
    player.position = Math.min(player.position + steps, TRACK_LENGTH);
    if (player.position >= TRACK_LENGTH && !player.finished) {
      player.finished = true;
      player.rank = ++this.finishCount;
    }
    return player;
  }

  nextTurn() {
    this.turn = (this.turn + 1) % this.players.length;
  }
}

/** How far along its lane a camel is, from 0 (start) to 100 (finish). */
export function progressPercent(position) {
  return (Math.min(position, TRACK_LENGTH) / TRACK_LENGTH) * 100;
}
