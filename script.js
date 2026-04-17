// 应用状态管理
let appState = {
    // 用户自己的角色
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
    
    // 未读消息计数
    unreadCounts: {},
    
    // 其他状态
    worldbooks: [],
    moments: [],
    currentTheme: 'default',
    settings: {
        apiUrl: 'https://api.deepseek.com/v1',
        apiKey: '',
        model: 'deepseek-chat',
        autoMomentProbability: 50
    },
    
    // 当前聊天状态
    currentChat: {
        type: null, // 'single', 'group'
        targetId: null
    }
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    changeTheme(appState.currentTheme);
    updateClock();
    setInterval(updateClock, 1000);
    
    document.getElementById('api-url').value = appState.settings.apiUrl;
    document.getElementById('model-select').value = appState.settings.model;
    document.getElementById('auto-moment-prob').value = appState.settings.autoMomentProbability;
    document.getElementById('prob-value').textContent = `${appState.settings.autoMomentProbability}%`;
    
    // 事件监听
    document.getElementById('single-send-btn').onclick = sendSingleMessage;
    document.getElementById('single-user-input').addEventListener('keypress', handleSingleKeyPress);
    document.getElementById('group-send-btn').onclick = sendGroupMessage;
    document.getElementById('group-user-input').addEventListener('keypress', handleGroupKeyPress);
    document.getElementById('auto-moment-prob').addEventListener('input', updateProbabilityValue);
    
    // 更新用户名显示
    document.getElementById('user-name').textContent = appState.currentUser.name;
    
    // 初始化聊天列表
    updateChatList();
    updateContactsList();
    updateUnreadCount();
    
    generateRandomMoments();
    setInterval(generateAutoMoments, 5 * 60 * 1000);
});

// 时间功能
function updateClock() {
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ":" + 
                   now.getMinutes().toString().padStart(2, '0');
    const dateStr = `${now.getFullYear()}年${(now.getMonth()+1).toString().padStart(2, '0')}月${now.getDate().toString().padStart(2, '0')}日`;
    
    document.getElementById('real-time').textContent = timeStr;
    document.getElementById('real-date').textContent = dateStr;
    
    // 更新微信顶部时间
    const wechatTime = document.getElementById('wechat-time');
    if (wechatTime) {
        wechatTime.textContent = timeStr;
    }
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
    
    // 清空未读消息
    appState.unreadCounts[characterId] = 0;
    updateUnreadCount();
    
    // 加载聊天记录
    loadChatMessages(characterId, 'single');
}

// 打开群聊
function openGroupChat(groupId) {
    const group = appState.groupChats.find(g => g.id === groupId);
    
    if (!group) return;
    
    appState.currentChat = {
        type: 'group',
        targetId: groupId
    };
    
    // 隐藏其他，显示群聊界面
    document.querySelectorAll('.tab-content, .chat-list-container').forEach(el => {
        el.classList.add('hidden');
    });
    document.getElementById('group-chat').classList.remove('hidden');
    
    // 更新聊天标题
    document.getElementById('group-chat-name').textContent = group.name;
    
    // 清空未读消息
    appState.unreadCounts[groupId] = 0;
    updateUnreadCount();
    
    // 加载聊天记录
    loadChatMessages(groupId, 'group');
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
        const unread = appState.unreadCounts[char.id] || 0;
        
        const item = createChatItem(char, lastMsg, unread, () => openSingleChat(char.id));
        container.appendChild(item);
    });
    
    // 添加用户角色聊天
    appState.userCharacters.forEach(char => {
        const conversation = appState.conversations[char.id] || [];
        const lastMsg = conversation.length > 0 ? conversation[conversation.length - 1] : null;
        const unread = appState.unreadCounts[char.id] || 0;
        
        const item = createChatItem(char, lastMsg, unread, () => openSingleChat(char.id));
        container.appendChild(item);
    });
    
    // 添加群聊
    appState.groupChats.forEach(group => {
        const conversation = appState.conversations[group.id] || [];
        const lastMsg = conversation.length > 0 ? conversation[conversation.length - 1] : null;
        const unread = appState.unreadCounts[group.id] || 0;
        
        const item = createChatItem(group, lastMsg, unread, () => openGroupChat(group.id));
        container.appendChild(item);
    });
}

