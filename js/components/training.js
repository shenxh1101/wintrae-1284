const TrainingPage = {
  currentScene: null,
  currentCategory: null,
  mode: 'training',
  currentQuestions: [],
  currentIndex: 0,
  combo: 0,
  maxCombo: 0,
  errors: 0,
  correctCount: 0,
  totalReactionTime: 0,
  questionStartTime: 0,
  currentQuestion: null,
  wrongCategories: {},
  settings: null,
  isAnswering: false,

  init() {
    this.settings = Storage.getSettings();
    this.renderSceneSelect();
    this.bindEvents();
  },

  renderSceneSelect() {
    const grid = document.getElementById('training-scene-grid');
    if (!grid) return;

    grid.innerHTML = shortcutData.scenes.map(scene => {
      const count = shortcutData.shortcuts[scene.id]?.length || 0;
      return `
        <div class="scene-card" data-scene="${scene.id}" style="--scene-color: ${scene.color}">
          <div class="scene-icon">${scene.icon}</div>
          <div class="scene-name">${scene.name}</div>
          <div class="scene-desc">${scene.description}</div>
          <div class="scene-count">${count} 个快捷键</div>
        </div>
      `;
    }).join('');
  },

  bindEvents() {
    const backBtn = document.getElementById('back-from-training');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (document.getElementById('training-game').style.display !== 'none') {
          this.showQuitConfirm();
        } else {
          this.reset();
          App.navigateTo('home');
        }
      });
    }

    const grid = document.getElementById('training-scene-grid');
    if (grid) {
      grid.addEventListener('click', (e) => {
        const card = e.target.closest('.scene-card');
        if (card) {
          const sceneId = card.dataset.scene;
          this.startScene(sceneId);
        }
      });
    }

    const hintBtn = document.getElementById('hint-btn');
    if (hintBtn) {
      hintBtn.addEventListener('click', () => {
        this.showHint();
      });
    }

    const quitBtn = document.getElementById('quit-training');
    if (quitBtn) {
      quitBtn.addEventListener('click', () => {
        this.showQuitConfirm();
      });
    }

    const resultRetry = document.getElementById('result-retry');
    if (resultRetry) {
      resultRetry.addEventListener('click', () => {
        if (this.mode === 'review' && this.currentCategory) {
          this.startReview(this.currentCategory);
        } else if (this.currentScene) {
          this.startScene(this.currentScene);
        }
      });
    }

    const resultBack = document.getElementById('result-back');
    if (resultBack) {
      resultBack.addEventListener('click', () => {
        this.showSceneSelect();
      });
    }

    KeyListener.onKeyCombination((data) => {
      if (document.getElementById('page-training').classList.contains('active') &&
          document.getElementById('training-game').style.display !== 'none' &&
          this.isAnswering) {
        this.checkAnswer(data.keys, data.event);
      }
    });
  },

  startScene(sceneId) {
    this.mode = 'training';
    this.currentScene = sceneId;
    this.currentCategory = null;
    this.currentIndex = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.errors = 0;
    this.correctCount = 0;
    this.totalReactionTime = 0;
    this.wrongCategories = {};

    const shortcuts = shortcutData.shortcuts[sceneId] || [];
    const questionsPerLevel = this.settings.questionsPerLevel || 10;
    
    this.currentQuestions = this.shuffleArray([...shortcuts]).slice(0, Math.min(questionsPerLevel, shortcuts.length));

    document.getElementById('training-scene-select').style.display = 'none';
    document.getElementById('training-result').style.display = 'none';
    document.getElementById('training-game').style.display = 'block';

    this.updateProgress();
    this.nextQuestion();
  },

  startReview(category) {
    this.mode = 'review';
    this.currentScene = null;
    this.currentCategory = category;
    this.currentIndex = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.errors = 0;
    this.correctCount = 0;
    this.totalReactionTime = 0;
    this.wrongCategories = {};

    const allShortcuts = [];
    for (const sceneId of Object.keys(shortcutData.shortcuts)) {
      const sceneShortcuts = shortcutData.shortcuts[sceneId];
      for (const s of sceneShortcuts) {
        if (s.category === category) {
          allShortcuts.push({ ...s, scene: sceneId });
        }
      }
    }

    const questionsPerLevel = this.settings.questionsPerLevel || 10;
    this.currentQuestions = this.shuffleArray([...allShortcuts]).slice(0, Math.min(questionsPerLevel, allShortcuts.length));

    document.getElementById('training-scene-select').style.display = 'none';
    document.getElementById('training-result').style.display = 'none';
    document.getElementById('training-game').style.display = 'block';

    this.updateProgress();
    this.nextQuestion();
  },

  shuffleArray(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  },

  nextQuestion() {
    if (this.currentIndex >= this.currentQuestions.length) {
      this.showResult();
      return;
    }

    this.currentQuestion = this.currentQuestions[this.currentIndex];
    this.questionStartTime = Date.now();
    this.isAnswering = true;
    KeyListener.clearPressedKeys();

    const taskAction = document.getElementById('task-action');
    const taskExample = document.getElementById('task-example');
    const keyDisplay = document.getElementById('key-display');
    const feedback = document.getElementById('feedback');

    if (taskAction) taskAction.textContent = this.currentQuestion.action;
    if (taskExample) taskExample.textContent = this.currentQuestion.example;
    if (keyDisplay) keyDisplay.innerHTML = '<div class="key-hint">等待按键...</div>';
    if (feedback) {
      feedback.textContent = '';
      feedback.className = 'feedback';
    }

    this.updateStatsDisplay();
  },

  checkAnswer(pressedKeys, event) {
    if (!this.currentQuestion || !this.isAnswering) return;

    const targetKeys = this.currentQuestion.keys;
    const keyDisplay = document.getElementById('key-display');
    
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
    this.isAnswering = false;
    
    const reactionTime = Date.now() - this.questionStartTime;
    this.totalReactionTime += reactionTime;
    this.correctCount++;
    this.combo++;
    
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }

    const feedback = document.getElementById('feedback');
    if (feedback) {
      feedback.textContent = `✅ 正确！(${reactionTime}ms) - 连击 ${this.combo}`;
      feedback.className = 'feedback correct';
    }

    AudioManager.playCorrect();

    Storage.recordPractice({
      mode: this.mode,
      scene: this.currentScene,
      category: this.currentQuestion.category,
      correct: true,
      reactionTime: reactionTime,
      combo: this.combo
    });

    this.updateStatsDisplay();
    this.currentIndex++;
    this.updateProgress();

    if (this.settings.autoNext) {
      setTimeout(() => {
        this.nextQuestion();
      }, 800);
    } else {
      setTimeout(() => {
        this.nextQuestion();
      }, 1500);
    }
  },

  handleWrong() {
    this.isAnswering = false;
    this.errors++;
    if (this.combo > 0) {
      this.combo = 0;
    }

    const category = this.currentQuestion.category;
    if (!this.wrongCategories[category]) {
      this.wrongCategories[category] = 0;
    }
    this.wrongCategories[category]++;

    const feedback = document.getElementById('feedback');
    if (feedback) {
      const correctKeys = KeyListener.formatKeys(this.currentQuestion.keys);
      feedback.textContent = `❌ 错误！正确答案是：${correctKeys}`;
      feedback.className = 'feedback wrong';
    }

    AudioManager.playWrong();

    Storage.recordPractice({
      mode: this.mode,
      scene: this.currentScene,
      category: this.currentQuestion.category,
      correct: false,
      combo: 0
    });

    this.updateStatsDisplay();
    this.currentIndex++;
    this.updateProgress();
    KeyListener.clearPressedKeys();

    setTimeout(() => {
      this.nextQuestion();
    }, 1200);
  },

  showHint() {
    if (!this.currentQuestion) return;
    
    const keyDisplay = document.getElementById('key-display');
    if (keyDisplay) {
      keyDisplay.innerHTML = KeyListener.renderKeyCaps(this.currentQuestion.keys);
    }
    
    AudioManager.playClick();
  },

  updateProgress() {
    const progressText = document.getElementById('training-progress-text');
    if (progressText) {
      progressText.textContent = `${this.currentIndex} / ${this.currentQuestions.length}`;
    }
  },

  updateStatsDisplay() {
    const comboEl = document.getElementById('game-combo');
    const errorsEl = document.getElementById('game-errors');
    const timeEl = document.getElementById('game-time');

    if (comboEl) comboEl.textContent = this.combo;
    if (errorsEl) errorsEl.textContent = this.errors;
    if (timeEl) {
      const avgTime = this.correctCount > 0 ? Math.round(this.totalReactionTime / this.correctCount) : 0;
      timeEl.textContent = avgTime ? `${avgTime}ms` : '-';
    }
  },

  showResult() {
    document.getElementById('training-game').style.display = 'none';
    document.getElementById('training-result').style.display = 'block';

    const total = this.currentQuestions.length;
    const correct = this.correctCount;
    const wrong = this.errors;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const avgTime = correct > 0 ? Math.round(this.totalReactionTime / correct) : 0;

    const resultIcon = document.querySelector('#training-result .result-icon');
    const resultTitle = document.querySelector('#training-result h2');
    if (this.mode === 'review') {
      if (resultIcon) resultIcon.textContent = '📚';
      if (resultTitle) resultTitle.textContent = '复习完成！';
    } else {
      if (resultIcon) resultIcon.textContent = '🎉';
      if (resultTitle) resultTitle.textContent = '训练完成！';
    }

    document.getElementById('result-total').textContent = total;
    document.getElementById('result-correct').textContent = correct;
    document.getElementById('result-wrong').textContent = wrong;
    document.getElementById('result-accuracy').textContent = `${accuracy}%`;
    document.getElementById('result-combo').textContent = this.maxCombo;
    document.getElementById('result-avg-time').textContent = avgTime ? `${avgTime}ms` : '-';

    const weakEl = document.getElementById('weak-categories');
    if (weakEl && Object.keys(this.wrongCategories).length > 0) {
      const weakItems = Object.entries(this.wrongCategories)
        .sort((a, b) => b[1] - a[1])
        .map(([cat, count]) => {
          const catInfo = shortcutData.categories[cat];
          const name = catInfo ? catInfo.name : cat;
          return `<span class="weak-item">${name} (${count}次)</span>`;
        })
        .join('');
      
      weakEl.innerHTML = `
        <h4>📌 需要加强的类别</h4>
        ${weakItems}
      `;
    } else if (weakEl) {
      weakEl.innerHTML = '';
    }

    Storage.recordSession({
      mode: this.mode,
      scene: this.currentScene,
      category: this.currentCategory,
      total: total,
      correct: correct,
      wrong: wrong,
      maxCombo: this.maxCombo,
      avgReactionTime: avgTime,
      wrongCategories: { ...this.wrongCategories }
    });

    AudioManager.playSuccess();
  },

  showSceneSelect() {
    document.getElementById('training-game').style.display = 'none';
    document.getElementById('training-result').style.display = 'none';
    document.getElementById('training-scene-select').style.display = 'block';
    this.reset();
  },

  reset() {
    this.currentScene = null;
    this.currentCategory = null;
    this.mode = 'training';
    this.currentQuestions = [];
    this.currentIndex = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.errors = 0;
    this.correctCount = 0;
    this.totalReactionTime = 0;
    this.currentQuestion = null;
    this.isAnswering = false;
    KeyListener.clearPressedKeys();
  },

  showQuitConfirm() {
    App.showModal({
      title: '退出训练',
      message: '确定要退出当前训练吗？进度不会保存。',
      confirmText: '退出',
      cancelText: '继续训练',
      onConfirm: () => {
        this.showSceneSelect();
      }
    });
  },

  updateSettings() {
    this.settings = Storage.getSettings();
  },

  onShow() {
    this.updateSettings();
  }
};
