// 应用状态管理
let appState = {
    // 当前用户
    currentUser: { 
        id: 'user-1',
        name: "花晓", 
        prompt: "女，认认真真，战战兢兢",
        avatar: '👤',
        isUser: true
    },
    
    // AI角色列表
    aiCharacters: [
        {
            id: 'ai-1',
            name: "老板",
            prompt: "实力强势女强人，但有花晓这个总爱闯祸的助理，无可奈何一直在收拾烂摊子",
            avatar: '👩‍💼',
            isAI: true
        },
        {
            id: 'ai-2', 
            name: "花阳美苑",
            prompt: "你是花阳美苑，一个温柔贴心的 AI 助手。",
            avatar: '🌸',
            isAI: true
        }
    ],
    
    // 用户创建的虚拟人物角色
    userCharacters: [],
    
    // 当前应用
    currentApp: 'desktop',
    
    // 聊天记录
    conversations: {},
    
    // 设置
    settings: {
        apiUrl: 'https://api.deepseek.com/v1',
        model: 'deepseek-chat'
    }
};

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('应用初始化开始...');
    
    // 初始化界面
    initUI();
    
    // 初始化时钟
    updateClock();
    setInterval(updateClock, 1000);
    
    // 初始化数据
    initData();
    
    // 绑定所有事件
    bindAllEvents();
    
    console.log('应用初始化完成');
});

// 初始化UI
function initUI() {
    console.log('初始化UI...');
    
    // 确保桌面是活跃的
    document.getElementById('desktop').style.display = 'flex';
    
    // 隐藏所有应用窗口
    document.querySelectorAll('.app-window').forEach(app => {
        app.style.display = 'none';
    });
    
    // 隐藏角色编辑器
    document.getElementById('char-editor').style.display = 'none';
    
    // 更新用户信息显示
    document.getElementById('user-name').textContent = appState.currentUser.name;
    
    // 设置默认值
    document.getElementById('api-url').value = appState.settings.apiUrl;
    document.getElementById('model-select').value = appState.settings.model;
}

// 初始化数据
function initData() {
    console.log('初始化数据...');
    
    // 更新聊天列表
    updateChatList();
    
    // 更新统计
    updateStats();
}

// 绑定所有事件
function bindAllEvents() {
    console.log('绑定事件...');
    
    // 桌面应用图标点击 - 使用事件委托
    document.addEventListener('click', function(event) {
        const appIcon = event.target.closest('.app-icon');
        if (appIcon) {
            const app = appIcon.getAttribute('data-app');
            if (app) {
                console.log(`点击了应用图标: ${app}`);
                openApp(app);
                return;
            }
        }
        
        // 底部导航图标点击
        const navIcon = event.target.closest('.nav-icon');
        if (navIcon) {
            const theme = navIcon.getAttribute('data-theme');
            const app = navIcon.getAttribute('data-app');
            
            if (theme) {
                console.log(`点击了主题按钮: ${theme}`);
                changeTheme(theme);
            } else if (app) {
                console.log(`点击了导航应用图标: ${app}`);
                openApp(app);
            }
            return;
        }
        
        // 返回按钮点击
        const backBtn = event.target.closest('.back-btn');
        if (backBtn) {
            if (backBtn.hasAttribute('data-close')) {
                console.log('点击了关闭按钮');
                closeApp();
            }
            return;
        }
        
        // 角色编辑器标签页
        const editorTab = event.target.closest('.editor-tab');
        if (editorTab) {
            const tabName = editorTab.getAttribute('data-editor-tab');
            console.log(`点击了编辑器标签: ${tabName}`);
            switchEditorTab(tabName);
            return;
        }
        
        // 主题按钮
        const themeBtn = event.target.closest('.theme-btn');
        if (themeBtn) {
            const theme = themeBtn.getAttribute('data-theme');
            if (theme) {
                console.log(`点击了主题按钮: ${theme}`);
                changeTheme(theme);
            }
            return;
        }
        
        // 聊天项点击
        const chatItem = event.target.closest('.chat-item');
        if (chatItem) {
            const charId = chatItem.getAttribute('data-char-id');
            if (charId) {
                console.log(`点击了聊天项: ${charId}`);
                openChat(charId);
            }
            return;
        }
    });
    
    // 按钮事件绑定
    document.getElementById('add-char-btn').addEventListener('click', toggleCharEditor);
    document.getElementById('close-char-editor').addEventListener('click', closeCharEditor);
    document.getElementById('save-ai-char-btn').addEventListener('click', saveAICharacter);
    document.getElementById('save-user-char-btn').addEventListener('click', saveUserCharacter);
    document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
    
    console.log('事件绑定完成');
}

