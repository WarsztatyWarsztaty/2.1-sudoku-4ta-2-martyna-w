/**
 * Dźwięki w grze oparte na Web Audio API
 * Działa bez zewnętrznych plików dźwiękowych, błyskawicznie i bez opóźnień
 */

class SoundController {
  constructor() {
    this.audioCtx = null;
    this.muted = localStorage.getItem('sudoku_sound_muted') === 'true';
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  isMuted() {
    return this.muted;
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('sudoku_sound_muted', this.muted);
    return this.muted;
  }

  playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.15) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  playClick() {
    this.playTone(600, 'sine', 0.04, 0.05);
  }

  playPlaceNumber(num = 5) {
    // Częstotliwość dopasowana do wstawianej cyfry 1..9 (akord pentatoniczny)
    const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33];
    const freq = notes[(num - 1) % notes.length] || 440;
    this.playTone(freq, 'triangle', 0.12, 0.1);
  }

  playPencilNote() {
    this.playTone(850, 'sine', 0.03, 0.03);
  }

  playErase() {
    this.playTone(220, 'triangle', 0.08, 0.08);
  }

  playError() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.setValueAtTime(110, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {}
  }

  playSectionComplete() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.audioCtx) return;
      const chords = [523.25, 659.25, 783.99]; // C-E-G
      chords.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, 'sine', 0.2, 0.12);
        }, idx * 60);
      });
    } catch (e) {}
  }

  playWin() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.audioCtx) return;
      // Radosna melodia wygranej
      const notes = [
        { f: 523.25, d: 0.12, delay: 0 },
        { f: 659.25, d: 0.12, delay: 100 },
        { f: 783.99, d: 0.14, delay: 200 },
        { f: 1046.50, d: 0.35, delay: 320 }
      ];
      notes.forEach(n => {
        setTimeout(() => {
          this.playTone(n.f, 'triangle', n.d, 0.18);
        }, n.delay);
      });
    } catch (e) {}
  }
}

window.soundCtrl = new SoundController();
