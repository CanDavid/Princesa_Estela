export interface LevelConfig {
  readonly id: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  readonly kind: 'swarm' | 'boss';
  readonly targetScore: number;
  readonly bugCount: number;
  readonly minSpeed: number;
  readonly maxSpeed: number;
}

export const LEVELS: readonly LevelConfig[] = [
  { id: 1, kind: 'swarm', targetScore: 12, bugCount: 12, minSpeed: 190, maxSpeed: 250 },
  { id: 2, kind: 'swarm', targetScore: 14, bugCount: 14, minSpeed: 230, maxSpeed: 300 },
  { id: 3, kind: 'swarm', targetScore: 16, bugCount: 16, minSpeed: 270, maxSpeed: 350 },
  { id: 4, kind: 'swarm', targetScore: 18, bugCount: 18, minSpeed: 315, maxSpeed: 410 },
  { id: 5, kind: 'swarm', targetScore: 20, bugCount: 20, minSpeed: 360, maxSpeed: 470 },
  { id: 6, kind: 'swarm', targetScore: 22, bugCount: 22, minSpeed: 410, maxSpeed: 540 },
  { id: 7, kind: 'swarm', targetScore: 24, bugCount: 24, minSpeed: 470, maxSpeed: 620 },
  { id: 8, kind: 'swarm', targetScore: 26, bugCount: 26, minSpeed: 540, maxSpeed: 720 },
  { id: 9, kind: 'swarm', targetScore: 28, bugCount: 28, minSpeed: 620, maxSpeed: 840 },
  { id: 10, kind: 'boss', targetScore: 5, bugCount: 1, minSpeed: 145, maxSpeed: 210 },
] as const;

export function getLevel(index: number): LevelConfig {
  const level = LEVELS[index];
  if (!level) throw new RangeError(`No existe el nivel ${index + 1}`);
  return level;
}
