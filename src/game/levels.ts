export interface LevelConfig {
  readonly id: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  readonly targetScore: number;
  readonly maxBugs: number;
  readonly minSpeed: number;
  readonly maxSpeed: number;
  readonly respawnDelayMs: number;
}

export const LEVELS: readonly LevelConfig[] = [
  { id: 1, targetScore: 12, maxBugs: 5, minSpeed: 190, maxSpeed: 250, respawnDelayMs: 300 },
  { id: 2, targetScore: 14, maxBugs: 5, minSpeed: 230, maxSpeed: 300, respawnDelayMs: 270 },
  { id: 3, targetScore: 16, maxBugs: 6, minSpeed: 270, maxSpeed: 350, respawnDelayMs: 240 },
  { id: 4, targetScore: 18, maxBugs: 6, minSpeed: 315, maxSpeed: 410, respawnDelayMs: 210 },
  { id: 5, targetScore: 20, maxBugs: 7, minSpeed: 360, maxSpeed: 470, respawnDelayMs: 180 },
  { id: 6, targetScore: 22, maxBugs: 7, minSpeed: 410, maxSpeed: 540, respawnDelayMs: 155 },
  { id: 7, targetScore: 24, maxBugs: 8, minSpeed: 470, maxSpeed: 620, respawnDelayMs: 130 },
  { id: 8, targetScore: 26, maxBugs: 9, minSpeed: 540, maxSpeed: 720, respawnDelayMs: 105 },
] as const;

export function getLevel(index: number): LevelConfig {
  const level = LEVELS[index];
  if (!level) throw new RangeError(`No existe el nivel ${index + 1}`);
  return level;
}
