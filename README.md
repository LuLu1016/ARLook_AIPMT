# ARLook - AI-Powered Apartment Inspector

An AI-powered apartment inspection platform that helps international students make informed rental decisions by analyzing apartment tour videos.

## Features

- 🎥 **Video Upload**: Upload apartment tour videos (MP4, MOV, AVI, MKV, WEBM)
- 🤖 **AI Analysis**: GPT-4V analyzes apartment layout, facilities, issues, and safety
- 📊 **Detailed Reports**: Get structured reports with ratings and recommendations
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **Real-time Processing**: Fast analysis with loading indicators

## Quick Start

### 🚀 自动安装 (推荐)

**Windows 用户:**
```bash
# 双击运行 install.bat 文件
install.bat
```

**Mac/Linux 用户:**
```bash
# 运行安装脚本
chmod +x install.sh
./install.sh
```

### 📋 手动安装

#### 1. 克隆项目
```bash
git clone https://github.com/LuLu1016/ARLook_AIPMT.git
cd ARLook_AIPMT
```

#### 2. 安装依赖
```bash
npm install
```

#### 3. 配置环境变量
创建 `.env` 文件：
```bash
# 创建环境变量文件
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
echo "NODE_ENV=development" >> .env
echo "PORT=3000" >> .env
```

**获取 OpenAI API Key:**
1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 注册或登录
3. 进入 API Keys 部分
4. 创建新的 API Key
5. 复制密钥并粘贴到 `.env` 文件中

#### 4. 启动服务器
```bash
npm start
```

服务器将在 `http://localhost:3000` 启动

#### 5. 使用应用
1. 打开浏览器访问 `http://localhost:3000`
2. 选择您的角色：
   - **客户** - 预约看房
   - **ARLooker** - 上传视频
   - **管理员** - 管理预约 (密码: `admin2024`)
3. 按照界面提示操作

## API Endpoints

- `GET /` - Main application page
- `GET /api/health` - Health check endpoint
- `POST /api/analyze` - Upload video for AI analysis

## How It Works

1. **Video Upload**: Users upload apartment tour videos
2. **Frame Extraction**: The system extracts 3 key frames from the video
3. **AI Analysis**: GPT-4V analyzes the frames for:
   - Layout and space utilization
   - Visible facilities and appliances
   - Damages, stains, or maintenance issues
   - Safety concerns
   - Overall condition rating (1-5)
4. **Report Generation**: Returns a structured JSON report

## Mock Mode

If no OpenAI API key is configured, the system will return mock responses for testing purposes. The health check endpoint will show `"openai_configured": false` in this case.

## File Requirements

- **Supported formats**: MP4, MOV, AVI, MKV, WEBM
- **Maximum size**: 100MB
- **Recommended**: Clear, well-lit apartment tour videos

## Development

```bash
# Install development dependencies
npm install

# Start with auto-reload
npm run dev

# Start production server
npm start
```

## Project Structure

```
ARLook_AIPMT/
├── server.js                    # Express server with AI integration
├── package.json                 # Dependencies and scripts
├── .env                         # Environment variables (create this)
├── install.sh                   # Mac/Linux 安装脚本
├── install.bat                  # Windows 安装脚本
├── LOCAL_SETUP_GUIDE.md         # 详细本地部署指南
├── public/                      # Frontend files
│   ├── index.html              # 主页 - 角色选择
│   ├── customer/               # 客户页面
│   │   ├── schedule.html       # 预约表单
│   │   ├── confirmation.html  # 确认页面
│   │   ├── login.html         # 客户登录
│   │   └── dashboard.html     # 客户仪表板
│   ├── admin/                  # 管理员页面
│   │   ├── admin.html         # 管理员仪表板
│   │   ├── admin.js           # 管理员逻辑
│   │   └── admin.css          # 管理员样式
│   └── arlooker/              # ARLooker 页面
│       ├── dashboard.html     # ARLooker 仪表板
│       ├── dashboard.js       # ARLooker 逻辑
│       └── upload.html        # 视频上传页面
├── data/                       # 数据存储
│   └── appointments.json      # 预约数据
├── uploads/                    # 上传文件存储
└── test_videos/               # 测试视频
```

## Technologies Used

- **Backend**: Node.js, Express.js
- **AI**: OpenAI GPT-4V (Vision)
- **File Processing**: Multer, FFmpeg
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Pure CSS (no frameworks)

## Troubleshooting

### Server won't start
- Make sure all dependencies are installed: `npm install`
- Check if port 3000 is available
- Verify your `.env` file exists and has the correct format

### OpenAI API errors
- Verify your API key is correct in the `.env` file
- Check your OpenAI account has sufficient credits
- Ensure the API key has access to GPT-4V

### Video processing issues
- Make sure FFmpeg is installed on your system
- Check video file format is supported
- Verify file size is under 100MB

## License

MIT License - see LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Note**: This is an MVP (Minimum Viable Product) designed for demonstration purposes. For production use, consider adding user authentication, database storage, and enhanced security measures.
