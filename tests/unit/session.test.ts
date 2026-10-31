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
    expect(swarms.every((level) => level.bowserLimit === level.targetScore / 2)).toBe(true);
    expect(swarms.every((level) => level.bowserCount === level.bowserLimit + 2)).toBe(true);
    expect(LEVELS[9]).toMatchObject({ id: 10, kind: 'boss', targetScore: 5, bugCount: 1, bowserLimit: 3, bowserCount: 5 });
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
    expect(session.recordCapture('miss')).toMatchObject({ hit: false, score: 0, bowserScore: 0, completed: false, failed: false, status: 'playing' });
  });

  it('cada acierto suma exactamente un punto', () => {
    const session = new GameSession();
    session.startGame();
    expect(session.recordCapture('good').score).toBe(1);
    expect(session.recordCapture('good').score).toBe(2);
  });

  it('avanza al nivel siguiente y reinicia su marcador', () => {
    const session = new GameSession();
    session.startGame();
    for (let index = 0; index < session.level.targetScore; index += 1) session.recordCapture('good');
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
      for (let score = 0; score < session.level.targetScore; score += 1) session.recordCapture('good');
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
    for (let score = 0; score < session.level.targetScore; score += 1) session.recordCapture('good');
    expect(session.timing).toEqual({ levelMs: 2_500, totalMs: 2_500 });

    now += 8_000;
    session.advanceLevel();
    now += 1_200;
    session.pauseTimer();
    now += 5_000;
    session.resumeTimer();
    now += 800;
    for (let score = 0; score < session.level.targetScore; score += 1) session.recordCapture('good');
    expect(session.timing).toEqual({ levelMs: 2_000, totalMs: 4_500 });
  });

  it('reinicia el progreso sin cambiar la preferencia de sonido', () => {
    const session = new GameSession();
    session.startGame();
    session.muted = true;
    session.recordCapture('good');
    session.reset();
    expect(session).toMatchObject({ levelIndex: 0, score: 0, status: 'title', muted: true });
  });

  it('pierde exactamente al alcanzar el límite Bowser', () => {
    const session = new GameSession();
    session.startGame();
    for (let point = 1; point < session.level.bowserLimit; point += 1) {
      expect(session.recordCapture('bowser')).toMatchObject({ bowserScore: point, failed: false, status: 'playing' });
    }
    expect(session.recordCapture('bowser')).toMatchObject({ bowserScore: 6, failed: true, status: 'level-failed' });
    expect(session.recordCapture('good')).toMatchObject({ hit: false, score: 0, status: 'level-failed' });
  });

  it('reintenta con marcadores a cero y conserva el tiempo de los intentos', () => {
    let now = 1_000;
    const session = new GameSession(() => now);
    session.startGame();
    now = 4_000;
    for (let point = 0; point < session.level.bowserLimit; point += 1) session.recordCapture('bowser');
    expect(session.timing).toEqual({ levelMs: 3_000, totalMs: 3_000 });

    now = 9_000;
    expect(session.timing).toEqual({ levelMs: 3_000, totalMs: 3_000 });
    session.retryLevel();
    expect(session).toMatchObject({ score: 0, bowserScore: 0, status: 'playing' });
    now = 11_000;
    expect(session.timing).toEqual({ levelMs: 5_000, totalMs: 5_000 });
  });
});
