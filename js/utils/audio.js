const AudioManager = {
  audioContext: null,
  enabled: true,

  init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.log('Web Audio API not supported');
      this.enabled = false;
    }
  },

  playTone(frequency, duration, type = 'sine', volume = 0.3) {
    if (!this.enabled || !this.audioContext) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (e) {
        console.error('Audio play error:', e);
      }
  },

  playCorrect() {
    if (!this.enabled) return;
    
    this.playTone(523.25, 0.1, 'sine', 0.2);
    setTimeout(() => {
      this.playTone(659.25, 0.15, 'sine', 0.2);
    }, 100);
  },

  playWrong() {
    if (!this.enabled) return;
    
    this.playTone(200, 0.3, 'sawtooth', 0.15);
  },

  playClick() {
    if (!this.enabled) return;
    
    this.playTone(800, 0.05, 'sine', 0.1);
  },

  playSuccess() {
    if (!this.enabled) return;
    
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, 0.2, 'sine', 0.2);
      }, index * 150);
    });
  },

  playChallengeStart() {
    if (!this.enabled) return;
    
    this.playTone(440, 0.1, 'sine', 0.2);
    setTimeout(() => {
      this.playTone(554.37, 0.2, 'sine', 0.2);
    }, 100);
  },

  setEnabled(enabled) {
    this.enabled = enabled;
  },

  resumeContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
};
