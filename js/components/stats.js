const StatsPage = {
  init() {
    this.bindEvents();
    this.renderStats();
  },

  bindEvents() {
    const backBtn = document.getElementById('back-from-stats');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        App.navigateTo('home');
      });
    }
  },

  renderStats() {
    this.renderOverview();
    this.renderAccuracyChart();
    this.renderSceneMastery();
    this.renderRecommendations();
    this.renderWeakCategories();
  },

  renderOverview() {
    const stats = Storage.getStats();
    const todayCount = Storage.getTodayPracticeCount();
    const accuracy = Storage.getAccuracy();

    const dailyEl = document.getElementById('daily-practice');
    const totalEl = document.getElementById('total-practice');
    const comboEl = document.getElementById('max-combo');
    const accuracyEl = document.getElementById('total-accuracy');

    if (dailyEl) dailyEl.textContent = todayCount;
    if (totalEl) totalEl.textContent = stats.totalPractice;
    if (comboEl) comboEl.textContent = stats.maxCombo;
    if (accuracyEl) accuracyEl.textContent = `${accuracy}%`;
  },

  renderAccuracyChart() {
    const container = document.getElementById('accuracy-chart');
    if (!container) return;

    const dailyStats = Storage.getDailyStats(7);
    const maxAccuracy = Math.max(...dailyStats.map(d => d.accuracy), 100);

    container.innerHTML = dailyStats.map(day => {
      const height = day.accuracy > 0 ? Math.max((day.accuracy / maxAccuracy) * 150, 4) : 4;
      return `
        <div class="bar-item">
          <span class="bar-value">${day.accuracy}%</span>
          <div class="bar" style="height: ${height}px;"></div>
          <span class="bar-label">${day.label}</span>
        </div>
      `;
    }).join('');
  },

  renderSceneMastery() {
    const container = document.getElementById('scene-mastery');
    if (!container) return;

    const stats = Storage.getStats();
    const sceneStats = stats.sceneStats || {};

    const masteryData = shortcutData.scenes.map(scene => {
      const sceneData = sceneStats[scene.id] || { total: 0, correct: 0 };
      let accuracy = 0;
      if (sceneData.total > 0) {
        accuracy = Math.round((sceneData.correct / sceneData.total) * 100);
      }
      return {
        ...scene,
        total: sceneData.total,
        accuracy
      };
    });

    container.innerHTML = masteryData.map(scene => `
      <div class="mastery-item">
        <span class="mastery-icon">${scene.icon}</span>
        <span class="mastery-name">${scene.name}</span>
        <div class="mastery-bar">
          <div class="mastery-fill" style="width: ${scene.accuracy}%; background: linear-gradient(90deg, ${scene.color}88, ${scene.color});"></div>
        </div>
        <span class="mastery-percent">${scene.accuracy}%</span>
      </div>
    `).join('');
  },

  renderRecommendations() {
    const container = document.getElementById('recommend-list');
    if (!container) return;

    const stats = Storage.getStats();
    const recommendations = [];

    for (const scene of shortcutData.scenes) {
      const sceneData = stats.sceneStats[scene.id];
      if (!sceneData || sceneData.total < 5) {
        recommendations.push({
          type: 'scene',
          icon: scene.icon,
          title: `练习${scene.name}快捷键`,
          desc: '练习次数较少，建议多加练习',
          sceneId: scene.id,
          priority: 1
        });
      } else if (sceneData.correct / sceneData.total < 0.7) {
        recommendations.push({
          type: 'scene',
          icon: scene.icon,
          title: `复习${scene.name}快捷键`,
          desc: `正确率 ${Math.round(sceneData.correct / sceneData.total * 100)}%，有待提高`,
          sceneId: scene.id,
          priority: 2
        });
      }
    }

    if (stats.weakCategories && stats.weakCategories.length > 0) {
      for (const weak of stats.weakCategories.slice(0, 2)) {
        const catInfo = shortcutData.categories[weak.category];
        if (catInfo) {
          recommendations.push({
            type: 'category',
            icon: catInfo.icon,
            title: `加强${catInfo.name}类练习`,
            desc: `正确率 ${weak.accuracy}%，错误 ${weak.wrong} 次`,
            category: weak.category,
            priority: 3
          });
        }
      }
    }

    recommendations.sort((a, b) => b.priority - a.priority);

    if (recommendations.length === 0) {
      recommendations.push({
        type: 'general',
        icon: '🎉',
        title: '继续保持！',
        desc: '你已经掌握得很好了，继续每天练习保持手感',
        priority: 0
      });
    }

    container.innerHTML = recommendations.slice(0, 4).map(rec => `
      <div class="recommend-item" data-type="${rec.type}" data-scene="${rec.sceneId || ''}" data-category="${rec.category || ''}">
        <span class="recommend-icon">${rec.icon}</span>
        <div class="recommend-info">
          <div class="recommend-title">${rec.title}</div>
          <div class="recommend-desc">${rec.desc}</div>
        </div>
        <button class="recommend-btn" onclick="StatsPage.goToRecommend('${rec.type}', '${rec.sceneId}', '${rec.category}')">去练习</button>
      </div>
    `).join('');
  },

  goToRecommend(type, sceneId, category) {
    if (type === 'scene' && sceneId) {
      TrainingPage.startScene(sceneId);
      App.navigateTo('training');
    } else {
      App.navigateTo('training');
    }
    AudioManager.playClick();
  },

  renderWeakCategories() {
    const container = document.getElementById('weak-list');
    if (!container) return;

    const stats = Storage.getStats();
    const weakCategories = stats.weakCategories || [];

    if (weakCategories.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 20px;">
          <div class="empty-icon">💪</div>
          <p>暂无薄弱类别，继续保持！</p>
        </div>
      `;
      return;
    }

    container.innerHTML = weakCategories.map(weak => {
      const catInfo = shortcutData.categories[weak.category];
      const name = catInfo ? catInfo.name : weak.category;
      const icon = catInfo ? catInfo.icon : '📌';
      const totalInfo = weak.total ? ` · 共 ${weak.total} 题` : '';
      
      return `
        <div class="weak-item-list">
          <span style="font-size: 20px; margin-right: 8px;">${icon}</span>
          <span class="weak-name">${name}</span>
          <span class="weak-count">正确率 ${weak.accuracy}%${totalInfo} · 错误 ${weak.wrong} 次</span>
        </div>
      `;
    }).join('');
  },

  onShow() {
    this.renderStats();
  }
};
