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
    
    // 群聊列表
    groupChats: [],
    
    // 聊天记录
    conversations: {},
    
    // 当前聊天状态
    currentChat: {
        type: null,
        targetId: null
    },
    
    // 当前应用
    currentApp: 'desktop',
    
    // 当前微信标签页
    currentWechatTab: 'chats',
    
    // 当前编辑器标签页
    currentEditorTab: 'ai',
    
    // 设置
    settings: {
        apiUrl: 'https://api.deepseek.com/v1',
        model: 'deepseek-chat',
        autoMomentProbability: 50
    }
};

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
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
    // 确保桌面是活跃的
    document.getElementById('desktop').style.display = 'flex';
    
    // 隐藏所有应用窗口
    document.querySelectorAll('.app-window').forEach(app => {
        app.style.display = 'none';
    });
    
    // 隐藏所有标签页
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // 隐藏编辑器
    document.getElementById('char-editor').style.display = 'none';
    
    // 隐藏发帖编辑器
    document.getElementById('post-editor').style.display = 'none';
    
    // 隐藏导入器
    document.getElementById('worldbook-importer').style.display = 'none';
    
    // 更新用户信息显示
    document.getElementById('user-name').textContent = appState.currentUser.name;
    
    // 设置默认值
    document.getElementById('api-url').value = appState.settings.apiUrl;
    document.getElementById('model-select').value = appState.settings.model;
    document.getElementById('auto-moment-prob').value = appState.settings.autoMomentProbability;
    document.getElementById('prob-value').textContent = `${appState.settings.autoMomentProbability}%`;
}

// 初始化数据
function initData() {
    // 更新聊天列表
    updateChatList();
    updateContactsList();
    updateStats();
    
    // 加载世界书列表
    updateWorldbookList();
}

// 绑定所有事件
function bindAllEvents() {
    // 桌面应用图标点击
    document.querySelectorAll('.app-icon').forEach(icon => {
        icon.addEventListener('click', function() {
            const app = this.getAttribute('data-app');
            if (app) {
                openApp(app);
            }
        });
    });
    
    // 底部导航图标点击
    document.querySelectorAll('.nav-icon').forEach(icon => {
        icon.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            const app = this.getAttribute('data-app');
            
            if (theme) {
                changeTheme(theme);
            } else if (app) {
                openApp(app);
            }
        });
    });
    
    // 返回按钮
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const backTo = this.getAttribute('data-back');
            const appClose = this.hasAttribute('data-app-close');
            
            if (backTo) {
                if (backTo === 'chats' || backTo === 'discover') {
                    switchWechatTab(backTo);
                }
            } else if (appClose) {
                closeApp();
            }
        });
    });
    
    // 微信底部导航
    document.querySelectorAll('.wechat-nav .nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            if (tab) {
                switchWechatTab(tab);
            }
        });
    });
    
    // 角色编辑器标签页
    document.querySelectorAll('.editor-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-editor-tab');
            switchEditorTab(tabName);
        });
    });
    
    // 主题按钮
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            if (theme) {
                changeTheme(theme);
            }
        });
    });
    
    // 壁纸按钮
    document.querySelectorAll('.wallpaper-item').forEach(item => {
        item.addEventListener('click', function() {
            const wallpaper = this.getAttribute('data-wallpaper');
            if (wallpaper) {
                setWallpaper(wallpaper);
            }
        });
    });
    
    // 按钮事件绑定
    document.getElementById('add-char-btn').addEventListener('click', toggleCharEditor);
    document.getElementById('close-char-editor').addEventListener('click', closeCharEditor);
    document.getElementById('new-chat-btn').addEventListener('click', openNewChat);
    document.getElementById('moments-btn').addEventListener('click', openMoments);
    document.getElementById('camera-btn').addEventListener('click', openPostEditor);
    document.getElementById('save-ai-char-btn').addEventListener('click', saveAICharacter);
    document.getElementById('save-user-char-btn').addEventListener('click', saveUserCharacter);
    document.getElementById('create-group-btn').addEventListener('click', createGroupChat);
    document.getElementById('import-worldbook-btn').addEventListener('click', toggleWorldbookImporter);
    document.getElementById('copy-template-btn').addEventListener('click', copyWorldbookTemplate);
    document.getElementById('upload-wallpaper-btn').addEventListener('click', uploadWallpaper);
    document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
    document.getElementById('post-submit-btn').addEventListener('click', postMoment);
    document.getElementById('post-cancel-btn').addEventListener('click', closePostEditor);
    document.getElementById('single-send-btn').addEventListener('click', sendSingleMessage);
    
    // 文件上传
    document.getElementById('worldbook-file').addEventListener('change', handleWorldbookFile);
    
    // 输入框回车发送
    document.getElementById('single-user-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendSingleMessage();
        }
    });
    
    // 概率滑块
    document.getElementById('auto-moment-prob').addEventListener('input', function() {
        const value = this.value;
        document.getElementById('prob-value').textContent = `${value}%`;
        appState.settings.autoMomentProbability = parseInt(value);
    });
}

