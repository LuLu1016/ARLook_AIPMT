# 🚀 ARLook MVP - Render部署指南

## 📋 **Render优势**
- ✅ **完全免费** - 每月750小时免费额度
- ✅ **零配置** - 自动检测Node.js
- ✅ **自动HTTPS** - SSL证书自动配置
- ✅ **GitHub集成** - 推送即部署
- ✅ **环境变量** - 安全存储API密钥
- ✅ **持久存储** - 支持文件上传

## 🚀 **部署步骤**

### **步骤1：访问Render**
1. 打开 [render.com](https://render.com)
2. 点击 "Get Started for Free"
3. 使用GitHub账号登录

### **步骤2：创建Web Service**
1. 点击 "New +"
2. 选择 "Web Service"
3. 连接GitHub仓库 `LuLu1016/ARLook_AIPMT`

### **步骤3：配置服务**
```
Name: arlook-mvp
Environment: Node
Region: Oregon (US West)
Branch: master
Root Directory: (留空)
Build Command: npm install
Start Command: npm start
```

### **步骤4：设置环境变量**
在 "Environment" 标签页添加：
```
OPENAI_API_KEY = your_openai_api_key_here
NODE_ENV = production
```

### **步骤5：部署**
1. 点击 "Create Web Service"
2. 等待3-5分钟部署完成
3. 获得生产URL

## 📊 **预期结果**
- 🌐 **生产URL** - 如 `https://arlook-mvp.onrender.com`
- 🔒 **自动HTTPS** - 安全连接
- 📊 **实时日志** - 部署和运行日志
- 🚀 **自动部署** - GitHub推送自动更新

## 🛠️ **故障排除**
- **构建失败** - 检查package.json依赖
- **环境变量** - 确认OPENAI_API_KEY已设置
- **端口问题** - Render自动处理端口

**Render是最稳定的免费选择！** 🚀
