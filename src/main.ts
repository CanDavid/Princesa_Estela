import Phaser from 'phaser';
import './style.css';
import { GameAudio } from './game/audio';
import { BootScene, CompleteScene, FailedScene, FinalScene, GameScene, TitleScene } from './game/scenes';
import { GameSession } from './game/session';
import { GameUi } from './ui';

const session = new GameSession();
const audio = new GameAudio();
const ui = new GameUi();
const services = { session, audio, ui };

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game-canvas',
  width: 1280,
  height: 720,
  backgroundColor: '#80c9f3',
  transparent: false,
  antialias: true,
  render: { pixelArt: false, roundPixels: false },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720,
  },
  scene: [
    new BootScene(services),
    new TitleScene(services),
    new GameScene(services),
    new FailedScene(services),
    new CompleteScene(services),
    new FinalScene(services),
  ],
});

function openGameFrom(sceneKey: 'Title' | 'Failed' | 'Complete' | 'Final'): void {
  if (game.scene.isActive(sceneKey)) game.scene.stop(sceneKey);
  game.scene.start('Game');
  game.scene.bringToTop('Game');
}

ui.bind({
  start: () => {
    void audio.unlock();
    session.startGame();
    openGameFrom('Title');
  },
  next: () => {
    if (session.status !== 'level-complete') return;
    session.advanceLevel();
    openGameFrom('Complete');
  },
  replay: () => {
    session.reset();
    session.startGame();
    openGameFrom('Final');
  },
  retry: () => {
    if (session.status !== 'level-failed') return;
    session.retryLevel();
    openGameFrom('Failed');
  },
  toggleMute: () => {
    session.muted = !session.muted;
    audio.setMuted(session.muted);
    ui.setMuted(session.muted);
  },
  selectSpell: (spell) => {
    const scene = game.scene.getScene('Game');
    if (scene instanceof GameScene) scene.selectSpell(spell);
  },
});

document.addEventListener('visibilitychange', () => {
  game.loop.sleep();
  if (document.hidden) session.pauseTimer();
  else {
    session.resumeTimer();
    game.loop.wake();
  }
  void audio.handleVisibility(document.hidden);
});

if (import.meta.env.DEV) {
  window.__ESTELA_TEST__ = {
    startLevel: (levelNumber) => {
      session.startGame();
      for (let index = 1; index < levelNumber; index += 1) {
        for (let score = 0; score < session.level.targetScore; score += 1) session.recordCapture('good');
        session.advanceLevel();
      }
      for (const scene of game.scene.getScenes(true)) game.scene.stop(scene.scene.key);
      game.scene.start('Game');
      game.scene.bringToTop('Game');
    },
    scorePoint: () => {
      const scene = game.scene.getScene('Game');
      if (scene instanceof GameScene) scene.debugScorePoint();
    },
    scoreBowserPoint: () => {
      const scene = game.scene.getScene('Game');
      if (scene instanceof GameScene) scene.debugScoreBowserPoint();
    },
    bugPosition: () => {
      const scene = game.scene.getScene('Game');
      return scene instanceof GameScene ? scene.debugBugPosition() : undefined;
    },
    bowserPosition: () => {
      const scene = game.scene.getScene('Game');
      return scene instanceof GameScene ? scene.debugBugPosition('bowser') : undefined;
    },
    bossPosition: () => {
      const scene = game.scene.getScene('Game');
      return scene instanceof GameScene ? scene.debugBugPosition('boss') : undefined;
    },
    bugCount: () => {
      const scene = game.scene.getScene('Game');
      return scene instanceof GameScene ? scene.debugBugCount() : 0;
    },
    bowserBugCount: () => {
      const scene = game.scene.getScene('Game');
      return scene instanceof GameScene ? scene.debugBugCount('bowser') : 0;
    },
    characterState: () => {
      const scene = game.scene.getScene('Game');
      return scene instanceof GameScene ? scene.debugCharacterState() : undefined;
    },
    activeScenes: () => game.scene.getScenes(true).map((scene) => scene.scene.key),
    state: () => ({ level: session.levelIndex + 1, score: session.score, bowserScore: session.bowserScore, status: session.status, muted: session.muted, timing: session.timing }),
  };
}

declare global {
  interface Window {
    __ESTELA_TEST__?: {
      startLevel: (levelNumber: number) => void;
      scorePoint: () => void;
      scoreBowserPoint: () => void;
      bugPosition: () => { x: number; y: number } | undefined;
      bowserPosition: () => { x: number; y: number } | undefined;
      bossPosition: () => { x: number; y: number } | undefined;
      bugCount: () => number;
      bowserBugCount: () => number;
      characterState: () => { estela: string; lumi: string; lumiVisible: boolean } | undefined;
      activeScenes: () => string[];
      state: () => { level: number; score: number; bowserScore: number; status: string; muted: boolean; timing: { levelMs: number; totalMs: number } };
    };
  }
}
