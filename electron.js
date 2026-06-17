const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

let mainWindow = null;
let isGameActive = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: '快捷键大师',
    backgroundColor: '#667eea',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true
    },
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return;
    
    const isCtrl = input.control || input.meta;
    const key = input.key.toLowerCase();

    if (isCtrl && ['w', 't', 'l', 's', 'n', 'o', 'p', 'r', 'd', 'h', 'j',
        'k', 'u', 'b', 'i', 'g', 'f', 'a', 'x', 'c', 'v', 'z', 'y',
        '+', '-', '0', '1', 'tab'].includes(key)) {
      event.preventDefault();
      sendKeyEventToPage(input);
      return;
    }

    if (isCtrl && input.shift && ['t', 'n', 'p', 'w', 'd', 'z', 'g', 's', 'esc'].includes(key)) {
      event.preventDefault();
      sendKeyEventToPage(input);
      return;
    }

    if (input.alt && ['tab', 'f4', 'arrowleft', 'arrowright'].includes(key)) {
      event.preventDefault();
      sendKeyEventToPage(input);
      return;
    }

    if (input.meta && ['d', 'e', 'l', 'r', 'i', 'v', 'tab'].includes(key)) {
      event.preventDefault();
      sendKeyEventToPage(input);
      return;
    }

    if (input.meta && input.shift && ['s'].includes(key)) {
      event.preventDefault();
      sendKeyEventToPage(input);
      return;
    }

    if (isCtrl && input.shift && key === 'escape') {
      event.preventDefault();
      sendKeyEventToPage(input);
      return;
    }

    if (key === 'f5') {
      event.preventDefault();
      sendKeyEventToPage(input);
      return;
    }
  });
}

function sendKeyEventToPage(input) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  
  const codeMap = {
    'ctrl': 'ControlLeft', 'control': 'ControlLeft',
    'shift': 'ShiftLeft',
    'alt': 'AltLeft',
    'meta': 'MetaLeft',
    'tab': 'Tab',
    'enter': 'Enter',
    'escape': 'Escape', 'esc': 'Escape',
    'backspace': 'Backspace',
    'arrowup': 'ArrowUp', 'arrowdown': 'ArrowDown',
    'arrowleft': 'ArrowLeft', 'arrowright': 'ArrowRight',
    ' ': 'Space',
    '+': 'Equal', '-': 'Minus',
    '0': 'Digit0', '1': 'Digit1',
    'f4': 'F4', 'f5': 'F5',
  };

  const keyLower = input.key.toLowerCase();
  let code = codeMap[keyLower];
  if (!code) {
    if (keyLower.length === 1) {
      code = 'Key' + keyLower.toUpperCase();
    } else {
      code = keyLower;
    }
  }

  mainWindow.webContents.executeJavaScript(`
    (function() {
      var kd = new KeyboardEvent('keydown', {
        key: '${input.key}',
        code: '${code}',
        ctrlKey: ${!!input.control},
        shiftKey: ${!!input.shift},
        altKey: ${!!input.alt},
        metaKey: ${!!input.meta},
        bubbles: true,
        cancelable: true
      });
      document.dispatchEvent(kd);
      
      var ku = new KeyboardEvent('keyup', {
        key: '${input.key}',
        code: '${code}',
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        bubbles: true,
        cancelable: true
      });
      setTimeout(function() { document.dispatchEvent(ku); }, 50);
    })();
  `).catch(() => {});
}

function createMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '重新加载',
          click: () => {
            if (mainWindow) {
              mainWindow.reload();
            }
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '视图',
      submenu: [
        {
          label: '放大',
          click: () => {
            if (mainWindow) {
              const currentZoom = mainWindow.webContents.getZoomLevel();
              mainWindow.webContents.setZoomLevel(currentZoom + 0.5);
            }
          }
        },
        {
          label: '缩小',
          click: () => {
            if (mainWindow) {
              const currentZoom = mainWindow.webContents.getZoomLevel();
              mainWindow.webContents.setZoomLevel(currentZoom - 0.5);
            }
          }
        },
        {
          label: '重置缩放',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.setZoomLevel(0);
            }
          }
        },
        { type: 'separator' },
        {
          label: '全屏',
          accelerator: 'F11',
          click: () => {
            if (mainWindow) {
              mainWindow.setFullScreen(!mainWindow.isFullScreen());
            }
          }
        },
        {
          label: '开发者工具',
          accelerator: isMac ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.toggleDevTools();
            }
          }
        }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              title: '关于快捷键大师',
              message: '快捷键大师 v1.0',
              detail: '帮助你快速记忆键盘快捷键，提升工作效率\n\n© 2024 快捷键大师',
              buttons: ['确定']
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
});

app.commandLine.appendSwitch('disable-features', 'HardwareMediaKeyHandling');
