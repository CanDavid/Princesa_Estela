export interface LevelConfig {
  readonly id: 1 | 2 | 3;
  readonly targetScore: number;
  readonly maxBugs: number;
  readonly minSpeed: number;
  readonly maxSpeed: number;
  readonly respawnDelayMs: number;
}

export const LEVELS: readonly LevelConfig[] = [
  { id: 1, targetScore: 5, maxBugs: 3, minSpeed: 95, maxSpeed: 135, respawnDelayMs: 500 },
  { id: 2, targetScore: 8, maxBugs: 4, minSpeed: 135, maxSpeed: 190, respawnDelayMs: 400 },
  { id: 3, targetScore: 12, maxBugs: 5, minSpeed: 190, maxSpeed: 250, respawnDelayMs: 300 },
] as const;

export function getLevel(index: number): LevelConfig {
  const level = LEVELS[index];
  if (!level) throw new RangeError(`No existe el nivel ${index + 1}`);
  return level;
}
