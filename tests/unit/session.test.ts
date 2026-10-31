import { describe, expect, it } from 'vitest';
import { LEVELS } from '../../src/game/levels';
import { GameSession } from '../../src/game/session';

describe('configuración de niveles', () => {
  it('define ocho niveles cada vez más exigentes', () => {
    expect(LEVELS.map(({ targetScore, maxBugs }) => [targetScore, maxBugs])).toEqual([
      [12, 5], [14, 5], [16, 6], [18, 6], [20, 7], [22, 7], [24, 8], [26, 9],
    ]);
    expect(LEVELS.every((level) => level.minSpeed < level.maxSpeed)).toBe(true);
    expect(LEVELS.map(({ minSpeed, maxSpeed }) => [minSpeed, maxSpeed])).toEqual([
      [190, 250],
      [230, 300],
      [270, 350],
      [315, 410],
      [360, 470],
      [410, 540],
      [470, 620],
      [540, 720],
    ]);
    for (let index = 1; index < LEVELS.length; index += 1) {
      const current = LEVELS[index]!;
      const previous = LEVELS[index - 1]!;
      expect(current.targetScore).toBeGreaterThan(previous.targetScore);
      expect(current.maxBugs).toBeGreaterThanOrEqual(previous.maxBugs);
      expect(current.minSpeed).toBeGreaterThan(previous.minSpeed);
      expect(current.maxSpeed).toBeGreaterThan(previous.maxSpeed);
      expect(current.respawnDelayMs).toBeLessThan(previous.respawnDelayMs);
    }
  });
});

describe('GameSession', () => {
  it('empieza siempre en el primer nivel con cero puntos', () => {
    const session = new GameSession();
    session.startGame();
    expect(session.level.id).toBe(1);
    expect(session.score).toBe(0);
    expect(session.status).toBe('playing');
  });

  it('un fallo no modifica la puntuación ni termina la partida', () => {
    const session = new GameSession();
    session.startGame();
    expect(session.recordCapture(false)).toMatchObject({ hit: false, score: 0, completed: false, status: 'playing' });
  });

  it('cada acierto suma exactamente un punto', () => {
    const session = new GameSession();
    session.startGame();
    expect(session.recordCapture(true).score).toBe(1);
    expect(session.recordCapture(true).score).toBe(2);
  });

  it('avanza al nivel siguiente y reinicia su marcador', () => {
    const session = new GameSession();
    session.startGame();
    for (let index = 0; index < session.level.targetScore; index += 1) session.recordCapture(true);
    expect(session.status).toBe('level-complete');
    session.advanceLevel();
    expect(session.level.id).toBe(2);
    expect(session.score).toBe(0);
    expect(session.status).toBe('playing');
  });

  it('termina la aventura al alcanzar el objetivo del octavo nivel', () => {
    const session = new GameSession();
    session.startGame();
    for (let levelIndex = 0; levelIndex < LEVELS.length; levelIndex += 1) {
      for (let score = 0; score < session.level.targetScore; score += 1) session.recordCapture(true);
      if (levelIndex < LEVELS.length - 1) session.advanceLevel();
    }
    expect(session.level.id).toBe(8);
    expect(session.score).toBe(26);
    expect(session.status).toBe('game-complete');
  });

  it('reinicia el progreso sin cambiar la preferencia de sonido', () => {
    const session = new GameSession();
    session.startGame();
    session.muted = true;
    session.recordCapture(true);
    session.reset();
    expect(session).toMatchObject({ levelIndex: 0, score: 0, status: 'title', muted: true });
  });
});
