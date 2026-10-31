import { LEVELS, getLevel } from './levels';

export type SessionStatus = 'title' | 'playing' | 'level-failed' | 'level-complete' | 'game-complete';
export type CaptureKind = 'good' | 'bowser' | 'miss';

export interface CaptureResult {
  readonly hit: boolean;
  readonly kind: CaptureKind;
  readonly score: number;
  readonly bowserScore: number;
  readonly bowserLimit: number;
  readonly target: number;
  readonly completed: boolean;
  readonly failed: boolean;
  readonly status: SessionStatus;
}

export interface GameTiming {
  readonly levelMs: number;
  readonly totalMs: number;
}

export class GameSession {
  levelIndex = 0;
  score = 0;
  bowserScore = 0;
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
    this.bowserScore = 0;
    this.status = 'playing';
    this.completedGameMs = 0;
    this.lastLevelMs = 0;
    this.levelStartedAt = this.now();
    this.pausedAt = undefined;
  }

  get timing(): GameTiming {
    if (this.status === 'playing') {
      const levelMs = Math.max(0, (this.pausedAt ?? this.now()) - this.levelStartedAt);
      return { levelMs, totalMs: this.completedGameMs + levelMs };
    }
    if (this.status === 'level-failed') {
      return { levelMs: this.lastLevelMs, totalMs: this.completedGameMs + this.lastLevelMs };
    }
    return { levelMs: this.lastLevelMs, totalMs: this.completedGameMs };
  }

  recordCapture(kind: CaptureKind): CaptureResult {
    if (this.status !== 'playing') {
      return this.captureResult(kind, false, false, false);
    }

    if (kind === 'good') this.score += 1;
    if (kind === 'bowser') this.bowserScore += 1;
    const completed = this.score >= this.level.targetScore;
    const failed = this.bowserScore >= this.level.bowserLimit;
    if (completed) {
      this.score = this.level.targetScore;
      this.lastLevelMs = Math.max(0, (this.pausedAt ?? this.now()) - this.levelStartedAt);
      this.completedGameMs += this.lastLevelMs;
      this.status = this.levelIndex === LEVELS.length - 1 ? 'game-complete' : 'level-complete';
    } else if (failed) {
      const failedAt = this.pausedAt ?? this.now();
      this.lastLevelMs = Math.max(0, failedAt - this.levelStartedAt);
      this.pausedAt = failedAt;
      this.status = 'level-failed';
    }

    return this.captureResult(kind, completed, failed);
  }

  advanceLevel(): void {
    if (this.status !== 'level-complete') throw new Error('El nivel actual todavía no está superado');
    this.levelIndex += 1;
    this.score = 0;
    this.bowserScore = 0;
    this.status = 'playing';
    this.lastLevelMs = 0;
    this.levelStartedAt = this.now();
    this.pausedAt = undefined;
  }

  retryLevel(): void {
    if (this.status !== 'level-failed' || this.pausedAt === undefined) throw new Error('El nivel actual no está pendiente de reintento');
    this.levelStartedAt += this.now() - this.pausedAt;
    this.score = 0;
    this.bowserScore = 0;
    this.lastLevelMs = 0;
    this.pausedAt = undefined;
    this.status = 'playing';
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
    this.bowserScore = 0;
    this.status = 'title';
    this.completedGameMs = 0;
    this.lastLevelMs = 0;
    this.levelStartedAt = 0;
    this.pausedAt = undefined;
  }

  private captureResult(kind: CaptureKind, completed: boolean, failed: boolean, accepted = true): CaptureResult {
    return {
      hit: accepted && kind !== 'miss',
      kind,
      score: this.score,
      bowserScore: this.bowserScore,
      bowserLimit: this.level.bowserLimit,
      target: this.level.targetScore,
      completed,
      failed,
      status: this.status,
    };
  }
}
