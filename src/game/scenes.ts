import Phaser from 'phaser';
import { GameAudio } from './audio';
import { createArtTextures } from './art';
import { createEstelaRig, preloadCharacter, registerCharacterAnimations, type EstelaRig } from './character';
import { GameSession } from './session';
import type { SpellType } from './spells';
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
  kind: 'good' | 'bowser' | 'boss';
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
    preloadCharacter(this);
  }

  create(): void {
    createArtTextures(this);
    registerCharacterAnimations(this);
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
    const estela = createEstelaRig(this, 205, 636, 1.06).setDepth(4);
    const net = this.add.image(310, 520, 'net').setScale(0.58).setRotation(-0.18);
    addFloatingStars(this, 10, new Phaser.Geom.Rectangle(40, 70, 520, 520));
    this.tweens.add({ targets: [estela.root, net, glow], y: '-=10', duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.services.ui.showTitle();
  }
}

export class GameScene extends Phaser.Scene {
  private readonly bugs: FlyingBug[] = [];
  private inputLocked = false;
  private ending = false;
  private estelaRig?: EstelaRig;
  private selectedSpell: SpellType = 'star';
  private lastTimerUpdate = 0;

  constructor(private readonly services: SceneServices) {
    super('Game');
  }

  create(): void {
    this.bugs.length = 0;
    this.inputLocked = false;
    this.ending = false;
    this.selectedSpell = 'star';
    this.lastTimerUpdate = 0;
    background(this);
    this.add.rectangle(640, 360, 1280, 720, 0xfff4ca, 0.035);
    this.estelaRig = createEstelaRig(this, 150, 654, 0.88).setDepth(8);
    this.add.image(215, 614, 'net').setScale(0.34).setRotation(-0.23).setDepth(7).setAlpha(0.86);

    const { level } = this.services.session;
    this.services.ui.showGame(
      level.id,
      this.services.session.score,
      level.targetScore,
      this.services.session.bowserScore,
      level.bowserLimit,
      level.kind === 'boss',
    );
    if (level.kind === 'boss') {
      this.spawnBoss();
      this.spawnBossMinions(level.bowserCount);
    } else this.spawnSwarm(level.bugCount, level.bowserCount);

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
    if (time - this.lastTimerUpdate >= 80) {
      this.services.ui.updateTimer(this.services.session.timing);
      this.lastTimerUpdate = time;
    }
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
      const minX = bug.kind === 'boss' ? 475 : 345;
      const maxX = bug.kind === 'boss' ? 1080 : 1205;
      const minY = bug.kind === 'boss' ? 205 : 135;
      const maxY = bug.kind === 'boss' ? 430 : 505;
      if (bug.x < minX || bug.x > maxX) {
        bug.x = Phaser.Math.Clamp(bug.x, minX, maxX);
        bug.velocityX *= -1;
      }
      if (bug.y < minY || bug.y > maxY) {
        bug.y = Phaser.Math.Clamp(bug.y, minY, maxY);
        bug.velocityY *= -1;
      }
    }
  }

  debugScorePoint(): void {
    if (this.ending || this.services.session.status !== 'playing') return;
    if (this.services.session.level.kind === 'boss') this.scoreBossHit(730, 280);
    else {
      const bug = this.bugs.find((candidate) => candidate.active && candidate.kind === 'good');
      if (bug) this.scoreHit(bug.x, bug.y, bug);
    }
  }

  debugScoreBowserPoint(): void {
    if (this.ending || this.services.session.status !== 'playing') return;
    const bug = this.bugs.find((candidate) => candidate.active && candidate.kind === 'bowser');
    if (bug) this.scoreHit(bug.x, bug.y, bug);
  }

  debugBugCount(kind: FlyingBug['kind'] = 'good'): number {
    return this.bugs.filter((bug) => bug.active && bug.kind === kind).length;
  }

  selectSpell(spell: SpellType): void {
    this.selectedSpell = spell;
    this.services.ui.setSelectedSpell(spell);
  }

  debugBugPosition(kind: FlyingBug['kind'] = 'good'): { x: number; y: number } | undefined {
    const bug = this.bugs.find((candidate) => candidate.active && candidate.kind === kind);
    return bug ? { x: bug.x, y: bug.y } : undefined;
  }

  debugCharacterState(): { estela: string; lumi: string; lumiVisible: boolean } | undefined {
    if (!this.estelaRig) return undefined;
    return {
      estela: this.estelaRig.estela.anims.currentAnim?.key ?? '',
      lumi: this.estelaRig.lumi.anims.currentAnim?.key ?? '',
      lumiVisible: this.estelaRig.lumi.visible,
    };
  }

  private handleCapture(pointer: Phaser.Input.Pointer): void {
    if (this.inputLocked || this.ending || this.services.session.status !== 'playing') return;
    if (this.services.session.level.kind === 'boss') {
      this.handleBossSpell(pointer);
      return;
    }
    this.inputLocked = true;
    const targetX = Phaser.Math.Clamp(pointer.worldX, 275, 1220);
    const targetY = Phaser.Math.Clamp(pointer.worldY, 90, 590);
    const originX = this.estelaRig?.root.x ?? 150;
    const originY = (this.estelaRig?.root.y ?? 654) - 90;
    const rotation = Phaser.Math.Angle.Between(originX, originY, targetX, targetY) + 0.72;
    const net = this.add.image(originX + 45, originY, 'net').setOrigin(0.11, 0.86).setScale(0.28).setRotation(rotation).setDepth(12).setAlpha(0.92);
    this.estelaRig?.play('magic', true).playLumi('react', true);
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
      this.services.session.recordCapture('miss');
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

    const kind = bug?.kind === 'bowser' ? 'bowser' : 'good';
    const result = this.services.session.recordCapture(kind);
    this.services.ui.updateScore(
      this.services.session.level.id,
      result.score,
      result.target,
      result.bowserScore,
      result.bowserLimit,
    );
    if (kind === 'bowser') {
      this.services.audio.danger();
      this.showBowserPenalty(x, y);
    } else {
      this.services.audio.sparkle();
      this.showStar(x, y);
    }

    if (result.failed) {
      this.ending = true;
      this.inputLocked = true;
      this.time.delayedCall(520, () => this.scene.start('Failed'));
    } else if (result.completed) {
      this.ending = true;
      this.inputLocked = true;
      this.time.delayedCall(700, () => {
        this.scene.start(result.status === 'game-complete' ? 'Final' : 'Complete');
      });
    }
  }

  private handleBossSpell(pointer: Phaser.Input.Pointer): void {
    const boss = this.bugs.find((bug) => bug.active && bug.kind === 'boss');
    if (!boss) return;
    this.inputLocked = true;
    this.estelaRig?.play('magic', true).playLumi('react', true);
    this.services.audio.net();

    const targetX = Phaser.Math.Clamp(pointer.worldX, 300, 1210);
    const targetY = Phaser.Math.Clamp(pointer.worldY, 90, 590);
    const target = this.bugs
      .filter((bug) => bug.active)
      .sort((a, b) => Phaser.Math.Distance.Between(pointer.worldX, pointer.worldY, a.x, a.y) - Phaser.Math.Distance.Between(pointer.worldX, pointer.worldY, b.x, b.y))[0];
    const didHit = Boolean(target && Phaser.Math.Distance.Between(pointer.worldX, pointer.worldY, target.x, target.y) <= (target.kind === 'boss' ? 180 : 82));
    const colors: Record<SpellType, number> = { star: 0xffd21f, lightning: 0x67ddff, rainbow: 0xff65c5 };
    const texture = this.selectedSpell === 'rainbow' ? 'glow' : 'star';
    const projectile = this.add.image(225, 545, texture)
      .setTint(colors[this.selectedSpell])
      .setScale(this.selectedSpell === 'lightning' ? 0.32 : 0.4)
      .setDepth(18);
    if (this.selectedSpell === 'lightning') projectile.setScale(0.22, 0.72).setAngle(18);

    this.tweens.add({
      targets: projectile,
      x: targetX,
      y: targetY,
      angle: projectile.angle + 220,
      scale: this.selectedSpell === 'rainbow' ? 1.1 : 0.72,
      duration: 260,
      ease: 'Quad.in',
      onComplete: () => {
        projectile.destroy();
        if (didHit && target?.kind === 'bowser') this.scoreHit(target.x, target.y, target);
        else if (didHit) this.scoreBossHit(boss.x, boss.y);
        else {
          this.services.session.recordCapture('miss');
          this.services.audio.miss();
          this.showTapRipple(targetX, targetY, colors[this.selectedSpell]);
        }
        if (!this.ending) this.inputLocked = false;
      },
    });
  }

  private scoreBossHit(x: number, y: number): void {
    const boss = this.bugs.find((bug) => bug.active && bug.kind === 'boss');
    const result = this.services.session.recordCapture('good');
    this.services.ui.updateScore(this.services.session.level.id, result.score, result.target, result.bowserScore, result.bowserLimit);
    this.services.audio.sparkle();
    this.showStar(x, y);
    if (boss) this.tweens.add({ targets: boss, alpha: 0.3, duration: 85, yoyo: true, repeat: 2 });

    if (result.completed) {
      this.ending = true;
      this.inputLocked = true;
      this.time.delayedCall(900, () => this.scene.start('Final'));
    }
  }

  private showStar(x: number, y: number): void {
    const glow = this.add.image(x, y, 'glow').setScale(0.25).setDepth(15);
    const star = this.add.image(x, y, 'star').setScale(0.2).setDepth(16);
    this.tweens.add({ targets: glow, scale: 1.15, alpha: 0, duration: 650, onComplete: () => glow.destroy() });
    this.tweens.add({ targets: star, y: y - 80, scale: 0.85, angle: 140, alpha: 0, duration: 720, ease: 'Back.out', onComplete: () => star.destroy() });
  }

  private showBowserPenalty(x: number, y: number): void {
    const warning = this.add.text(x, y, 'BOWSER +1', {
      color: '#ffffff',
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '30px',
      fontStyle: 'bold',
      stroke: '#5d167d',
      strokeThickness: 7,
    }).setOrigin(0.5).setDepth(17);
    const ring = this.add.circle(x, y, 20).setStrokeStyle(7, 0xb84be4, 0.95).setDepth(16);
    this.tweens.add({ targets: warning, y: y - 75, alpha: 0, scale: 1.25, duration: 720, onComplete: () => warning.destroy() });
    this.tweens.add({ targets: ring, scale: 3.1, alpha: 0, duration: 520, onComplete: () => ring.destroy() });
  }

  private showTapRipple(x: number, y: number, color: number): void {
    const ring = this.add.circle(x, y, 12).setStrokeStyle(5, color, 0.9).setDepth(14);
    this.tweens.add({ targets: ring, scale: 2.7, alpha: 0, duration: 430, onComplete: () => ring.destroy() });
  }

  private spawnSwarm(goodCount: number, bowserCount: number): void {
    const kinds: Array<'good' | 'bowser'> = [
      ...Array.from({ length: goodCount }, () => 'good' as const),
      ...Array.from({ length: bowserCount }, () => 'bowser' as const),
    ];
    Phaser.Utils.Array.Shuffle(kinds);
    const count = kinds.length;
    const columns = Math.ceil(Math.sqrt(count * 2.35));
    const rows = Math.ceil(count / columns);
    const scaleMin = count >= 38 ? 0.45 : count >= 30 ? 0.49 : count >= 22 ? 0.54 : 0.6;
    for (let index = 0; index < count; index += 1) {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const x = 380 + ((column + 0.5) / columns) * 800 + Phaser.Math.Between(-14, 14);
      const y = 140 + ((row + 0.5) / rows) * 350 + Phaser.Math.Between(-12, 12);
      this.spawnBug(x, y, Phaser.Math.FloatBetween(scaleMin, scaleMin + 0.1), kinds[index] ?? 'good');
    }
  }

  private spawnBug(x: number, y: number, scale: number, kind: 'good' | 'bowser'): void {
    const speed = Phaser.Math.FloatBetween(this.services.session.level.minSpeed, this.services.session.level.maxSpeed);
    const angle = Phaser.Math.FloatBetween(-Math.PI, Math.PI);
    const bug = this.add.image(x, y, kind === 'bowser' ? 'bowser-bug' : 'bug').setScale(scale).setDepth(6) as FlyingBug;
    bug.velocityX = Math.cos(angle) * speed;
    bug.velocityY = Math.sin(angle) * speed * 0.58;
    bug.turnAt = this.time.now + Phaser.Math.Between(900, 2100);
    bug.phase = Phaser.Math.FloatBetween(0, Math.PI * 2);
    bug.kind = kind;
    this.bugs.push(bug);
    this.tweens.add({ targets: bug, scaleX: bug.scaleX * 1.08, scaleY: bug.scaleY * 0.94, duration: 300, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }

  private spawnBoss(): void {
    const speed = Phaser.Math.FloatBetween(this.services.session.level.minSpeed, this.services.session.level.maxSpeed);
    const angle = Phaser.Math.FloatBetween(-Math.PI, Math.PI);
    const boss = this.add.image(820, 310, 'bug').setScale(2.2).setDepth(7) as FlyingBug;
    boss.velocityX = Math.cos(angle) * speed;
    boss.velocityY = Math.sin(angle) * speed * 0.45;
    boss.turnAt = this.time.now + 1800;
    boss.phase = 0;
    boss.kind = 'boss';
    this.bugs.push(boss);
    this.tweens.add({ targets: boss, scaleX: 2.32, scaleY: 2.08, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }

  private spawnBossMinions(count: number): void {
    const positions = [
      { x: 440, y: 190 },
      { x: 1150, y: 185 },
      { x: 500, y: 450 },
      { x: 1090, y: 455 },
      { x: 790, y: 485 },
    ];
    for (let index = 0; index < count; index += 1) {
      const position = positions[index] ?? { x: Phaser.Math.Between(400, 1160), y: Phaser.Math.Between(160, 480) };
      this.spawnBug(position.x, position.y, 0.76, 'bowser');
    }
  }
}

export class FailedScene extends Phaser.Scene {
  constructor(private readonly services: SceneServices) {
    super('Failed');
  }

  create(): void {
    background(this, 0xe8c9ff);
    this.add.rectangle(640, 360, 1280, 720, 0x361148, 0.38);
    createEstelaRig(this, 175, 646, 0.84).setDepth(5).play('damage').playLumi('react');
    const bowserBug = this.add.image(1010, 300, 'bowser-bug').setScale(1.75).setDepth(5);
    const glow = this.add.image(1010, 300, 'glow').setTint(0xb84be4).setScale(2.4).setAlpha(0.38);
    this.tweens.add({ targets: [bowserBug, glow], y: '-=20', angle: { from: -4, to: 4 }, duration: 650, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.services.audio.danger();
    this.services.ui.showFailed(
      this.services.session.timing,
      this.services.session.bowserScore,
      this.services.session.level.bowserLimit,
    );
  }
}

export class CompleteScene extends Phaser.Scene {
  constructor(private readonly services: SceneServices) {
    super('Complete');
  }

  create(): void {
    background(this, 0xffe8ff);
    this.add.rectangle(640, 360, 1280, 720, 0x512257, 0.22);
    createEstelaRig(this, 175, 646, 0.84).setDepth(5).play('celebrate').playLumi('celebrate');
    const fairy = this.add.image(950, 300, 'fairy').setScale(0.94).setDepth(5);
    const glow = this.add.image(950, 300, 'glow').setScale(2.2).setAlpha(0.5);
    addFloatingStars(this, 18, new Phaser.Geom.Rectangle(650, 80, 500, 470));
    this.tweens.add({ targets: [fairy, glow], y: '-=22', duration: 980, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.services.audio.fanfare();
    this.services.ui.showComplete(this.services.session.timing);
  }
}

export class FinalScene extends Phaser.Scene {
  constructor(private readonly services: SceneServices) {
    super('Final');
  }

  create(): void {
    background(this, 0xfff0d6);
    this.add.rectangle(640, 360, 1280, 720, 0x6d1d65, 0.18);
    const estela = createEstelaRig(this, 190, 648, 0.9).setDepth(5).play('celebrate').playLumi('celebrate');
    const fairy = this.add.image(1040, 265, 'fairy').setScale(1.06);
    this.add.image(1040, 265, 'glow').setScale(2.8).setAlpha(0.54);
    addFloatingStars(this, 28, new Phaser.Geom.Rectangle(50, 40, 1160, 590));
    this.tweens.add({ targets: estela.root, angle: { from: -2, to: 2 }, duration: 650, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: fairy, y: '-=28', duration: 820, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.services.audio.fanfare();
    this.services.ui.showFinal(this.services.session.timing);
  }
}
