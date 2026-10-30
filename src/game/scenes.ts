import Phaser from 'phaser';
import { GameAudio } from './audio';
import { createArtTextures } from './art';
import { GameSession } from './session';
import { GameUi } from '../ui';

interface SceneServices {
  session: GameSession;
  audio: GameAudio;
  ui: GameUi;
}

interface FlyingBug extends Phaser.GameObjects.Image {
  velocityX: number;
  velocityY: number;
  turnAt: number;
  phase: number;
}

function background(scene: Phaser.Scene, shade = 0xffffff): Phaser.GameObjects.Image {
  return scene.add.image(640, 360, 'castle-garden').setDisplaySize(1280, 720).setTint(shade);
}

function addFloatingStars(scene: Phaser.Scene, count: number, area: Phaser.Geom.Rectangle): void {
  for (let index = 0; index < count; index += 1) {
    const star = scene.add.image(
      Phaser.Math.Between(area.left, area.right),
      Phaser.Math.Between(area.top, area.bottom),
      'star',
    ).setScale(Phaser.Math.FloatBetween(0.13, 0.34)).setAlpha(Phaser.Math.FloatBetween(0.45, 0.95));
    scene.tweens.add({
      targets: star,
      y: star.y - Phaser.Math.Between(15, 42),
      alpha: { from: star.alpha, to: 0.15 },
      angle: Phaser.Math.Between(-18, 18),
      duration: Phaser.Math.Between(950, 1900),
      delay: Phaser.Math.Between(0, 850),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
  }
}

export class BootScene extends Phaser.Scene {
  constructor(private readonly services: SceneServices) {
    super('Boot');
  }

  preload(): void {
    this.services.ui.showLoading();
    this.load.image('castle-garden', `${import.meta.env.BASE_URL}assets/castle-garden.png`);
  }

  create(): void {
    createArtTextures(this);
    this.scene.start('Title');
  }
}

export class TitleScene extends Phaser.Scene {
  constructor(private readonly services: SceneServices) {
    super('Title');
  }

  create(): void {
    background(this);
    const glow = this.add.image(210, 505, 'glow').setScale(2.4).setAlpha(0.34);
    const estela = this.add.image(210, 515, 'estela').setScale(0.86).setOrigin(0.5, 0.75);
    const net = this.add.image(310, 520, 'net').setScale(0.58).setRotation(-0.18);
    addFloatingStars(this, 10, new Phaser.Geom.Rectangle(40, 70, 520, 520));
    this.tweens.add({ targets: [estela, net, glow], y: '-=10', duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.services.ui.showTitle();
  }
}

export class GameScene extends Phaser.Scene {
  private readonly bugs: FlyingBug[] = [];
  private inputLocked = false;
  private ending = false;
  private princess?: Phaser.GameObjects.Image;

  constructor(private readonly services: SceneServices) {
    super('Game');
  }

  create(): void {
    this.bugs.length = 0;
    this.inputLocked = false;
    this.ending = false;
    background(this);
    this.add.rectangle(640, 360, 1280, 720, 0xfff4ca, 0.035);
    this.princess = this.add.image(145, 600, 'estela').setScale(0.72).setOrigin(0.5, 0.82).setDepth(8);
    this.add.image(208, 584, 'net').setScale(0.36).setRotation(-0.23).setDepth(7).setAlpha(0.82);

    const { level } = this.services.session;
    this.services.ui.showGame(level.id, this.services.session.score, level.targetScore);
    for (let index = 0; index < level.maxBugs; index += 1) this.spawnBug(index * 120);

    this.input.on('pointerdown', this.handleCapture, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.input.off('pointerdown', this.handleCapture, this));
    this.time.addEvent({
      delay: 2300,
      loop: true,
      callback: () => {
        if (this.bugs.length > 0 && !this.ending) this.services.audio.bugChirp();
      },
    });
  }

  update(time: number, delta: number): void {
    const seconds = delta / 1000;
    for (const bug of this.bugs) {
      if (!bug.active) continue;
      if (time >= bug.turnAt) {
        const speed = Phaser.Math.FloatBetween(this.services.session.level.minSpeed, this.services.session.level.maxSpeed);
        const angle = Phaser.Math.FloatBetween(-Math.PI, Math.PI);
        bug.velocityX = Math.cos(angle) * speed;
        bug.velocityY = Math.sin(angle) * speed * 0.58;
        bug.turnAt = time + Phaser.Math.Between(1200, 2600);
      }
      bug.x += bug.velocityX * seconds;
      bug.y += bug.velocityY * seconds;
      bug.angle = Math.sin(time / 210 + bug.phase) * 5;
      if (bug.x < 345 || bug.x > 1205) {
        bug.x = Phaser.Math.Clamp(bug.x, 345, 1205);
        bug.velocityX *= -1;
      }
      if (bug.y < 135 || bug.y > 505) {
        bug.y = Phaser.Math.Clamp(bug.y, 135, 505);
        bug.velocityY *= -1;
      }
    }
  }

  debugScorePoint(): void {
    if (this.ending || this.services.session.status !== 'playing') return;
    this.scoreHit(730, 280, undefined);
  }

  debugBugPosition(): { x: number; y: number } | undefined {
    const bug = this.bugs.find((candidate) => candidate.active);
    return bug ? { x: bug.x, y: bug.y } : undefined;
  }

  private handleCapture(pointer: Phaser.Input.Pointer): void {
    if (this.inputLocked || this.ending || this.services.session.status !== 'playing') return;
    this.inputLocked = true;
    const targetX = Phaser.Math.Clamp(pointer.worldX, 275, 1220);
    const targetY = Phaser.Math.Clamp(pointer.worldY, 90, 590);
    const originX = this.princess?.x ?? 150;
    const originY = (this.princess?.y ?? 600) - 40;
    const rotation = Phaser.Math.Angle.Between(originX, originY, targetX, targetY) + 0.72;
    const net = this.add.image(originX + 45, originY, 'net').setOrigin(0.11, 0.86).setScale(0.28).setRotation(rotation).setDepth(12).setAlpha(0.92);
    this.services.audio.net();

    const hit = this.bugs
      .filter((bug) => bug.active)
      .sort((a, b) => Phaser.Math.Distance.Between(pointer.worldX, pointer.worldY, a.x, a.y) - Phaser.Math.Distance.Between(pointer.worldX, pointer.worldY, b.x, b.y))[0];
    const didHit = Boolean(hit && Phaser.Math.Distance.Between(pointer.worldX, pointer.worldY, hit.x, hit.y) <= 82);

    this.tweens.add({
      targets: net,
      x: originX + (targetX - originX) * 0.72,
      y: originY + (targetY - originY) * 0.72,
      scale: 0.58,
      duration: 180,
      yoyo: true,
      ease: 'Sine.out',
      onComplete: () => {
        net.destroy();
        if (!this.ending) this.inputLocked = false;
      },
    });

    if (didHit && hit) this.scoreHit(hit.x, hit.y, hit);
    else {
      this.services.session.recordCapture(false);
      this.services.audio.miss();
      this.showTapRipple(targetX, targetY, 0xffe6f3);
    }
  }

  private scoreHit(x: number, y: number, bug?: FlyingBug): void {
    if (bug) {
      const index = this.bugs.indexOf(bug);
      if (index >= 0) this.bugs.splice(index, 1);
      this.tweens.add({ targets: bug, scale: 0, angle: 90, alpha: 0, duration: 180, onComplete: () => bug.destroy() });
    }

    const result = this.services.session.recordCapture(true);
    this.services.ui.updateScore(this.services.session.level.id, result.score, result.target);
    this.services.audio.sparkle();
    this.showStar(x, y);

    if (result.completed) {
      this.ending = true;
      this.inputLocked = true;
      this.time.delayedCall(700, () => {
        this.scene.start(result.status === 'game-complete' ? 'Final' : 'Complete');
      });
    } else if (bug) {
      this.time.delayedCall(this.services.session.level.respawnDelayMs, () => this.spawnBug());
    }
  }

  private showStar(x: number, y: number): void {
    const glow = this.add.image(x, y, 'glow').setScale(0.25).setDepth(15);
    const star = this.add.image(x, y, 'star').setScale(0.2).setDepth(16);
    this.tweens.add({ targets: glow, scale: 1.15, alpha: 0, duration: 650, onComplete: () => glow.destroy() });
    this.tweens.add({ targets: star, y: y - 80, scale: 0.85, angle: 140, alpha: 0, duration: 720, ease: 'Back.out', onComplete: () => star.destroy() });
  }

  private showTapRipple(x: number, y: number, color: number): void {
    const ring = this.add.circle(x, y, 12).setStrokeStyle(5, color, 0.9).setDepth(14);
    this.tweens.add({ targets: ring, scale: 2.7, alpha: 0, duration: 430, onComplete: () => ring.destroy() });
  }

  private spawnBug(delay = 0): void {
    this.time.delayedCall(delay, () => {
      if (this.ending || this.services.session.status !== 'playing') return;
      const speed = Phaser.Math.FloatBetween(this.services.session.level.minSpeed, this.services.session.level.maxSpeed);
      const angle = Phaser.Math.FloatBetween(-Math.PI, Math.PI);
      const bug = this.add.image(
        Phaser.Math.Between(365, 1180),
        Phaser.Math.Between(150, 485),
        'bug',
      ).setScale(Phaser.Math.FloatBetween(0.66, 0.84)).setDepth(6) as FlyingBug;
      bug.velocityX = Math.cos(angle) * speed;
      bug.velocityY = Math.sin(angle) * speed * 0.58;
      bug.turnAt = this.time.now + Phaser.Math.Between(1200, 2600);
      bug.phase = Phaser.Math.FloatBetween(0, Math.PI * 2);
      this.bugs.push(bug);
      this.tweens.add({ targets: bug, scaleX: bug.scaleX * 1.08, scaleY: bug.scaleY * 0.94, duration: 300, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    });
  }
}

export class CompleteScene extends Phaser.Scene {
  constructor(private readonly services: SceneServices) {
    super('Complete');
  }

  create(): void {
    background(this, 0xffe8ff);
    this.add.rectangle(640, 360, 1280, 720, 0x512257, 0.22);
    this.add.image(170, 565, 'estela').setScale(0.65).setOrigin(0.5, 0.78);
    const fairy = this.add.image(950, 300, 'fairy').setScale(0.94).setDepth(5);
    const glow = this.add.image(950, 300, 'glow').setScale(2.2).setAlpha(0.5);
    addFloatingStars(this, 18, new Phaser.Geom.Rectangle(650, 80, 500, 470));
    this.tweens.add({ targets: [fairy, glow], y: '-=22', duration: 980, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.services.audio.fanfare();
    this.services.ui.showComplete();
  }
}

export class FinalScene extends Phaser.Scene {
  constructor(private readonly services: SceneServices) {
    super('Final');
  }

  create(): void {
    background(this, 0xfff0d6);
    this.add.rectangle(640, 360, 1280, 720, 0x6d1d65, 0.18);
    const estela = this.add.image(190, 555, 'estela').setScale(0.72).setOrigin(0.5, 0.78);
    const fairy = this.add.image(1040, 265, 'fairy').setScale(1.06);
    this.add.image(1040, 265, 'glow').setScale(2.8).setAlpha(0.54);
    addFloatingStars(this, 28, new Phaser.Geom.Rectangle(50, 40, 1160, 590));
    this.tweens.add({ targets: estela, angle: { from: -2, to: 2 }, duration: 650, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: fairy, y: '-=28', duration: 820, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.services.audio.fanfare();
    this.services.ui.showFinal();
  }
}
