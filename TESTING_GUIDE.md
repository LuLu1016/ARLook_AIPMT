# 🏠 ARLook - Evo Apartment Testing Guide

## 📹 文件大小限制已更新

✅ **新的文件大小限制：500MB**（之前是100MB）
✅ **支持格式：** MP4, MOV, AVI, MKV, WEBM
✅ **优化了帧提取功能**
✅ **改进了错误处理**

## 🚀 如何测试您的Evo视频

### 方法1：使用测试页面（推荐）
1. 打开浏览器访问：`http://localhost:3000/test.html`
2. 点击"Choose File"选择您的`evo_room.MOV`文件
3. 点击"Analyze Apartment"开始分析
4. 等待AI分析完成（可能需要1-2分钟）

### 方法2：使用主页面
1. 打开浏览器访问：`http://localhost:3000`
2. 拖拽或选择您的视频文件
3. 点击"Analyze Video"

### 方法3：使用API直接测试
```bash
curl -X POST -F "video=@evo_room.MOV" http://localhost:3000/api/analyze
```

## 🔧 系统优化

### 帧提取改进
- ✅ 修复了并发问题
- ✅ 提取5个关键帧（之前是3个）
- ✅ 基于视频时长智能分布帧
- ✅ 高质量帧提取

### AI分析优化
- ✅ 专门针对学生公寓的提示词
- ✅ 4个关键分析领域（各占25%权重）
- ✅ 明确的评分标准（1-5分）
- ✅ 专注于国际学生需求

### 错误处理增强
- ✅ 详细的错误日志
- ✅ 优雅降级到模拟数据
- ✅ 文件清理机制
- ✅ 用户友好的错误消息

## 📊 预期结果

您的Evo视频分析应该返回：

```json
{
  "success": true,
  "report": {
    "layout": "Evo apartment with modern open-concept living space...",
    "facilities": ["Full kitchen with stainless steel appliances", "Private bathroom...", "..."],
    "issues": "Minor wear on hardwood floors, some scuff marks...",
    "safety": "Secure entry system, smoke detectors present...",
    "rating": 4.3,
    "summary": "This Evo apartment offers excellent value for students..."
  },
  "analysisInfo": {
    "framesAnalyzed": 5,
    "model": "gpt-4o",
    "processingTime": "2025-10-20T..."
  }
}
```

## 🎯 测试您的视频

1. **确保您的视频文件**：
   - 文件名：`evo_room.MOV`
   - 大小：< 500MB
   - 格式：MOV（或其他支持的格式）

2. **上传并分析**：
   - 使用测试页面：`http://localhost:3000/test.html`
   - 或主页面：`http://localhost:3000`

3. **查看结果**：
   - 布局和空间分析
   - 设施和家具评估
   - 问题和维护检查
   - 安全和安保评估
   - 1-5分综合评分

## 🔍 故障排除

如果遇到问题：

1. **文件太大**：确保文件 < 500MB
2. **格式不支持**：转换为MP4或MOV格式
3. **网络错误**：检查服务器是否运行
4. **AI分析失败**：检查OpenAI API密钥配置

## 📞 技术支持

- 服务器状态：`http://localhost:3000/api/health`
- 测试页面：`http://localhost:3000/test.html`
- 主页面：`http://localhost:3000`

现在您可以测试您的250MB Evo视频了！🎉
