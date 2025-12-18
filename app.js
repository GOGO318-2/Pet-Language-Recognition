// ===== PetMind 主应用逻辑 =====

// TODO: 请替换为您的Gemini API密钥
// 注意：仅用于本地/测试环境，正式环境建议走后端代理，避免在前端暴露密钥
const GEMINI_API_KEY = 'AIzaSyA-cBJ0LURnlsxxAXLN-R-qav45a7sK2qM';
// 使用当前推荐的多模态模型：gemini-1.5-flash-latest，并使用 v1beta generateContent 接口
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;


// 全局状态管理
let currentFile = null;
let currentFileType = null; // 'image' 或 'video'
let analysisResult = null;

// DOM元素引用
const elements = {
    // 登录相关
    loginBtn: document.getElementById('loginBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    userInfo: document.getElementById('userInfo'),
    userAvatar: document.getElementById('userAvatar'),
    userName: document.getElementById('userName'),
    userSection: document.getElementById('userSection'),
    
    // 页面切换
    welcomeSection: document.getElementById('welcomeSection'),
    appSection: document.getElementById('appSection'),
    
    // 上传相关
    uploadCard: document.querySelector('.upload-card'),
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    previewImage: document.getElementById('previewImage'),
    previewVideo: document.getElementById('previewVideo'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    clearBtn: document.getElementById('clearBtn'),
    
    // 加载和结果
    loadingCard: document.getElementById('loadingCard'),
    resultCard: document.getElementById('resultCard'),
    resultContent: document.getElementById('resultContent'),
    shareBtn: document.getElementById('shareBtn'),
    newAnalysisBtn: document.getElementById('newAnalysisBtn')
};

// ===== Firebase 认证逻辑 =====

// Firebase认证函数（将在initAuth中初始化）
let firebaseAuthFunctions = null;

/**
 * 初始化Firebase认证状态监听
 */
async function initAuth() {
    if (!window.firebaseAuth) {
        console.error('Firebase未正确初始化');
        return;
    }

    // 动态导入Firebase认证函数
    firebaseAuthFunctions = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    const { signInWithPopup, signOut, onAuthStateChanged } = firebaseAuthFunctions;
    
    // 监听认证状态变化
    onAuthStateChanged(window.firebaseAuth, (user) => {
        if (user) {
            // 用户已登录
            handleUserLogin(user);
        } else {
            // 用户未登录
            handleUserLogout();
        }
    });

    // 登录按钮事件
    elements.loginBtn.addEventListener('click', async () => {
        try {
            await signInWithPopup(window.firebaseAuth, window.firebaseProvider);
        } catch (error) {
            console.error('登录失败:', error);
            alert('登录失败，请重试');
        }
    });

    // 退出按钮事件
    elements.logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(window.firebaseAuth);
        } catch (error) {
            console.error('退出失败:', error);
            alert('退出失败，请重试');
        }
    });
}

/**
 * 处理用户登录
 */
function handleUserLogin(user) {
    // 更新用户信息显示
    elements.userAvatar.src = user.photoURL || '';
    elements.userName.textContent = user.displayName || '用户';
    elements.userInfo.style.display = 'flex';
    elements.loginBtn.style.display = 'none';
}

/**
 * 处理用户退出
 */
function handleUserLogout() {
    // 重置用户信息显示
    elements.userInfo.style.display = 'none';
    elements.loginBtn.style.display = 'block';
    
    // 清除当前状态
    resetAppState();
}

// ===== 文件上传处理 =====

/**
 * 初始化文件上传功能
 */
function initFileUpload() {
    // 点击上传区域
    elements.uploadArea.addEventListener('click', () => {
        elements.fileInput.click();
    });

    // 文件选择
    elements.fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelect(file);
        }
    });

    // 拖拽上传
    elements.uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.add('dragover');
    });

    elements.uploadArea.addEventListener('dragleave', () => {
        elements.uploadArea.classList.remove('dragover');
    });

    elements.uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.remove('dragover');
        
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    });

    // 清除按钮
    elements.clearBtn.addEventListener('click', () => {
        resetFileState();
    });

    // 分析按钮
    elements.analyzeBtn.addEventListener('click', () => {
        if (currentFile) {
            analyzeMedia(currentFile);
        }
    });
}

/**
 * 处理文件选择
 */
function handleFileSelect(file) {
    // 验证文件类型
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        alert('请上传图片或视频文件');
        return;
    }

    currentFile = file;
    currentFileType = file.type.startsWith('image/') ? 'image' : 'video';

    // 显示预览
    const reader = new FileReader();
    reader.onload = (e) => {
        if (currentFileType === 'image') {
            elements.previewImage.src = e.target.result;
            elements.previewImage.style.display = 'block';
            elements.previewVideo.style.display = 'none';
        } else {
            elements.previewVideo.src = e.target.result;
            elements.previewVideo.style.display = 'block';
            elements.previewImage.style.display = 'none';
        }
        
        // 隐藏上传提示
        const placeholder = elements.uploadArea.querySelector('.upload-placeholder');
        if (placeholder) {
            placeholder.style.display = 'none';
        }
        
        // 显示操作按钮
        elements.analyzeBtn.disabled = false;
        elements.clearBtn.style.display = 'block';
    };
    
    reader.readAsDataURL(file);
}