// 时钟更新
function updateClock() {
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ":" + 
                   now.getMinutes().toString().padStart(2, '0');
    const dateStr = `${now.getFullYear()}年${(now.getMonth()+1).toString().padStart(2, '0')}月${now.getDate().toString().padStart(2, '0')}日`;
    
    document.getElementById('real-time').textContent = timeStr;
    document.getElementById('real-date').textContent = dateStr;
    document.getElementById('wechat-time').textContent = timeStr;
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
            switchWechatTab('chats');
        }
        
        showNotification(`已打开${getAppName(appName)}`);
    } else {
        console.error(`应用不存在: ${appName}`);
    }
}

// 关闭应用，返回桌面
function closeApp() {
    // 隐藏当前应用
    if (appState.currentApp !== 'desktop') {
        document.getElementById(`app-${appState.currentApp}`).style.display = 'none';
    }
    
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

// 微信标签页切换
function switchWechatTab(tab) {
    console.log(`切换微信标签页: ${tab}`);
    
    // 隐藏所有标签页
    document.querySelectorAll('.tab-content, .chat-list-container').forEach(el => {
        el.style.display = 'none';
    });
    
    // 移除所有激活状态
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // 显示目标标签页
    let targetTab = null;
    switch(tab) {
        case 'chats':
            targetTab = document.getElementById('chat-list-container');
            break;
        case 'contacts':
            targetTab = document.getElementById('contacts-container');
            break;
        case 'discover':
            targetTab = document.getElementById('discover-container');
            break;
        case 'profile':
            targetTab = document.getElementById('profile-container');
            break;
    }
    
    if (targetTab) {
        targetTab.style.display = 'flex';
        appState.currentWechatTab = tab;
        
        // 激活对应的导航按钮
        const navBtn = document.querySelector(`.nav-item[data-tab="${tab}"]`);
        if (navBtn) {
            navBtn.classList.add('active');
        }
    }
}

// 打开朋友圈
function openMoments() {
    switchWechatTab('chats');
    document.getElementById('moments-container').style.display = 'flex';
    renderMoments();
}

// 角色编辑器切换
function toggleCharEditor() {
    const editor = document.getElementById('char-editor');
    if (editor.style.display === 'none' || editor.style.display === '') {
        editor.style.display = 'flex';
        switchEditorTab('ai');
        updateAvailableChars();
    } else {
        editor.style.display = 'none';
    }
}

function closeCharEditor() {
    document.getElementById('char-editor').style.display = 'none';
}

function switchEditorTab(tab) {
    // 隐藏所有标签页
    document.querySelectorAll('.editor-tab-content').forEach(content => {
        content.style.display = 'none';
    });
    
    // 移除所有激活状态
    document.querySelectorAll('.editor-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 显示目标标签页
    const targetTab = document.getElementById(`${tab}-tab`) || document.getElementById(`${tab}-char-tab`);
    if (targetTab) {
        targetTab.style.display = 'block';
        appState.currentEditorTab = tab;
        
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
        
        const item = createChatItem(char, lastMsg, () => openSingleChat(char.id));
        container.appendChild(item);
    });
    
    // 添加用户角色聊天
    appState.userCharacters.forEach(char => {
        const conversation = appState.conversations[char.id] || [];
        const lastMsg = conversation.length > 0 ? conversation[conversation.length - 1] : null;
        
        const item = createChatItem(char, lastMsg, () => openSingleChat(char.id));
        container.appendChild(item);
    });
}

// 创建聊天项
function createChatItem(target, lastMsg, onClick) {
    const item = document.createElement('div');
    item.className = 'chat-item';
    item.onclick = onClick;
    
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

// 打开单聊
function openSingleChat(characterId) {
    const allCharacters = [...appState.aiCharacters, ...appState.userCharacters];
    const character = allCharacters.find(c => c.id === characterId);
    
    if (!character) return;
    
    appState.currentChat = {
        type: 'single',
        targetId: characterId
    };
    
    // 隐藏其他，显示单聊界面
    document.querySelectorAll('.tab-content, .chat-list-container').forEach(el => {
        el.style.display = 'none';
    });
    document.getElementById('single-chat').style.display = 'flex';
    
    // 更新聊天标题
    document.getElementById('chat-with-name').textContent = character.name;
    
    // 加载聊天记录
    loadChatMessages(characterId, 'single');
}

// 加载聊天消息
function loadChatMessages(chatId, chatType) {
    const container = document.getElementById('single-chat-window');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    const messages = appState.conversations[chatId] || [];
    messages.forEach(msg => {
        displayMessage(msg, false);
    });
    
    // 滚动到底部
    container.scrollTop = container.scrollHeight;
}

// 显示消息
function displayMessage(message, isGroupChat) {
    const container = document.getElementById('single-chat-window');
    
    if (!container) return;
    
    const isUser = message.senderId === appState.currentUser.id;
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${isUser ? 'user-msg' : 'other-msg'}`;
    
    const time = new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    msgDiv.innerHTML = `
        <div class="msg-content">${message.content.replace(/\n/g, '<br>')}</div>
        <div class="msg-time">${time}</div>
    `;
    
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

// 发送单聊消息
function sendSingleMessage() {
    if (appState.currentChat.type !== 'single') return;
    
    const input = document.getElementById('single-user-input');
    const text = input.value.trim();
    const targetId = appState.currentChat.targetId;
    
    if (!text || !targetId) return;
    
    const allCharacters = [...appState.aiCharacters, ...appState.userCharacters];
    const character = allCharacters.find(c => c.id === targetId);
    
    if (!character) return;
    
    // 创建消息
    const message = {
        id: 'msg-' + Date.now(),
        senderId: appState.currentUser.id,
        senderName: appState.currentUser.name,
        content: text,
        timestamp: Date.now(),
        type: 'text'
    };
    
    // 保存消息
    if (!appState.conversations[targetId]) {
        appState.conversations[targetId] = [];
    }
    appState.conversations[targetId].push(message);
    
    // 显示消息
    displayMessage(message, false);
    
    input.value = '';
    
    // 更新聊天列表的最后消息
    updateChatList();
    
    // 如果是AI角色，自动回复
    if (character.isAI) {
        setTimeout(() => {
            generateAIResponse(character, text, targetId);
        }, 1000);
    }
}

// 生成AI回复
function generateAIResponse(character, userMessage, chatId) {
    const responses = [
        "我明白了。",
        "很有趣的观点。",
        "能详细说说吗？",
        "哈哈，你真有意思。",
        "我也这么觉得。",
        "这个想法不错。"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    const aiMessage = {
        id: 'msg-' + Date.now(),
        senderId: character.id,
        senderName: character.name,
        content: randomResponse,
        timestamp: Date.now(),
        type: 'text'
    };
    
    if (!appState.conversations[chatId]) {
        appState.conversations[chatId] = [];
    }
    appState.conversations[chatId].push(aiMessage);
    
    displayMessage(aiMessage, false);
    updateChatList();
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
    updateContactsList();
    updateAvailableChars();
    showNotification(`AI角色"${name}"已保存`);
    
    // 自动打开与这个角色的聊天
    setTimeout(() => {
        openSingleChat(newCharacter.id);
    }, 500);
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
    updateContactsList();
    updateAvailableChars();
    showNotification(`用户角色"${name}"已保存`);
    
    // 自动打开与这个角色的聊天
    setTimeout(() => {
        openSingleChat(newCharacter.id);
    }, 500);
}

// 更新可选角色列表
function updateAvailableChars() {
    const container = document.getElementById('available-chars');
    if (!container) return;
    
    container.innerHTML = '';
    
    // 添加AI角色
    appState.aiCharacters.forEach(char => {
        const item = document.createElement('div');
        item.className = 'char-select-item';
        item.innerHTML = `
            <input type="checkbox" id="select-${char.id}" value="${char.id}">
            <div class="char-select-avatar">${char.avatar}</div>
            <label for="select-${char.id}">${char.name}</label>
        `;
        container.appendChild(item);
    });
    
    // 添加用户角色
    appState.userCharacters.forEach(char => {
        const item = document.createElement('div');
        item.className = 'char-select-item';
        item.innerHTML = `
            <input type="checkbox" id="select-${char.id}" value="${char.id}">
            <div class="char-select-avatar">${char.avatar}</div>
            <label for="select-${char.id}">${char.name}</label>
        `;
        container.appendChild(item);
    });
}

// 创建群聊
function createGroupChat() {
    const selectedItems = document.querySelectorAll('#available-chars input[type="checkbox"]:checked');
    if (selectedItems.length < 2) {
        showNotification('请选择至少2个成员创建群聊', 'error');
        return;
    }
    
    const selectedIds = Array.from(selectedItems).map(item => item.value);
    const groupName = document.getElementById('group-name').value.trim() || 
                     `群聊${appState.groupChats.length + 1}`;
    
    const newGroup = {
        id: 'group-' + Date.now(),
        name: groupName,
        memberIds: selectedIds,
        avatar: '👥',
        isGroup: true
    };
    
    appState.groupChats.push(newGroup);
    
    // 清空表单
    document.getElementById('group-name').value = '';
    selectedItems.forEach(item => item.checked = false);
    
    showNotification(`群聊"${groupName}"创建成功`);
    closeCharEditor();
}

// 更新联系人列表
function updateContactsList() {
    const container = document.getElementById('contacts-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    // 添加AI角色
    appState.aiCharacters.forEach(char => {
        const item = document.createElement('div');
        item.className = 'contact-item';
        item.onclick = () => openSingleChat(char.id);
        item.innerHTML = `
            <div class="contact-avatar">${char.avatar}</div>
            <div class="contact-info">
                <div class="contact-name">${char.name}</div>
            </div>
        `;
        container.appendChild(item);
    });
    
    // 添加用户角色
    appState.userCharacters.forEach(char => {
        const item = document.createElement('div');
        item.className = 'contact-item';
        item.onclick = () => openSingleChat(char.id);
        item.innerHTML = `
            <div class="contact-avatar">${char.avatar}</div>
            <div class="contact-info">
                <div class="contact-name">${char.name}</div>
            </div>
        `;
        container.appendChild(item);
    });
}

// 朋友圈功能
function openPostEditor() {
    document.getElementById('post-editor').style.display = 'block';
}

function closePostEditor() {
    document.getElementById('post-editor').style.display = 'none';
    document.getElementById('post-content').value = '';
}

function postMoment() {
    const content = document.getElementById('post-content').value.trim();
    if (!content) {
        showNotification('请输入内容', 'error');
        return;
    }
    
    const moment = {
        id: Date.now(),
        author: appState.currentUser.name,
        avatar: appState.currentUser.avatar,
        content: content,
        time: '刚刚',
        likes: 0,
        comments: []
    };
    
    if (!appState.moments) appState.moments = [];
    appState.moments.unshift(moment);
    renderMoments();
    closePostEditor();
    showNotification('动态发布成功');
    updateStats();
}

function renderMoments() {
    const container = document.getElementById('moments-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!appState.moments || appState.moments.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:20px;color:#888;">暂无动态</div>';
        return;
    }
    
    appState.moments.forEach(moment => {
        const momentEl = document.createElement('div');
        momentEl.className = 'moment-card';
        momentEl.innerHTML = `
            <div class="moment-header">
                <div class="moment-avatar">${moment.avatar}</div>
                <div class="moment-author">
                    <h4>${moment.author}</h4>
                    <div class="moment-time">${moment.time}</div>
                </div>
            </div>
            <div class="moment-content">${moment.content}</div>
        `;
        container.appendChild(momentEl);
    });
}

// 主题切换
function changeTheme(theme) {
    const screen = document.getElementById('main-screen');
    // 移除所有主题类
    screen.className = 'screen';
    screen.classList.add('theme-' + theme);
    showNotification(`已切换为${theme}主题`);
}

// 壁纸设置
function setWallpaper(wallpaper) {
    const bg = document.getElementById('desktop-bg');
    switch(wallpaper) {
        case 'gradient1':
            bg.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
            break;
        case 'gradient2':
            bg.style.background = 'linear-gradient(45deg, #ff9a9e, #fad0c4)';
            break;
        case 'gradient3':
            bg.style.background = 'linear-gradient(45deg, #a1c4fd, #c2e9fb)';
            break;
    }
    showNotification('壁纸已更换');
}

function uploadWallpaper() {
    showNotification('壁纸上传功能开发中...');
}

// 世界书功能
function toggleWorldbookImporter() {
    const importer = document.getElementById('worldbook-importer');
    if (importer.style.display === 'none' || importer.style.display === '') {
        importer.style.display = 'block';
    } else {
        importer.style.display = 'none';
    }
}

function handleWorldbookFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const worldbook = JSON.parse(e.target.result);
            worldbook.id = 'worldbook-' + Date.now();
            
            if (!appState.worldbooks) appState.worldbooks = [];
            appState.worldbooks.push(worldbook);
            
            updateWorldbookList();
            showNotification(`世界书"${worldbook.name}"导入成功`);
        } catch (error) {
            showNotification('文件格式错误', 'error');
        }
    };
    reader.readAsText(file);
}

function copyWorldbookTemplate() {
    const template = document.getElementById('worldbook-template');
    template.select();
    document.execCommand('copy');
    showNotification('模板已复制到剪贴板');
}

function updateWorldbookList() {
    const container = document.getElementById('worldbook-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!appState.worldbooks || appState.worldbooks.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:20px;color:#888;">暂无世界书</div>';
        return;
    }
    
    appState.worldbooks.forEach(wb => {
        const card = document.createElement('div');
        card.className = 'worldbook-card';
        card.innerHTML = `
            <h4>${wb.name}</h4>
            <p>作者: ${wb.author}</p>
        `;
        container.appendChild(card);
    });
    
    updateStats();
}

// 保存设置
function saveSettings() {
    appState.settings.apiUrl = document.getElementById('api-url').value;
    appState.settings.apiKey = document.getElementById('api-key').value;
    appState.settings.model = document.getElementById('model-select').value;
    
    showNotification('设置已保存');
    closeApp();
}

// 更新统计
function updateStats() {
    document.getElementById('char-count').textContent = 
        appState.aiCharacters.length + appState.userCharacters.length;
    document.getElementById('moment-count').textContent = 
        (appState.moments ? appState.moments.length : 0);
    document.getElementById('worldbook-count').textContent = 
        (appState.worldbooks ? appState.worldbooks.length : 0);
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

// 打开新聊天
function openNewChat() {
    toggleCharEditor();
}
