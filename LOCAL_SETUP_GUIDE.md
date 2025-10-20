# 🏠 ARLook 本地部署指南

## 📋 系统要求
- **Node.js** 版本 16+ 
- **npm** 包管理器
- **Git** 版本控制

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/LuLu1016/ARLook_AIPMT.git
cd ARLook_AIPMT
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
创建 `.env` 文件：
```bash
# 复制环境变量模板
cp .env.example .env
```

编辑 `.env` 文件，添加您的 OpenAI API Key：
```env
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
```

### 4. 启动服务器
```bash
npm start
```

### 5. 访问网站
打开浏览器访问：`http://localhost:3000`

## 🎯 功能测试

### 测试所有用户角色：

#### 👤 **客户流程**
1. 点击 "I'm a Customer - Schedule Tour"
2. 填写预约表单
3. 提交后查看确认页面

#### 👨‍💼 **管理员流程**
1. 点击 "Admin Dashboard"
2. 输入密码：`admin2024`
3. 查看所有预约
4. 分配任务给 ARLooker

#### 📹 **ARLooker 流程**
1. 点击 "I'm an ARLooker - Upload Video"
2. 输入姓名登录
3. 查看分配的任务
4. 上传视频进行 AI 分析

## 🔧 故障排除

### 常见问题：

#### ❌ **端口被占用**
```bash
# 查看端口占用
lsof -i :3000

# 杀死占用进程
kill -9 <PID>

# 或使用其他端口
PORT=3001 npm start
```

#### ❌ **依赖安装失败**
```bash
# 清除缓存重新安装
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### ❌ **OpenAI API 错误**
- 检查 `.env` 文件中的 API Key 是否正确
- 确认 API Key 有足够的额度
- 检查网络连接

#### ❌ **文件上传失败**
- 确保 `uploads/` 目录存在
- 检查文件大小限制（最大 500MB）
- 确认文件格式支持（MP4, MOV, AVI, MKV, WEBM）

## 📁 项目结构
```
ARLook_AIPMT/
├── public/                 # 前端文件
│   ├── index.html         # 主页
│   ├── customer/          # 客户页面
│   ├── admin/            # 管理员页面
│   └── arlooker/         # ARLooker 页面
├── data/                 # 数据存储
│   └── appointments.json # 预约数据
├── uploads/              # 上传文件
├── test_videos/          # 测试视频
├── server.js             # 后端服务器
├── package.json          # 项目配置
└── .env                  # 环境变量
```

## 🎨 自定义配置

### 修改端口
```bash
# 方法1：环境变量
PORT=8080 npm start

# 方法2：修改 server.js
const PORT = process.env.PORT || 8080;
```

### 修改文件大小限制
编辑 `server.js` 中的 Multer 配置：
```javascript
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 1000 * 1024 * 1024 // 1GB
  }
});
```

## 🔐 安全注意事项

### 生产环境部署
- 修改默认管理员密码
- 使用 HTTPS
- 设置 CORS 限制
- 添加输入验证

### 数据备份
```bash
# 备份数据文件
cp data/appointments.json data/appointments_backup.json

# 恢复数据
cp data/appointments_backup.json data/appointments.json
```

## 📞 技术支持

### 获取帮助
1. 查看控制台错误信息
2. 检查服务器日志
3. 确认所有依赖已安装
4. 验证环境变量配置

### 联系信息
- GitHub Issues: [项目 Issues 页面]
- 邮箱: [您的邮箱]

## 🎉 开始使用

现在您可以：
- ✅ 创建客户预约
- ✅ 管理 ARLooker 任务
- ✅ 上传视频进行 AI 分析
- ✅ 查看详细检查报告

**祝您使用愉快！** 🚀
