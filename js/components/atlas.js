const AtlasPage = {
  currentScene: 'browser',
  currentCategory: 'all',

  init() {
    this.renderSceneFilters();
    this.renderCategoryFilters();
    this.bindEvents();
    this.renderAtlas();
  },

  renderSceneFilters() {
    const container = document.getElementById('atlas-scene-filters');
    if (!container) return;

    const scenes = [
      { id: 'all', name: '全部场景', icon: '📚' },
      ...shortcutData.scenes
    ];

    container.innerHTML = scenes.map(scene => `
      <button class="filter-btn ${scene.id === this.currentScene ? 'active' : ''}" 
              data-scene="${scene.id}">
        ${scene.icon} ${scene.name}
      </button>
    `).join('');
  },

  renderCategoryFilters() {
    const container = document.getElementById('atlas-category-filters');
    if (!container) return;

    const categories = [
      { id: 'all', name: '全部类别', icon: '📋' },
      ...Object.entries(shortcutData.categories).map(([id, data]) => ({
        id,
        name: data.name,
        icon: data.icon
      }))
    ];

    container.innerHTML = categories.map(cat => `
      <button class="filter-btn ${cat.id === this.currentCategory ? 'active' : ''}" 
              data-category="${cat.id}">
        ${cat.icon} ${cat.name}
      </button>
    `).join('');
  },

  bindEvents() {
    const backBtn = document.getElementById('back-from-atlas');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        App.navigateTo('home');
      });
    }

    const sceneFilters = document.getElementById('atlas-scene-filters');
    if (sceneFilters) {
      sceneFilters.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (btn) {
          this.currentScene = btn.dataset.scene;
          this.renderSceneFilters();
          this.renderAtlas();
          AudioManager.playClick();
        }
      });
    }

    const categoryFilters = document.getElementById('atlas-category-filters');
    if (categoryFilters) {
      categoryFilters.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (btn) {
          this.currentCategory = btn.dataset.category;
          this.renderCategoryFilters();
          this.renderAtlas();
          AudioManager.playClick();
        }
      });
    }
  },

  renderAtlas() {
    const container = document.getElementById('atlas-content');
    if (!container) return;

    let shortcuts = [];
    
    if (this.currentScene === 'all') {
      for (const sceneId of Object.keys(shortcutData.shortcuts)) {
        const sceneShortcuts = shortcutData.shortcuts[sceneId].map(s => ({
          ...s,
          scene: sceneId
        }));
        shortcuts.push(...sceneShortcuts);
      }
    } else {
      shortcuts = (shortcutData.shortcuts[this.currentScene] || []).map(s => ({
        ...s,
        scene: this.currentScene
      }));
    }

    if (this.currentCategory !== 'all') {
      shortcuts = shortcuts.filter(s => s.category === this.currentCategory);
    }

    if (shortcuts.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <p>没有找到符合条件的快捷键</p>
        </div>
      `;
      return;
    }

    const grouped = {};
    for (const shortcut of shortcuts) {
      const cat = shortcut.category;
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
      grouped[cat].push(shortcut);
    }

    const categoryOrder = ['edit', 'navigate', 'file', 'window', 'tool', 'view'];
    const sortedCategories = Object.keys(grouped).sort((a, b) => {
      const idxA = categoryOrder.indexOf(a);
      const idxB = categoryOrder.indexOf(b);
      if (idxA === -1 && idxB === -1) return a.localeCompare(b);
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });

    container.innerHTML = sortedCategories.map(catId => {
      const catInfo = shortcutData.categories[catId] || { name: catId, icon: '📌' };
      const items = grouped[catId];
      
      return `
        <div class="atlas-category">
          <div class="atlas-category-header">
            <span class="atlas-category-icon">${catInfo.icon}</span>
            <span>${catInfo.name}</span>
            <span style="margin-left:auto; color:#888; font-size:13px; font-weight:normal;">${items.length} 个</span>
          </div>
          <div class="atlas-shortcut-list">
            ${items.map(item => this.renderShortcutItem(item)).join('')}
          </div>
        </div>
      `;
    }).join('');
  },

  renderShortcutItem(item) {
    const keyCaps = item.keys.map(key => 
      `<span class="atlas-key">${KeyListener.getDisplayKey(key)}</span>`
    ).join('<span style="color:#aaa; margin:0 4px;">+</span>');

    return `
      <div class="atlas-item">
        <div class="atlas-keys">${keyCaps}</div>
        <div class="atlas-action">${item.action}</div>
        <div class="atlas-example">${item.example || ''}</div>
      </div>
    `;
  },

  onShow() {
    this.renderAtlas();
  }
};
