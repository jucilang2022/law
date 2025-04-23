import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import _ from 'lodash'
import { Card, Col, Row, List, Layout, Typography, Input, Button, Avatar, Select, message, Modal, Upload } from 'antd';
import { SendOutlined, UserOutlined, DeleteOutlined, PictureOutlined, AudioOutlined, StopOutlined, MessageOutlined } from '@ant-design/icons';
import './News.css'

const { Header, Content } = Layout;
const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function News() {
    const [list, setlist] = useState([])
    const [lawyers, setLawyers] = useState([])
    const [selectedLawyer, setSelectedLawyer] = useState(null)
    const [chatMessages, setChatMessages] = useState([])
    const [inputMessage, setInputMessage] = useState('')
    const [userInfo, setUserInfo] = useState(null)
    const messagesEndRef = useRef(null)
    const [uploading, setUploading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isChatVisible, setIsChatVisible] = useState(true);

    // 滚动到最新消息
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // 获取用户信息
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            const user = JSON.parse(token)
            setUserInfo(user)
        }
    }, [])

    // 获取案件信息
    useEffect(() => {
        axios.get("/news?publishState=2&_expand=category").then(res => {
            setlist(Object.entries(_.groupBy(res.data, item => item.category.title)))
        })
    }, [])

    // 获取律师列表
    useEffect(() => {
        axios.get("/users?roleId=2").then(res => {
            setLawyers(res.data)
        })
    }, [])

    // 获取聊天记录
    const fetchChatMessages = () => {
        if (selectedLawyer) {
            axios.get(`/users/${selectedLawyer.id}`).then(res => {
                if (res.data.chatInfo) {
                    try {
                        const chatHistory = JSON.parse(res.data.chatInfo)
                        // 只显示当前用户与该律师的聊天记录
                        const userChatHistory = chatHistory.filter(msg =>
                            msg.userId === userInfo.id || msg.lawyerId === selectedLawyer.id
                        )
                        setChatMessages(userChatHistory)

                        // 计算未读消息数量（用户发送的消息且未展开聊天框时）
                        if (!isChatVisible) {
                            const unreadMessages = userChatHistory.filter(msg =>
                                msg.type === 'user' &&
                                msg.userId !== userInfo.id
                            )
                            setUnreadCount(unreadMessages.length)
                        }
                    } catch (e) {
                        setChatMessages([])
                    }
                }
            })
        }
    }

    // 切换聊天框显示状态
    const toggleChatVisibility = () => {
        setIsChatVisible(!isChatVisible)
        if (!isChatVisible) {
            setUnreadCount(0) // 展开聊天框时清零未读消息数
        }
    }

    // 初始加载和定时更新聊天记录
    useEffect(() => {
        if (selectedLawyer) {
            fetchChatMessages()
            // 每3秒更新一次聊天记录
            const timer = setInterval(fetchChatMessages, 3000)
            return () => clearInterval(timer)
        }
    }, [selectedLawyer, userInfo])

    // 选择律师
    const handleLawyerSelect = (lawyerId) => {
        const lawyer = lawyers.find(l => l.id === lawyerId)
        setSelectedLawyer(lawyer)
    }

    // 发送消息
    const handleSendMessage = () => {
        if (!inputMessage.trim()) {
            message.warning('请输入消息内容')
            return
        }
        if (!selectedLawyer) {
            message.warning('请先选择律师')
            return
        }
        if (!userInfo) {
            message.warning('请先登录')
            return
        }

        const newMessage = {
            type: 'user',
            content: inputMessage,
            timestamp: new Date().toISOString(),
            userId: userInfo.id,
            lawyerId: selectedLawyer.id
        }

        const updatedMessages = [...chatMessages, newMessage]
        setChatMessages(updatedMessages)
        setInputMessage('')

        // 保存聊天记录到律师信息中
        const updatedLawyer = {
            ...selectedLawyer,
            chatInfo: JSON.stringify(updatedMessages)
        }

        axios.patch(`/users/${selectedLawyer.id}`, updatedLawyer)
            .then(() => {
                message.success('消息发送成功')
                // 发送成功后立即更新消息
                fetchChatMessages()
            })
            .catch(() => {
                message.error('消息发送失败')
            })
    }

    // 删除聊天记录
    const handleDeleteChat = () => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除所有聊天记录吗？',
            okText: '确定',
            cancelText: '取消',
            onOk: () => {
                if (selectedLawyer) {
                    axios.patch(`/users/${selectedLawyer.id}`, {
                        chatInfo: JSON.stringify([])
                    }).then(() => {
                        setChatMessages([]);
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
        if (!selectedLawyer) {
            message.warning('请先选择律师');
            return false;
        }
        if (!userInfo) {
            message.warning('请先登录');
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
            });

            const imageUrl = response.data.url;
            const newMessage = {
                type: 'user',
                content: imageUrl,
                timestamp: new Date().toISOString(),
                userId: userInfo.id,
                lawyerId: selectedLawyer.id,
                messageType: 'image'
            };

            const updatedMessages = [...chatMessages, newMessage];
            setChatMessages(updatedMessages);

            const updatedLawyer = {
                ...selectedLawyer,
                chatInfo: JSON.stringify(updatedMessages)
            };

            await axios.patch(`/users/${selectedLawyer.id}`, updatedLawyer);
            message.success('图片发送成功');
            fetchChatMessages();
        } catch (error) {
            message.error('图片上传失败');
        } finally {
            setUploading(false);
        }
        return false;
    };

    // 开始录音
    const startRecording = async () => {
        if (!selectedLawyer) {
            message.warning('请先选择律师');
            return;
        }
        if (!userInfo) {
            message.warning('请先登录');
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
                timeout: 10000,
            });

            if (!response.data || !response.data.url) {
                throw new Error('服务器返回数据格式错误');
            }

            const audioUrl = response.data.url;
            const newMessage = {
                type: 'user',
                content: audioUrl,
                timestamp: new Date().toISOString(),
                userId: userInfo.id,
                lawyerId: selectedLawyer.id,
                messageType: 'audio'
            };

            const updatedMessages = [...chatMessages, newMessage];
            setChatMessages(updatedMessages);

            const updatedLawyer = {
                ...selectedLawyer,
                chatInfo: JSON.stringify(updatedMessages)
            };

            await axios.patch(`/users/${selectedLawyer.id}`, updatedLawyer);
            message.success('语音发送成功');
            fetchChatMessages();
        } catch (error) {
            console.error('上传错误:', error);
            if (error.response) {
                message.error(`上传失败: ${error.response.status} ${error.response.statusText}`);
            } else if (error.request) {
                message.error('无法连接到服务器，请检查网络连接');
            } else {
                message.error('上传配置错误');
            }
        }
    };

    return (
        <Layout className="main-layout">
            <Header className="main-header">
                <div className="header-title">智能化在线法律援助平台</div>
            </Header>
            <Content className="main-content">
                <Row gutter={[20, 20]}>
                    {/* 左侧案件信息模块 */}
                    <Col span={userInfo?.roleId === 3 ? 16 : 24}>
                        <div className="case-section">
                            <Title level={3} className="section-title">案件信息</Title>
                            <Row gutter={[20, 20]}>
                                {
                                    list.map(item =>
                                        <Col span={12} key={item[0]}>
                                            <Card
                                                title={item[0]}
                                                bordered={false}
                                                hoverable
                                                headStyle={{ borderBottom: 'none' }}
                                            >
                                                <List
                                                    size="small"
                                                    bordered={false}
                                                    dataSource={item[1]}
                                                    pagination={{
                                                        pageSize: 3,
                                                        size: "small",
                                                        style: { textAlign: 'center' }
                                                    }}
                                                    renderItem={(data) => (
                                                        <List.Item>
                                                            <a href={`#/detail/${data.id}`}>{data.title}</a>
                                                        </List.Item>
                                                    )}
                                                />
                                            </Card>
                                        </Col>
                                    )
                                }
                            </Row>
                        </div>
                    </Col>

                    {/* 右侧在线咨询模块 - 仅对普通用户显示 */}
                    {userInfo?.roleId === 3 && (
                        <Col span={8}>
                            <div className="chat-section">
                                <div className="section-header">
                                    <Title level={3} className="section-title">在线咨询</Title>
                                    <div className="chat-header-actions">
                                        <Button
                                            type="text"
                                            icon={<DeleteOutlined />}
                                            onClick={handleDeleteChat}
                                            className="delete-button"
                                        />
                                        <Button
                                            type="text"
                                            icon={<MessageOutlined />}
                                            onClick={toggleChatVisibility}
                                            className="toggle-chat-button"
                                        >
                                            {!isChatVisible && unreadCount > 0 && (
                                                <span className="unread-badge">{unreadCount}</span>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                                {isChatVisible && (
                                    <Card className="chat-card">
                                        <div className="lawyer-select">
                                            <Select
                                                style={{ width: '100%' }}
                                                placeholder="请选择律师"
                                                onChange={handleLawyerSelect}
                                                value={selectedLawyer?.id}
                                            >
                                                {lawyers.map(lawyer => (
                                                    <Option key={lawyer.id} value={lawyer.id}>
                                                        {lawyer.username}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </div>
                                        <div className="chat-messages">
                                            {chatMessages.length === 0 ? (
                                                <div className="message system">
                                                    请选择一位律师开始咨询
                                                </div>
                                            ) : (
                                                chatMessages.map((msg, index) => (
                                                    <div key={index} className={`message ${msg.type === 'user' ? 'self' : 'other'}`}>
                                                        {msg.type === 'lawyer' && (
                                                            <Avatar
                                                                style={{ backgroundColor: '#008181' }}
                                                            >
                                                                L
                                                            </Avatar>
                                                        )}
                                                        <div className="message-content">
                                                            <div className="message-header">
                                                                <span className="message-sender">
                                                                    {msg.type === 'user' ? userInfo.username : '律师'}
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
                                                        {msg.type === 'user' && (
                                                            <Avatar
                                                                icon={<UserOutlined />}
                                                                style={{ backgroundColor: '#87d068' }}
                                                            />
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                            <div ref={messagesEndRef} />
                                        </div>
                                        <div className="chat-input">
                                            <TextArea
                                                placeholder="请输入您的问题..."
                                                autoSize={{ minRows: 2, maxRows: 4 }}
                                                value={inputMessage}
                                                onChange={(e) => setInputMessage(e.target.value)}
                                                onPressEnter={(e) => {
                                                    if (!e.shiftKey) {
                                                        e.preventDefault()
                                                        handleSendMessage()
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
                                )}
                            </div>
                        </Col>
                    )}
                </Row>
            </Content>
        </Layout>
    )
}