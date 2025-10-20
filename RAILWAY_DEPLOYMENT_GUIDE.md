# 🚀 ARLook MVP - Railway部署指南

## 📋 **部署前准备**

### **1. 环境变量设置**
在Railway项目设置中添加以下环境变量：

```bash
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=production
PORT=3000
```

### **2. 文件结构确认**
确保以下文件存在：
- ✅ `server.js` - 主服务器文件
- ✅ `package.json` - 依赖配置
- ✅ `public/` - 前端静态文件
- ✅ `.gitignore` - Git忽略文件

## 🚀 **Railway部署步骤**

### **步骤1：连接GitHub**
1. 访问 [Railway.app](https://railway.app)
2. 点击 "Start a New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择 `LuLu1016/ARLook_AIPMT` 仓库

### **步骤2：配置项目**
1. **项目名称：** ARLook-MVP
2. **根目录：** `/` (默认)
3. **构建命令：** `npm install`
4. **启动命令：** `npm start`

### **步骤3：设置环境变量**
在Railway项目设置中添加：
- `OPENAI_API_KEY` = 您的OpenAI API密钥
- `NODE_ENV` = production
- `PORT` = 3000

### **步骤4：部署**
1. 点击 "Deploy"
2. 等待构建完成
3. 获取部署URL

## 🔧 **部署后配置**

### **1. 自定义域名（可选）**
- 在Railway项目设置中添加自定义域名
- 配置DNS记录

### **2. 监控和日志**
- 查看Railway仪表板中的日志
- 监控应用性能

## 📊 **预期结果**

部署成功后，您将获得：
- ✅ **生产环境URL** - 如 `https://arlook-mvp-production.up.railway.app`
- ✅ **自动HTTPS** - SSL证书自动配置
- ✅ **自动扩展** - 根据流量自动调整
- ✅ **实时日志** - 完整的应用日志

## 🛠️ **故障排除**

### **常见问题：**

1. **构建失败**
   - 检查 `package.json` 依赖
   - 查看构建日志

2. **环境变量未设置**
   - 确认在Railway项目设置中添加了所有必需的环境变量

3. **端口问题**
   - Railway自动分配端口，无需手动设置

4. **文件上传问题**
   - Railway支持文件上传，但建议使用外部存储（如AWS S3）

## 🎯 **部署验证**

部署完成后，测试以下功能：
- ✅ 主页加载正常
- ✅ 客户预约功能
- ✅ 管理员登录
- ✅ ARLooker仪表板
- ✅ 视频上传（如果有测试视频）
- ✅ AI分析功能

## 📞 **支持**

如果遇到问题：
1. 查看Railway部署日志
2. 检查环境变量设置
3. 确认所有依赖已正确安装

**Railway部署是最稳妥的选择，支持您的完整Express.js应用！** 🚀
