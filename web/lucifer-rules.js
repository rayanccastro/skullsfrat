// Shared by the game and the leaderboard's time validation.
export const BASE_TIME = 120;
export const MAX_RUN_SECONDS = 900;
export const MAX_BONUS = 6;
export const SCORE_PER_CAR = 10;
export const MISS_PENALTY = 35;
export const ESCAPE_PENALTY = 2;
export const CAR_LIMIT = 6;
export const FIRST_SPAWN = .35;
export const MIN_SPAWN_GAP = .55;

export const ANASTACIA = Object.freeze({
  name: 'Anastacia',
  triggerScore: 800,
  health: 500,
  damage: 25,
  bombPenalty: 5,
  bombFuse: 4.8,
  bombInterval: 3.2,
  firstBombDelay: 1.8,
  bombLimit: 6,
  bombBurst: 2,
  defeatDuration: 1.2
});
