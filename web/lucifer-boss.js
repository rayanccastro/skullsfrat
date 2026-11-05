import { ANASTACIA } from './lucifer-rules.js';

export const BOSS_BOUNDS = Object.freeze({ x: 396, y: 132, width: 168, height: 244 });
export const DODGE_AREA = Object.freeze({ minX: 104, maxX: 688, minY: 128, maxY: 158 });
export const BOSS_DIALOGUE = 'Quem autorizou você a destruir esses carros bode inutil? esse trabalho é meuu!';

export function createAnastacia() {
  return {
    phase: 'waiting', health: ANASTACIA.health, age: 0, hitFlash: 0,
    bombClock: ANASTACIA.firstBombDelay, deathTime: 0, bombs: [],
    hits: 0, bombsBurned: 0, bombsExploded: 0, defeated: false,
    position: { x: BOSS_BOUNDS.x, y: BOSS_BOUNDS.y },
    dodgeTarget: null, dodgeClock: 0, dodging: false
  };
}

export function summonAnastacia(boss, score) {
  if (boss.phase !== 'waiting' || score < ANASTACIA.triggerScore) return false;
  boss.phase = 'active';
  return true;
}

export function advanceAnastacia(boss, dt, random = Math.random) {
  boss.hitFlash = Math.max(0, boss.hitFlash - dt);
  if (boss.phase === 'dying') {
    boss.deathTime += dt;
    if (boss.deathTime >= ANASTACIA.defeatDuration) boss.phase = 'defeated';
    return [];
  }
  if (boss.phase !== 'active') return [];

  boss.age += dt;
  const exploded = [];
  boss.bombs = boss.bombs.filter(bomb => {
    bomb.age += dt;
    if (bomb.age < ANASTACIA.bombFuse) return true;
    boss.bombsExploded++;
    exploded.push(bomb);
    return false;
  });

  if (boss.dodging) {
    boss.dodgeClock -= dt;
    if (boss.dodgeClock <= 0 || !boss.dodgeTarget) {
      const { minX, maxX, minY, maxY } = DODGE_AREA;
      let x = minX + random() * (maxX - minX);
      // Avoid a stationary "dodge" when the next random point is too close.
      if (Math.abs(x - boss.position.x) < 120) {
        x = boss.position.x < (minX + maxX) / 2 ? maxX - random() * 120 : minX + random() * 120;
      }
      boss.dodgeTarget = { x, y: minY + random() * (maxY - minY) };
      boss.dodgeClock = ANASTACIA.dodgeMinInterval + random() * ANASTACIA.dodgeIntervalRange;
    }
    const dx = boss.dodgeTarget.x - boss.position.x, dy = boss.dodgeTarget.y - boss.position.y;
    const distance = Math.hypot(dx, dy);
    const step = Math.min(distance, ANASTACIA.dodgeSpeed * dt);
    if (distance > 0) {
      boss.position.x += dx / distance * step;
      boss.position.y += dy / distance * step;
    }
    return exploded;
  }

  boss.bombClock -= dt;
  if (boss.bombClock <= 0) {
    boss.bombClock = ANASTACIA.bombInterval;
    for (let i = 0; i < ANASTACIA.bombBurst && boss.bombs.length < ANASTACIA.bombLimit; i++) {
      const side = i % 2;
      const x = (side ? 666 : 126) + random() * 168;
      const y = 230 + random() * 120;
      // Keep the target rings apart so a Molotov has one unambiguous target.
      if (boss.bombs.some(bomb => Math.hypot(bomb.x - x, bomb.y - y) < 78)) continue;
      boss.bombs.push({ x, y, age: 0 });
    }
  }
  return exploded;
}

export function hitAnastacia(boss, point) {
  if (boss.phase !== 'active') return 'none';
  const bombIndex = boss.bombs.findIndex(bomb => Math.hypot(bomb.x - point.x, bomb.y - point.y) <= 36);
  if (bombIndex >= 0) {
    boss.bombs.splice(bombIndex, 1);
    boss.bombsBurned++;
    return 'bomb';
  }

  const { x, y } = boss.position;
  const { width, height } = BOSS_BOUNDS;
  if (point.x < x || point.x > x + width || point.y < y || point.y > y + height) return 'miss';
  boss.health = Math.max(0, boss.health - ANASTACIA.damage);
  boss.hits++;
  boss.hitFlash = .16;
  if (boss.health > 0 && boss.health <= ANASTACIA.health * ANASTACIA.dodgeHealthRatio) boss.dodging = true;
  if (boss.health > 0) return 'boss';

  boss.phase = 'dying';
  boss.defeated = true;
  boss.bombs = [];
  return 'defeated';
}
