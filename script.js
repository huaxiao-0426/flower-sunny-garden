let currentPersona = { name: "花阳", prompt: "你是一个温柔贴心的少女。" };

// 1. 时间同步
function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `${h}:${m}`;
    document.getElementById('real-time').innerText = timeStr;
    if(document.getElementById('big-time')) document.getElementById('big-time').innerText = timeStr;
    
    const dateStr = `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日`;
    if(document.getElementById('big-date')) document.getElementById('big-date').innerText = dateStr;
}
setInterval(updateClock, 1000);
updateClock();

// 2. 窗口切换逻辑
function openApp(id) {
    // 隐藏桌面
    document.getElementById('desktop').classList.add('hidden');
    // 显示对应的窗口
    document.getElementById('app-' + id).classList.remove('hidden');
}

function closeApp() {
    // 隐藏所有窗口
    document.querySelectorAll('.app-window').forEach(win => win.classList.add('hidden'));
    // 显示桌面
    document.getElementById('desktop').classList.remove('hidden');
}

// 3. 微信功能
function toggleCharEditor() {
    document.getElementById('char-editor').classList.toggle('hidden');
}

function saveChar() {
    const name = document.getElementById('char-name').value;
    const prompt = document.getElementById('char-prompt').value;
    if(name) {
        currentPersona = { name, prompt };
        document.getElementById('chat-target').innerText = `微信 (${name})`;
        appendMsg('ai', `系统：已成功切换至角色【${name}】`);
        toggleCharEditor();
    }
}

async function sendChat() {
    const input = document.getElementById('user-msg');
    const text = input.value.trim();
    if(!text) return;

    const key = document.getElementById('api-key').value;
    const url = document.getElementById('api-url').value;
    const model = document.getElementById('model-select').value;

    if(!key) { alert("请先在'AI设置'里填入 API Key！"); openApp('settings'); return; }

    appendMsg('user', text);
    input.value = '';

    const tempId = 'loading-' + Date.now();
    appendMsg('ai', '正在输入...', tempId);

    try {
        const response = await fetch(`${url}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: "system", content: currentPersona.prompt },
                    { role: "user", content: text }
                ]
            })
        });
        const data = await response.json();
        document.getElementById(tempId).remove();
        appendMsg('ai', data.choices[0].message.content);
    } catch (e) {
        document.getElementById(tempId).innerText = "连接失败，请检查网络或配置。";
    }
}

function appendMsg(role, content, id = null) {
    const box = document.getElementById('chat-box');
    const div = document.createElement('div');
    div.className = `msg ${role}`;
    if(id) div.id = id;
    div.innerText = content;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}
