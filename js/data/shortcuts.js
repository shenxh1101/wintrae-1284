const shortcutData = {
  scenes: [
    {
      id: 'browser',
      name: '浏览器',
      icon: '🌐',
      description: 'Chrome、Edge、Firefox 等浏览器常用快捷键',
      color: '#4285F4'
    },
    {
      id: 'editor',
      name: '文本编辑器',
      icon: '📝',
      description: 'Word、记事本、VS Code 等编辑类软件',
      color: '#0078D4'
    },
    {
      id: 'system',
      name: '系统操作',
      icon: '💻',
      description: 'Windows 系统通用快捷键',
      color: '#00BCF2'
    },
    {
      id: 'design',
      name: '设计软件',
      icon: '🎨',
      description: 'Photoshop、Figma 等设计工具',
      color: '#FF6B6B'
    }
  ],

  categories: {
    edit: { name: '编辑操作', icon: '✏️' },
    navigate: { name: '导航跳转', icon: '🧭' },
    file: { name: '文件操作', icon: '📁' },
    window: { name: '窗口管理', icon: '🪟' },
    tool: { name: '工具功能', icon: '🔧' },
    view: { name: '视图控制', icon: '👁️' }
  },

  shortcuts: {
    browser: [
      { id: 'b1', keys: ['Ctrl', 'T'], action: '打开新标签页', category: 'navigate', example: '想快速打开新网页时' },
      { id: 'b2', keys: ['Ctrl', 'W'], action: '关闭当前标签页', category: 'navigate', example: '看完页面想关掉时' },
      { id: 'b3', keys: ['Ctrl', 'Shift', 'T'], action: '恢复刚关闭的标签', category: 'navigate', example: '不小心关错了页面' },
      { id: 'b4', keys: ['Ctrl', 'L'], action: '选中地址栏', category: 'navigate', example: '要输入新网址时' },
      { id: 'b5', keys: ['Ctrl', 'D'], action: '添加书签', category: 'tool', example: '想收藏当前网页' },
      { id: 'b6', keys: ['Ctrl', 'H'], action: '打开历史记录', category: 'navigate', example: '找之前看过的网页' },
      { id: 'b7', keys: ['Ctrl', 'J'], action: '打开下载列表', category: 'tool', example: '查看刚下载的文件' },
      { id: 'b8', keys: ['F5'], action: '刷新页面', category: 'view', example: '页面加载不出来时' },
      { id: 'b9', keys: ['Ctrl', 'F'], action: '页面内查找', category: 'edit', example: '在网页里找关键词' },
      { id: 'b10', keys: ['Ctrl', '+'], action: '放大页面', category: 'view', example: '字太小看不清时' },
      { id: 'b11', keys: ['Ctrl', '-'], action: '缩小页面', category: 'view', example: '想看到更多内容' },
      { id: 'b12', keys: ['Ctrl', '0'], action: '恢复默认缩放', category: 'view', example: '页面大小乱了的时候' },
      { id: 'b13', keys: ['Alt', '←'], action: '后退一页', category: 'navigate', example: '回到上一个页面' },
      { id: 'b14', keys: ['Alt', '→'], action: '前进一页', category: 'navigate', example: '后退之后想再回来' },
      { id: 'b15', keys: ['Ctrl', 'Tab'], action: '切换到下一个标签', category: 'window', example: '标签太多切换着看' },
      { id: 'b16', keys: ['Ctrl', 'Shift', 'Tab'], action: '切换到上一个标签', category: 'window', example: '往回切标签页' }
    ],
    editor: [
      { id: 'e1', keys: ['Ctrl', 'C'], action: '复制', category: 'edit', example: '想复制一段文字' },
      { id: 'e2', keys: ['Ctrl', 'V'], action: '粘贴', category: 'edit', example: '把复制的内容贴过来' },
      { id: 'e3', keys: ['Ctrl', 'X'], action: '剪切', category: 'edit', example: '想移动一段文字' },
      { id: 'e4', keys: ['Ctrl', 'Z'], action: '撤销', category: 'edit', example: '操作错了想退回去' },
      { id: 'e5', keys: ['Ctrl', 'Y'], action: '重做', category: 'edit', example: '撤销多了想恢复' },
      { id: 'e6', keys: ['Ctrl', 'A'], action: '全选', category: 'edit', example: '想选中所有内容' },
      { id: 'e7', keys: ['Ctrl', 'F'], action: '查找', category: 'edit', example: '找文档里的某个词' },
      { id: 'e8', keys: ['Ctrl', 'H'], action: '替换', category: 'edit', example: '批量替换文字' },
      { id: 'e9', keys: ['Ctrl', 'S'], action: '保存', category: 'file', example: '写了东西要保存' },
      { id: 'e10', keys: ['Ctrl', 'Shift', 'S'], action: '另存为', category: 'file', example: '保存成新的文件' },
      { id: 'e11', keys: ['Ctrl', 'B'], action: '加粗', category: 'tool', example: '让文字变粗' },
      { id: 'e12', keys: ['Ctrl', 'I'], action: '斜体', category: 'tool', example: '让文字倾斜' },
      { id: 'e13', keys: ['Ctrl', 'U'], action: '下划线', category: 'tool', example: '给文字加下划线' },
      { id: 'e14', keys: ['Home'], action: '跳到行首', category: 'navigate', example: '快速回到这行开头' },
      { id: 'e15', keys: ['End'], action: '跳到行尾', category: 'navigate', example: '快速跳到这行末尾' },
      { id: 'e16', keys: ['Ctrl', 'Home'], action: '跳到文档开头', category: 'navigate', example: '回到文档最前面' },
      { id: 'e17', keys: ['Ctrl', 'End'], action: '跳到文档末尾', category: 'navigate', example: '跳到文档最后面' },
      { id: 'e18', keys: ['Ctrl', 'D'], action: '删除整行', category: 'edit', example: '快速删掉一整行' }
    ],
    system: [
      { id: 's1', keys: ['Win', 'D'], action: '显示桌面', category: 'window', example: '窗口太多想看到桌面' },
      { id: 's2', keys: ['Win', 'E'], action: '打开文件资源管理器', category: 'file', example: '想找电脑里的文件' },
      { id: 's3', keys: ['Win', 'L'], action: '锁定电脑', category: 'tool', example: '离开座位想锁屏' },
      { id: 's4', keys: ['Alt', 'Tab'], action: '切换窗口', category: 'window', example: '在打开的窗口间切换' },
      { id: 's5', keys: ['Win', 'Tab'], action: '任务视图', category: 'window', example: '看所有打开的窗口' },
      { id: 's6', keys: ['Ctrl', 'Shift', 'Esc'], action: '打开任务管理器', category: 'tool', example: '程序卡死了想关掉' },
      { id: 's7', keys: ['Win', 'I'], action: '打开设置', category: 'tool', example: '想改系统设置' },
      { id: 's8', keys: ['Win', 'R'], action: '运行命令', category: 'tool', example: '快速启动程序' },
      { id: 's9', keys: ['Win', 'V'], action: '剪贴板历史', category: 'edit', example: '找之前复制过的内容' },
      { id: 's10', keys: ['Win', 'Shift', 'S'], action: '截图工具', category: 'tool', example: '想截取屏幕的一部分' },
      { id: 's11', keys: ['PrintScreen'], action: '全屏截图', category: 'tool', example: '截取整个屏幕' },
      { id: 's12', keys: ['Win', '↑'], action: '窗口最大化', category: 'window', example: '让窗口占满屏幕' },
      { id: 's13', keys: ['Win', '↓'], action: '窗口最小化/还原', category: 'window', example: '把窗口收起来' },
      { id: 's14', keys: ['Win', '←'], action: '窗口靠左', category: 'window', example: '窗口贴左边一半' },
      { id: 's15', keys: ['Win', '→'], action: '窗口靠右', category: 'window', example: '窗口贴右边一半' },
      { id: 's16', keys: ['Win', '+'], action: '放大屏幕', category: 'view', example: '屏幕内容太小看不清' },
      { id: 's17', keys: ['Win', '-'], action: '缩小屏幕', category: 'view', example: '放大镜想缩回去' }
    ],
    design: [
      { id: 'd1', keys: ['Ctrl', 'Z'], action: '撤销', category: 'edit', example: '画错了想退回去' },
      { id: 'd2', keys: ['Ctrl', 'Shift', 'Z'], action: '重做', category: 'edit', example: '撤销多了恢复' },
      { id: 'd3', keys: ['Ctrl', 'T'], action: '自由变换', category: 'tool', example: '想缩放旋转图形' },
      { id: 'd4', keys: ['Ctrl', 'S'], action: '保存', category: 'file', example: '做好了要保存' },
      { id: 'd5', keys: ['Ctrl', 'N'], action: '新建文件', category: 'file', example: '创建新画布' },
      { id: 'd6', keys: ['Ctrl', 'O'], action: '打开文件', category: 'file', example: '打开已有的设计稿' },
      { id: 'd7', keys: ['Ctrl', 'C'], action: '复制', category: 'edit', example: '复制选中的元素' },
      { id: 'd8', keys: ['Ctrl', 'V'], action: '粘贴', category: 'edit', example: '粘贴复制的元素' },
      { id: 'd9', keys: ['Ctrl', 'D'], action: '再制', category: 'edit', example: '快速复制并偏移' },
      { id: 'd10', keys: ['Ctrl', 'G'], action: '组合/打组', category: 'tool', example: '把多个元素绑在一起' },
      { id: 'd11', keys: ['Ctrl', 'Shift', 'G'], action: '取消组合', category: 'tool', example: '把组拆分开' },
      { id: 'd12', keys: ['Ctrl', '+'], action: '放大画布', category: 'view', example: '想看清细节' },
      { id: 'd13', keys: ['Ctrl', '-'], action: '缩小画布', category: 'view', example: '想看整体效果' },
      { id: 'd14', keys: ['Ctrl', '0'], action: '适应画布', category: 'view', example: '让整个画布显示出来' },
      { id: 'd15', keys: ['Ctrl', '1'], action: '实际像素', category: 'view', example: '看 100% 实际大小' },
      { id: 'd16', keys: ['V'], action: '选择工具', category: 'tool', example: '切换到选择移动工具' },
      { id: 'd17', keys: ['M'], action: '选区工具', category: 'tool', example: '框选区域' },
      { id: 'd18', keys: ['B'], action: '画笔工具', category: 'tool', example: '切换到画笔' },
      { id: 'd19', keys: ['E'], action: '橡皮擦', category: 'tool', example: '切换到橡皮擦' },
      { id: 'd20', keys: ['Space'], action: '抓手工具', category: 'navigate', example: '按住拖动画布' }
    ]
  },

  challengeShortcuts: [
    { keys: ['Ctrl', 'C'], action: '复制选中文本或文件' },
    { keys: ['Ctrl', 'V'], action: '粘贴剪贴板内容' },
    { keys: ['Ctrl', 'X'], action: '剪切选中文本' },
    { keys: ['Ctrl', 'Z'], action: '撤销上一步操作' },
    { keys: ['Ctrl', 'Y'], action: '重做刚才撤销的操作' },
    { keys: ['Ctrl', 'S'], action: '保存当前文件' },
    { keys: ['Ctrl', 'F'], action: '查找内容' },
    { keys: ['Ctrl', 'A'], action: '全部选中' },
    { keys: ['Alt', 'Tab'], action: '切换打开的窗口' },
    { keys: ['Ctrl', 'T'], action: '打开新标签页' },
    { keys: ['Ctrl', 'W'], action: '关闭当前标签' },
    { keys: ['Ctrl', 'Shift', 'T'], action: '恢复刚关闭的标签' },
    { keys: ['F5'], action: '刷新页面' },
    { keys: ['Ctrl', 'N'], action: '新建文件或窗口' },
    { keys: ['Ctrl', 'O'], action: '打开文件' },
    { keys: ['Win', 'D'], action: '显示桌面' },
    { keys: ['Win', 'E'], action: '打开文件管理器' },
    { keys: ['Win', 'L'], action: '锁定电脑屏幕' }
  ]
};
