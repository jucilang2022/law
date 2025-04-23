const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3001;

// 启用 CORS
app.use(cors());

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../public/chat_images');
const audioDir = path.join(__dirname, '../public/chat_audio');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
}

// 配置 multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'image') {
            cb(null, uploadDir);
        } else if (file.fieldname === 'audio') {
            cb(null, audioDir);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// 提供静态文件服务
app.use('/chat_images', express.static(uploadDir));
app.use('/chat_audio', express.static(audioDir));

// 处理图片上传
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: '没有上传文件' });
    }

    const imageUrl = `/chat_images/${req.file.filename}`;
    res.json({ url: imageUrl });
});

// 处理音频上传
app.post('/upload-audio', upload.single('audio'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: '没有上传文件' });
    }

    const audioUrl = `/chat_audio/${req.file.filename}`;
    res.json({ url: audioUrl });
});

// 启动服务器
app.listen(port, () => {
    console.log(`文件上传服务器运行在 http://localhost:${port}`);
}); 