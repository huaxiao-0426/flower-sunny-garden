/**
 * 花阳美苑 - 核心脚本
 * 包含：实时时钟、配置管理、API 请求逻辑
 */

// --- 1. 获取 HTML 元素 ---
const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const configPanel = document.getElementById('config-panel');
const configToggle = document.getElementById('config-toggle');
const saveBtn = document.getElementById('save-config');
const realTimeElement = document.getElementById('real-time');

// --- 2. 实时时钟功能 ---
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    if (realTimeElement) {
        realTimeElement.innerText = `${hours}:${minutes}`;
    }
}
// 每秒更新一次时间，并立即执行一次防止白屏
setInterval(updateClock, 1000);
updateClock();

// --- 3. 配置面板交互 ---
// 点击⚙️按钮切换面板显示或隐藏
configToggle.onclick = () => {
    configPanel.classList.toggle('hidden');
};

// 点击保存按钮
saveBtn.onclick = () => {
    const key = document.getElementById('api-key').value;
    if (!key) {
        alert('请填入 API Key，否则无法聊天哦！');
        return;
    }
    configPanel.classList.add('hidden');
    appendMessage('ai', '系统：配置已保存，花阳美苑准备好为您服务了。');
};

// --- 4. 核心聊天逻辑 ---
async function sendMessage() {
    const text = userInput.value.trim();
    const apiKey = document.getElementById('api-key').value;
    const apiUrl = document.getElementById('api-url').value || 'https://api.deepseek.com/v1';
    const model = document.getElementById('model-select').value;

    // 基础检查
    if (!text) return;
    if (!apiKey) {
        alert('请先通过设置配置您的 API Key');
        configPanel.classList.remove('hidden');
        return;
    }

    // A. 在屏幕显示用户消息
    appendMessage('user', text);
    userInput.value = '';

    // B. 显示思考状态
    const loadingId = 'loading-' + Date.now();
    appendMessage('ai', '正在思考...', loadingId);

    // C. 发起网络请求
    try {
        const response = await fetch(`${apiUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: 'user', content: text }],
                // 可以根据需要增加温度等参数
                temperature: 0.7
            })
        });

        const data = await response.json();

        // 移除“正在思考”提示
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.remove();

        if (data.error) {
            appendMessage('ai', '抱歉，接口返回了错误：' + data.error.message);
        } else {
            const aiReply = data.choices[0].message.content;
            appendMessage('ai', aiReply);
        }
    } catch (error) {
        // 请求失败处理
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.remove();
        appendMessage('ai', '网络连接失败，请检查反代地址是否正确或网络环境。');
        console.error('API Error:', error);
    }
}

// --- 5. 辅助功能 ---
// 在聊天窗口添加气泡
function appendMessage(role, content, id = null) {
    const div = document.createElement('div');
    div.className = `msg ${role}`;
    if (id) div.id = id;
    
    // 如果是 AI 回复，支持简单的换行显示
    div.innerText = content;
    
    chatWindow.appendChild(div);
    
    // 自动滚动到最新消息
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// 绑定发送按钮点击事件
sendBtn.onclick = sendMessage;

// 绑定回车键发送
userInput.onkeypress = (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
};
