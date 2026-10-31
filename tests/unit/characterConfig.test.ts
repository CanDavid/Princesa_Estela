import { describe, expect, it } from 'vitest';
import { ESTELA_ANIMATIONS, LUMI_ANIMATIONS, estelaAnimation, lumiAnimation } from '../../src/game/characterConfig';

describe('animaciones oficiales de Estela y Lumi', () => {
  it('registra todos los estados previstos de Estela', () => {
    expect(ESTELA_ANIMATIONS.map(({ state }) => state)).toEqual([
      'idle', 'walk', 'run', 'jump', 'fall', 'land', 'celebrate', 'damage', 'magic',
    ]);
    expect(new Set(ESTELA_ANIMATIONS.map(({ key }) => key)).size).toBe(ESTELA_ANIMATIONS.length);
  });

  it('registra los tres estados de Lumi', () => {
    expect(LUMI_ANIMATIONS.map(({ state }) => state)).toEqual(['idle', 'react', 'celebrate']);
    expect(lumiAnimation('idle')).toMatchObject({ key: 'lumi-idle', repeat: -1 });
  });

  it('deja en bucle los estados continuos y limita las acciones puntuales', () => {
    expect(estelaAnimation('idle').repeat).toBe(-1);
    expect(estelaAnimation('run').repeat).toBe(-1);
    expect(estelaAnimation('magic').repeat).toBe(0);
    expect(estelaAnimation('land').repeat).toBe(0);
    expect(estelaAnimation('damage').repeat).toBe(0);
  });

  it('usa seis frames con nombres normalizados para cada secuencia', () => {
    for (const definition of [...ESTELA_ANIMATIONS, ...LUMI_ANIMATIONS]) {
      expect(definition.prefix).toMatch(/_$/);
      expect(definition.frameRate).toBeGreaterThanOrEqual(6);
      expect(definition.frameRate).toBeLessThanOrEqual(14);
    }
  });
});
