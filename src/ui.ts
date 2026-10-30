interface UiActions {
  start: () => void;
  next: () => void;
  replay: () => void;
  toggleMute: () => void;
}

const byId = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Falta el elemento #${id}`);
  return element as T;
};

export class GameUi {
  private readonly loading = byId('loading-screen');
  private readonly title = byId('title-screen');
  private readonly complete = byId('complete-screen');
  private readonly final = byId('final-screen');
  private readonly hud = byId('hud');
  private readonly levelValue = byId('level-value');
  private readonly scoreValue = byId('score-value');
  private readonly targetValue = byId('target-value');
  private readonly muteButton = byId<HTMLButtonElement>('mute-button');

  bind(actions: UiActions): void {
    byId<HTMLButtonElement>('start-button').addEventListener('click', actions.start);
    byId<HTMLButtonElement>('next-button').addEventListener('click', actions.next);
    byId<HTMLButtonElement>('replay-button').addEventListener('click', actions.replay);
    this.muteButton.addEventListener('click', actions.toggleMute);
  }

  showLoading(): void {
    this.hideAll();
    this.loading.classList.add('is-visible');
  }

  showTitle(): void {
    this.hideAll();
    this.title.classList.add('is-visible');
    byId<HTMLButtonElement>('start-button').focus({ preventScroll: true });
  }

  showGame(level: number, score: number, target: number): void {
    this.hideAll();
    this.hud.classList.add('is-visible');
    this.updateScore(level, score, target);
  }

  showComplete(): void {
    this.hideAll();
    this.complete.classList.add('is-visible');
    this.muteButton.parentElement?.classList.add('is-visible');
    byId<HTMLButtonElement>('next-button').focus({ preventScroll: true });
  }

  showFinal(): void {
    this.hideAll();
    this.final.classList.add('is-visible');
    this.muteButton.parentElement?.classList.add('is-visible');
    byId<HTMLButtonElement>('replay-button').focus({ preventScroll: true });
  }

  updateScore(level: number, score: number, target: number): void {
    this.levelValue.textContent = String(level);
    this.scoreValue.textContent = String(score);
    this.targetValue.textContent = String(target);
  }

  setMuted(muted: boolean): void {
    this.muteButton.textContent = muted ? '🔇' : '🔊';
    this.muteButton.setAttribute('aria-label', muted ? 'Activar sonido' : 'Silenciar sonido');
    this.muteButton.setAttribute('aria-pressed', String(muted));
  }

  private hideAll(): void {
    [this.loading, this.title, this.complete, this.final, this.hud].forEach((element) => element.classList.remove('is-visible'));
  }
}
