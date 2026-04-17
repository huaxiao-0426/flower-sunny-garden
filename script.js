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
        type: null, // 'single', 'group'
        targetId: null
    }
};

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    // 初始化时钟
    updateClock();
    setInterval(updateClock, 1000);
    
    // 更新用户信息显示
    document.getElementById('user-name').textContent = appState.currentUser.name;
    
    // 初始化聊天列表
    updateChatList();
    updateContactsList();
    
    // 绑定事件
    document.getElementById('single-send-btn').onclick = sendSingleMessage;
    document.getElementById('single-user-input').addEventListener('keypress', handleSingleKeyPress);
});

// 时钟更新
function updateClock() {
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ":" + 
                   now.getMinutes().toString().padStart(2, '0');
    const dateStr = `${now.getFullYear()}年${(now.getMonth()+1).toString().padStart(2, '0')}月${now.getDate().toString().padStart(2, '0')}日`;
    
    document.getElementById('real-time').textContent = timeStr;
    document.getElementById('real-date').textContent = dateStr;
    
    // 更新微信时间
    const wechatTime = document.getElementById('wechat-time');
    if (wechatTime) {
        wechatTime.textContent = timeStr;
    }
}

// 打开应用
function openApp(appId) {
    // 隐藏所有应用窗口
    document.querySelectorAll('.app-window').forEach(win => win.classList.add('hidden'));
    
    // 显示目标应用
    document.getElementById('app-' + appId).classList.remove('hidden');
    
    // 如果是微信，初始化界面
    if (appId === 'wechat') {
        switchWechatTab('chats');
    }
}

// 关闭应用，返回桌面
function closeApp() {
    document.querySelectorAll('.app-window').forEach(win => win.classList.add('hidden'));
    document.getElementById('desktop').classList.remove('hidden');
}

// 微信标签页切换
function switchWechatTab(tab) {
    // 隐藏所有标签页
    document.querySelectorAll('.tab-content, .chat-list-container').forEach(el => {
        el.classList.add('hidden');
    });
    
    // 移除所有激活状态
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // 显示目标标签页
    switch(tab) {
        case 'chats':
            document.getElementById('chat-list-container').classList.remove('hidden');
            document.querySelector('.nav-item:nth-child(1)').classList.add('active');
            break;
        case 'contacts':
            document.getElementById('contacts-container').classList.remove('hidden');
            document.querySelector('.nav-item:nth-child(2)').classList.add('active');
            break;
        case 'discover':
            document.getElementById('discover-container').classList.remove('hidden');
            document.querySelector('.nav-item:nth-child(3)').classList.add('active');
            break;
        case 'profile':
            document.getElementById('profile-container').classList.remove('hidden');
            document.querySelector('.nav-item:nth-child(4)').classList.add('active');
            break;
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
        el.classList.add('hidden');
    });
    document.getElementById('single-chat').classList.remove('hidden');
    
    // 更新聊天标题
    document.getElementById('chat-with-name').textContent = character.name;
    
    // 加载聊天记录
    loadChatMessages(characterId, 'single');
}

// 返回聊天列表
function backToChatList() {
    document.querySelectorAll('.tab-content').forEach(el => {
        el.classList.add('hidden');
    });
    document.getElementById('chat-list-container').classList.remove('hidden');
    appState.currentChat.type = null;
}

// 返回发现页面
function backToDiscover() {
    document.getElementById('moments-container').classList.add('hidden');
    document.getElementById('discover-container').classList.remove('hidden');
}

// 打开朋友圈
function openMoments() {
    document.getElementById('discover-container').classList.add('hidden');
    document.getElementById('moments-container').classList.remove('hidden');
    renderMoments();
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

// 角色编辑器功能
function toggleCharEditor() {
    const editor = document.getElementById('char-editor');
    editor.classList.toggle('hidden');
    if (!editor.classList.contains('hidden')) {
        switchEditorTab('ai');
        updateAvailableChars();
    }
}

function closeCharEditor() {
    document.getElementById('char-editor').classList.add('hidden');
}

function switchEditorTab(tab) {
    // 隐藏所有标签页
    document.querySelectorAll('.editor-tab-content').forEach(el => {
        el.classList.add('hidden');
    });
    
    // 移除所有激活状态
    document.querySelectorAll('.editor-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 显示目标标签页
    switch(tab) {
        case 'ai':
            document.getElementById('ai-char-tab').classList.remove('hidden');
            document.querySelector('.editor-tab:nth-child(1)').classList.add('active');
            break;
        case 'user':
            document.getElementById('user-char-tab').classList.remove('hidden');
            document.querySelector('.editor-tab:nth-child(2)').classList.add('active');
            break;
        case 'group':
            document.getElementById('group-tab').classList.remove('hidden');
            document.querySelector('.editor-tab:nth-child(3)').classList.add('active');
            break;
    }
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

// 加载聊天消息
function loadChatMessages(chatId, chatType) {
    const container = chatType === 'single' ? 
        document.getElementById('single-chat-window') : 
        document.getElementById('group-chat-window');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    const messages = appState.conversations[chatId] || [];
    messages.forEach(msg => {
        displayMessage(msg, chatType === 'group');
    });
    
    // 滚动到底部
    container.scrollTop = container.scrollHeight;
}

// 显示消息
function displayMessage(message, isGroupChat) {
    const container = isGroupChat ? 
        document.getElementById('group-chat-window') : 
        document.getElementById('single-chat-window');
    
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
    // 这里是模拟AI回复
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

// 处理回车键发送
function handleSingleKeyPress(event) {
    if (event.key === 'Enter') {
        sendSingleMessage();
    }
}

// 朋友圈功能
function openPostEditor() {
    document.getElementById('post-editor').classList.remove('hidden');
}

function closePostEditor() {
    document.getElementById('post-editor').classList.add('hidden');
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

// 显示通知
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}
