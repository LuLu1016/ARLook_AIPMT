#!/bin/bash

# ARLook 本地安装脚本
echo "🏠 ARLook 本地安装脚本"
echo "=========================="

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    echo "   访问: https://nodejs.org/"
    exit 1
fi

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"
echo "✅ npm 版本: $(npm --version)"

# 安装依赖
echo ""
echo "📦 安装项目依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装成功"

# 创建必要的目录
echo ""
echo "📁 创建必要的目录..."
mkdir -p uploads
mkdir -p data
mkdir -p test_videos

echo "✅ 目录创建成功"

# 创建环境变量文件
echo ""
echo "🔧 创建环境变量文件..."
if [ ! -f .env ]; then
    cat > .env << EOF
# ARLook Environment Variables
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
PORT=3000
EOF
    echo "✅ .env 文件已创建"
    echo "⚠️  请编辑 .env 文件，添加您的 OpenAI API Key"
else
    echo "✅ .env 文件已存在"
fi

# 创建初始数据文件
echo ""
echo "📊 创建初始数据文件..."
if [ ! -f data/appointments.json ]; then
    cat > data/appointments.json << EOF
{
  "appointments": []
}
EOF
    echo "✅ 初始数据文件已创建"
else
    echo "✅ 数据文件已存在"
fi

echo ""
echo "🎉 安装完成！"
echo ""
echo "📋 下一步："
echo "1. 编辑 .env 文件，添加您的 OpenAI API Key"
echo "2. 运行: npm start"
echo "3. 访问: http://localhost:3000"
echo ""
echo "🔑 管理员密码: admin2024"
echo ""
echo "📖 详细说明请查看: LOCAL_SETUP_GUIDE.md"
