// 应用状态管理
let appState = {
    currentCharacter: { 
        name: "花阳美苑", 
        prompt: "你是花阳美苑，一个温柔贴心的 AI 助手。",
        worldbook: null
    },
    characters: [
        { 
            name: "花阳美苑", 
            prompt: "你是花阳美苑，一个温柔贴心的 AI 助手。",
            worldbook: null,
            isActive: true
        }
    ],
    conversations: [],
    currentChat: [],
    worldbooks: [
        {
            id: 'default',
            name: '默认世界',
            author: '系统',
            style: '普通对话风格',
            background: '基础聊天背景',
            characters: ['花阳美苑'],
            settings: ['日常对话']
        }
    ],
    moments: [],
    currentTheme: 'default',
    customThemes: [],
    settings: {
        apiUrl: 'https://api.deepseek.com/v1',
        apiKey: '',
        model: 'deepseek-chat',
        autoMomentProbability: 50
    }
};

// 本地存储
function saveToLocalStorage() {
    const data = {
        characters: appState.characters,
        worldbooks: appState.worldbooks,
        moments: appState.moments,
        currentTheme: appState.currentTheme,
        customThemes: appState.customThemes,
        settings: appState.settings
    };
    localStorage.setItem('huaYangMeiYuan', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('huaYangMeiYuan');
    if (saved) {
        const data = JSON.parse(saved);
        appState.characters = data.characters || appState.characters;
        appState.worldbooks = data.worldbooks || appState.worldbooks;
        appState.moments = data.moments || appState.moments;
        appState.currentTheme = data.currentTheme || appState.currentTheme;
        appState.customThemes = data.customThemes || appState.customThemes;
        appState.settings = data.settings || appState.settings;
        
        // 更新UI
        updateCharacterList();
        updateWorldbookList();
        updateThemeList();
        updateStats();
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 加载保存的数据
    loadFromLocalStorage();
    
    // 设置默认主题
    changeTheme(appState.currentTheme);
    
    // 初始化时钟
    updateClock();
    setInterval(updateClock, 1000);
    
    // 初始化设置
    document.getElementById('api-url').value = appState.settings.apiUrl;
    document.getElementById('model-select').value = appState.settings.model;
    document.getElementById('auto-moment-prob').value = appState.settings.autoMomentProbability;
    document.getElementById('prob-value').textContent = `${appState.settings.autoMomentProbability}%`;
    
    // 事件监听
    document.getElementById('send-btn').onclick = sendMessage;
    document.getElementById('user-input').addEventListener('keypress', handleKeyPress);
    document.getElementById('auto-moment-prob').addEventListener('input', updateProbabilityValue);
    
    // 初始化世界书下拉框
    updateWorldbookSelect();
    
    // 如果有角色，显示第一个角色
    if (appState.characters.length > 0) {
        appState.currentCharacter = appState.characters[0];
        document.getElementById('chat-title').textContent = `微信 (${appState.currentCharacter.name})`;
    }
    
    // 模拟一些初始动态
    generateRandomMoments();
    
    // 启动自动朋友圈生成
    setInterval(generateAutoMoments, 5 * 60 * 1000); // 每5分钟检查一次
});

// --- 基础系统功能 ---
function updateClock() {
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ":" + 
                   now.getMinutes().toString().padStart(2, '0');
    const dateStr = `${now.getFullYear()}年${(now.getMonth()+1).toString().padStart(2, '0')}月${now.getDate().toString().padStart(2, '0')}日`;
    
    document.getElementById('real-time').textContent = timeStr;
    document.getElementById('real-date').textContent = dateStr;
}

function openApp(appId) {
    document.querySelectorAll('.app-window').forEach(win => win.classList.add('hidden'));
    document.getElementById('app-' + appId).classList.remove('hidden');
    
    // 特殊处理
    if (appId === 'moments') {
        renderMoments();
    } else if (appId === 'worldbook') {
        renderWorldbooks();
    } else if (appId === 'profile') {
        updateStats();
    }
}

function closeApp() {
    document.querySelectorAll('.app-window').forEach(win => win.classList.add('hidden'));
    document.getElementById('desktop').classList.remove('hidden');
    
    // 关闭所有编辑器
    document.querySelectorAll('.char-editor, .group-manager, .importer').forEach(el => {
        el.classList.add('hidden');
    });
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// --- 角色管理 ---
function toggleCharEditor() {
    const editor = document.getElementById('char-editor');
    editor.classList.toggle('hidden');
    if (!editor.classList.contains('hidden')) {
        document.getElementById('group-manager').classList.add('hidden');
    }
}

function updateWorldbookSelect() {
    const select = document.getElementById('char-worldbook');
    select.innerHTML = '<option value="">选择世界书...</option>';
    appState.worldbooks.forEach(wb => {
        const option = document.createElement('option');
        option.value = wb.id;
        option.textContent = wb.name;
        select.appendChild(option);
    });
}

function updateCharFromWorldbook() {
    const worldbookId = document.getElementById('char-worldbook').value;
    if (worldbookId) {
        const worldbook = appState.worldbooks.find(wb => wb.id === worldbookId);
        if (worldbook) {
            const promptInput = document.getElementById('char-prompt');
            const currentPrompt = promptInput.value;
            const newPrompt = `${currentPrompt}\n\n【世界设定】\n名称: ${worldbook.name}\n文风: ${worldbook.style}\n背景: ${worldbook.background}`;
            promptInput.value = newPrompt;
        }
    }
}

function saveCharacter() {
    const name = document.getElementById('char-name').value.trim();
    const prompt = document.getElementById('char-prompt').value.trim();
    const worldbookId = document.getElementById('char-worldbook').value;
    
    if (!name) {
        showNotification('请输入角色名字', 'error');
        return;
    }
    
    const worldbook = worldbookId ? appState.worldbooks.find(wb => wb.id === worldbookId) : null;
    
    const newCharacter = {
        name,
        prompt: prompt || '这是一个AI角色。',
        worldbook: worldbookId,
        isActive: true
    };
    
    // 检查是否已存在
    const existingIndex = appState.characters.findIndex(c => c.name === name);
    if (existingIndex > -1) {
        appState.characters[existingIndex] = newCharacter;
    } else {
        appState.characters.push(newCharacter);
    }
    
    appState.currentCharacter = newCharacter;
    document.getElementById('chat-title').textContent = `微信 (${name})`;
    
    // 清空表单
    document.getElementById('char-name').value = '';
    document.getElementById('char-prompt').value = '';
    document.getElementById('char-worldbook').value = '';
    
    toggleCharEditor();
    updateCharacterList();
    saveToLocalStorage();
    showNotification(`角色"${name}"已保存`);
}

function updateCharacterList() {
    const charCount = document.getElementById('char-count');
    charCount.textContent = appState.characters.length;
}

function openCharacterList() {
    const charList = document.getElementById('available-chars');
    charList.innerHTML = '';
    
    appState.characters.forEach(char => {
        const charItem = document.createElement('div');
        charItem.className = 'char-item';
        charItem.textContent = char.name;
        charItem.onclick = () => selectCharacter(char);
        charList.appendChild(charItem);
    });
    
    document.getElementById('group-manager').classList.remove('hidden');
    document.getElementById('char-editor').classList.add('hidden');
}

function selectCharacter(character) {
    appState.currentCharacter = character;
    document.getElementById('chat-title').textContent = `微信 (${character.name})`;
    closeApp();
    showNotification(`已切换到角色: ${character.name}`);
}

// --- 群聊功能 ---
function openGroupChat() {
    const availableChars = document.getElementById('available-chars');
    const groupChars = document.getElementById('group-chars');
    
    availableChars.innerHTML = '';
    groupChars.innerHTML = '';
    
    appState.characters.forEach(char => {
        const charItem = document.createElement('div');
        charItem.className = 'char-item';
        charItem.textContent = char.name;
        charItem.onclick = () => addToGroup(char, charItem);
        availableChars.appendChild(charItem);
    });
    
    document.getElementById('group-manager').classList.remove('hidden');
    document.getElementById('char-editor').classList.add('hidden');
}

function addToGroup(character, element) {
    element.classList.toggle('selected');
    
    const groupChars = document.getElementById('group-chars');
    if (element.classList.contains('selected')) {
        const groupItem = document.createElement('div');
        groupItem.className = 'char-item';
        groupItem.textContent = character.name;
        groupChars.appendChild(groupItem);
    } else {
        const items = groupChars.querySelectorAll('.char-item');
        items.forEach(item => {
            if (item.textContent === character.name) {
                item.remove();
            }
        });
    }
}

function createGroupChat() {
    const selectedChars = Array.from(
        document.querySelectorAll('#group-chars .char-item')
    ).map(item => item.textContent);
    
    if (selectedChars.length < 2) {
        showNotification('请选择至少2个角色创建群聊', 'error');
        return;
    }
    
    const groupName = `${selectedChars.join('、')}的群聊`;
    appState.currentCharacter = {
        name: groupName,
        prompt: `这是一个群聊，包含以下角色: ${selectedChars.join(', ')}。请模拟群聊对话。`,
        isGroup: true,
        members: selectedChars
    };
    
    document.getElementById('chat-title').textContent = groupName;
    closeApp();
    showNotification(`已创建群聊: ${groupName}`);
}

// --- 聊天功能 ---
async function sendMessage() {
    const input = document.getElementById('user-input');
    const text = input.value.trim();
    const apiKey = document.getElementById('api-key').value;
    const apiUrl = document.getElementById('api-url').value;
    const model = document.getElementById('model-select').value;
    
    if (!text) return;
    if (!apiKey) { 
        showNotification('请先在设置中填入API Key', 'error');
        openApp('settings');
        return;
    }
    
    // 添加用户消息
    appendMessage('user', text);
    input.value = '';
    
    // 显示正在输入
    const loadingId = 'loading-' + Date.now();
    appendMessage('ai', '正在输入...', loadingId);
    
    try {
        const response = await fetch(`${apiUrl}/chat/completions`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${apiKey}` 
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: "system", content: appState.currentCharacter.prompt },
                    ...appState.currentChat,
                    { role: "user", content: text }
                ],
                stream: false
            })
        });
        
        if (!response.ok) {
            throw new Error(`API错误: ${response.status}`);
        }
        
        const data = await response.json();
        document.getElementById(loadingId).remove();
        
        const aiResponse = data.choices[0].message.content;
        appendMessage('ai', aiResponse);
        
        // 保存对话记录
        appState.currentChat.push(
            { role: "user", content: text },
            { role: "assistant", content: aiResponse }
        );
        
        // 限制对话历史长度
        if (appState.currentChat.length > 20) {
            appState.currentChat = appState.currentChat.slice(-20);
        }
        
        // 随机触发AI角色发朋友圈
        if (Math.random() < 0.3) { // 30%概率
            setTimeout(generateAiMoment, 2000);
        }
        
    } catch (error) {
        console.error('API调用失败:', error);
        document.getElementById(loadingId).innerText = "连接失败，请检查API配置。";
    }
}

function appendMessage(role, content, id = null) {
    const win = document.getElementById('chat-window');
    const div = document.createElement('div');
    div.className = `msg ${role}`;
    if (id) div.id = id;
    
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    div.innerHTML = `
        <div class="msg-content">${content.replace(/\n/g, '<br>')}</div>
        <div class="msg-time">${time}</div>
    `;
    
    win.appendChild(div);
    win.scrollTop = win.scrollHeight;
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// --- 朋友圈功能 ---
function openPostEditor() {
    document.getElementById('post-editor').classList.remove('hidden');
}

function closePostEditor() {
    document.getElementById('post-editor').classList.add('hidden');
    document.getElementById('post-content').value = '';
}

function addImageToPost() {
    // 在实际应用中，这里可以实现图片上传功能
    const content = document.getElementById('post-content');
    content.value += '\n[图片]';
    showNotification('已添加图片占位符');
}

function postMoment() {
    const content = document.getElementById('post-content').value.trim();
    if (!content) {
        showNotification('请输入内容', 'error');
        return;
    }
    
    const moment = {
        id: Date.now(),
        author: '我',
        avatar: '👤',
        content: content,
        time: new Date().toLocaleString(),
        likes: 0,
        liked: false,
        comments: [],
        isAI: false
    };
    
    appState.moments.unshift(moment);
    renderMoments();
    closePostEditor();
    showNotification('动态发布成功');
    saveToLocalStorage();
    updateStats();
}

function generateRandomMoments() {
    const sampleMoments = [
        {
            id: 1,
            author: '花阳美苑',
            avatar: '🌸',
            content: '今天天气真好，适合出去散步呢~',
            time: '今天 10:30',
            likes: 3,
            liked: false,
            comments: [],
            isAI: true
        },
        {
            id: 2,
            author: 'AI助手',
            avatar: '🤖',
            content: '刚刚学习了一个新算法，感觉很有收获！',
            time: '昨天 15:20',
            likes: 5,
            liked: true,
            comments: [
                { author: '我', content: '好厉害！' },
                { author: '花阳美苑', content: '可以教教我吗？' }
            ],
            isAI: true
        }
    ];
    
    appState.moments = [...sampleMoments, ...appState.moments];
}

function generateAutoMoments() {
    if (appState.characters.length === 0) return;
    
    const probability = appState.settings.autoMomentProbability / 100;
    if (Math.random() < probability) {
        setTimeout(generateAiMoment, Math.random() * 30000); // 30秒内随机时间
    }
}

function generateAiMoment() {
    if (appState.characters.length === 0) return;
    
    const char = appState.characters[Math.floor(Math.random() * appState.characters.length)];
    const contents = [
        `${char.name}: 今天又是美好的一天！`,
        `${char.name}: 刚刚完成了一个项目，好开心~`,
        `${char.name}: 有人想聊聊天吗？`,
        `${char.name}: 分享一首喜欢的诗...`,
        `${char.name}: 学习新知识中...`
    ];
    
    const moment = {
        id: Date.now(),
        author: char.name,
        avatar: '🤖',
        content: contents[Math.floor(Math.random() * contents.length)],
        time: '刚刚',
        likes: 0,
        liked: false,
        comments: [],
        isAI: true
    };
    
    appState.moments.unshift(moment);
    
    // 如果有朋友圈界面打开，更新它
    if (!document.getElementById('app-moments').classList.contains('hidden')) {
        renderMoments();
    }
    
    // 显示通知
    showNotification(`${char.name} 发布了一条新动态`);
    saveToLocalStorage();
    updateStats();
    
    // 随机评论其他动态
    if (appState.moments.length > 1 && Math.random() < 0.5) {
        setTimeout(() => {
            const targetMoment = appState.moments.find(m => m.id !== moment.id && m.comments);
            if (targetMoment) {
                const comments = ['说得好！', '赞同~', '我也这么想', '😊', '👍'];
                const comment = comments[Math.floor(Math.random() * comments.length)];
                targetMoment.comments.push({
                    author: char.name,
                    content: comment
                });
                saveToLocalStorage();
            }
        }, 5000);
    }
}

function renderMoments() {
    const container = document.getElementById('moments-list');
    container.innerHTML = '';
    
    appState.moments.forEach(moment => {
        const momentEl = document.createElement('div');
        momentEl.className = 'moment-card';
        momentEl.innerHTML = `
            <div class="moment-header">
                <div class="moment-avatar">${moment.avatar}</div>
                <div class="moment-author">
                    <h4>${moment.author}</h4>
                    <div class="moment-time">

