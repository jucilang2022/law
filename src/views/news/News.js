import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import _ from 'lodash'
import {
    Card, Col, Row, List, Layout, Typography, Input, Button, Avatar,
    Select, message, Modal, Upload, Drawer, Menu, Tabs, Carousel,
    Statistic, Tag, Space, Tooltip, Badge, Divider, Progress, Rate,
    Timeline, Alert, Popover, Calendar, Badge as AntBadge, Form, Collapse
} from 'antd';
import {
    SendOutlined, UserOutlined, DeleteOutlined, PictureOutlined,
    AudioOutlined, StopOutlined, MessageOutlined, RobotOutlined,
    BookOutlined, ToolOutlined, FileTextOutlined, QuestionCircleOutlined,
    CalculatorOutlined, SafetyCertificateOutlined, GlobalOutlined,
    TeamOutlined, BankOutlined, FileSearchOutlined, PhoneOutlined,
    EnvironmentOutlined, ClockCircleOutlined, RightOutlined,
    CalendarOutlined, UploadOutlined, SearchOutlined, StarOutlined,
    FireOutlined, TrophyOutlined, LikeOutlined, ShareAltOutlined,
    EyeOutlined, CommentOutlined, HeartOutlined, ThunderboltOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import './News.css'
import { useHistory } from 'react-router-dom'

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;

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
        { id: 3, title: '案件进度查询', icon: <FileSearchOutlined />, description: '查询案件审理进度', path: '/case-progress' }
    ]);
    const [knowledgeBase, setKnowledgeBase] = useState([
        { id: 1, title: '婚姻家事', category: '民事' },
        { id: 2, title: '劳动纠纷', category: '民事' },
        { id: 3, title: '合同纠纷', category: '民事' },
        { id: 4, title: '交通事故', category: '民事' },
        { id: 5, title: '知识产权', category: '商事' },
        { id: 6, title: '公司治理', category: '商事' },
    ]);
    const [hotTopics, setHotTopics] = useState([
        {
            id: 1,
            question: '离婚后子女抚养权如何确定？',
            answer: '根据《民法典》规定，子女抚养权的确定主要考虑以下因素：\n\n1. 子女的年龄、性别、健康状况；\n2. 父母的经济能力、教育水平；\n3. 子女的意愿（8周岁以上）；\n4. 父母与子女的感情基础等。\n\n法院会综合这些因素，以子女利益最大化为原则作出判决。建议在离婚前，双方可以协商确定抚养权，如果协商不成，可以向法院提起诉讼。',
            category: '婚姻家事'
        },
        {
            id: 2,
            question: '劳动合同到期不续签需要赔偿吗？',
            answer: '根据《劳动合同法》规定，劳动合同到期不续签是否需要赔偿，主要看以下情况：\n\n1. 用人单位提出续签但劳动者不同意：无需赔偿；\n2. 用人单位不续签：需要支付经济补偿金；\n3. 劳动者提出不续签：一般无需赔偿。\n\n经济补偿金的计算标准：\n- 工作满一年支付一个月工资；\n- 不满一年按一年计算；\n- 不满半年按半年计算。\n\n建议在劳动合同到期前，双方就续签事宜进行充分沟通，避免产生不必要的纠纷。',
            category: '劳动纠纷'
        },
        {
            id: 3,
            question: '交通事故责任如何认定？',
            answer: '交通事故责任认定主要依据《道路交通安全法》及相关规定，具体考虑以下因素：\n\n1. 当事人的过错程度：\n   - 违反交通信号灯\n   - 超速行驶\n   - 违规变道\n   - 未保持安全距离等\n\n2. 事故现场证据：\n   - 现场照片\n   - 监控录像\n   - 车辆损坏情况\n   - 路面痕迹等\n\n3. 其他重要因素：\n   - 天气状况\n   - 道路条件\n   - 车辆状况\n   - 驾驶员状态等\n\n交警部门会制作事故认定书，明确各方责任。如果对认定结果有异议，可以在收到认定书之日起3日内申请复核。',
            category: '交通事故'
        },
        {
            id: 4,
            question: '房屋买卖合同违约如何维权？',
            answer: '房屋买卖合同违约维权途径如下：\n\n1. 协商和解：\n   - 与对方进行友好协商\n   - 寻求调解机构帮助\n   - 达成和解协议\n\n2. 仲裁：\n   - 向仲裁委员会申请仲裁\n   - 提交相关证据材料\n   - 等待仲裁结果\n\n3. 诉讼：\n   - 向法院提起诉讼\n   - 准备起诉材料\n   - 参加庭审\n\n维权建议：\n1. 及时收集证据：\n   - 合同文本\n   - 付款凭证\n   - 违约证据\n   - 沟通记录等\n\n2. 注意诉讼时效：\n   - 一般诉讼时效为3年\n   - 从知道或应当知道权利被侵害时起算\n\n3. 选择合适方式：\n   - 根据具体情况选择维权途径\n   - 考虑时间成本和费用支出\n   - 评估胜诉可能性',
            category: '合同纠纷'
        }
    ]);
    const [userStats, setUserStats] = useState({
        consultationCount: 12,
        savedArticles: 8,
        completedTasks: 5
    });
    const [events, setEvents] = useState([
        { date: '2025-03-20', content: '法律讲座：民法典解读' },
        { date: '2025-03-25', content: '在线法律咨询日' },
        { date: '2025-04-01', content: '法律援助志愿者培训' }
    ]);
    const [showWelcome, setShowWelcome] = useState(true);
    const history = useHistory()
    const [expandedQuestions, setExpandedQuestions] = useState({});
    const [consultations, setConsultations] = useState([]);
    const [isConsultationModalVisible, setIsConsultationModalVisible] = useState(false);
    const [consultationForm] = Form.useForm();
    const [commentInputs, setCommentInputs] = useState({});
    const [comments, setComments] = useState({});
    const [expandedConsultations, setExpandedConsultations] = useState({});
    const [isAboutModalVisible, setIsAboutModalVisible] = useState(false);
    const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);
    const [isPrivacyModalVisible, setIsPrivacyModalVisible] = useState(false);
    const [isTermsModalVisible, setIsTermsModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [expandedSearchResults, setExpandedSearchResults] = useState({});

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
            // 过滤掉id为7的法律咨询分类
            const filteredData = res.data.filter(item => item.categoryId !== 7);
            setlist(Object.entries(_.groupBy(filteredData, item => item.category.title)))
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
            { id: 1, title: '最高法发布新规：关于审理民间借贷案件的规定', date: '2025-03-15', category: '司法解释' },
            { id: 2, title: '《民法典》实施后，这些变化与你息息相关', date: '2025-03-14', category: '法律动态' },
            { id: 3, title: '最高检发布典型案例：打击电信网络诈骗', date: '2025-03-13', category: '案例指导' },
        ];
        setLegalNews(mockNews);
    }, []);

    // 获取咨询列表
    useEffect(() => {
        fetchConsultations();
    }, []);

    const fetchConsultations = async () => {
        try {
            const response = await axios.get("/news?publishState=2&_expand=category");
            // 过滤出法律咨询分类的文章
            const consultationList = response.data.filter(item => item.categoryId === 7);
            setConsultations(consultationList);
        } catch (error) {
            message.error('获取咨询列表失败');
        }
    };

    // 处理新建咨询
    const handleCreateConsultation = () => {
        if (!userInfo) {
            message.warning('请先登录');
            return;
        }
        setIsConsultationModalVisible(true);
    };

    // 提交咨询
    const handleSubmitConsultation = async (values) => {
        try {
            const newConsultation = {
                title: values.title,
                content: values.description,
                categoryId: 7, // 修改为法律咨询的分类ID
                author: userInfo.username,
                publishState: 2, // 已发布状态
                createTime: new Date().toISOString(),
                view: 0,
                star: 0,
                like: 0
            };

            await axios.post("/news", newConsultation);
            message.success('咨询发布成功');
            setIsConsultationModalVisible(false);
            consultationForm.resetFields();
            fetchConsultations();
        } catch (error) {
            message.error('发布失败，请重试');
        }
    };

    // 获取评论列表
    const fetchComments = async (consultationId) => {
        try {
            const response = await axios.get(`/news/${consultationId}`);
            // 直接从 news 对象中获取 comments 数组
            const commentsList = response.data.comments || [];
            setComments(prev => ({
                ...prev,
                [consultationId]: commentsList
            }));
        } catch (error) {
            message.error('获取评论失败');
        }
    };

    // 处理评论输入变化
    const handleCommentChange = (consultationId, value) => {
        setCommentInputs(prev => ({
            ...prev,
            [consultationId]: value
        }));
    };

    // 处理评论提交
    const handleSubmitComment = async (consultationId) => {
        const commentContent = commentInputs[consultationId];
        if (!commentContent?.trim()) {
            message.warning('请输入评论内容');
            return;
        }

        try {
            // 获取当前咨询的评论列表
            const response = await axios.get(`/news/${consultationId}`);
            const currentComments = response.data.comments || [];

            // 创建新评论
            const newComment = {
                id: Date.now(), // 临时ID
                content: commentContent,
                userId: userInfo.id,
                username: userInfo.username,
                createTime: new Date().toISOString()
            };

            // 更新咨询的评论列表
            await axios.patch(`/news/${consultationId}`, {
                comments: [...currentComments, newComment]
            });

            message.success('评论发布成功');
            // 清空当前咨询的评论输入
            setCommentInputs(prev => ({
                ...prev,
                [consultationId]: ''
            }));
            // 重新获取评论列表
            await fetchComments(consultationId);
        } catch (error) {
            message.error('评论发布失败');
        }
    };

    // 切换咨询展开状态时获取评论
    const toggleConsultation = async (id) => {
        setExpandedConsultations(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
        // 如果展开，则获取评论
        if (!expandedConsultations[id]) {
            await fetchComments(id);
        }
    };

    // 获取用户角色标签
    const getUserRoleTag = (userId) => {
        // 从 lawyers 数组中查找用户是否为律师
        const isLawyer = lawyers.some(lawyer => lawyer.id === userId);

        if (userId === 1) {
            return { color: 'red', text: '管理员' };
        } else if (isLawyer) {
            return { color: 'blue', text: '律师' };
        } else {
            return { color: 'green', text: '用户' };
        }
    };

    // 模糊搜索算法
    const fuzzySearch = (query, items) => {
        if (!query) return items;

        const searchTerms = query.toLowerCase().split(' ');
        return items.filter(item => {
            const title = item.title.toLowerCase();
            const content = item.content?.toLowerCase() || '';
            return searchTerms.every(term =>
                title.includes(term) || content.includes(term)
            );
        });
    };

    // 关键词匹配算法
    const keywordMatch = (text, keywords) => {
        const textLower = text.toLowerCase();
        return keywords.filter(keyword =>
            textLower.includes(keyword.toLowerCase())
        ).length;
    };

    // 处理搜索
    const handleSearch = (value) => {
        setSearchQuery(value);
        const results = fuzzySearch(value, list.flatMap(([_, items]) => items));
        setSearchResults(results);
    };

    // 处理搜索结果展开/收起
    const toggleSearchResult = (id) => {
        setExpandedSearchResults(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
        // 如果展开，则获取评论
        if (!expandedSearchResults[id]) {
            fetchComments(id);
        }
    };

    // 渲染法律咨询模块
    const renderLegalConsultations = () => (
        <div className="legal-consultations">
            {userInfo?.roleId === 3 && (
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20, gap: '16px' }}>
                    <Button
                        type="primary"
                        icon={<MessageOutlined />}
                        onClick={handleCreateConsultation}
                        className="create-consultation-btn"
                    >
                        新建咨询
                    </Button>
                    <Input.Search
                        placeholder="搜索咨询内容..."
                        allowClear
                        enterButton="搜索"
                        style={{ width: '400px' }}
                        onSearch={value => {
                            const results = consultations.filter(item =>
                                item.title.toLowerCase().includes(value.toLowerCase()) ||
                                item.content.toLowerCase().includes(value.toLowerCase())
                            );
                            setConsultations(results);
                        }}
                    />
                </div>
            )}

            <Row gutter={[16, 16]}>
                {consultations.map(consultation => (
                    <Col span={12} key={consultation.id}>
                        <Card
                            className="consultation-card"
                            hoverable
                            onClick={() => toggleConsultation(consultation.id)}
                        >
                            <div className="consultation-header">
                                <Title level={5} style={{ marginBottom: 8 }}>{consultation.title}</Title>
                                <div className="consultation-meta">
                                    <Space>
                                        <Tag color="blue">
                                            <UserOutlined /> {consultation.author}
                                        </Tag>
                                        <Tag color="green">
                                            <ClockCircleOutlined /> {new Date(consultation.createTime).toLocaleString()}
                                        </Tag>
                                    </Space>
                                </div>
                            </div>

                            {expandedConsultations[consultation.id] && (
                                <div
                                    className="consultation-content"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="consultation-description" style={{ fontSize: '16px', lineHeight: '1.8' }}>
                                        {consultation.content}
                                    </div>

                                    <Divider />

                                    <div className="comments-section">
                                        <Title level={5}>评论 ({comments[consultation.id]?.length || 0})</Title>
                                        <List
                                            dataSource={comments[consultation.id] || []}
                                            renderItem={comment => {
                                                const roleInfo = getUserRoleTag(comment.userId);
                                                const isLawyer = lawyers.some(lawyer => lawyer.id === comment.userId);
                                                return (
                                                    <List.Item>
                                                        <div className="comment-item">
                                                            <div className="comment-header">
                                                                <Avatar
                                                                    icon={
                                                                        comment.userId === 1 ? <SafetyCertificateOutlined /> :
                                                                            isLawyer ? <BankOutlined /> :
                                                                                <UserOutlined />
                                                                    }
                                                                    style={{
                                                                        backgroundColor:
                                                                            comment.userId === 1 ? '#f5222d' :
                                                                                isLawyer ? '#1890ff' :
                                                                                    '#87d068'
                                                                    }}
                                                                />
                                                                <span className="comment-username">{comment.username}</span>
                                                                <Tag color={roleInfo.color}>
                                                                    {roleInfo.text}
                                                                </Tag>
                                                                <span className="comment-time">
                                                                    {new Date(comment.createTime).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <div className="comment-content">
                                                                {comment.content}
                                                            </div>
                                                        </div>
                                                    </List.Item>
                                                );
                                            }}
                                        />

                                        {userInfo && (
                                            <div className="comment-input-section">
                                                <Input.TextArea
                                                    value={commentInputs[consultation.id] || ''}
                                                    onChange={e => handleCommentChange(consultation.id, e.target.value)}
                                                    placeholder="请输入您的评论..."
                                                    rows={3}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                <Button
                                                    type="primary"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSubmitComment(consultation.id);
                                                    }}
                                                    style={{ marginTop: 10 }}
                                                >
                                                    发表评论
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* 新建咨询的模态框 */}
            <Modal
                title="新建法律咨询"
                open={isConsultationModalVisible}
                onCancel={() => setIsConsultationModalVisible(false)}
                footer={null}
            >
                <Form
                    form={consultationForm}
                    onFinish={handleSubmitConsultation}
                    layout="vertical"
                >
                    <Form.Item
                        name="title"
                        label="咨询标题"
                        rules={[{ required: true, message: '请输入咨询标题' }]}
                    >
                        <Input placeholder="请输入咨询标题" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="咨询内容"
                        rules={[{ required: true, message: '请输入咨询内容' }]}
                    >
                        <Input.TextArea
                            placeholder="请详细描述您的问题..."
                            rows={6}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            发布咨询
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );

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
                    <Card
                        hoverable
                        className="quick-service-card"
                        onClick={() => {
                            const token = localStorage.getItem('token');
                            if (!token) {
                                message.warning('请先登录');
                                return;
                            }
                            const userInfo = JSON.parse(token);
                            if (userInfo.roleId !== 3) {
                                message.warning('只有普通用户可以预约服务');
                                return;
                            }
                            history.push({
                                pathname: '/notary/appointment',
                                state: { showBackButton: true }
                            });
                        }}
                    >
                        <BankOutlined className="quick-service-icon" />
                        <div className="quick-service-title-text">预约服务</div>
                        <div className="quick-service-desc">办理在线预约</div>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card
                        hoverable
                        className="quick-service-card"
                        onClick={() => {
                            const token = localStorage.getItem('token');
                            if (!token) {
                                message.warning('请先登录');
                                return;
                            }
                            const userInfo = JSON.parse(token);
                            if (userInfo.role.roleName === '用户') {
                                history.push({
                                    pathname: '/appointment/my',
                                    state: { showBackButton: true }
                                });
                            } else {
                                history.push({
                                    pathname: '/appointment-manage',
                                    state: { showBackButton: true }
                                });
                            }
                        }}
                    >
                        <TeamOutlined className="quick-service-icon" />
                        <div className="quick-service-title-text">我的预约</div>
                        <div className="quick-service-desc">查看预约记录</div>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card
                        hoverable
                        className="quick-service-card"
                        onClick={() => history.push({
                            pathname: '/legal-map',
                            state: { showBackButton: true }
                        })}
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
            <div className="search-section" style={{ marginBottom: 20 }}>
                <Input.Search
                    placeholder="搜索案件信息..."
                    allowClear
                    enterButton="搜索"
                    size="large"
                    value={searchQuery}
                    onChange={e => handleSearch(e.target.value)}
                    style={{ maxWidth: 500 }}
                />
            </div>
            {searchQuery ? (
                <List
                    dataSource={searchResults}
                    renderItem={item => (
                        <List.Item>
                            <Card
                                className="search-result-card"
                                hoverable
                                onClick={() => history.push({
                                    pathname: `/detail/${item.id}`,
                                    state: { showBackButton: true }
                                })}
                            >
                                <div className="search-result-content">
                                    <Title level={5}>{item.title}</Title>
                                    <div className="search-result-meta">
                                        <Space>
                                            <Tag color="blue">
                                                <ClockCircleOutlined /> {new Date(item.publishTime).toLocaleDateString()}
                                            </Tag>
                                            <Tag color="green">
                                                <EyeOutlined /> {Math.floor(Math.random() * 1000)} 阅读
                                            </Tag>
                                        </Space>
                                    </div>
                                </div>
                            </Card>
                        </List.Item>
                    )}
                />
            ) : (
                <Row gutter={[20, 20]}>
                    {list.map(item =>
                        <Col span={12} key={item[0]}>
                            <Card
                                className="case-card"
                                title={
                                    <div className="case-card-header">
                                        <span className="case-category-icon">
                                            {item[0] === '民事案件' ? <TeamOutlined /> :
                                                item[0] === '刑事案件' ? <SafetyCertificateOutlined /> :
                                                    item[0] === '行政案件' ? <BankOutlined /> :
                                                        <FileTextOutlined />}
                                        </span>
                                        <span className="case-category-title">{item[0]}</span>
                                    </div>
                                }
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
                                        <List.Item className="case-list-item">
                                            <div className="case-item-content">
                                                <div className="case-item-title">
                                                    <a href={`#/detail/${data.id}`}>{data.title}</a>
                                                </div>
                                                <div className="case-item-meta">
                                                    <Space>
                                                        <Tag color="blue">
                                                            <ClockCircleOutlined /> {new Date(data.publishTime).toLocaleDateString()}
                                                        </Tag>
                                                        <Tag color="green">
                                                            <EyeOutlined /> {Math.floor(Math.random() * 1000)} 阅读
                                                        </Tag>
                                                    </Space>
                                                </div>
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        </Col>
                    )}
                </Row>
            )}
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
                            onClick={() => tool.path && history.push({
                                pathname: tool.path,
                                state: { showBackButton: true }
                            })}
                        >
                            <div className="tool-icon">{tool.icon}</div>
                            <div className="tool-title">{tool.title}</div>
                            <div className="tool-desc">{tool.description}</div>
                        </Card>
                    </Col>
                ))}
                <Col span={24}>
                    <Card className="calendar-card">
                        <div className="calendar-header">
                            <CalendarOutlined className="calendar-icon" />
                            <span className="calendar-title">法律活动日历</span>
                        </div>
                        <Calendar
                            fullscreen={false}
                            dateCellRender={(date) => {
                                const event = events.find(e => e.date === date.format('YYYY-MM-DD'));
                                return event ? (
                                    <Popover
                                        content={
                                            <div className="event-popover">
                                                <div className="event-title">{event.content}</div>
                                                <div className="event-date">{event.date}</div>
                                            </div>
                                        }
                                        title="活动详情"
                                    >
                                        <div className="event-dot" />
                                    </Popover>
                                ) : null;
                            }}
                        />
                    </Card>
                </Col>
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
                                    onClick={() => history.push({
                                        pathname: `/knowledge/${item.title}`,
                                        state: { showBackButton: true }
                                    })}
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
                                    onClick={() => history.push({
                                        pathname: `/knowledge/${item.title}`,
                                        state: { showBackButton: true }
                                    })}
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
                                <Tag color="blue" className="news-tag">
                                    <ThunderboltOutlined /> {item.category}
                                </Tag>
                                <Text type="secondary" className="news-date">
                                    <CalendarOutlined /> {item.date}
                                </Text>
                            </div>
                            <div className="news-content">
                                <div className="news-title">{item.title}</div>
                                <div className="news-stats">
                                    <Space>
                                        <span><EyeOutlined /> {Math.floor(Math.random() * 1000)} 阅读</span>
                                        <span><LikeOutlined /> {Math.floor(Math.random() * 100)} 点赞</span>
                                        <span><CommentOutlined /> {Math.floor(Math.random() * 50)} 评论</span>
                                    </Space>
                                </div>
                            </div>
                            <div className="news-footer">
                                <Button type="link" icon={<RightOutlined />} className="news-more-btn">
                                    查看详情
                                </Button>
                            </div>
                        </Card>
                    </List.Item>
                )}
            />
        </div>
    );

    // 处理问题展开/收起
    const toggleQuestion = (id) => {
        setExpandedQuestions(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // 渲染热门话题
    const renderHotTopics = () => (
        <Card
            title={
                <div className="section-header">
                    <div className="section-title-wrapper">
                        <QuestionCircleOutlined className="section-icon" />
                        <span className="section-title">法律问答</span>
                    </div>
                    <span className="section-subtitle">常见法律问题解答</span>
                </div>
            }
            className="hot-topics-section"
        >
            <List
                itemLayout="vertical"
                dataSource={hotTopics}
                renderItem={item => (
                    <List.Item>
                        <div className="qa-item">
                            <div
                                className="question"
                                onClick={() => toggleQuestion(item.id)}
                            >
                                <span className="q-tag">问</span>
                                <span className="question-text">{item.question}</span>
                                <span className="expand-icon">
                                    {expandedQuestions[item.id] ? '收起' : '展开'}
                                </span>
                            </div>
                            {expandedQuestions[item.id] && (
                                <div className="answer">
                                    <span className="a-tag">答</span>
                                    <div className="answer-text">
                                        {item.answer.split('\n').map((line, index) => (
                                            <p key={index}>{line}</p>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="qa-meta">
                                <Tag color="blue">{item.category}</Tag>
                            </div>
                        </div>
                    </List.Item>
                )}
            />
        </Card>
    );

    // 渲染用户统计
    const renderUserStats = () => (
        <div className="user-stats-section">
            <Row gutter={[16, 16]}>
                <Col span={8}>
                    <Card className="stat-card">
                        <Statistic
                            title="咨询次数"
                            value={userStats.consultationCount}
                            prefix={<MessageOutlined />}
                        />
                        <Progress percent={75} showInfo={false} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card className="stat-card">
                        <Statistic
                            title="收藏文章"
                            value={userStats.savedArticles}
                            prefix={<StarOutlined />}
                        />
                        <Progress percent={60} showInfo={false} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card className="stat-card">
                        <Statistic
                            title="完成任务"
                            value={userStats.completedTasks}
                            prefix={<TrophyOutlined />}
                        />
                        <Progress percent={40} showInfo={false} />
                    </Card>
                </Col>
            </Row>
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
                    {/* 欢迎提示和使用指南 */}
                    <Collapse
                        defaultActiveKey={['1']}
                        className="usage-guide-collapse"
                        style={{ marginBottom: 20 }}
                    >
                        <Panel
                            header={
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <InfoCircleOutlined style={{ marginRight: 8 }} />
                                    <span>欢迎使用智能化在线法律援助平台</span>
                                </div>
                            }
                            key="1"
                        >
                            <div className="usage-guide-content">
                                <div style={{ marginBottom: '16px', color: '#666' }}>
                                    我们提供专业的法律咨询、在线预约、智能问答等服务，让法律服务触手可及。
                                </div>
                                <Row gutter={[24, 24]}>
                                    <Col span={8}>
                                        <Card className="guide-card">
                                            <div className="guide-step">
                                                <div className="step-number">1</div>
                                                <div className="step-content">
                                                    <Title level={5}>注册登录</Title>
                                                    <Text>首次使用请先注册账号，已有账号可直接登录。登录后即可使用平台全部功能。</Text>
                                                </div>
                                            </div>
                                        </Card>
                                    </Col>
                                    <Col span={8}>
                                        <Card className="guide-card">
                                            <div className="guide-step">
                                                <div className="step-number">2</div>
                                                <div className="step-content">
                                                    <Title level={5}>选择服务</Title>
                                                    <Text>根据需求选择：在线咨询、智能问答、预约服务、法律工具等。</Text>
                                                </div>
                                            </div>
                                        </Card>
                                    </Col>
                                    <Col span={8}>
                                        <Card className="guide-card">
                                            <div className="guide-step">
                                                <div className="step-number">3</div>
                                                <div className="step-content">
                                                    <Title level={5}>获取帮助</Title>
                                                    <Text>专业律师在线解答，AI助手24小时服务，让您随时随地获取法律支持。</Text>
                                                </div>
                                            </div>
                                        </Card>
                                    </Col>
                                </Row>
                                <Divider />
                                <div className="quick-tips">
                                    <Title level={5}>快速提示：</Title>
                                    <ul>
                                        <li>使用智能法律咨询，可以快速获取常见法律问题的解答</li>
                                        <li>在线咨询功能支持文字、图片、语音等多种沟通方式</li>
                                        <li>法律工具集提供诉讼费计算、文书生成等实用功能</li>
                                        <li>法律知识库收录了丰富的法律知识和案例</li>
                                        <li>遇到紧急情况，建议直接拨打服务热线获取帮助</li>
                                    </ul>
                                </div>
                            </div>
                        </Panel>
                    </Collapse>

                    {/* 轮播图 */}
                    <div className="banner-section">
                        <Carousel autoplay autoplaySpeed={2000}>
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
                                <TabPane tab="法律咨询" key="2">
                                    {renderLegalConsultations()}
                                </TabPane>
                                <TabPane tab="法律工具" key="3">
                                    {renderLegalTools()}
                                </TabPane>
                                <TabPane tab="法律知识库" key="4">
                                    {renderKnowledgeBase()}
                                </TabPane>
                            </Tabs>

                            {/* 新增的用户统计和热门话题 */}
                            {userInfo?.roleId === 3 && (
                                <>
                                    {renderUserStats()}
                                    {renderHotTopics()}
                                </>
                            )}
                        </Col>

                        {/* 右侧在线咨询模块 */}
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
                                            <a onClick={() => setIsAboutModalVisible(true)}>关于我们</a>
                                            <a onClick={() => setIsHelpModalVisible(true)}>帮助中心</a>
                                            <a onClick={() => setIsPrivacyModalVisible(true)}>隐私政策</a>
                                            <a onClick={() => setIsTermsModalVisible(true)}>服务条款</a>
                                        </Space>
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                        <Divider />
                        <div className="footer-bottom">
                            <Text>© 2025 智能化在线法律援助平台 版权所有</Text>
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

            {/* 添加四个弹窗组件 */}
            <Modal
                title="关于我们"
                open={isAboutModalVisible}
                onCancel={() => setIsAboutModalVisible(false)}
                footer={null}
                width={800}
            >
                <div className="modal-content">
                    <Title level={4}>智能化在线法律援助平台</Title>
                    <Paragraph>
                        我们是一家致力于为广大群众提供便捷、专业法律服务的在线平台。通过互联网技术，我们打破了传统法律服务的地域限制，让每个人都能轻松获取专业的法律支持。
                    </Paragraph>
                    <Title level={5}>我们的使命</Title>
                    <Paragraph>
                        让法律服务触手可及，为每个人提供平等的法律保护。
                    </Paragraph>
                    <Title level={5}>我们的愿景</Title>
                    <Paragraph>
                        成为最受信赖的在线法律援助平台，推动法律服务普惠化发展。
                    </Paragraph>
                    <Title level={5}>我们的优势</Title>
                    <ul>
                        <li>专业的律师团队</li>
                        <li>智能化的服务系统</li>
                        <li>便捷的在线咨询</li>
                        <li>全面的法律工具</li>
                        <li>24小时不间断服务</li>
                    </ul>
                </div>
            </Modal>

            <Modal
                title="帮助中心"
                open={isHelpModalVisible}
                onCancel={() => setIsHelpModalVisible(false)}
                footer={null}
                width={800}
            >
                <div className="modal-content">
                    <Collapse defaultActiveKey={['1']}>
                        <Panel header="如何开始使用平台？" key="1">
                            <Paragraph>
                                1. 注册/登录账号<br />
                                2. 选择需要的服务类型<br />
                                3. 按照指引完成操作
                            </Paragraph>
                        </Panel>
                        <Panel header="如何预约律师？" key="2">
                            <Paragraph>
                                1. 进入预约服务页面<br />
                                2. 选择律师和时间<br />
                                3. 填写预约信息<br />
                                4. 确认预约
                            </Paragraph>
                        </Panel>
                        <Panel header="如何使用智能法律咨询？" key="3">
                            <Paragraph>
                                1. 点击"智能法律咨询"按钮<br />
                                2. 输入您的问题<br />
                                3. 等待AI助手回复
                            </Paragraph>
                        </Panel>
                        <Panel header="常见问题" key="4">
                            <Paragraph>
                                <ul>
                                    <li>如何修改个人信息？</li>
                                    <li>如何查看历史咨询记录？</li>
                                    <li>如何取消预约？</li>
                                    <li>如何联系客服？</li>
                                </ul>
                            </Paragraph>
                        </Panel>
                    </Collapse>
                </div>
            </Modal>

            <Modal
                title="隐私政策"
                open={isPrivacyModalVisible}
                onCancel={() => setIsPrivacyModalVisible(false)}
                footer={null}
                width={800}
            >
                <div className="modal-content">
                    <Title level={4}>隐私政策</Title>
                    <Paragraph>
                        本平台非常重视用户的隐私保护，我们承诺对您的个人信息进行严格保密。
                    </Paragraph>
                    <Title level={5}>信息收集</Title>
                    <Paragraph>
                        我们收集的信息包括但不限于：
                        <ul>
                            <li>基本信息（姓名、联系方式等）</li>
                            <li>账户信息（用户名、密码等）</li>
                            <li>使用记录（咨询记录、预约记录等）</li>
                        </ul>
                    </Paragraph>
                    <Title level={5}>信息使用</Title>
                    <Paragraph>
                        我们使用收集的信息用于：
                        <ul>
                            <li>提供法律服务</li>
                            <li>改进服务质量</li>
                            <li>发送服务通知</li>
                        </ul>
                    </Paragraph>
                    <Title level={5}>信息保护</Title>
                    <Paragraph>
                        我们采取严格的安全措施保护您的个人信息，包括：
                        <ul>
                            <li>数据加密存储</li>
                            <li>访问权限控制</li>
                            <li>定期安全审计</li>
                        </ul>
                    </Paragraph>
                </div>
            </Modal>

            <Modal
                title="服务条款"
                open={isTermsModalVisible}
                onCancel={() => setIsTermsModalVisible(false)}
                footer={null}
                width={800}
            >
                <div className="modal-content">
                    <Title level={4}>服务条款</Title>
                    <Paragraph>
                        欢迎使用智能化在线法律援助平台，请仔细阅读以下条款。
                    </Paragraph>
                    <Title level={5}>服务内容</Title>
                    <Paragraph>
                        本平台提供以下服务：
                        <ul>
                            <li>在线法律咨询</li>
                            <li>律师预约</li>
                            <li>智能法律问答</li>
                            <li>法律工具使用</li>
                        </ul>
                    </Paragraph>
                    <Title level={5}>用户义务</Title>
                    <Paragraph>
                        用户在使用本平台时应：
                        <ul>
                            <li>提供真实、准确的信息</li>
                            <li>遵守相关法律法规</li>
                            <li>保护账号安全</li>
                            <li>不得从事违法活动</li>
                        </ul>
                    </Paragraph>
                    <Title level={5}>免责声明</Title>
                    <Paragraph>
                        本平台提供的法律建议仅供参考，不构成正式的法律意见。对于重大法律问题，建议咨询专业律师。
                    </Paragraph>
                </div>
            </Modal>
        </Layout>
    )
}