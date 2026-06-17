const KeyListener = {
  pressedKeys: new Set(),
  callbacks: [],
  isListening: false,
  preventDefaultEnabled: true,
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
    'Alt': 'Alt',
    'Insert': 'Ins',
    'PageUp': 'PgUp',
    'PageDown': 'PgDn',
    'CapsLock': 'Caps'
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

  blockedCombinations: [
    ['Ctrl', 'W'], ['Ctrl', 'T'], ['Ctrl', 'L'], ['Ctrl', 'S'],
    ['Ctrl', 'N'], ['Ctrl', 'O'], ['Ctrl', 'P'], ['Ctrl', 'Q'],
    ['Ctrl', 'R'], ['Ctrl', 'D'], ['Ctrl', 'H'], ['Ctrl', 'J'],
    ['Ctrl', 'K'], ['Ctrl', 'U'], ['Ctrl', 'B'], ['Ctrl', 'I'],
    ['Ctrl', 'Shift', 'T'], ['Ctrl', 'Shift', 'N'], ['Ctrl', 'Shift', 'P'],
    ['Ctrl', 'Shift', 'W'], ['Ctrl', 'Shift', 'D'],
    ['Alt', 'Tab'], ['Alt', 'F4'],
    ['Win', 'D'], ['Win', 'E'], ['Win', 'L'], ['Win', 'R'],
    ['Win', 'I'], ['Win', 'V'], ['Win', 'Tab'],
    ['Ctrl', 'Shift', 'Esc'], ['Win', 'Shift', 'S'],
    ['Ctrl', 'Tab'], ['Ctrl', 'Shift', 'Tab'],
    ['Ctrl', '+'], ['Ctrl', '-'], ['Ctrl', '0'],
    ['Alt', '←'], ['Alt', '→'],
    ['Ctrl', 'G'], ['Ctrl', 'Y'], ['Ctrl', 'Z'],
    ['Ctrl', 'Shift', 'Z'], ['Ctrl', 'Shift', 'G']
  ],

  init() {
    if (this.isListening) return;
    
    document.addEventListener('keydown', (e) => this.handleKeyDown(e), true);
    document.addEventListener('keyup', (e) => this.handleKeyUp(e), true);
    
    window.addEventListener('blur', () => {
      this.clearPressedKeys();
    });
    
    this.isListening = true;
  },

  shouldPreventDefault(e, pressedKeys) {
    if (!this.preventDefaultEnabled) return false;
    
    if (e.ctrlKey || e.altKey || e.metaKey) {
      return true;
    }
    
    const currentKeys = this.getPressedKeys();
    for (const combo of this.blockedCombinations) {
      if (currentKeys.length >= combo.length) {
        const hasAllModifiers = combo.every(k => 
          this.isModifierKey(k) ? currentKeys.includes(k) : true
        );
        if (hasAllModifiers && currentKeys.some(k => !this.isModifierKey(k))) {
          return true;
        }
      }
    }
    
    return false;
  },

  handleKeyDown(e) {
    if (e.repeat) return;
    
    const key = this.normalizeKey(e.key);
    this.pressedKeys.add(key);
    
    if (this.shouldPreventDefault(e, this.getPressedKeys())) {
      e.preventDefault();
      e.stopPropagation();
    }
    
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
    
    if (this.shouldPreventDefault(e, this.getPressedKeys())) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    this.notifyCallbacks('keyup', {
      key,
      rawKey: e.key,
      keys: this.getPressedKeys(),
      event: e
    });
  },

  setPreventDefault(enabled) {
    this.preventDefaultEnabled = enabled;
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
