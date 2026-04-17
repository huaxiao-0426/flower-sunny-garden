// 应用状态
let appState = {
    currentApp: 'desktop',
    currentTheme: 'blue',
    characters: [],
    settings: {
        apiKey: '',
        model: 'DeepSeek-V3'
    }
};

// 初始化
function init() {
    updateTime();
    setInterval(updateTime, 1000);
    
    // 绑定所有事件
    bindEvents();
    
    // 显示桌面
    showDesktop();
    
    // 加载保存的数据
    loadData();
    
    console.log('应用初始化完成');
}

// 更新时间
function updateTime() {
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ':' + 
                    now.getMinutes().toString().padStart(2, '0');
    const dateStr = now.getFullYear() + '年' + 
                   (now.getMonth() + 1).toString().padStart(2, '0') + '月' + 
                   now.getDate().toString().padStart(2, '0') + '日';
    
    document.getElementById('time').textContent = timeStr;
    document.getElementById('date').textContent = dateStr;
}

// 绑定事件
function bindEvents() {
    console.log('绑定事件...');
    
    // 应用图标点击事件
    const apps = document.querySelectorAll('.app');
    apps.forEach(app => {
        app.addEventListener('click', function(e) {
            console.log('应用图标被点击');
            const appName = this.getAttribute('onclick').match(/openApp\('(\w+)'\)/)[1];
            openApp(appName);
        });
    });
    
    // 底部导航点击事件
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            console.log('导航按钮被点击');
        });
    });
    
    // 返回按钮点击事件
    const backBtns = document.querySelectorAll('.back-btn');
    backBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            console.log('返回按钮被点击');
            closeApp();
        });
    });
    
    // 主题项点击事件
    const themeItems = document.querySelectorAll('.theme-item');
    themeItems.forEach(item => {
        item.addEventListener('click', function(e) {
            console.log('主题被点击');
        });
    });
    
    console.log('所有事件绑定完成');
}

// 打开应用
function openApp(appName) {
    console.log('打开应用:', appName);
    
    // 隐藏所有窗口
    document.querySelectorAll('.app-window').forEach(window => {
        window.style.display = 'none';
    });
    
    // 隐藏桌面
    document.getElementById('desktop').style.display = 'none';
    document.getElementById('screen').style.display = 'none';
    
    // 显示目标应用
    const targetApp = document.getElementById(appName);
    if (targetApp) {
        targetApp.style.display = 'flex';
        appState.currentApp = appName;
        showNotification('已打开' + getAppName(appName));
    }
}

// 获取应用名称
function getAppName(appId) {
    const names = {
        'wechat': '微信',
        'worldbook': '世界书',
        'theme': '主题壁纸',
        'settings': 'AI设置',
        'profile': '个人资料'
    };
    return names[appId] || appId;
}

// 关闭应用
function closeApp() {
    console.log('关闭应用');
    
    // 隐藏所有应用窗口
    document.querySelectorAll('.app-window').forEach(window => {
        window.style.display = 'none';
    });
    
    // 显示桌面
    document.getElementById('desktop').style.display = 'block';
    document.getElementById('screen').style.display = 'block';
    
    appState.currentApp = 'desktop';
}

// 显示桌面
function showDesktop() {
    document.getElementById('desktop').style.display = 'block';
    document.getElementById('screen').style.display = 'block';
    document.querySelectorAll('.app-window').forEach(window => {
        window.style.display = 'none';
    });
    document.getElementById('charEditor').style.display = 'none';
}

// 显示角色编辑器
function showCharEditor() {
    document.getElementById('charEditor').style.display = 'flex';
}

// 关闭角色编辑器
function closeCharEditor() {
    document.getElementById('charEditor').style.display = 'none';
}

// 保存角色
function saveCharacter() {
    const name = document.getElementById('charName').value.trim();
    const prompt = document.getElementById('charPrompt').value.trim();
    
    if (!name) {
        showNotification('请输入角色名字', 'error');
        return;
    }
    
    const newCharacter = {
        id: Date.now(),
        name: name,
        prompt: prompt || '这是一个新角色',
        avatar: '👤',
        isAI: true
    };
    
    appState.characters.push(newCharacter);
    saveData();
    closeCharEditor();
    showNotification('角色保存成功');
    
    // 清空表单
    document.getElementById('charName').value = '';
    document.getElementById('charPrompt').value = '';
}

// 导入世界书
function importWorldbook() {
    showNotification('导入功能开发中...');
}

// 设置主题
function setTheme(theme) {
    appState.currentTheme = theme;
    document.body.className = theme;
    showNotification('主题已切换');
}

// 改变主题
function changeTheme(type) {
    if (type === 'sun') {
        setTheme('sunny');
    } else if (type === 'moon') {
        setTheme('dark');
    }
}

// 保存设置
function saveSettings() {
    const apiKey = document.querySelector('#settings input[type="password"]').value;
    const model = document.querySelector('#settings select').value;
    
    appState.settings.apiKey = apiKey;
    appState.settings.model = model;
    saveData();
    showNotification('设置已保存');
    closeApp();
}

// 显示通知
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// 保存数据到本地存储
function saveData() {
    localStorage.setItem('huaYangData', JSON.stringify(appState));
}

// 从本地存储加载数据
function loadData() {
    const saved = localStorage.getItem('huaYangData');
    if (saved) {
        appState = JSON.parse(saved);
        
        // 应用主题
        document.body.className = appState.currentTheme;
        
        // 恢复设置
        if (document.querySelector('#settings select')) {
            document.querySelector('#settings select').value = appState.settings.model || 'DeepSeek-V3';
        }
        if (document.querySelector('#settings input[type="password"]')) {
            document.querySelector('#settings input[type="password"]').value = appState.settings.apiKey || '';
        }
    }
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，开始初始化...');
    init();
});

// 全局错误处理
window.addEventListener('error', function(e) {
    console.error('发生错误:', e.message, e.filename, e.lineno);
    showNotification('发生错误: ' + e.message, 'error');
});
