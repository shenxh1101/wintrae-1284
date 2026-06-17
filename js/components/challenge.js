const ChallengePage = {
  isRunning: false,
  timeLeft: 60,
  timerId: null,
  score: 0,
  combo: 0,
  maxCombo: 0,
  correctCount: 0,
  wrongCount: 0,
  currentQuestion: null,
  questionStartTime: 0,
  isAnswering: false,
  settings: null,

  init() {
    this.settings = Storage.getSettings();
    this.bindEvents();
  },

  bindEvents() {
    const backBtn = document.getElementById('back-from-challenge');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (this.isRunning) {
          this.showQuitConfirm();
        } else {
          this.reset();
          App.navigateTo('home');
        }
      });
    }

    const startBtn = document.getElementById('start-challenge');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        this.startChallenge();
      });
    }

    const retryBtn = document.getElementById('challenge-retry');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.startChallenge();
      });
    }

    const backBtn2 = document.getElementById('challenge-back');
    if (backBtn2) {
      backBtn2.addEventListener('click', () => {
        this.showStartScreen();
      });
    }

    KeyListener.onKeyCombination((data) => {
      if (document.getElementById('page-challenge').classList.contains('active') &&
          this.isRunning && this.isAnswering) {
        this.checkAnswer(data.keys, data.event);
      }
    });
  },

  startChallenge() {
    this.timeLeft = this.settings.challengeTime || 60;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.isRunning = true;

    document.getElementById('challenge-start').style.display = 'none';
    document.getElementById('challenge-result').style.display = 'none';
    document.getElementById('challenge-game').style.display = 'block';

    this.updateTimerDisplay();
    this.updateStatsDisplay();
    this.nextQuestion();
    this.startTimer();

    AudioManager.playChallengeStart();
    AudioManager.resumeContext();
  },

  startTimer() {
    this.timerId = setInterval(() => {
      this.timeLeft--;
      this.updateTimerDisplay();

      if (this.timeLeft <= 10) {
        const timerEl = document.querySelector('.challenge-timer');
        if (timerEl) {
          timerEl.classList.add('warning');
        }
      }

      if (this.timeLeft <= 0) {
        this.endChallenge();
      }
    }, 1000);
  },

  stopTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  },

  updateTimerDisplay() {
    const timeEl = document.getElementById('challenge-time');
    if (timeEl) {
      timeEl.textContent = this.timeLeft;
    }
  },

  nextQuestion() {
    const shortcuts = shortcutData.challengeShortcuts;
    const randomIndex = Math.floor(Math.random() * shortcuts.length);
    this.currentQuestion = shortcuts[randomIndex];
    this.questionStartTime = Date.now();
    this.isAnswering = true;
    KeyListener.clearPressedKeys();

    const taskAction = document.getElementById('challenge-task-action');
    const keyDisplay = document.getElementById('challenge-key-display');
    const feedback = document.getElementById('challenge-feedback');

    if (taskAction) taskAction.textContent = this.currentQuestion.action;
    if (keyDisplay) keyDisplay.innerHTML = '<div class="key-hint">准备...</div>';
    if (feedback) {
      feedback.textContent = '';
      feedback.className = 'feedback';
    }
  },

  checkAnswer(pressedKeys, event) {
    if (!this.currentQuestion || !this.isAnswering || !this.isRunning) return;

    const targetKeys = this.currentQuestion.keys;
    const keyDisplay = document.getElementById('challenge-key-display');
    
    if (keyDisplay && this.settings.keyHint) {
      keyDisplay.innerHTML = KeyListener.renderKeyCaps(pressedKeys);
    }

    const isCorrect = KeyListener.checkCombination(targetKeys);

    if (isCorrect) {
      this.handleCorrect();
    } else if (pressedKeys.length >= targetKeys.length) {
      const hasModifier = pressedKeys.some(k => KeyListener.isModifierKey(k));
      
      if (targetKeys.length === 1) {
        if (!hasModifier && pressedKeys.length === 1 && !KeyListener.isModifierKey(pressedKeys[0])) {
          this.handleWrong();
          return;
        }
      }
      
      if (pressedKeys.length >= targetKeys.length) {
        this.handleWrong();
      }
    }
  },

  handleCorrect() {
    if (!this.isRunning) return;
    
    this.isAnswering = false;
    
    const reactionTime = Date.now() - this.questionStartTime;
    this.correctCount++;
    this.combo++;
    
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }

    const baseScore = 10;
    const comboBonus = Math.min(this.combo * 2, 20);
    const timeBonus = Math.max(0, Math.floor((3000 - reactionTime) / 100));
    const totalPoints = baseScore + comboBonus + timeBonus;
    this.score += totalPoints;

    const feedback = document.getElementById('challenge-feedback');
    if (feedback) {
      feedback.textContent = `✅ +${totalPoints}分 (连击 ${this.combo})`;
      feedback.className = 'feedback correct';
    }

    AudioManager.playCorrect();
    
    Storage.recordPractice({
      mode: 'challenge',
      category: this.currentQuestion.category || null,
      correct: true,
      reactionTime: reactionTime,
      combo: this.combo
    });
    
    this.updateStatsDisplay();

    setTimeout(() => {
      if (this.isRunning) {
        this.nextQuestion();
      }
    }, 500);
  },

  handleWrong() {
    if (!this.isRunning) return;
    
    this.isAnswering = false;
    this.wrongCount++;
    if (this.combo > 0) {
      this.combo = 0;
    }

    const feedback = document.getElementById('challenge-feedback');
    if (feedback) {
      const correctKeys = KeyListener.formatKeys(this.currentQuestion.keys);
      feedback.textContent = `❌ 正确答案：${correctKeys}`;
      feedback.className = 'feedback wrong';
    }

    AudioManager.playWrong();
    
    Storage.recordPractice({
      mode: 'challenge',
      category: this.currentQuestion.category || null,
      correct: false,
      combo: 0
    });
    
    this.updateStatsDisplay();
    KeyListener.clearPressedKeys();

    setTimeout(() => {
      if (this.isRunning) {
        this.nextQuestion();
      }
    }, 800);
  },

  updateStatsDisplay() {
    document.getElementById('challenge-score').textContent = this.score;
    document.getElementById('challenge-combo').textContent = this.combo;
    document.getElementById('challenge-correct').textContent = this.correctCount;
    document.getElementById('challenge-wrong').textContent = this.wrongCount;
  },

  endChallenge() {
    this.isRunning = false;
    this.isAnswering = false;
    this.stopTimer();
    KeyListener.clearPressedKeys();

    const timerEl = document.querySelector('.challenge-timer');
    if (timerEl) {
      timerEl.classList.remove('warning');
    }

    document.getElementById('challenge-game').style.display = 'none';
    document.getElementById('challenge-result').style.display = 'block';

    const total = this.correctCount + this.wrongCount;
    const accuracy = total > 0 ? Math.round((this.correctCount / total) * 100) : 0;

    document.getElementById('final-score').textContent = this.score;
    document.getElementById('challenge-final-correct').textContent = this.correctCount;
    document.getElementById('challenge-final-wrong').textContent = this.wrongCount;
    document.getElementById('challenge-final-combo').textContent = this.maxCombo;
    document.getElementById('challenge-final-accuracy').textContent = `${accuracy}%`;

    AudioManager.playSuccess();
  },

  showStartScreen() {
    this.stopTimer();
    this.reset();
    
    document.getElementById('challenge-game').style.display = 'none';
    document.getElementById('challenge-result').style.display = 'none';
    document.getElementById('challenge-start').style.display = 'block';

    const timerEl = document.querySelector('.challenge-timer');
    if (timerEl) {
      timerEl.classList.remove('warning');
    }
  },

  reset() {
    this.isRunning = false;
    this.isAnswering = false;
    this.timeLeft = this.settings.challengeTime || 60;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.currentQuestion = null;
    KeyListener.clearPressedKeys();
  },

  showQuitConfirm() {
    App.showModal({
      title: '退出挑战',
      message: '确定要退出当前挑战吗？当前成绩不会保存。',
      confirmText: '退出',
      cancelText: '继续挑战',
      onConfirm: () => {
        this.showStartScreen();
      }
    });
  },

  updateSettings() {
    this.settings = Storage.getSettings();
  },

  onShow() {
    this.updateSettings();
    if (!this.isRunning) {
      this.showStartScreen();
    }
  },

  onHide() {
    if (this.isRunning) {
      this.stopTimer();
    }
  }
};