/**
 * 重置文件状态
 */
function resetFileState() {
    currentFile = null;
    currentFileType = null;
    elements.fileInput.value = '';
    elements.previewImage.style.display = 'none';
    elements.previewVideo.style.display = 'none';
    
    const placeholder = elements.uploadArea.querySelector('.upload-placeholder');
    if (placeholder) {
        placeholder.style.display = 'flex';
    }
    
    elements.analyzeBtn.disabled = true;
    elements.clearBtn.style.display = 'none';
}

// ===== Gemini API 调用 =====

/**
 * 将文件转换为base64
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // 移除data URL前缀（data:image/jpeg;base64,）
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * 分析媒体文件
 */
async function analyzeMedia(file) {
    try {
        // 显示加载状态
        showLoading();
        
        // 将文件转换为base64
        const base64Data = await fileToBase64(file);
        
        // 确定MIME类型
        const mimeType = file.type;
        
        // 构建请求体
        const requestBody = {
            contents: [{
                parts: [
                    {
                        text: "请分析这张宠物照片/视频，从心理学角度解读宠物的情绪、行为和心理状态。请用中文回答，内容要专业但易懂，包括：1. 情绪状态分析 2. 行为解读 3. 心理需求推测 4. 建议和注意事项"
                    },
                    {
                        inline_data: {
                            mime_type: mimeType,
                            data: base64Data
                        }
                    }
                ]
            }]
        };
        
        // 调用Gemini API
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'API调用失败');
        }
        
        const data = await response.json();
        
        // 提取分析结果
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            analysisResult = data.candidates[0].content.parts[0].text;
            showResult(analysisResult);
        } else {
            throw new Error('无法获取分析结果');
        }
        
    } catch (error) {
        console.error('分析失败:', error);
        hideLoading();
        alert('分析失败：' + error.message);
    }
}

/**
 * 显示加载状态
 */
function showLoading() {
    elements.uploadCard.style.display = 'none';
    elements.resultCard.style.display = 'none';
    elements.loadingCard.style.display = 'block';
}

/**
 * 隐藏加载状态
 */
function hideLoading() {
    elements.loadingCard.style.display = 'none';
}

/**
 * 显示分析结果
 */
function showResult(result) {
    hideLoading();
    elements.resultContent.textContent = result;
    elements.resultCard.style.display = 'block';
    elements.uploadCard.style.display = 'none';
}

// ===== 分享功能 =====

/**
 * 初始化分享功能
 */
function initShare() {
    elements.shareBtn.addEventListener('click', generateShareImage);
    elements.newAnalysisBtn.addEventListener('click', () => {
        resetAppState();
    });
}

/**
 * 生成分享图片
 */
async function generateShareImage() {
    try {
        elements.shareBtn.disabled = true;
        elements.shareBtn.textContent = '生成中...';
        
        // 使用html2canvas截取结果卡片
        const canvas = await html2canvas(elements.resultCard, {
            backgroundColor: '#FFFFFF',
            scale: 2, // 提高清晰度
            logging: false
        });
        
        // 转换为图片并下载
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `petmind-analysis-${Date.now()}.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            
            elements.shareBtn.disabled = false;
            elements.shareBtn.textContent = '生成分享图';
        }, 'image/png');
        
    } catch (error) {
        console.error('生成分享图失败:', error);
        alert('生成分享图失败，请重试');
        elements.shareBtn.disabled = false;
        elements.shareBtn.textContent = '生成分享图';
    }
}

// ===== 应用状态重置 =====

/**
 * 重置应用状态
 */
function resetAppState() {
    resetFileState();
    analysisResult = null;
    elements.resultCard.style.display = 'none';
    elements.uploadCard.style.display = 'block';
}

// ===== 应用初始化 =====

/**
 * 应用入口
 */
document.addEventListener('DOMContentLoaded', () => {
    // 等待Firebase初始化完成
    const checkFirebase = setInterval(() => {
        if (window.firebaseAuth) {
            clearInterval(checkFirebase);
            // 初始化认证
            initAuth();
            // 初始化其他功能
            initFileUpload();
            initShare();
        }
    }, 100);
    
    // 超时检查
    setTimeout(() => {
        if (!window.firebaseAuth) {
            clearInterval(checkFirebase);
            console.error('Firebase初始化超时');
            alert('应用初始化失败，请刷新页面重试');
        }
    }, 5000);
});

