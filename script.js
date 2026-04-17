// 应用状态管理
let appState = {
    currentCharacter: { 
        name: "花阳美苑", 
        prompt: "你是花阳美苑，一个温柔贴心的 AI 助手。"
    },
    characters: [],
    worldbooks: [],
    moments: [],
    currentTheme: 'default',
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
        appState.settings = data.settings || appState.settings;
        
        // 更新UI
        updateCharacterList();
        updateWorldbookList();
        updateStats();
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 加载保存的数据
    loadFromLocalStorage();
    
    // 设置默认主题
    changeTheme(appState.currentTheme);
    
    // 初始化时钟 - 修复时间不更新问题
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
    
    // 如果有角色，显示第一个角色
    if (appState.characters.length > 0) {
        appState.currentCharacter = appState.characters[0];
        document.getElementById('chat-title').textContent = `微信 (${appState.currentCharacter.name})`;
    }
    
    // 模拟一些初始动态
    generateRandomMoments();
    
    // 启动自动朋友圈生成
    setInterval(generateAutoMoments, 5 * 60 * 1000);
});

// --- 修复的时间功能 ---
function updateClock() {
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ":" + 
                   now.getMinutes().toString().padStart(2, '0');
    const dateStr = `${now.getFullYear()}年${(now.getMonth()+1).toString().padStart(2, '0')}月${now.getDate().toString().padStart(2, '0')}日`;
    
    document.getElementById('real-time').textContent = timeStr;
    document.getElementById('real-date').textContent = dateStr;
}

function updateProbabilityValue() {
    const value = document.getElementById('auto-moment-prob').value;
    document.getElementById('prob-value').textContent = `${value}%`;
    appState.settings.autoMomentProbability = parseInt(value);
    saveToLocalStorage();
}

// --- 修复的应用打开功能 ---
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
    document.querySelectorAll('.char-editor, .group-manager, .importer, .post-editor').forEach(el => {
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
}

function saveCharacter() {
    const name = document.getElementById('char-name').value.trim();
    const prompt = document.getElementById('char-prompt').value.trim();
    
    if (!name) {
        showNotification('请输入角色名字', 'error');
        return;
    }
    
    const newCharacter = {
        name,
        prompt: prompt || '这是一个AI角色。',
        isActive: true
    };
    
    appState.characters.push(newCharacter);
    appState.currentCharacter = newCharacter;
    document.getElementById('chat-title').textContent = `微信 (${name})`;
    
    // 清空表单
    document.getElementById('char-name').value = '';
    document.getElementById('char-prompt').value = '';
    
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
    // 这里可以扩展显示角色列表
    showNotification(`共有 ${appState.characters.length} 个角色`);
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
        showNotification('请先在AI设置中填入API Key', 'error');
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
        
        // 随机触发AI角色发朋友圈
        if (Math.random() < 0.3) {
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
        time: '刚刚',
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
    renderMoments();
}

function generateAutoMoments() {
    if (appState.characters.length === 0) return;
    
    const probability = appState.settings.autoMomentProbability / 100;
    if (Math.random() < probability) {
        setTimeout(generateAiMoment, Math.random() * 30000);
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
    renderMoments();
    showNotification(`${char.name} 发布了一条新动态`);
    saveToLocalStorage();
    updateStats();
}

function renderMoments() {
    const container = document.getElementById('moments-list');
    if (!container) return;
    
    container.innerHTML = '';
    
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
            <div class="moment-actions">
                <button class="like-btn ${moment.liked ? 'liked' : ''}" onclick="toggleLike(${moment.id})">
                    <span>${moment.liked ? '❤️' : '🤍'}</span> ${moment.likes}
                </button>
                <button class="comment-btn" onclick="toggleComment(${moment.id})">
                    <span>💬</span> ${moment.comments.length}
                </button>
            </div>
            ${moment.comments.length > 0 ? `
                <div class="comment-list">
                    ${moment.comments.map(comment => `
                        <div class="comment-item">
                            <span class="comment-author">${comment.author}:</span>
                            <span class="comment-content">${comment.content}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;
        container.appendChild(momentEl);
    });
}

function toggleLike(momentId) {
    const moment = appState.moments.find(m => m.id === momentId);
    if (moment) {
        moment.liked = !moment.liked;
        moment.likes += moment.liked ? 1 : -1;
        renderMoments();
        saveToLocalStorage();
    }
}

// --- 世界书功能 ---
function openWorldbookImporter() {
    document.getElementById('worldbook-importer').classList.toggle('hidden');
}

function importWorldbook(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const worldbook = JSON.parse(e.target.result);
            worldbook.id = 'worldbook-' + Date.now();
            appState.worldbooks.push(worldbook);
            renderWorldbooks();
            saveToLocalStorage();
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

function renderWorldbooks() {
    const container = document.getElementById('worldbook-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    appState.worldbooks.forEach(wb => {
        const card = document.createElement('div');
        card.className = 'worldbook-card';
        card.innerHTML = `
            <h4>${wb.name}</h4>
            <p>作者: ${wb.author}</p>
            <p>文风: ${wb.style}</p>
        `;
        card.onclick = () => loadWorldbook(wb.id);
        container.appendChild(card);
    });
    
    updateStats();
}

function loadWorldbook(worldbookId) {
    const worldbook = appState.worldbooks.find(wb => wb.id === worldbookId);
    if (worldbook) {
        showNotification(`已加载世界书: ${worldbook.name}`);
    }
}

// --- 主题壁纸功能 ---
function changeTheme(theme) {
    const screen = document.getElementById('main-screen');
    // 移除所有主题类
    screen.className = 'screen';
    screen.classList.add('theme-' + theme);
    appState.currentTheme = theme;
    saveToLocalStorage();
    showNotification(`已切换为${theme}主题`);
}

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
    // 这里可以添加上传壁纸的功能
    showNotification('壁纸上传功能开发中...');
}

// --- 设置功能 ---
function saveSettings() {
    appState.settings.apiUrl = document.getElementById('api-url').value;
    appState.settings.apiKey = document.getElementById('api-key').value;
    appState.settings.model = document.getElementById('model-select').value;
    appState.settings.autoMomentProbability = parseInt(document.getElementById('auto-moment-prob').value);
    
    saveToLocalStorage();
    showNotification('设置已保存');
    closeApp();
}

// --- 统计功能 ---
function updateStats() {
    document.getElementById('char-count').textContent = appState.characters.length;
    document.getElementById('moment-count').textContent = appState.moments.length;
    document.getElementById('worldbook-count').textContent = appState.worldbooks.length;
}

