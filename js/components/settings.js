const SettingsPage = {
  init() {
    this.settings = Storage.getSettings();
    this.bindEvents();
    this.loadSettings();
  },

  loadSettings() {
    const settings = Storage.getSettings();
    
    const soundEl = document.getElementById('setting-sound');
    if (soundEl) soundEl.checked = settings.sound;
    
    const keyHintEl = document.getElementById('setting-key-hint');
    if (keyHintEl) keyHintEl.checked = settings.keyHint;
    
    const autoNextEl = document.getElementById('setting-auto-next');
    if (autoNextEl) autoNextEl.checked = settings.autoNext;
    
    const questionsEl = document.getElementById('setting-questions-per-level');
    if (questionsEl) questionsEl.value = settings.questionsPerLevel;
    
    const challengeTimeEl = document.getElementById('setting-challenge-time');
    if (challengeTimeEl) challengeTimeEl.value = settings.challengeTime;
  },

  bindEvents() {
    const backBtn = document.getElementById('back-from-settings');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        App.navigateTo('home');
      });
    }

    const soundEl = document.getElementById('setting-sound');
    if (soundEl) {
      soundEl.addEventListener('change', (e) => {
        this.updateSetting('sound', e.target.checked);
      });
    }

    const keyHintEl = document.getElementById('setting-key-hint');
    if (keyHintEl) {
      keyHintEl.addEventListener('change', (e) => {
        this.updateSetting('keyHint', e.target.checked);
      });
    }

    const autoNextEl = document.getElementById('setting-auto-next');
    if (autoNextEl) {
      autoNextEl.addEventListener('change', (e) => {
        this.updateSetting('autoNext', e.target.checked);
      });
    }

    const questionsEl = document.getElementById('setting-questions-per-level');
    if (questionsEl) {
      questionsEl.addEventListener('change', (e) => {
        this.updateSetting('questionsPerLevel', parseInt(e.target.value));
      });
    }

    const challengeTimeEl = document.getElementById('setting-challenge-time');
    if (challengeTimeEl) {
      challengeTimeEl.addEventListener('change', (e) => {
        this.updateSetting('challengeTime', parseInt(e.target.value));
      });
    }

    const exportBtn = document.getElementById('export-data');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportData();
      });
    }

    const clearBtn = document.getElementById('clear-data');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.showClearConfirm();
      });
    }
  },

  updateSetting(key, value) {
    const settings = Storage.getSettings();
    settings[key] = value;
    Storage.saveSettings(settings);

    if (key === 'sound') {
      AudioManager.setEnabled(value);
      if (value) {
        AudioManager.playClick();
      }
    }

    if (typeof TrainingPage !== 'undefined' && TrainingPage.updateSettings) {
      TrainingPage.updateSettings();
    }
    if (typeof ChallengePage !== 'undefined' && ChallengePage.updateSettings) {
      ChallengePage.updateSettings();
    }
  },

  exportData() {
    const dataStr = Storage.exportData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `快捷键大师_数据_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    AudioManager.playClick();
  },

  showClearConfirm() {
    App.showModal({
      title: '清除数据',
      message: '确定要清除所有练习记录和设置吗？此操作不可恢复！',
      confirmText: '清除',
      cancelText: '取消',
      onConfirm: () => {
        this.clearData();
      }
    });
  },

  clearData() {
    Storage.clearAllData();
    
    const defaultSettings = Storage.getSettings();
    Storage.saveSettings(defaultSettings);
    AudioManager.setEnabled(defaultSettings.sound);
    
    this.loadSettings();
    
    if (typeof HomePage !== 'undefined' && HomePage.updateStats) {
      HomePage.updateStats();
    }
    
    App.showModal({
      title: '清除成功',
      message: '所有数据已清除',
      showCancel: false,
      confirmText: '确定',
      onConfirm: () => {}
    });
  },

  onShow() {
    this.loadSettings();
  }
};
