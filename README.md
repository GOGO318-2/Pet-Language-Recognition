# PetMind - 宠物心理分析应用

一个基于AI的单页H5应用，通过分析宠物照片/视频来解读宠物的心理状态。

## 功能特性

- 🔐 Google账号登录（Firebase Authentication）
- 📸 支持图片和视频上传（拖拽或点击上传）
- 🤖 AI智能分析（Gemini Pro Vision API）
- 📤 生成分享图片（html2canvas）
- 📱 响应式设计，完美适配移动端

## 技术栈

- **前端框架**: 原生HTML、CSS、JavaScript
- **认证服务**: Firebase Authentication v9+ (Google登录)
- **AI服务**: Google Gemini Pro Vision API v1beta
- **工具库**: html2canvas (分享图生成)

## 快速开始

### 第一步：配置Firebase

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 创建新项目或选择现有项目
3. 启用 **Authentication** > **Sign-in method** > **Google**
4. 获取项目配置信息

### 第二步：配置Gemini API

1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 创建API密钥
3. 确保已启用Gemini Pro Vision API

### 第三步：替换配置

#### 1. 在 `index.html` 中替换Firebase配置

找到以下代码段（约第12-19行）：

```html
// TODO: 请替换为您的Firebase配置
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

替换为您的实际Firebase配置值。

#### 2. 在 `app.js` 中替换Gemini API密钥

找到以下代码段（约第4行）：

```javascript
// TODO: 请替换为您的Gemini API密钥
const GEMINI_API_KEY = 'YOUR_API_KEY';
```

替换为您的实际Gemini API密钥。

#### 3. （可选）配置Google AdSense

在 `index.html` 的页脚部分（约第118-130行），找到AdSense代码注释，取消注释并替换为您的广告代码。

## 运行项目

### 本地开发

由于使用了ES模块和Firebase SDK，建议使用本地服务器运行：

#### 方法1：使用Python（推荐）

```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### 方法2：使用Node.js

```bash
# 安装http-server
npm install -g http-server

# 运行
http-server -p 8000
```

#### 方法3：使用VS Code Live Server

1. 安装VS Code扩展 "Live Server"
2. 右键点击 `index.html`
3. 选择 "Open with Live Server"

然后在浏览器中访问：`http://localhost:8000`

### 部署

#### 部署到Firebase Hosting

1. 安装Firebase CLI：
```bash
npm install -g firebase-tools
```

2. 登录Firebase：
```bash
firebase login
```

3. 初始化项目：
```bash
firebase init hosting
```

4. 部署：
```bash
firebase deploy --only hosting
```

#### 部署到其他平台

- **Netlify**: 直接拖拽项目文件夹到Netlify
- **Vercel**: 使用Vercel CLI或GitHub集成
- **GitHub Pages**: 推送到GitHub仓库并启用Pages

## 项目结构

```
pet/
├── index.html      # 主页面结构
├── style.css       # 样式文件
├── app.js          # 应用逻辑
└── README.md       # 项目说明
```

## 注意事项

1. **API密钥安全**: 
   - 生产环境建议使用环境变量或后端代理
   - 当前实现中API密钥暴露在前端，仅适用于演示

2. **CORS问题**: 
   - Gemini API可能需要在Firebase配置中添加授权域名
   - 如遇CORS错误，考虑使用后端代理

3. **文件大小限制**: 
   - 建议限制上传文件大小（可在代码中添加验证）
   - Gemini API对文件大小有限制

4. **浏览器兼容性**: 
   - 需要支持ES6+的现代浏览器
   - 移动端建议使用Chrome或Safari

## 常见问题

### Q: 登录按钮点击无反应？
A: 检查Firebase配置是否正确，确保已启用Google登录方式。

### Q: 分析失败？
A: 检查Gemini API密钥是否正确，确保已启用Gemini Pro Vision API。

### Q: 分享图生成失败？
A: 确保html2canvas库已正确加载，检查浏览器控制台错误信息。

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎提交Issue。

