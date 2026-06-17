const { app, BrowserWindow, Menu, globalShortcut, shell } = require('electron');
const path = require('path');

let mainWindow = null;

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
    if (input.type === 'keyDown') {
      const blockedKeys = ['w', 't', 'l', 's', 'n', 'o', 'p', 'q', 'r', 'd', 'h', 'j', 'k', 'u', 'b', 'i'];
      
      if ((input.control || input.meta) && !input.alt) {
        if (blockedKeys.includes(input.key.toLowerCase())) {
          event.preventDefault();
        }
      }
      
      if ((input.control || input.meta) && input.shift) {
        if (['t', 'n', 'p', 'w', 'd'].includes(input.key.toLowerCase())) {
          event.preventDefault();
        }
      }
      
      if (input.alt && input.key.toLowerCase() === 'tab') {
        event.preventDefault();
      }
      
      if (input.alt && input.key.toLowerCase() === 'f4') {
        event.preventDefault();
      }
      
      if (input.meta) {
        const winBlocked = ['d', 'e', 'l', 'r', 'i', 'v', 'tab'];
        if (winBlocked.includes(input.key.toLowerCase())) {
          event.preventDefault();
        }
      }
      
      if (input.control && input.shift && input.key.toLowerCase() === 'escape') {
        event.preventDefault();
      }
      
      if (input.meta && input.shift && input.key.toLowerCase() === 's') {
        event.preventDefault();
      }
      
      if (input.control && input.key.toLowerCase() === 'tab') {
        event.preventDefault();
      }
    }
  });
}

function createMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '重新加载',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) {
              mainWindow.reload();
            }
          }
        },
        { type: 'separator' },
        {
          label: isMac ? '退出' : '退出',
          accelerator: isMac ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: '重做', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: '全选', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
      ]
    },
    {
      label: '视图',
      submenu: [
        {
          label: '放大',
          accelerator: 'CmdOrCtrl+=',
          click: () => {
            if (mainWindow) {
              const currentZoom = mainWindow.webContents.getZoomLevel();
              mainWindow.webContents.setZoomLevel(currentZoom + 0.5);
            }
          }
        },
        {
          label: '缩小',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            if (mainWindow) {
              const currentZoom = mainWindow.webContents.getZoomLevel();
              mainWindow.webContents.setZoomLevel(currentZoom - 0.5);
            }
          }
        },
        {
          label: '重置缩放',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.setZoomLevel(0);
            }
          }
        },
        { type: 'separator' },
        {
          label: '全屏',
          accelerator: isMac ? 'Ctrl+Cmd+F' : 'F11',
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
  globalShortcut.unregisterAll();
});

app.commandLine.appendSwitch('disable-features', 'HardwareMediaKeyHandling');
