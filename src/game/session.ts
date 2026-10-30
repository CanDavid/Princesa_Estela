import { LEVELS, getLevel } from './levels';

export type SessionStatus = 'title' | 'playing' | 'level-complete' | 'game-complete';

export interface CaptureResult {
  readonly hit: boolean;
  readonly score: number;
  readonly target: number;
  readonly completed: boolean;
  readonly status: SessionStatus;
}

export class GameSession {
  levelIndex = 0;
  score = 0;
  muted = false;
  status: SessionStatus = 'title';

  get level() {
    return getLevel(this.levelIndex);
  }

  startGame(): void {
    this.levelIndex = 0;
    this.score = 0;
    this.status = 'playing';
  }

  recordCapture(hit: boolean): CaptureResult {
    if (this.status !== 'playing') {
      return { hit: false, score: this.score, target: this.level.targetScore, completed: false, status: this.status };
    }

    if (hit) this.score += 1;
    const completed = this.score >= this.level.targetScore;
    if (completed) {
      this.score = this.level.targetScore;
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
  }

  reset(): void {
    this.levelIndex = 0;
    this.score = 0;
    this.status = 'title';
  }
}