// 时钟更新
function updateClock() {
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ":" + 
                   now.getMinutes().toString().padStart(2, '0');
    const dateStr = `${now.getFullYear()}年${(now.getMonth()+1).toString().padStart(2, '0')}月${now.getDate().toString().padStart(2, '0')}日`;
    
    document.getElementById('real-time').textContent = timeStr;
    document.getElementById('real-date').textContent = dateStr;
}

// 打开应用
function openApp(appName) {
    console.log(`打开应用: ${appName}`);
    
    // 隐藏桌面
    document.getElementById('desktop').style.display = 'none';
    
    // 隐藏所有应用窗口
    document.querySelectorAll('.app-window').forEach(app => {
        app.style.display = 'none';
    });
    
    // 显示目标应用
    const targetApp = document.getElementById(`app-${appName}`);
    if (targetApp) {
        targetApp.style.display = 'flex';
        appState.currentApp = appName;
        
        // 如果是微信，初始化微信界面
        if (appName === 'wechat') {
            updateChatList();
        }
        
        showNotification(`已打开${getAppName(appName)}`);
    } else {
        console.error(`应用不存在: ${appName}`);
    }
}

// 关闭应用，返回桌面
function closeApp() {
    console.log('关闭应用，返回桌面');
    
    // 隐藏当前应用
    if (appState.currentApp !== 'desktop') {
        document.getElementById(`app-${appState.currentApp}`).style.display = 'none';
    }
    
    // 隐藏角色编辑器
    document.getElementById('char-editor').style.display = 'none';
    
    // 显示桌面
    document.getElementById('desktop').style.display = 'flex';
    appState.currentApp = 'desktop';
}

// 获取应用显示名称
function getAppName(appId) {
    const appNames = {
        'wechat': '微信',
        'worldbook': '世界书',
        'theme-wallpaper': '主题壁纸',
        'settings': 'AI设置',
        'profile': '个人资料'
    };
    return appNames[appId] || appId;
}

// 角色编辑器切换
function toggleCharEditor() {
    const editor = document.getElementById('char-editor');
    if (editor.style.display === 'none' || editor.style.display === '') {
        editor.style.display = 'flex';
        switchEditorTab('ai');
    } else {
        editor.style.display = 'none';
    }
}

function closeCharEditor() {
    document.getElementById('char-editor').style.display = 'none';
}

