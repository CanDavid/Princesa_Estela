import type { GameTiming } from './game/session';
import { SPELLS, type SpellType } from './game/spells';

interface UiActions {
  start: () => void;
  next: () => void;
  replay: () => void;
  toggleMute: () => void;
  selectSpell: (spell: SpellType) => void;
}

const byId = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Falta el elemento #${id}`);
  return element as T;
};

export function formatDuration(milliseconds: number): string {
  const totalTenths = Math.max(0, Math.floor(milliseconds / 100));
  const minutes = Math.floor(totalTenths / 600);
  const seconds = Math.floor((totalTenths % 600) / 10);
  const tenths = totalTenths % 10;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${tenths}`;
}

export class GameUi {
  private readonly loading = byId('loading-screen');
  private readonly title = byId('title-screen');
  private readonly complete = byId('complete-screen');
  private readonly final = byId('final-screen');
  private readonly hud = byId('hud');
  private readonly levelValue = byId('level-value');
  private readonly scoreValue = byId('score-value');
  private readonly targetValue = byId('target-value');
  private readonly scoreLabel = byId('score-label');
  private readonly timerValue = byId('timer-value');
  private readonly spellBar = byId('spell-bar');
  private readonly muteButton = byId<HTMLButtonElement>('mute-button');

  bind(actions: UiActions): void {
    byId<HTMLButtonElement>('start-button').addEventListener('click', actions.start);
    byId<HTMLButtonElement>('next-button').addEventListener('click', actions.next);
    byId<HTMLButtonElement>('replay-button').addEventListener('click', actions.replay);
    this.muteButton.addEventListener('click', actions.toggleMute);
    for (const button of this.spellBar.querySelectorAll<HTMLButtonElement>('[data-spell]')) {
      button.addEventListener('click', () => {
        const spell = button.dataset.spell as SpellType;
        if (!SPELLS.includes(spell)) return;
        this.setSelectedSpell(spell);
        actions.selectSpell(spell);
      });
    }
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

  showGame(level: number, score: number, target: number, boss = false): void {
    this.hideAll();
    this.hud.classList.add('is-visible');
    this.scoreLabel.textContent = boss ? 'HECHIZOS' : 'CACAS';
    if (boss) this.spellBar.classList.add('is-visible');
    this.setSelectedSpell('star');
    this.updateScore(level, score, target);
  }

  showComplete(timing: GameTiming): void {
    this.hideAll();
    this.complete.classList.add('is-visible');
    this.muteButton.parentElement?.classList.add('is-visible');
    byId('complete-level-time').textContent = formatDuration(timing.levelMs);
    byId('complete-total-time').textContent = formatDuration(timing.totalMs);
    byId<HTMLButtonElement>('next-button').focus({ preventScroll: true });
  }

  showFinal(timing: GameTiming): void {
    this.hideAll();
    this.final.classList.add('is-visible');
    this.muteButton.parentElement?.classList.add('is-visible');
    byId('final-level-time').textContent = formatDuration(timing.levelMs);
    byId('final-total-time').textContent = formatDuration(timing.totalMs);
    byId<HTMLButtonElement>('replay-button').focus({ preventScroll: true });
  }

  updateScore(level: number, score: number, target: number): void {
    this.levelValue.textContent = String(level);
    this.scoreValue.textContent = String(score);
    this.targetValue.textContent = String(target);
  }

  updateTimer(timing: GameTiming): void {
    this.timerValue.textContent = formatDuration(timing.totalMs);
  }

  setSelectedSpell(spell: SpellType): void {
    for (const button of this.spellBar.querySelectorAll<HTMLButtonElement>('[data-spell]')) {
      const selected = button.dataset.spell === spell;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    }
  }

  setMuted(muted: boolean): void {
    this.muteButton.textContent = muted ? '🔇' : '🔊';
    this.muteButton.setAttribute('aria-label', muted ? 'ACTIVAR SONIDO' : 'SILENCIAR SONIDO');
    this.muteButton.setAttribute('aria-pressed', String(muted));
  }

  private hideAll(): void {
    [this.loading, this.title, this.complete, this.final, this.hud].forEach((element) => element.classList.remove('is-visible'));
    this.spellBar.classList.remove('is-visible');
  }
}
