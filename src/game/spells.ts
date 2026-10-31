export const SPELLS = ['star', 'lightning', 'rainbow'] as const;

export type SpellType = (typeof SPELLS)[number];
