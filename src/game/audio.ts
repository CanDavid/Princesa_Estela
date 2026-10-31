type AudioWindow = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext };

export class GameAudio {
  private context?: AudioContext;
  private master?: GainNode;
  private melodyStep = 0;
  private started = false;
  private muted = false;

  async unlock(): Promise<void> {
    if (!this.context) {
      const Context = window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
      if (!Context) return;
      this.context = new Context();
      this.master = this.context.createGain();
      this.master.gain.value = this.muted ? 0 : 0.72;
      this.master.connect(this.context.destination);
    }
    await this.context.resume();
    if (!this.started) {
      this.started = true;
      this.startMusic();
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.context && this.master) {
      this.master.gain.setTargetAtTime(muted ? 0 : 0.72, this.context.currentTime, 0.025);
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  async handleVisibility(hidden: boolean): Promise<void> {
    if (!this.context || !this.started) return;
    if (hidden) await this.context.suspend();
    else if (!this.muted) await this.context.resume();
  }

  net(): void {
    this.tone(220, 0.11, 'triangle', 0.07, 430);
  }

  miss(): void {
    this.tone(180, 0.09, 'sine', 0.035, 140);
  }

  danger(): void {
    this.tone(220, 0.16, 'square', 0.055, 120);
    window.setTimeout(() => this.tone(150, 0.2, 'triangle', 0.05, 90), 90);
  }

  sparkle(): void {
    this.tone(660, 0.16, 'sine', 0.08, 990);
    window.setTimeout(() => this.tone(990, 0.18, 'sine', 0.07, 1320), 80);
  }

  bugChirp(): void {
    const start = 470 + Math.random() * 140;
    this.tone(start, 0.07, 'sine', 0.025, start * 1.45);
  }

  fanfare(): void {
    [523, 659, 784, 1047].forEach((frequency, index) => {
      window.setTimeout(() => this.tone(frequency, 0.28, 'triangle', 0.09), index * 120);
    });
  }

  private startMusic(): void {
    const melody = [262, 330, 392, 330, 294, 349, 440, 349];
    const playStep = () => {
      const note = melody[this.melodyStep % melody.length] ?? 262;
      this.melodyStep += 1;
      this.tone(note, 0.72, 'sine', 0.018);
      this.tone(note / 2, 0.82, 'triangle', 0.011);
    };
    playStep();
    window.setInterval(playStep, 780);
  }

  private tone(frequency: number, duration: number, type: OscillatorType, volume: number, endFrequency?: number): void {
    if (!this.context || !this.master || this.context.state !== 'running') return;
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(this.master);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.03);
  }
}
