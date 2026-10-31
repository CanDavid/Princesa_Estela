import Phaser from 'phaser';
import './style.css';
import { GameAudio } from './game/audio';
import { BootScene, CompleteScene, FinalScene, GameScene, TitleScene } from './game/scenes';
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
    new CompleteScene(services),
    new FinalScene(services),
  ],
});

function openGameFrom(sceneKey: 'Title' | 'Complete' | 'Final'): void {
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
  toggleMute: () => {
    session.muted = !session.muted;
    audio.setMuted(session.muted);
    ui.setMuted(session.muted);
  },
});

document.addEventListener('visibilitychange', () => {
  game.loop.sleep();
  if (!document.hidden) game.loop.wake();
  void audio.handleVisibility(document.hidden);
});

if (import.meta.env.DEV) {
  window.__ESTELA_TEST__ = {
    scorePoint: () => {
      const scene = game.scene.getScene('Game');
      if (scene instanceof GameScene) scene.debugScorePoint();
    },
    bugPosition: () => {
      const scene = game.scene.getScene('Game');
      return scene instanceof GameScene ? scene.debugBugPosition() : undefined;
    },
    characterState: () => {
      const scene = game.scene.getScene('Game');
      return scene instanceof GameScene ? scene.debugCharacterState() : undefined;
    },
    activeScenes: () => game.scene.getScenes(true).map((scene) => scene.scene.key),
    state: () => ({ level: session.levelIndex + 1, score: session.score, status: session.status, muted: session.muted }),
  };
}

declare global {
  interface Window {
    __ESTELA_TEST__?: {
      scorePoint: () => void;
      bugPosition: () => { x: number; y: number } | undefined;
      characterState: () => { estela: string; lumi: string; lumiVisible: boolean } | undefined;
      activeScenes: () => string[];
      state: () => { level: number; score: number; status: string; muted: boolean };
    };
  }
}
