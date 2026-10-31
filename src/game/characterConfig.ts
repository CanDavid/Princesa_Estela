export type EstelaAnimation = 'idle' | 'walk' | 'run' | 'jump' | 'fall' | 'land' | 'celebrate' | 'damage' | 'magic';
export type LumiAnimation = 'idle' | 'react' | 'celebrate';

export interface CharacterAnimationDefinition<State extends string> {
  readonly state: State;
  readonly key: string;
  readonly texture: string;
  readonly prefix: string;
  readonly frameRate: number;
  readonly repeat: number;
}

export const ESTELA_ANIMATIONS: readonly CharacterAnimationDefinition<EstelaAnimation>[] = [
  { state: 'idle', key: 'estela-idle', texture: 'estela-motion', prefix: 'estela_idle_', frameRate: 6, repeat: -1 },
  { state: 'walk', key: 'estela-walk', texture: 'estela-motion', prefix: 'estela_walk_', frameRate: 10, repeat: -1 },
  { state: 'run', key: 'estela-run', texture: 'estela-motion', prefix: 'estela_run_', frameRate: 14, repeat: -1 },
  { state: 'jump', key: 'estela-jump', texture: 'estela-motion', prefix: 'estela_jump_', frameRate: 12, repeat: 0 },
  { state: 'fall', key: 'estela-fall', texture: 'estela-actions', prefix: 'estela_fall_', frameRate: 8, repeat: -1 },
  { state: 'land', key: 'estela-land', texture: 'estela-actions', prefix: 'estela_land_', frameRate: 12, repeat: 0 },
  { state: 'celebrate', key: 'estela-celebrate', texture: 'estela-actions', prefix: 'estela_celebrate_', frameRate: 10, repeat: -1 },
  { state: 'damage', key: 'estela-damage', texture: 'estela-actions', prefix: 'estela_damage_', frameRate: 10, repeat: 0 },
  { state: 'magic', key: 'estela-magic', texture: 'estela-magic-lumi', prefix: 'estela_magic_', frameRate: 12, repeat: 0 },
] as const;

export const LUMI_ANIMATIONS: readonly CharacterAnimationDefinition<LumiAnimation>[] = [
  { state: 'idle', key: 'lumi-idle', texture: 'estela-magic-lumi', prefix: 'lumi_idle_', frameRate: 8, repeat: -1 },
  { state: 'react', key: 'lumi-react', texture: 'estela-magic-lumi', prefix: 'lumi_react_', frameRate: 12, repeat: 0 },
  { state: 'celebrate', key: 'lumi-celebrate', texture: 'estela-magic-lumi', prefix: 'lumi_celebrate_', frameRate: 12, repeat: -1 },
] as const;

export function estelaAnimation(state: EstelaAnimation): CharacterAnimationDefinition<EstelaAnimation> {
  const definition = ESTELA_ANIMATIONS.find((candidate) => candidate.state === state);
  if (!definition) throw new RangeError(`Animación de Estela desconocida: ${state}`);
  return definition;
}

export function lumiAnimation(state: LumiAnimation): CharacterAnimationDefinition<LumiAnimation> {
  const definition = LUMI_ANIMATIONS.find((candidate) => candidate.state === state);
  if (!definition) throw new RangeError(`Animación de Lumi desconocida: ${state}`);
  return definition;
}