// 创建聊天项
function createChatItem(target, lastMsg, unread, onClick) {
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
        ${unread > 0 ? `<div class="unread-badge">${unread}</div>` : ''}
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

// 更新未读消息计数
function updateUnreadCount() {
    let totalUnread = 0;
    
    // 计算总未读数
    Object.values(appState.unreadCounts).forEach(count => {
        totalUnread += count;
    });
    
    const badge = document.getElementById('unread-count');
    if (totalUnread > 0) {
        badge.textContent = totalUnread;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

// 角色编辑器功能
function toggleCharEditor() {
    document.getElementById('char-editor').classList.toggle('hidden');
    if (!document.getElementById('char-editor').classList.contains('hidden')) {
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
    
    // 添加当前用户
    const userItem = document.createElement('div');
    userItem.className = 'char-select-item';
    userItem.innerHTML = `
        <input type="checkbox" id="select-user" value="user">
        <div class="char-select-avatar">${appState.currentUser.avatar}</div>
        <label for="select-user">${appState.currentUser.name} (我)</label>
    `;
    container.appendChild(userItem);
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
    saveToLocalStorage();
    showNotification(`AI角色"${name}"已保存`);
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
    saveToLocalStorage();
    showNotification(`用户角色"${name}"已保存`);
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
    
    // 获取群成员信息
    const members = [];
    selectedIds.forEach(id => {
        if (id === 'user') {
            members.push(appState.currentUser);
        } else {
            const aiChar = appState.aiCharacters.find(c => c.id === id);
            const userChar = appState.userCharacters.find(c => c.id === id);
            if (aiChar) members.push(aiChar);
            if (userChar) members.push(userChar);
        }
    });
    
    const newGroup = {
        id: 'group-' + Date.now(),
        name: groupName,
        members: members,
        avatar: '👥',
        isGroup: true
    };
    
    appState.groupChats.push(newGroup);
    
    // 清空表单
    document.getElementById('group-name').value = '';
    selectedItems.forEach(item => item.checked = false);
    
    updateChatList();
    updateContactsList();
    saveToLocalStorage();
    showNotification(`群聊"${groupName}"创建成功`);
    closeCharEditor();
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
    
    // 发送用户消息
    sendMessageToChat(targetId, 'single', text, appState.currentUser);
    
    input.value = '';
    
    // 如果是AI角色，自动回复
    if (character.isAI) {
        setTimeout(() => {
            generateAIResponse(character, text, targetId);
        }, 1000);
    }
}

// 发送群聊消息
function sendGroupMessage() {
    if (appState.currentChat.type !== 'group') return;
    
    const input = document.getElementById('group-user-input');
    const text = input.value.trim();
    const groupId = appState.currentChat.targetId;
    
    if (!text || !groupId) return;
    
    const group = appState.groupChats.find(g => g.id === groupId);
    if (!group) return;
    
    // 发送用户消息
    sendMessageToChat(groupId, 'group', text, appState.currentUser);
    
    input.value = '';
    
    // 随机触发群成员回复
    setTimeout(() => {
        generateGroupResponse(group, text, groupId);
    }, 2000);
}

// 发送消息到聊天
function sendMessageToChat(chatId, chatType, text, sender) {
    const message = {
        id: 'msg-' + Date.now(),
        senderId: sender.id,
        senderName: sender.name,
        senderAvatar: sender.avatar,
        content: text,
        timestamp: Date.now(),
        type: 'text'
    };
    
    // 保存消息
    if (!appState.conversations[chatId]) {
        appState.conversations[chatId] = [];
    }
    appState.conversations[chatId].push(message);
    
    // 如果不是当前聊天，增加未读数
    if (appState.currentChat.targetId !== chatId) {
        appState.unreadCounts[chatId] = (appState.unreadCounts[chatId] || 0) + 1;
        updateUnreadCount();
    }
    
    // 更新聊天列表
    updateChatList();
    
    // 如果正在查看这个聊天，显示消息
    if (appState.currentChat.targetId === chatId) {
        displayMessage(message, chatType === 'group');
    }
    
    saveToLocalStorage();
}

// 显示消息
function displayMessage(message
