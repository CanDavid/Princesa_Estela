import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

interface AtlasFrame {
  frame: { x: number; y: number; w: number; h: number };
  pivot: { x: number; y: number };
}

interface Atlas {
  frames: Record<string, AtlasFrame>;
  meta: { size: { w: number; h: number } };
}

const atlases = [
  'public/assets/characters/estela/estela-motion.json',
  'public/assets/characters/estela/estela-actions.json',
  'public/assets/characters/estela/estela-magic-lumi.json',
];

describe('atlas de personajes', () => {
  it.each(atlases)('%s contiene 24 frames dentro de la textura', (path) => {
    const atlas = JSON.parse(readFileSync(path, 'utf8')) as Atlas;
    const frames = Object.values(atlas.frames);
    expect(frames).toHaveLength(24);
    for (const { frame, pivot } of frames) {
      expect(frame.x).toBeGreaterThanOrEqual(0);
      expect(frame.y).toBeGreaterThanOrEqual(0);
      expect(frame.x + frame.w).toBeLessThanOrEqual(atlas.meta.size.w);
      expect(frame.y + frame.h).toBeLessThanOrEqual(atlas.meta.size.h);
      expect(pivot.x).toBeGreaterThanOrEqual(0);
      expect(pivot.x).toBeLessThanOrEqual(1);
      expect(pivot.y).toBeGreaterThanOrEqual(0);
      expect(pivot.y).toBeLessThanOrEqual(1);
    }
  });
});
