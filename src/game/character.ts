import Phaser from 'phaser';
import {
  ESTELA_ANIMATIONS,
  LUMI_ANIMATIONS,
  estelaAnimation,
  lumiAnimation,
  type EstelaAnimation,
  type LumiAnimation,
} from './characterConfig';

const CHARACTER_PATH = 'assets/characters/estela';

export function preloadCharacter(scene: Phaser.Scene): void {
  const base = import.meta.env.BASE_URL;
  scene.load.atlas('estela-motion', `${base}${CHARACTER_PATH}/estela-motion.png`, `${base}${CHARACTER_PATH}/estela-motion.json`);
  scene.load.atlas('estela-actions', `${base}${CHARACTER_PATH}/estela-actions.png`, `${base}${CHARACTER_PATH}/estela-actions.json`);
  scene.load.atlas('estela-magic-lumi', `${base}${CHARACTER_PATH}/estela-magic-lumi.png`, `${base}${CHARACTER_PATH}/estela-magic-lumi.json`);
}

export function registerCharacterAnimations(scene: Phaser.Scene): void {
  for (const definition of [...ESTELA_ANIMATIONS, ...LUMI_ANIMATIONS]) {
    if (scene.anims.exists(definition.key)) continue;
    scene.anims.create({
      key: definition.key,
      frames: scene.anims.generateFrameNames(definition.texture, {
        prefix: definition.prefix,
        start: 0,
        end: 5,
        zeroPad: 2,
      }),
      frameRate: definition.frameRate,
      repeat: definition.repeat,
    });
  }
}

export class EstelaRig {
  readonly root: Phaser.GameObjects.Container;
  readonly estela: Phaser.GameObjects.Sprite;
  readonly lumi: Phaser.GameObjects.Sprite;
  private estelaCompletion?: () => void;
  private lumiCompletion?: () => void;

  constructor(scene: Phaser.Scene, x: number, y: number, scale = 1) {
    this.estela = scene.add.sprite(0, 0, 'estela-motion', 'estela_idle_00').setOrigin(0.5, 1);
    this.lumi = scene.add.sprite(112, -168, 'estela-magic-lumi', 'lumi_idle_00').setOrigin(0.5).setScale(0.42);
    this.root = scene.add.container(x, y, [this.estela, this.lumi]).setScale(scale);
    this.play('idle');
    this.playLumi('idle');
    scene.tweens.add({
      targets: this.lumi,
      y: this.lumi.y - 12,
      angle: { from: -4, to: 4 },
      duration: 950,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
  }

  setDepth(depth: number): this {
    this.root.setDepth(depth);
    return this;
  }

  play(state: EstelaAnimation, returnToIdle = false): this {
    const definition = estelaAnimation(state);
    this.clearEstelaCompletion();
    // La fila de magia incluye el halo completo y usa celdas más altas; esta
    // compensación mantiene el cuerpo de Estela a la misma escala visual.
    this.estela.setScale(state === 'magic' ? 0.74 : 1);
    this.estela.play(definition.key, true);
    if (returnToIdle && definition.repeat === 0) {
      this.estelaCompletion = () => this.play('idle');
      this.estela.once(Phaser.Animations.Events.ANIMATION_COMPLETE, this.estelaCompletion);
    }
    return this;
  }

  playLumi(state: LumiAnimation, returnToIdle = false): this {
    const definition = lumiAnimation(state);
    this.clearLumiCompletion();
    this.lumi.play(definition.key, true);
    if (returnToIdle && definition.repeat === 0) {
      this.lumiCompletion = () => this.playLumi('idle');
      this.lumi.once(Phaser.Animations.Events.ANIMATION_COMPLETE, this.lumiCompletion);
    }
    return this;
  }

  destroy(): void {
    this.clearEstelaCompletion();
    this.clearLumiCompletion();
    this.root.destroy(true);
  }

  private clearEstelaCompletion(): void {
    if (!this.estelaCompletion) return;
    this.estela.off(Phaser.Animations.Events.ANIMATION_COMPLETE, this.estelaCompletion);
    this.estelaCompletion = undefined;
  }

  private clearLumiCompletion(): void {
    if (!this.lumiCompletion) return;
    this.lumi.off(Phaser.Animations.Events.ANIMATION_COMPLETE, this.lumiCompletion);
    this.lumiCompletion = undefined;
  }
}

export function createEstelaRig(scene: Phaser.Scene, x: number, y: number, scale = 1): EstelaRig {
  return new EstelaRig(scene, x, y, scale);
}
