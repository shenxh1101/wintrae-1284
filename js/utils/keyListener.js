const KeyListener = {
  pressedKeys: new Set(),
  callbacks: [],
  isListening: false,
  isMac: navigator.platform.toUpperCase().indexOf('MAC') >= 0,

  keyMap: {
    'Control': 'Ctrl',
    'Meta': this.isMac ? 'Cmd' : 'Win',
    ' ': 'Space',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
    'Escape': 'Esc',
    'Delete': 'Del',
    'Backspace': '⌫',
    'Enter': 'Enter',
    'Tab': 'Tab',
    'Shift': 'Shift',
    'Alt': 'Alt'
  },

  displayKeyMap: {
    'Control': 'Ctrl',
    'Meta': 'Win',
    ' ': 'Space',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
    'Escape': 'Esc',
    'Delete': 'Del',
    'Backspace': '⌫'
  },

  init() {
    if (this.isListening) return;
    
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    this.isListening = true;
  },

  handleKeyDown(e) {
    if (e.repeat) return;
    
    const key = this.normalizeKey(e.key);
    this.pressedKeys.add(key);
    
    this.notifyCallbacks('keydown', {
      key,
      rawKey: e.key,
      keys: this.getPressedKeys(),
      event: e
    });
  },

  handleKeyUp(e) {
    const key = this.normalizeKey(e.key);
    this.pressedKeys.delete(key);
    
    this.notifyCallbacks('keyup', {
      key,
      rawKey: e.key,
      keys: this.getPressedKeys(),
      event: e
    });
  },

  normalizeKey(key) {
    if (this.keyMap[key]) {
      return this.keyMap[key];
    }
    if (key.length === 1) {
      return key.toUpperCase();
    }
    return key;
  },

  getDisplayKey(key) {
    if (this.displayKeyMap[key]) {
      return this.displayKeyMap[key];
    }
    return key;
  },

  getPressedKeys() {
    return Array.from(this.pressedKeys);
  },

  checkCombination(targetKeys) {
    const pressed = this.getPressedKeys();
    
    if (pressed.length !== targetKeys.length) {
      return false;
    }
    
    const sortedTarget = [...targetKeys].sort();
    const sortedPressed = pressed.sort();
    
    return sortedTarget.every((key, index) => {
      const pressedKey = sortedPressed[index];
      if (key === pressedKey) return true;
      
      if (key === '+' || key === '-') {
        return pressedKey === key;
      }
      
      return key.toUpperCase() === pressedKey.toUpperCase();
    });
  },

  onKeyCombination(callback) {
    const wrapper = (type, data) => {
      if (type === 'keydown') {
        callback(data);
      }
    };
    this.callbacks.push(wrapper);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== wrapper);
    };
  },

  onKeyDown(callback) {
    const wrapper = (type, data) => {
      if (type === 'keydown') {
        callback(data);
      }
    };
    this.callbacks.push(wrapper);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== wrapper);
    };
  },

  onKeyUp(callback) {
    const wrapper = (type, data) => {
      if (type === 'keyup') {
        callback(data);
      }
    };
    this.callbacks.push(wrapper);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== wrapper);
    };
  },

  notifyCallbacks(type, data) {
    this.callbacks.forEach(cb => {
      try {
        cb(type, data);
      } catch (e) {
        console.error('Callback error:', e);
      }
    });
  },

  clearPressedKeys() {
    this.pressedKeys.clear();
  },

  formatKeys(keys) {
    return keys.join(' + ');
  },

  renderKeyCaps(keys) {
    return keys.map(key => `<span class="key-cap">${this.getDisplayKey(key)}</span>`).join('<span class="key-plus">+</span>');
  },

  isModifierKey(key) {
    const modifiers = ['Ctrl', 'Shift', 'Alt', 'Win', 'Cmd', 'Meta'];
    return modifiers.includes(key);
  }
};
