@echo off
echo 🏠 ARLook 本地安装脚本 (Windows)
echo ==========================

REM 检查 Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js 未安装，请先安装 Node.js
    echo    访问: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查 npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm 未安装，请先安装 npm
    pause
    exit /b 1
)

echo ✅ Node.js 和 npm 已安装

REM 安装依赖
echo.
echo 📦 安装项目依赖...
npm install
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo ✅ 依赖安装成功

REM 创建必要的目录
echo.
echo 📁 创建必要的目录...
if not exist uploads mkdir uploads
if not exist data mkdir data
if not exist test_videos mkdir test_videos

echo ✅ 目录创建成功

REM 创建环境变量文件
echo.
echo 🔧 创建环境变量文件...
if not exist .env (
    echo # ARLook Environment Variables > .env
    echo OPENAI_API_KEY=your_openai_api_key_here >> .env
    echo NODE_ENV=development >> .env
    echo PORT=3000 >> .env
    echo ✅ .env 文件已创建
    echo ⚠️  请编辑 .env 文件，添加您的 OpenAI API Key
) else (
    echo ✅ .env 文件已存在
)

REM 创建初始数据文件
echo.
echo 📊 创建初始数据文件...
if not exist data\appointments.json (
    echo { > data\appointments.json
    echo   "appointments": [] >> data\appointments.json
    echo } >> data\appointments.json
    echo ✅ 初始数据文件已创建
) else (
    echo ✅ 数据文件已存在
)

echo.
echo 🎉 安装完成！
echo.
echo 📋 下一步：
echo 1. 编辑 .env 文件，添加您的 OpenAI API Key
echo 2. 运行: npm start
echo 3. 访问: http://localhost:3000
echo.
echo 🔑 管理员密码: admin2024
echo.
echo 📖 详细说明请查看: LOCAL_SETUP_GUIDE.md
pause