function switchEditorTab(tab) {
    console.log(`切换编辑器标签页: ${tab}`);
    
    // 隐藏所有标签页
    document.querySelectorAll('.editor-tab-content').forEach(content => {
        content.style.display = 'none';
    });
    
    // 移除所有激活状态
    document.querySelectorAll('.editor-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 显示目标标签页
    const targetTab = document.getElementById(`${tab}-char-tab`);
    if (targetTab) {
        targetTab.style.display = 'block';
        
        // 激活对应的标签按钮
        const tabBtn = document.querySelector(`.editor-tab[data-editor-tab="${tab}"]`);
        if (tabBtn) {
            tabBtn.classList.add('active');
        }
    }
}

// 更新聊天列表
function updateChatList() {
    const container = document.getElementById('chat-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    // 添加AI角色聊天
    appState.aiCharacters.forEach(char => {
        const conversation = appState.conversations[char.id] || [];
        const lastMsg = conversation.length > 0 ? conversation[conversation.length - 1] : null;
        
        const item = createChatItem(char, lastMsg);
        container.appendChild(item);
    });
    
    // 添加用户角色聊天
    appState.userCharacters.forEach(char => {
        const conversation = appState.conversations[char.id] || [];
        const lastMsg = conversation.length > 0 ? conversation[conversation.length - 1] : null;
        
        const item = createChatItem(char, lastMsg);
        container.appendChild(item);
    });
    
    // 如果没有聊天，显示提示
    if (container.children.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:#888;">暂无聊天<br>点击右上角"👤+"创建角色</div>';
    }
}

// 创建聊天项
function createChatItem(target, lastMsg) {
    const item = document.createElement('div');
    item.className = 'chat-item';
    item.setAttribute('data-char-id', target.id);
    
    const time = lastMsg ? formatTime(lastMsg.timestamp) : '';
    const lastMsgText = lastMsg ? (lastMsg.content.length > 20 ? lastMsg.content.substring(0, 20) + '...' : lastMsg.content) : '暂无消息';
    
    item.innerHTML = `
        <div class="chat-avatar">${target.avatar}</div>
        <div class="chat-info">
            <div class="chat-name">${target.name}</div>
            <div class="chat-last-msg">${lastMsgText}</div>
        </div>
        <div class="chat-time">${time}</div>
    `;
    
    return item;
}

// 打开聊天
function openChat(characterId) {
    const allCharacters = [...appState.aiCharacters, ...appState.userCharacters];
    const character = allCharacters.find(c => c.id === characterId);
    
    if (!character) return;
    
    showNotification(`打开与 ${character.name} 的聊天`);
    // 这里可以扩展为打开具体的聊天界面
}

// 格式化时间
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60 * 1000) {
        return '刚刚';
    } else if (diff < 60 * 60 * 1000) {
        return Math.floor(diff / (60 * 1000)) + '分钟前';
    } else if (diff < 24 * 60 * 60 * 1000) {
        return date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
    } else {
        return Math.floor(diff / (24 * 60 * 60 * 1000)) + '天前';
    }
}

// 保存AI角色
function saveAICharacter() {
    const name = document.getElementById('char-name').value.trim();
    const prompt = document.getElementById('char-prompt').value.trim();
    
    if (!name) {
        showNotification('请输入角色名字', 'error');
        return;
    }
    
    const newCharacter = {
        id: 'ai-' + Date.now(),
        name,
        prompt: prompt || '这是一个AI角色。',
        avatar: '🤖',
        isAI: true
    };
    
    appState.aiCharacters.push(newCharacter);
    
    // 清空表单
    document.getElementById('char-name').value = '';
    document.getElementById('char-prompt').value = '';
    
    updateChatList();
    updateStats();
    showNotification(`AI角色"${name}"已保存`);
    
    // 自动关闭编辑器
    closeCharEditor();
}

// 保存用户角色
function saveUserCharacter() {
    const name = document.getElementById('user-char-name').value.trim();
    const prompt = document.getElementById('user-char-prompt').value.trim();
    
    if (!name) {
        showNotification('请输入角色名字', 'error');
        return;
    }
    
    const newCharacter = {
        id: 'user-char-' + Date.now(),
        name,
        prompt: prompt || '这是一个用户角色。',
        avatar: '👤',
        isUser: true
    };
    
    appState.userCharacters.push(newCharacter);
    
    // 清空表单
    document.getElementById('user-char-name').value = '';
    document.getElementById('user-char-prompt').value = '';
    
    updateChatList();
    updateStats();
    showNotification(`用户角色"${name}"已保存`);
    
    // 自动关闭编辑器
    closeCharEditor();
}

// 主题切换
function changeTheme(theme) {
    const screen = document.getElementById('main-screen');
    // 移除所有主题类
    screen.className = 'screen';
    screen.classList.add('theme-' + theme);
    showNotification(`已切换为${getThemeName(theme)}主题`);
}

// 获取主题显示名称
function getThemeName(theme) {
    const themeNames = {
        'default': '经典蓝白',
        'dark': '极夜黑',
        'sakura': '樱花粉',
        'midnight': '午夜蓝',
        'sunny': '阳光橙'
    };
    return themeNames[theme] || theme;
}

// 保存设置
function saveSettings() {
    appState.settings.apiUrl = document.getElementById('api-url').value;
    appState.settings.model = document.getElementById('model-select').value;
    
    showNotification('设置已保存');
    closeApp();
}

// 更新统计
function updateStats() {
    document.getElementById('char-count').textContent = 
        appState.aiCharacters.length + appState.userCharacters.length;
}

// 显示通知
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}
