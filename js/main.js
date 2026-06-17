const App = {
  currentPage: 'home',
  modalCallback: null,

  init() {
    KeyListener.init();
    AudioManager.init();

    const settings = Storage.getSettings();
    AudioManager.setEnabled(settings.sound);

    if (typeof HomePage !== 'undefined' && HomePage.init) {
      HomePage.init();
    }
    if (typeof TrainingPage !== 'undefined' && TrainingPage.init) {
      TrainingPage.init();
    }
    if (typeof ChallengePage !== 'undefined' && ChallengePage.init) {
      ChallengePage.init();
    }
    if (typeof AtlasPage !== 'undefined' && AtlasPage.init) {
      AtlasPage.init();
    }
    if (typeof StatsPage !== 'undefined' && StatsPage.init) {
      StatsPage.init();
    }
    if (typeof SettingsPage !== 'undefined' && SettingsPage.init) {
      SettingsPage.init();
    }

    this.bindNavEvents();
    this.bindModalEvents();
    this.navigateTo('home');
  },

  bindNavEvents() {
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const page = btn.dataset.page;
        if (page) {
          this.navigateTo(page);
          AudioManager.playClick();
        }
      });
    });
  },

  bindModalEvents() {
    const cancelBtn = document.getElementById('modal-cancel');
    const confirmBtn = document.getElementById('modal-confirm');
    const overlay = document.getElementById('modal-overlay');

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.hideModal();
        AudioManager.playClick();
      });
    }

    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        if (this.modalCallback) {
          this.modalCallback();
        }
        this.hideModal();
        AudioManager.playClick();
      });
    }

    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.hideModal();
        }
      });
    }
  },

  navigateTo(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
      page.classList.remove('active');
    });

    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
      targetPage.classList.add('active');
    }

    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
      if (btn.dataset.page === pageId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (this.currentPage !== pageId) {
      const pageObj = this.getPageObject(this.currentPage);
      if (pageObj && pageObj.onHide) {
        pageObj.onHide();
      }
    }

    this.currentPage = pageId;

    const currentPageObj = this.getPageObject(pageId);
    if (currentPageObj && currentPageObj.onShow) {
      currentPageObj.onShow();
    }

    window.scrollTo(0, 0);
  },

  getPageObject(pageId) {
    const pageMap = {
      'home': HomePage,
      'training': TrainingPage,
      'challenge': ChallengePage,
      'atlas': AtlasPage,
      'stats': StatsPage,
      'settings': SettingsPage
    };
    return pageMap[pageId] || null;
  },

  showModal(options) {
    const { title, message, confirmText = '确定', cancelText = '取消', onConfirm, showCancel = true } = options;

    const titleEl = document.getElementById('modal-title');
    const messageEl = document.getElementById('modal-message');
    const cancelBtn = document.getElementById('modal-cancel');
    const confirmBtn = document.getElementById('modal-confirm');
    const overlay = document.getElementById('modal-overlay');

    if (titleEl) titleEl.textContent = title;
    if (messageEl) messageEl.textContent = message;
    if (confirmBtn) confirmBtn.textContent = confirmText;
    
    if (cancelBtn) {
      cancelBtn.textContent = cancelText;
      cancelBtn.style.display = showCancel ? 'block' : 'none';
    }

    this.modalCallback = onConfirm || null;

    if (overlay) {
      overlay.style.display = 'flex';
    }
  },

  hideModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
    this.modalCallback = null;
  },

  refreshStats() {
    if (typeof HomePage !== 'undefined' && HomePage.updateStats) {
      HomePage.updateStats();
    }
    if (typeof StatsPage !== 'undefined' && StatsPage.renderStats) {
      StatsPage.renderStats();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

document.addEventListener('click', () => {
  AudioManager.resumeContext();
}, { once: true });
