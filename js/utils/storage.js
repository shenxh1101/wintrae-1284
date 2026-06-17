const Storage = {
  KEY_STATS: 'shortcut_master_stats',
  KEY_SETTINGS: 'shortcut_master_settings',
  KEY_HISTORY: 'shortcut_master_history',

  defaultStats: {
    totalPractice: 0,
    totalCorrect: 0,
    totalWrong: 0,
    maxCombo: 0,
    avgReactionTime: 0,
    totalReactionTime: 0,
    reactionCount: 0,
    sceneStats: {},
    categoryStats: {},
    dailyStats: {},
    weakCategories: [],
    modeStats: {
      training: { total: 0, correct: 0, wrong: 0 },
      challenge: { total: 0, correct: 0, wrong: 0 },
      review: { total: 0, correct: 0, wrong: 0 }
    },
    sessions: []
  },

  defaultSettings: {
    sound: true,
    keyHint: true,
    autoNext: true,
    questionsPerLevel: 10,
    challengeTime: 60,
    challengeCategories: ['edit', 'file', 'navigate', 'window', 'view', 'tool']
  },

  getStats() {
    try {
      const data = localStorage.getItem(this.KEY_STATS);
      if (data) {
        return { ...this.defaultStats, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Failed to load stats:', e);
    }
    return { ...this.defaultStats };
  },

  saveStats(stats) {
    try {
      localStorage.setItem(this.KEY_STATS, JSON.stringify(stats));
    } catch (e) {
      console.error('Failed to save stats:', e);
    }
  },

  getSettings() {
    try {
      const data = localStorage.getItem(this.KEY_SETTINGS);
      if (data) {
        return { ...this.defaultSettings, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
    return { ...this.defaultSettings };
  },

  saveSettings(settings) {
    try {
      localStorage.setItem(this.KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  },

  getHistory() {
    try {
      const data = localStorage.getItem(this.KEY_HISTORY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
    return [];
  },

  saveHistory(history) {
    try {
      if (history.length > 100) {
        history = history.slice(-100);
      }
      localStorage.setItem(this.KEY_HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history:', e);
    }
  },

  recordPractice(result) {
    const stats = this.getStats();
    const today = this.getToday();
    const mode = result.mode || 'training';

    stats.totalPractice++;
    if (result.correct) {
      stats.totalCorrect++;
    } else {
      stats.totalWrong++;
    }

    if (result.reactionTime) {
      stats.totalReactionTime += result.reactionTime;
      stats.reactionCount++;
      stats.avgReactionTime = Math.round(stats.totalReactionTime / stats.reactionCount);
    }

    if (result.combo && result.combo > stats.maxCombo) {
      stats.maxCombo = result.combo;
    }

    if (result.scene) {
      if (!stats.sceneStats[result.scene]) {
        stats.sceneStats[result.scene] = { total: 0, correct: 0, wrong: 0 };
      }
      stats.sceneStats[result.scene].total++;
      if (result.correct) {
        stats.sceneStats[result.scene].correct++;
      } else {
        stats.sceneStats[result.scene].wrong++;
      }
    }

    if (result.category) {
      if (!stats.categoryStats[result.category]) {
        stats.categoryStats[result.category] = { total: 0, correct: 0, wrong: 0 };
      }
      stats.categoryStats[result.category].total++;
      if (result.correct) {
        stats.categoryStats[result.category].correct++;
      } else {
        stats.categoryStats[result.category].wrong++;
      }
    }

    if (!stats.modeStats[mode]) {
      stats.modeStats[mode] = { total: 0, correct: 0, wrong: 0 };
    }
    stats.modeStats[mode].total++;
    if (result.correct) {
      stats.modeStats[mode].correct++;
    } else {
      stats.modeStats[mode].wrong++;
    }

    if (!stats.dailyStats[today]) {
      stats.dailyStats[today] = { total: 0, correct: 0, wrong: 0, combo: 0 };
    }
    stats.dailyStats[today].total++;
    if (result.correct) {
      stats.dailyStats[today].correct++;
    } else {
      stats.dailyStats[today].wrong++;
    }
    if (result.combo && result.combo > stats.dailyStats[today].combo) {
      stats.dailyStats[today].combo = result.combo;
    }

    this.updateWeakCategories(stats);
    this.saveStats(stats);

    const history = this.getHistory();
    history.push({
      ...result,
      timestamp: Date.now(),
      date: today
    });
    this.saveHistory(history);

    return stats;
  },

  recordSession(sessionData) {
    const stats = this.getStats();
    const session = {
      id: Date.now(),
      mode: sessionData.mode || 'training',
      scene: sessionData.scene || null,
      category: sessionData.category || null,
      total: sessionData.total || 0,
      correct: sessionData.correct || 0,
      wrong: sessionData.wrong || 0,
      maxCombo: sessionData.maxCombo || 0,
      avgReactionTime: sessionData.avgReactionTime || 0,
      wrongCategories: sessionData.wrongCategories || {},
      timestamp: Date.now(),
      date: this.getToday()
    };

    stats.sessions.unshift(session);
    if (stats.sessions.length > 50) {
      stats.sessions = stats.sessions.slice(0, 50);
    }

    this.saveStats(stats);
    return session;
  },

  updateWeakCategories(stats) {
    const weakCategories = [];
    for (const [category, data] of Object.entries(stats.categoryStats)) {
      if (data.wrong >= 1) {
        const accuracy = data.total > 0 ? data.correct / data.total : 0;
        weakCategories.push({
          category,
          accuracy: Math.round(accuracy * 100),
          wrong: data.wrong,
          total: data.total
        });
      }
    }
    weakCategories.sort((a, b) => {
      if (a.wrong !== b.wrong) return b.wrong - a.wrong;
      return a.accuracy - b.accuracy;
    });
    stats.weakCategories = weakCategories.slice(0, 6);
  },

  getToday() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  },

  getDailyStats(days = 7) {
    const stats = this.getStats();
    const result = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const dayData = stats.dailyStats[dateStr] || { total: 0, correct: 0, wrong: 0, combo: 0 };
      
      let accuracy = 0;
      if (dayData.total > 0) {
        accuracy = Math.round((dayData.correct / dayData.total) * 100);
      }

      result.push({
        date: dateStr,
        label: `${date.getMonth() + 1}/${date.getDate()}`,
        ...dayData,
        accuracy
      });
    }

    return result;
  },

  getTodayPracticeCount() {
    const today = this.getToday();
    const stats = this.getStats();
    return stats.dailyStats[today]?.total || 0;
  },

  getAccuracy() {
    const stats = this.getStats();
    if (stats.totalPractice === 0) return 0;
    return Math.round((stats.totalCorrect / stats.totalPractice) * 100);
  },

  clearAllData() {
    localStorage.removeItem(this.KEY_STATS);
    localStorage.removeItem(this.KEY_SETTINGS);
    localStorage.removeItem(this.KEY_HISTORY);
  },

  exportData() {
    const data = {
      stats: this.getStats(),
      settings: this.getSettings(),
      history: this.getHistory(),
      exportTime: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }
};
