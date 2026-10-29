// Web Audio API Synthesizer Sound Engine for Sri Ramu Digital Admin
// Browser Autoplay Compliant: No external mp3 files that could 404; pure Web Audio synth!

class SoundAlertManager {
  constructor() {
    this.audioCtx = null;
    this.isMuted = localStorage.getItem('sri_ramu_sound_muted') === 'true';
    this.volume = parseFloat(localStorage.getItem('sri_ramu_sound_volume') || '0.7');
    this.hasUserInteracted = false;

    // Listen for first user click to unlock AudioContext
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        if (!this.hasUserInteracted) {
          this.initContext();
          this.hasUserInteracted = true;
          window.removeEventListener('click', unlockAudio);
          window.removeEventListener('keydown', unlockAudio);
        }
      };
      window.addEventListener('click', unlockAudio);
      window.addEventListener('keydown', unlockAudio);
    }
  }

  initContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    localStorage.setItem('sri_ramu_sound_muted', muted ? 'true' : 'false');
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('sri_ramu_sound_volume', this.volume.toString());
  }

  // Play New Order Alert (Upbeat ascending fanfare: C5 -> E5 -> G5)
  playOrderAlert() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.35 * this.volume, now + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.28);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.3);
    });
  }

  // Play Payment Submitted / Verified Alert (Crisp register chime: E6 -> G#6)
  playPaymentAlert() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const osc1 = this.audioCtx.createOscillator();
    const osc2 = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1318.51, now); // E6
    osc1.frequency.exponentialRampToValueAtTime(1661.22, now + 0.1); // G#6

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1975.53, now); // B6

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.4 * this.volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.6);
    osc2.stop(now + 0.6);
  }

  // Play Urgent Request / Cancellation Alert (Attention chime: A5 -> F5 -> A5)
  playRequestAlert() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const notes = [880, 698.46, 880]; // A5, F5, A5

    notes.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.15);

      gain.gain.setValueAtTime(0, now + idx * 0.15);
      gain.gain.linearRampToValueAtTime(0.3 * this.volume, now + idx * 0.15 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.22);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now + idx * 0.15);
      osc.stop(now + idx * 0.15 + 0.25);
    });
  }

  testSound(type = 'ORDER') {
    this.initContext();
    if (type === 'ORDER') this.playOrderAlert();
    else if (type === 'PAYMENT') this.playPaymentAlert();
    else if (type === 'REQUEST') this.playRequestAlert();
  }
}

const soundManager = new SoundAlertManager();
export default soundManager;
