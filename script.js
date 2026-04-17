let currentCharacter = { name: "花阳美苑", prompt: "你是花阳美苑，一个温柔贴心的 AI 助手。" };

// --- 基础系统功能 ---
function updateClock() {
    const now = new Date();
    document.getElementById('real-time').innerText = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
}
setInterval(updateClock, 1000);
updateClock();

function openApp(appId) {
    document.querySelectorAll('.app-window').forEach(win => win.classList.add('hidden'));
    document.getElementById('app-' + appId).classList.remove('hidden');
}

function closeApp() {
    document.querySelectorAll('.app-window').forEach(win => win.classList.add('hidden'));
}

// --- 微信角色管理 ---
function toggleCharEditor() {
    document.getElementById('char-editor').classList.toggle('hidden');
}

function saveCharacter() {
    const name = document.getElementById('char-name').value;
    const prompt = document.getElementById('char-prompt').value;
    if(name) {
        currentCharacter = { name, prompt };
        document.getElementById('chat-title').innerText = "微信 (" + name + ")";
        toggleCharEditor();
        appendMessage('ai', `系统：已切换至角色【${name}】`);
    }
}

// --- 聊天逻辑 ---
async function sendMessage() {
    const input = document.getElementById('user-input');
    const text = input.value.trim();
    const apiKey = document.getElementById('api-key').value;
    const apiUrl = document.getElementById('api-url').value || 'https://api.deepseek.com/v1';
    const model = document.getElementById('model-select').value;

    if (!text) return;
    if (!apiKey) { alert('请先在API设置中填入Key'); openApp('settings'); return; }

    appendMessage('user', text);
    input.value = '';

    const loadingId = 'loading-' + Date.now();
    appendMessage('ai', '正在输入...', loadingId);

    try {
        const response = await fetch(`${apiUrl}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: "system", content: currentCharacter.prompt },
                    { role: "user", content: text }
                ]
            })
        });
        const data = await response.json();
        document.getElementById(loadingId).remove();
        appendMessage('ai', data.choices[0].message.content);
    } catch (e) {
        document.getElementById(loadingId).innerText = "连接失败，请检查配置。";
    }
}

function appendMessage(role, content, id = null) {
    const win = document.getElementById('chat-window');
    const div = document.createElement('div');
    div.className = `msg ${role}`;
    if (id) div.id = id;
    div.innerText = content;
    win.appendChild(div);
    win.scrollTop = win.scrollHeight;
}

document.getElementById('send-btn').onclick = sendMessage;

// --- 主题切换 ---
function changeTheme(theme) {
    const screen = document.getElementById('main-screen');
    screen.className = 'screen'; // 重置
    if(theme !== 'default') screen.classList.add('theme-' + theme);
    closeApp();
}
