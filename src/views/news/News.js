import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import _ from 'lodash'
import {
    Card, Col, Row, List, Layout, Typography, Input, Button, Avatar,
    Select, message, Modal, Upload, Drawer, Menu, Tabs, Carousel,
    Statistic, Tag, Space, Tooltip, Badge, Divider
} from 'antd';
import {
    SendOutlined, UserOutlined, DeleteOutlined, PictureOutlined,
    AudioOutlined, StopOutlined, MessageOutlined, RobotOutlined,
    BookOutlined, ToolOutlined, FileTextOutlined, QuestionCircleOutlined,
    CalculatorOutlined, SafetyCertificateOutlined, GlobalOutlined,
    TeamOutlined, BankOutlined, FileSearchOutlined, PhoneOutlined,
    EnvironmentOutlined, ClockCircleOutlined, RightOutlined
} from '@ant-design/icons';
import './News.css'
import { useHistory } from 'react-router-dom'

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

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
    const [isAIChatVisible, setIsAIChatVisible] = useState(false);
    const [aiMessages, setAiMessages] = useState([]);
    const [aiInputMessage, setAiInputMessage] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const aiMessagesEndRef = useRef(null);
    const [activeTab, setActiveTab] = useState('1');
    const [legalNews, setLegalNews] = useState([]);
    const [legalTools, setLegalTools] = useState([
        { id: 1, title: '诉讼费计算器', icon: <CalculatorOutlined />, description: '快速计算各类案件诉讼费用', path: '/calculator' },
        { id: 2, title: '法律文书生成', icon: <FileTextOutlined />, description: '常用法律文书模板下载', path: '/document-generator' },
        { id: 4, title: '案件进度查询', icon: <FileSearchOutlined />, description: '查询案件审理进度' },
    ]);
    const [knowledgeBase, setKnowledgeBase] = useState([
        { id: 1, title: '婚姻家事', category: '民事' },
        { id: 2, title: '劳动纠纷', category: '民事' },
        { id: 3, title: '合同纠纷', category: '民事' },
        { id: 4, title: '交通事故', category: '民事' },
        { id: 5, title: '知识产权', category: '商事' },
        { id: 6, title: '公司治理', category: '商事' },
    ]);
    const history = useHistory()

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

    // AI 聊天相关函数
    const handleAIChat = async () => {
        if (!aiInputMessage.trim()) {
            message.warning('请输入消息内容');
            return;
        }

        const userMessage = {
            type: 'user',
            content: aiInputMessage,
            timestamp: new Date().toISOString()
        };

        setAiMessages(prev => [...prev, userMessage]);
        setAiInputMessage('');
        setIsAiLoading(true);

        try {
            // 使用 API2D 的备用域名
            const response = await axios.post(
                'https://openai.api2d.net/v1/chat/completions',  // 改用备用域名
                {
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: "你是一个专业的法律助手，擅长解答法律问题。请用中文回答，回答要专业、准确、简洁。如果遇到不确定的问题，建议用户咨询专业律师。"
                        },
                        {
                            role: "user",
                            content: aiInputMessage
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1000
                },
                {
                    headers: {
                        'Authorization': 'Bearer fk233081-xnzL9JgQCoY9jI7bNZMU0RyR1PlFTGzc',
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    timeout: 15000,  // 增加超时时间到 15 秒
                    withCredentials: false  // 禁用跨域凭证
                }
            );

            console.log('API 响应:', response.data);  // 添加响应日志

            if (!response.data || !response.data.choices || !response.data.choices[0]) {
                throw new Error('无效的 API 响应格式');
            }

            let aiResponse = {
                type: 'ai',
                content: response.data.choices[0].message.content,
                timestamp: new Date().toISOString()
            };

            // 添加法律建议提示
            const legalKeywords = ['法律', '律师', '诉讼', '合同', '纠纷', '赔偿', '权利', '义务', '离婚', '劳动'];
            if (legalKeywords.some(keyword => aiInputMessage.includes(keyword))) {
                aiResponse.content += '\n\n请注意：以上建议仅供参考，具体法律问题请咨询专业律师。';
            }

            setAiMessages(prev => [...prev, aiResponse]);
        } catch (error) {
            console.error('AI 响应详细错误:', {
                message: error.message,
                code: error.code,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers,
                    timeout: error.config?.timeout
                }
            });

            // 使用备用回复
            const fallbackResponses = {
                default: [
                    "我理解您的问题，让我为您解答：\n\n根据相关法律规定，建议您先咨询专业律师，因为每个案件的具体情况都不同。",
                    "这是一个很好的问题。作为法律助手，我建议您：\n1. 收集相关证据\n2. 咨询专业律师\n3. 了解相关法律程序\n\n具体建议请以专业律师意见为准。"
                ],
                greeting: [
                    "您好！我是您的法律助手，请问有什么可以帮您？",
                    "您好！很高兴为您服务，请问您有什么法律问题需要咨询？"
                ],
                thanks: [
                    "不客气！如果您还有其他法律问题，随时可以咨询我。",
                    "很高兴能帮到您！如果后续有任何法律问题，欢迎继续咨询。"
                ]
            };

            let responseType = 'default';
            if (aiInputMessage.includes('你好') || aiInputMessage.includes('您好')) {
                responseType = 'greeting';
            } else if (aiInputMessage.includes('谢谢') || aiInputMessage.includes('感谢')) {
                responseType = 'thanks';
            }

            const responses = fallbackResponses[responseType];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];

            const aiResponse = {
                type: 'ai',
                content: randomResponse,
                timestamp: new Date().toISOString()
            };

            setAiMessages(prev => [...prev, aiResponse]);

            // 显示更详细的错误提示
            if (error.response) {
                const status = error.response.status;
                const data = error.response.data;
                console.error('API 错误响应:', { status, data });

                switch (status) {
                    case 401:
                        message.error('API 认证失败，请检查 API 密钥是否正确');
                        break;
                    case 429:
                        message.warning('请求过于频繁，请稍后再试');
                        break;
                    case 403:
                        message.error('API 访问被拒绝，请检查 API 密钥权限');
                        break;
                    case 500:
                        message.error('服务器内部错误，请稍后重试');
                        break;
                    default:
                        message.error(`API 错误 (${status}): ${data?.error?.message || '未知错误'}`);
                }
            } else if (error.code === 'ECONNABORTED') {
                message.warning('请求超时，服务器响应时间过长');
            } else if (error.code === 'ERR_NETWORK') {
                message.error('网络连接失败，可能是由于跨域限制或网络问题');
                console.error('网络错误详情:', error);
            } else {
                message.error(`请求失败: ${error.message}`);
            }
        } finally {
            setIsAiLoading(false);
        }
    };

    // 滚动到 AI 聊天最新消息
    useEffect(() => {
        aiMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [aiMessages]);

    // 获取法律资讯
    useEffect(() => {
        // 这里可以替换为实际的API调用
        const mockNews = [
            { id: 1, title: '最高法发布新规：关于审理民间借贷案件的规定', date: '2024-03-15', category: '司法解释' },
            { id: 2, title: '《民法典》实施后，这些变化与你息息相关', date: '2024-03-14', category: '法律动态' },
            { id: 3, title: '最高检发布典型案例：打击电信网络诈骗', date: '2024-03-13', category: '案例指导' },
        ];
        setLegalNews(mockNews);
    }, []);

    // 渲染快速服务导航
    const renderQuickServices = () => (
        <div className="quick-service-section">
            <div className="quick-service-title">快速服务</div>
            <Row gutter={[16, 16]}>
                <Col span={6}>
                    <Card hoverable className="quick-service-card">
                        <SafetyCertificateOutlined className="quick-service-icon" />
                        <div className="quick-service-title-text">法律援助</div>
                        <div className="quick-service-desc">专业律师在线援助</div>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card hoverable className="quick-service-card">
                        <TeamOutlined className="quick-service-icon" />
                        <div className="quick-service-title-text">律师咨询</div>
                        <div className="quick-service-desc">一对一专业解答</div>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card hoverable className="quick-service-card">
                        <BankOutlined className="quick-service-icon" />
                        <div className="quick-service-title-text">公证服务</div>
                        <div className="quick-service-desc">在线预约办理</div>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card
                        hoverable
                        className="quick-service-card"
                        onClick={() => history.push('/legal-map')}
                    >
                        <GlobalOutlined className="quick-service-icon" />
                        <div className="quick-service-title-text">法律地图</div>
                        <div className="quick-service-desc">查看当前位置及附近法律服务机构</div>
                    </Card>
                </Col>
            </Row>
        </div>
    );

    // 渲染案件信息
    const renderCaseInfo = () => (
        <div className="case-section">
            <Row gutter={[20, 20]}>
                {list.map(item =>
                    <Col span={12} key={item[0]}>
                        <Card
                            className="case-card"
                            title={item[0]}
                            bordered={false}
                            hoverable
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
                )}
            </Row>
        </div>
    );

    // 渲染法律工具集
    const renderLegalTools = () => (
        <div className="legal-tools">
            <Row gutter={[24, 24]}>
                {legalTools.map(tool => (
                    <Col span={8} key={tool.id}>
                        <Card
                            hoverable
                            className="tool-card"
                            onClick={() => tool.path && history.push(tool.path)}
                        >
                            <div className="tool-icon">{tool.icon}</div>
                            <div className="tool-title">{tool.title}</div>
                            <div className="tool-desc">{tool.description}</div>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );

    // 渲染法律知识库
    const renderKnowledgeBase = () => (
        <div className="knowledge-base">
            <Tabs defaultActiveKey="民事">
                <TabPane tab="民事" key="民事">
                    <Row gutter={[24, 24]}>
                        {knowledgeBase.filter(item => item.category === '民事').map(item => (
                            <Col span={8} key={item.id}>
                                <Card
                                    hoverable
                                    className="knowledge-card"
                                    onClick={() => history.push(`/knowledge/${item.title}`)}
                                >
                                    <div className="knowledge-title">{item.title}</div>
                                    <div className="knowledge-category">{item.category}</div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </TabPane>
                <TabPane tab="商事" key="商事">
                    <Row gutter={[24, 24]}>
                        {knowledgeBase.filter(item => item.category === '商事').map(item => (
                            <Col span={8} key={item.id}>
                                <Card
                                    hoverable
                                    className="knowledge-card"
                                    onClick={() => history.push(`/knowledge/${item.title}`)}
                                >
                                    <div className="knowledge-title">{item.title}</div>
                                    <div className="knowledge-category">{item.category}</div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </TabPane>
            </Tabs>
        </div>
    );

    // 渲染法律资讯
    const renderLegalNews = () => (
        <div className="legal-news">
            <List
                itemLayout="vertical"
                dataSource={legalNews}
                renderItem={item => (
                    <List.Item>
                        <Card hoverable className="news-card">
                            <div className="news-header">
                                <Tag color="blue">{item.category}</Tag>
                                <Text type="secondary">{item.date}</Text>
                            </div>
                            <div className="news-title">{item.title}</div>
                            <div className="news-footer">
                                <Button type="link" icon={<RightOutlined />}>
                                    查看详情
                                </Button>
                            </div>
                        </Card>
                    </List.Item>
                )}
            />
        </div>
    );

    return (
        <Layout className="main-layout">
            <Header className="main-header">
                <div className="header-content">
                    <div className="header-title">智能化在线法律援助平台</div>
                    <div className="header-actions">
                        {userInfo?.roleId === 3 && (
                            <>
                                <Button
                                    type="primary"
                                    icon={<RobotOutlined />}
                                    onClick={() => setIsAIChatVisible(true)}
                                    className="ai-chat-button"
                                >
                                    智能法律咨询
                                </Button>
                                <Button
                                    type="text"
                                    icon={<UserOutlined />}
                                    className="user-center-button"
                                    onClick={() => history.push('/home')}
                                >
                                    个人中心
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </Header>

            <Content className="main-content">
                <div className="content-wrapper">
                    {/* 轮播图 */}
                    <div className="banner-section">
                        <Carousel autoplay>
                            <div>
                                <div className="banner-item" style={{ backgroundImage: 'url(/banner1.jpg)' }}>
                                    <div className="banner-content">
                                        <h2>专业法律援助</h2>
                                        <p>为您提供全方位的法律支持</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="banner-item" style={{ backgroundImage: 'url(/banner2.jpg)' }}>
                                    <div className="banner-content">
                                        <h2>智能法律咨询</h2>
                                        <p>AI助手24小时在线服务</p>
                                    </div>
                                </div>
                            </div>
                        </Carousel>
                    </div>

                    {/* 快速服务导航 */}
                    {renderQuickServices()}

                    {/* 主要内容区域 */}
                    <Row gutter={[20, 20]}>
                        {/* 左侧主要内容 */}
                        <Col span={userInfo?.roleId === 3 ? 16 : 24}>
                            <Tabs activeKey={activeTab} onChange={setActiveTab}>
                                <TabPane tab="案件信息" key="1">
                                    {renderCaseInfo()}
                                </TabPane>
                                <TabPane tab="法律资讯" key="2">
                                    {renderLegalNews()}
                                </TabPane>
                                <TabPane tab="法律工具" key="3">
                                    {renderLegalTools()}
                                </TabPane>
                                <TabPane tab="法律知识库" key="4">
                                    {renderKnowledgeBase()}
                                </TabPane>
                            </Tabs>
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
                </div>

                {/* 底部服务区域 */}
                <div className="bottom-services-wrapper">
                    <div className="bottom-services">
                        <div className="bottom-services-title">关于我们</div>
                        <Row gutter={[40, 20]}>
                            <Col span={8}>
                                <Card className="bottom-services-card">
                                    <TeamOutlined className="bottom-services-icon" />
                                    <div className="bottom-services-title-text">平台简介</div>
                                    <div className="bottom-services-desc">
                                        智能化在线法律援助平台致力于为广大群众提供便捷、专业的法律服务，
                                        通过互联网技术打破地域限制，让法律服务触手可及。
                                    </div>
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card className="bottom-services-card">
                                    <PhoneOutlined className="bottom-services-icon" />
                                    <div className="bottom-services-title-text">联系方式</div>
                                    <div className="bottom-services-desc">
                                        <Space direction="vertical">
                                            <Text><PhoneOutlined /> 服务热线：15502921537</Text>
                                            <Text><EnvironmentOutlined /> 地址：西安市长安区西长安街618号</Text>
                                            <Text><ClockCircleOutlined /> 服务时间：周一至周五 9:00-18:00</Text>
                                        </Space>
                                    </div>
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card className="bottom-services-card">
                                    <GlobalOutlined className="bottom-services-icon" />
                                    <div className="bottom-services-title-text">快速链接</div>
                                    <div className="bottom-services-desc">
                                        <Space direction="vertical">
                                            <a href="#/about">关于我们</a>
                                            <a href="#/help">帮助中心</a>
                                            <a href="#/privacy">隐私政策</a>
                                            <a href="#/terms">服务条款</a>
                                        </Space>
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                        <Divider />
                        <div className="footer-bottom">
                            <Text>© 2024 智能化在线法律援助平台 版权所有</Text>
                        </div>
                    </div>
                </div>
            </Content>

            {/* 添加 AI 聊天抽屉 */}
            <Drawer
                title="智能法律咨询"
                placement="right"
                onClose={() => setIsAIChatVisible(false)}
                open={isAIChatVisible}
                width={400}
            >
                <div className="ai-chat-container">
                    <div className="ai-chat-messages">
                        {aiMessages.length === 0 ? (
                            <div className="message system">
                                您好！我是您的 AI 法律助手，请问有什么可以帮您？
                            </div>
                        ) : (
                            aiMessages.map((msg, index) => (
                                <div key={index} className={`message ${msg.type === 'user' ? 'self' : 'other'}`}>
                                    {msg.type === 'ai' && (
                                        <Avatar
                                            icon={<RobotOutlined />}
                                            style={{ backgroundColor: '#1890ff' }}
                                        />
                                    )}
                                    <div className="message-content">
                                        <div className="message-header">
                                            <span className="message-sender">
                                                {msg.type === 'user' ? userInfo?.username : '法律小助手'}
                                            </span>
                                            <span className="message-time">
                                                {new Date(msg.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="message-text">{msg.content}</div>
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
                        <div ref={aiMessagesEndRef} />
                    </div>
                    <div className="ai-chat-input">
                        <TextArea
                            placeholder="请输入您的问题..."
                            autoSize={{ minRows: 2, maxRows: 4 }}
                            value={aiInputMessage}
                            onChange={(e) => setAiInputMessage(e.target.value)}
                            onPressEnter={(e) => {
                                if (!e.shiftKey) {
                                    e.preventDefault();
                                    handleAIChat();
                                }
                            }}
                        />
                        <Button
                            type="primary"
                            icon={<SendOutlined />}
                            onClick={handleAIChat}
                            loading={isAiLoading}
                            className="send-button"
                        >
                            发送
                        </Button>
                    </div>
                </div>
            </Drawer>
        </Layout>
    )
}