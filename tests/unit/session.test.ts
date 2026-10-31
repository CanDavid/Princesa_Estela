import { describe, expect, it } from 'vitest';
import { LEVELS } from '../../src/game/levels';
import { GameSession } from '../../src/game/session';

describe('configuración de niveles', () => {
  it('define nueve enjambres cerrados y un jefe final', () => {
    const swarms = LEVELS.filter((level) => level.kind === 'swarm');
    expect(swarms.map(({ targetScore, bugCount }) => [targetScore, bugCount])).toEqual([
      [12, 12], [14, 14], [16, 16], [18, 18], [20, 20], [22, 22], [24, 24], [26, 26], [28, 28],
    ]);
    expect(LEVELS.every((level) => level.minSpeed < level.maxSpeed)).toBe(true);
    expect(swarms.map(({ minSpeed, maxSpeed }) => [minSpeed, maxSpeed])).toEqual([
      [190, 250],
      [230, 300],
      [270, 350],
      [315, 410],
      [360, 470],
      [410, 540],
      [470, 620],
      [540, 720],
      [620, 840],
    ]);
    for (let index = 1; index < swarms.length; index += 1) {
      const current = swarms[index]!;
      const previous = swarms[index - 1]!;
      expect(current.targetScore).toBeGreaterThan(previous.targetScore);
      expect(current.minSpeed).toBeGreaterThan(previous.minSpeed);
      expect(current.maxSpeed).toBeGreaterThan(previous.maxSpeed);
    }
    expect(LEVELS[9]).toMatchObject({ id: 10, kind: 'boss', targetScore: 5, bugCount: 1 });
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

  it('termina la aventura al derrotar al jefe del décimo nivel', () => {
    const session = new GameSession();
    session.startGame();
    for (let levelIndex = 0; levelIndex < LEVELS.length; levelIndex += 1) {
      for (let score = 0; score < session.level.targetScore; score += 1) session.recordCapture(true);
      if (levelIndex < LEVELS.length - 1) session.advanceLevel();
    }
    expect(session.level.id).toBe(10);
    expect(session.score).toBe(5);
    expect(session.status).toBe('game-complete');
  });

  it('mide cada nivel y el juego sin contar pausas ni celebraciones', () => {
    let now = 1_000;
    const session = new GameSession(() => now);
    session.startGame();
    now += 2_500;
    for (let score = 0; score < session.level.targetScore; score += 1) session.recordCapture(true);
    expect(session.timing).toEqual({ levelMs: 2_500, totalMs: 2_500 });

    now += 8_000;
    session.advanceLevel();
    now += 1_200;
    session.pauseTimer();
    now += 5_000;
    session.resumeTimer();
    now += 800;
    for (let score = 0; score < session.level.targetScore; score += 1) session.recordCapture(true);
    expect(session.timing).toEqual({ levelMs: 2_000, totalMs: 4_500 });
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
