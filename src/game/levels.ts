export interface LevelConfig {
  readonly id: 1 | 2 | 3;
  readonly targetScore: number;
  readonly maxBugs: number;
  readonly minSpeed: number;
  readonly maxSpeed: number;
  readonly respawnDelayMs: number;
}

export const LEVELS: readonly LevelConfig[] = [
  { id: 1, targetScore: 5, maxBugs: 3, minSpeed: 35, maxSpeed: 55, respawnDelayMs: 650 },
  { id: 2, targetScore: 8, maxBugs: 4, minSpeed: 50, maxSpeed: 75, respawnDelayMs: 550 },
  { id: 3, targetScore: 12, maxBugs: 5, minSpeed: 65, maxSpeed: 95, respawnDelayMs: 450 },
] as const;

export function getLevel(index: number): LevelConfig {
  const level = LEVELS[index];
  if (!level) throw new RangeError(`No existe el nivel ${index + 1}`);
  return level;
}
