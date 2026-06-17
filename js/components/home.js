const HomePage = {
  init() {
    this.renderSceneGrid();
    this.bindEvents();
    this.updateStats();
  },

  renderSceneGrid() {
    const grid = document.getElementById('scene-grid');
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
    const grid = document.getElementById('scene-grid');
    if (grid) {
      grid.addEventListener('click', (e) => {
        const card = e.target.closest('.scene-card');
        if (card) {
          const sceneId = card.dataset.scene;
          this.startTraining(sceneId);
        }
      });
    }

    const quickChallenge = document.getElementById('quick-challenge');
    if (quickChallenge) {
      quickChallenge.addEventListener('click', () => {
        App.navigateTo('challenge');
      });
    }

    const quickAtlas = document.getElementById('quick-atlas');
    if (quickAtlas) {
      quickAtlas.addEventListener('click', () => {
        App.navigateTo('atlas');
      });
    }
  },

  startTraining(sceneId) {
    TrainingPage.startScene(sceneId);
    App.navigateTo('training');
  },

  updateStats() {
    const stats = Storage.getStats();
    const accuracy = Storage.getAccuracy();
    const todayCount = Storage.getTodayPracticeCount();

    const statTotal = document.getElementById('stat-total');
    const statStreak = document.getElementById('stat-streak');
    const statAccuracy = document.getElementById('stat-accuracy');
    const statAvgTime = document.getElementById('stat-avg-time');

    if (statTotal) statTotal.textContent = stats.totalPractice;
    if (statStreak) statStreak.textContent = stats.maxCombo;
    if (statAccuracy) statAccuracy.textContent = `${accuracy}%`;
    if (statAvgTime) {
      statAvgTime.textContent = stats.avgReactionTime ? `${stats.avgReactionTime}ms` : '-';
    }
  },

  onShow() {
    this.updateStats();
  }
};
