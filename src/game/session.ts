import { LEVELS, getLevel } from './levels';

export type SessionStatus = 'title' | 'playing' | 'level-complete' | 'game-complete';

export interface CaptureResult {
  readonly hit: boolean;
  readonly score: number;
  readonly target: number;
  readonly completed: boolean;
  readonly status: SessionStatus;
}

export interface GameTiming {
  readonly levelMs: number;
  readonly totalMs: number;
}

export class GameSession {
  levelIndex = 0;
  score = 0;
  muted = false;
  status: SessionStatus = 'title';
  private completedGameMs = 0;
  private lastLevelMs = 0;
  private levelStartedAt = 0;
  private pausedAt?: number;

  constructor(private readonly now: () => number = () => performance.now()) {}

  get level() {
    return getLevel(this.levelIndex);
  }

  startGame(): void {
    this.levelIndex = 0;
    this.score = 0;
    this.status = 'playing';
    this.completedGameMs = 0;
    this.lastLevelMs = 0;
    this.levelStartedAt = this.now();
    this.pausedAt = undefined;
  }

  get timing(): GameTiming {
    const liveLevelMs = this.status === 'playing'
      ? Math.max(0, (this.pausedAt ?? this.now()) - this.levelStartedAt)
      : this.lastLevelMs;
    return { levelMs: liveLevelMs, totalMs: this.completedGameMs + (this.status === 'playing' ? liveLevelMs : 0) };
  }

  recordCapture(hit: boolean): CaptureResult {
    if (this.status !== 'playing') {
      return { hit: false, score: this.score, target: this.level.targetScore, completed: false, status: this.status };
    }

    if (hit) this.score += 1;
    const completed = this.score >= this.level.targetScore;
    if (completed) {
      this.score = this.level.targetScore;
      this.lastLevelMs = Math.max(0, (this.pausedAt ?? this.now()) - this.levelStartedAt);
      this.completedGameMs += this.lastLevelMs;
      this.status = this.levelIndex === LEVELS.length - 1 ? 'game-complete' : 'level-complete';
    }

    return {
      hit,
      score: this.score,
      target: this.level.targetScore,
      completed,
      status: this.status,
    };
  }

  advanceLevel(): void {
    if (this.status !== 'level-complete') throw new Error('El nivel actual todavía no está superado');
    this.levelIndex += 1;
    this.score = 0;
    this.status = 'playing';
    this.lastLevelMs = 0;
    this.levelStartedAt = this.now();
    this.pausedAt = undefined;
  }

  pauseTimer(): void {
    if (this.status === 'playing' && this.pausedAt === undefined) this.pausedAt = this.now();
  }

  resumeTimer(): void {
    if (this.status !== 'playing' || this.pausedAt === undefined) return;
    this.levelStartedAt += this.now() - this.pausedAt;
    this.pausedAt = undefined;
  }

  reset(): void {
    this.levelIndex = 0;
    this.score = 0;
    this.status = 'title';
    this.completedGameMs = 0;
    this.lastLevelMs = 0;
    this.levelStartedAt = 0;
    this.pausedAt = undefined;
  }
}
