import React, { useEffect, useState, useRef } from 'react';
import { Card, Avatar, Typography, Input, Button, message, Select, Tag, Modal, Upload } from 'antd';
import { SendOutlined, UserOutlined, MinusOutlined, MessageOutlined, DeleteOutlined, PictureOutlined, AudioOutlined, StopOutlined } from '@ant-design/icons';
import axios from 'axios';
import './ChatBox.css';

const { TextArea } = Input;
const { Title } = Typography;
const { Option } = Select;

export default function ChatBox({ lawyerId }) {
    const [chatMessages, setChatMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [filteredMessages, setFilteredMessages] = useState([]);
    const [shouldScroll, setShouldScroll] = useState(true);
    const [isMinimized, setIsMinimized] = useState(false);
    const [position, setPosition] = useState({ x: window.innerWidth - 370, y: window.innerHeight - 520 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const messagesEndRef = useRef(null);
    const chatMessagesRef = useRef(null);
    const chatBoxRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    // 处理拖动开始
    const handleDragStart = (e) => {
        // 检查是否点击在标题栏上
        const target = e.target;
        const isHeader = target.closest('.ant-card-head');

        if (isHeader) {
            setIsDragging(true);
            const rect = chatBoxRef.current.getBoundingClientRect();
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    };

    // 处理拖动中
    const handleDrag = (e) => {
        if (isDragging) {
            const newX = e.clientX - dragOffset.x;
            const newY = e.clientY - dragOffset.y;

            // 确保不会拖出屏幕
            const maxX = window.innerWidth - 370;
            const maxY = window.innerHeight - 520;

            setPosition({
                x: Math.max(0, Math.min(newX, maxX)),
                y: Math.max(0, Math.min(newY, maxY))
            });
        }
    };

    // 处理拖动结束
    const handleDragEnd = () => {
        setIsDragging(false);
    };

    // 添加和移除全局事件监听
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleDrag);
            window.addEventListener('mouseup', handleDragEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleDrag);
            window.removeEventListener('mouseup', handleDragEnd);
        };
    }, [isDragging, dragOffset]);

    // 检查是否需要滚动到底部
    const checkShouldScroll = () => {
        if (chatMessagesRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatMessagesRef.current;
            setShouldScroll(scrollHeight - scrollTop - clientHeight < 100);
        }
    };

    // 滚动到最新消息
    const scrollToBottom = () => {
        if (shouldScroll) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    };

    // 获取所有用户信息
    useEffect(() => {
        axios.get('/users?roleId=3').then(res => {
            setUsers(res.data);
        });
    }, []);

    // 获取聊天记录
    const fetchChatMessages = () => {
        if (lawyerId) {
            axios.get(`/users/${lawyerId}`).then(res => {
                if (res.data.chatInfo) {
                    try {
                        const chatHistory = JSON.parse(res.data.chatInfo);
                        setChatMessages(chatHistory);
                    } catch (e) {
                        setChatMessages([]);
                    }
                }
            });
        }
    };

    // 初始加载和定时更新聊天记录
    useEffect(() => {
        fetchChatMessages();
        const timer = setInterval(fetchChatMessages, 3000);
        return () => clearInterval(timer);
    }, [lawyerId]);

    // 当选择用户或聊天记录更新时，过滤消息
    useEffect(() => {
        if (selectedUser) {
            const filtered = chatMessages.filter(msg =>
                msg.userId === selectedUser.id || msg.lawyerId === lawyerId
            );
            setFilteredMessages(filtered);
            setTimeout(scrollToBottom, 100);
        } else {
            setFilteredMessages([]);
        }
    }, [selectedUser, chatMessages, lawyerId]);

    // 发送消息
    const handleSendMessage = () => {
        if (!inputMessage.trim()) {
            message.warning('请输入消息内容');
            return;
        }
        if (!selectedUser) {
            message.warning('请选择要回复的用户');
            return;
        }

        const newMessage = {
            type: 'lawyer',
            content: inputMessage,
            timestamp: new Date().toISOString(),
            userId: selectedUser.id,
            lawyerId: lawyerId
        };

        const updatedMessages = [...chatMessages, newMessage];
        setChatMessages(updatedMessages);
        setInputMessage('');

        axios.patch(`/users/${lawyerId}`, {
            chatInfo: JSON.stringify(updatedMessages)
        }).then(() => {
            message.success('消息发送成功');
            fetchChatMessages();
        }).catch(() => {
            message.error('消息发送失败');
        });
    };

    // 删除聊天记录
    const handleDeleteChat = () => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除所有聊天记录吗？',
            okText: '确定',
            cancelText: '取消',
            onOk: () => {
                if (lawyerId) {
                    axios.patch(`/users/${lawyerId}`, {
                        chatInfo: JSON.stringify([])
                    }).then(() => {
                        setChatMessages([]);
                        setFilteredMessages([]);
                        message.success('聊天记录已清除');
                    }).catch(() => {
                        message.error('清除聊天记录失败');
                    });
                }
            }
        });
    };

    // 处理图片上传
    const handleImageUpload = async (file) => {
        if (!selectedUser) {
            message.warning('请先选择要回复的用户');
            return false;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await axios.post('http://localhost:3001/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 10000, // 设置超时时间为10秒
            });

            if (!response.data || !response.data.url) {
                throw new Error('服务器返回数据格式错误');
            }

            const imageUrl = response.data.url;
            const newMessage = {
                type: 'lawyer',
                content: imageUrl,
                timestamp: new Date().toISOString(),
                userId: selectedUser.id,
                lawyerId: lawyerId,
                messageType: 'image'
            };

            const updatedMessages = [...chatMessages, newMessage];
            setChatMessages(updatedMessages);

            await axios.patch(`/users/${lawyerId}`, {
                chatInfo: JSON.stringify(updatedMessages)
            });

            message.success('图片发送成功');
            fetchChatMessages();
        } catch (error) {
            console.error('上传错误:', error);
            if (error.response) {
                // 服务器返回了错误状态码
                message.error(`上传失败: ${error.response.status} ${error.response.statusText}`);
            } else if (error.request) {
                // 请求已发出但没有收到响应
                message.error('无法连接到服务器，请检查网络连接');
            } else {
                // 请求配置出错
                message.error('上传配置错误');
            }
        } finally {
            setUploading(false);
        }
        return false;
    };

    // 开始录音
    const startRecording = async () => {
        if (!selectedUser) {
            message.warning('请先选择要回复的用户');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                setAudioBlob(audioBlob);
                await handleAudioUpload(audioBlob);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            message.error('无法访问麦克风');
            console.error('录音错误:', error);
        }
    };

    // 停止录音
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    };

    // 处理音频上传
    const handleAudioUpload = async (audioBlob) => {
        if (!audioBlob) return;

        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.wav');

        try {
            const response = await axios.post('http://localhost:3001/upload-audio', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 10000, // 设置超时时间为10秒
            });

            if (!response.data || !response.data.url) {
                throw new Error('服务器返回数据格式错误');
            }

            const audioUrl = response.data.url;
            const newMessage = {
                type: 'lawyer',
                content: audioUrl,
                timestamp: new Date().toISOString(),
                userId: selectedUser.id,
                lawyerId: lawyerId,
                messageType: 'audio'
            };

            const updatedMessages = [...chatMessages, newMessage];
            setChatMessages(updatedMessages);

            await axios.patch(`/users/${lawyerId}`, {
                chatInfo: JSON.stringify(updatedMessages)
            });

            message.success('语音发送成功');
            fetchChatMessages();
        } catch (error) {
            console.error('上传错误:', error);
            if (error.response) {
                // 服务器返回了错误状态码
                message.error(`上传失败: ${error.response.status} ${error.response.statusText}`);
            } else if (error.request) {
                // 请求已发出但没有收到响应
                message.error('无法连接到服务器，请检查网络连接');
            } else {
                // 请求配置出错
                message.error('上传配置错误');
            }
        }
    };

    const chatBoxStyle = {
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab'
    };

    if (isMinimized) {
        return (
            <div
                className="minimized-chat"
                onClick={() => setIsMinimized(false)}
            >
                <MessageOutlined className="chat-icon" />
                {filteredMessages.length > 0 && (
                    <span className="unread-badge">
                        {filteredMessages.filter(msg => msg.type === 'user').length}
                    </span>
                )}
            </div>
        );
    }

    return (
        <Card
            ref={chatBoxRef}
            className="lawyer-chat-box"
            title="在线咨询"
            extra={
                <div className="chat-actions">
                    <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={handleDeleteChat}
                        className="delete-button"
                    />
                    <Button
                        type="text"
                        icon={<MinusOutlined />}
                        onClick={() => setIsMinimized(true)}
                        className="minimize-button"
                    />
                </div>
            }
            style={chatBoxStyle}
            onMouseDown={handleDragStart}
        >
            <div className="user-select">
                <Select
                    style={{ width: '100%' }}
                    placeholder="选择要回复的用户"
                    onChange={(userId) => {
                        const user = users.find(u => u.id === userId);
                        setSelectedUser(user);
                    }}
                    value={selectedUser?.id}
                >
                    {users.map(user => (
                        <Option key={user.id} value={user.id}>
                            {user.username}
                        </Option>
                    ))}
                </Select>
            </div>
            <div
                className="chat-messages lawyer-chat-messages"
                ref={chatMessagesRef}
                onScroll={checkShouldScroll}
            >
                {filteredMessages.length === 0 ? (
                    <div className="message system">
                        {selectedUser ? '暂无聊天记录' : '请选择要回复的用户'}
                    </div>
                ) : (
                    filteredMessages.map((msg, index) => (
                        <div key={index} className={`message ${msg.type === 'lawyer' ? 'self' : 'other'}`}>
                            {msg.type === 'user' && (
                                <Avatar
                                    icon={<UserOutlined />}
                                    style={{ backgroundColor: '#87d068' }}
                                />
                            )}
                            <div className="message-content">
                                <div className="message-header">
                                    <span className="message-sender">
                                        {msg.type === 'user' ? selectedUser.username : '律师'}
                                    </span>
                                    <span className="message-time">
                                        {new Date(msg.timestamp).toLocaleString()}
                                    </span>
                                </div>
                                {msg.messageType === 'image' ? (
                                    <div className="message-image">
                                        <img src={msg.content} alt="聊天图片" />
                                    </div>
                                ) : msg.messageType === 'audio' ? (
                                    <div className="message-audio">
                                        <audio controls src={msg.content}>
                                            您的浏览器不支持音频播放
                                        </audio>
                                    </div>
                                ) : (
                                    <div className="message-text">{msg.content}</div>
                                )}
                            </div>
                            {msg.type === 'lawyer' && (
                                <Avatar
                                    style={{ backgroundColor: '#008181' }}
                                >
                                    L
                                </Avatar>
                            )}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="chat-input">
                <TextArea
                    placeholder="请输入回复..."
                    autoSize={{ minRows: 2, maxRows: 4 }}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onPressEnter={(e) => {
                        if (!e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                />
                <div className="chat-actions">
                    <Button
                        type="text"
                        icon={isRecording ? <StopOutlined /> : <AudioOutlined />}
                        onClick={isRecording ? stopRecording : startRecording}
                        className={isRecording ? 'recording-button' : ''}
                    />
                    <Upload
                        showUploadList={false}
                        beforeUpload={handleImageUpload}
                        accept="image/*"
                    >
                        <Button
                            type="text"
                            icon={<PictureOutlined />}
                            loading={uploading}
                        />
                    </Upload>
                    <Button
                        type="primary"
                        icon={<SendOutlined />}
                        className="send-button"
                        onClick={handleSendMessage}
                    >
                        发送
                    </Button>
                </div>
            </div>
        </Card>
    );
}