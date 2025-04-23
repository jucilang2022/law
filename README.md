# 智能化在线法律援助平台

## 项目简介
这是一个基于 React 和 Node.js 开发的在线法律援助平台，提供法律咨询、案件管理、在线聊天等功能。平台支持用户与律师之间的实时沟通，包括文字、图片和语音消息的发送。

## 技术栈
- 前端：React, Ant Design
- 后端：Node.js, Express
- 数据库：JSON Server
- 文件存储：本地文件系统

## 项目结构
```
layer/law/
├── public/            # 静态资源
│   ├── chat_images/   # 聊天图片存储
│   └── chat_audio/    # 聊天语音存储
├── src/               # 源代码
│   ├── components/    # 组件
│   ├── views/         # 页面
│   └── App.js         # 主应用
├── server/            # 后端服务
│   └── index.js       # 服务器入口
└── db/                # 数据库
    └── db.json        # JSON 数据文件
```

## 环境要求
- Node.js >= 14.0.0
- npm >= 6.0.0

## 安装与启动

### 1. 安装依赖
```bash
npm install
```

### 2. 启动后端服务
```bash
# 启动 JSON Server
json-server --watch db/db.json --port 5000

# 启动文件上传服务
cd layer/law/server
node index.js
```

### 3. 启动前端开发服务器
```bash
npm start
```

## 接口说明

### 文件上传服务
- 地址：http://localhost:3001
- 图片上传：POST /upload
- 语音上传：POST /upload-audio

### JSON Server
- 地址：http://localhost:5000
- 用户管理：/users
- 案件信息：/news
- 分类信息：/categories

## 开发指南

### 添加新功能
1. 在 `src/views` 目录下创建新的页面组件
2. 在 `src/components` 目录下创建可复用的组件
3. 在 `db/db.json` 中添加相应的数据结构
4. 在 `server/index.js` 中添加新的接口

### 部署说明
1. 构建前端代码
```bash
npm run build
```
2. 配置生产环境变量
3. 部署到服务器

## 常见问题
1. 图片上传失败
   - 检查文件大小限制
   - 确认文件格式是否支持
   - 检查服务器存储空间

2. 语音消息无法播放
   - 确认浏览器支持 MediaRecorder API
   - 检查麦克风权限设置
   - 验证音频文件格式

## 贡献指南
1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证
MIT License
