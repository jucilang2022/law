import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Descriptions, PageHeader, Card, Typography, Space, Statistic, Row, Col, Button, Avatar, Divider, List, Tag, Tooltip, Affix, Input, Form, message, Popconfirm } from 'antd';
import {
    HeartTwoTone,
    EyeOutlined,
    StarOutlined,
    MessageOutlined,
    ShareAltOutlined,
    BookOutlined,
    UserOutlined,
    LikeOutlined,
    DislikeOutlined,
    StarFilled,
    FileTextOutlined,
    TeamOutlined,
    DeleteOutlined
} from "@ant-design/icons"
import moment from 'moment';
import { useHistory } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const styles = {
    container: {
        background: '#f0f2f5',
        minHeight: '100vh',
        padding: '24px'
    },
    header: {
        background: 'linear-gradient(135deg, #008181 0%, #006666 100%)',
        padding: '8px 0',
        textAlign: 'center',
        color: '#fff',
        fontSize: '18px',
        fontWeight: 500,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        marginBottom: '24px'
    },
    card: {
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        marginBottom: '24px'
    },
    contentWrapper: {
        padding: '24px',
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        lineHeight: 1.8,
        fontSize: '16px'
    },
    statsWrapper: {
        marginTop: '16px',
        padding: '16px',
        background: '#fafafa',
        borderRadius: '8px'
    },
    categoryTag: {
        background: '#e6f7ff',
        padding: '4px 8px',
        borderRadius: '4px',
        color: '#1890ff'
    },
    heartIcon: {
        fontSize: '24px',
        cursor: 'pointer',
        transition: 'transform 0.3s'
    },
    actionButtons: {
        position: 'fixed',
        right: '24px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        zIndex: 100
    },
    authorCard: {
        marginBottom: '24px'
    },
    relatedArticles: {
        marginTop: '24px'
    },
    commentSection: {
        marginTop: '24px',
        padding: '24px',
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
    },
    title: {
        fontSize: '20px',
        lineHeight: '1.4',
        margin: 0,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        wordBreak: 'break-word',
        whiteSpace: 'normal',
        height: 'auto',
        maxHeight: '56px'
    }
};

export default function Detail(props) {
    const [newsInfo, setnewsInfo] = useState(null);
    const [relatedArticles, setRelatedArticles] = useState([]);
    const [showComments, setShowComments] = useState(false);
    const [commentContent, setCommentContent] = useState('');
    const [form] = Form.useForm();
    const history = useHistory();
    const userInfo = JSON.parse(localStorage.getItem('token'));

    useEffect(() => {
        axios.get(`/news/${props.match.params.id}?_expand=category&_expand=role`)
            .then(res => {
                setnewsInfo({
                    ...res.data,
                    view: res.data.view + 1,
                    comments: res.data.comments || [] // 确保comments字段存在
                });
                // 获取相关案件，使用正确的API路径
                return axios.get(`/news?author=${res.data.author}&_limit=10&_sort=id&_order=desc`);
            }).then(res => {
                // 随机打乱数组顺序
                const shuffled = res.data.sort(() => 0.5 - Math.random());
                // 取前3个
                setRelatedArticles(shuffled.slice(0, 3));
            })
            .catch(error => {
                console.error('获取相关文章失败:', error);
                setRelatedArticles([]);
            });
    }, [props.match.params.id]);

    const handleStar = () => {
        setnewsInfo({
            ...newsInfo,
            star: newsInfo.star + 1
        });
        axios.patch(`/news/${props.match.params.id}`, {
            star: newsInfo.star + 1
        });
    };

    const handleShare = () => {
        // 实现分享功能
        if (navigator.share) {
            navigator.share({
                title: newsInfo.title,
                text: newsInfo.content.substring(0, 100) + '...',
                url: window.location.href,
            });
        }
    };

    const handleComment = () => {
        setShowComments(!showComments);
    };

    const handleMessage = () => {
        // 跳转到聊天页面，并传递律师信息
        history.push({
            pathname: '/users',
            state: {
                lawyerId: newsInfo.author,
                lawyerName: newsInfo.author,
                scrollToBottom: true
            }
        });
    };

    const handleArticleClick = (id) => {
        history.push(`/detail/${id}`);
    };

    const handleSubmitComment = () => {
        if (!commentContent.trim()) {
            message.warning('请输入评论内容');
            return;
        }

        const userInfo = JSON.parse(localStorage.getItem('token'));
        if (!userInfo) {
            message.warning('请先登录');
            return;
        }

        const newComment = {
            id: Date.now(),
            content: commentContent,
            author: userInfo.username,
            timestamp: new Date().toISOString(),
            userId: userInfo.id
        };

        const updatedNewsInfo = {
            ...newsInfo,
            comments: [...(newsInfo.comments || []), newComment]
        };

        axios.patch(`/news/${props.match.params.id}`, {
            comments: updatedNewsInfo.comments
        }).then(() => {
            setnewsInfo(updatedNewsInfo);
            setCommentContent('');
            message.success('评论发布成功');
        }).catch(() => {
            message.error('评论发布失败');
        });
    };

    const handleDeleteComment = (commentId) => {
        const updatedComments = newsInfo.comments.filter(comment => comment.id !== commentId);

        axios.patch(`/news/${props.match.params.id}`, {
            comments: updatedComments
        }).then(() => {
            setnewsInfo({
                ...newsInfo,
                comments: updatedComments
            });
            message.success('评论删除成功');
        }).catch(() => {
            message.error('评论删除失败');
        });
    };

    return (
        <div style={styles.container}>
            {
                newsInfo && <div>
                    <div style={styles.header}>智能化在线法律援助平台</div>
                    <Row gutter={24}>
                        <Col span={18}>
                            <Card style={styles.card}>
                                <PageHeader
                                    className="site-page-header-responsive"
                                    onBack={() => window.history.back()}
                                    title={
                                        <div style={styles.title}>
                                            {newsInfo.title}
                                        </div>
                                    }
                                    subTitle={
                                        <Space>
                                            <span style={styles.categoryTag}>
                                                {newsInfo.category.title}
                                            </span>
                                            <HeartTwoTone
                                                twoToneColor="#eb2f96"
                                                onClick={handleStar}
                                                style={styles.heartIcon}
                                            />
                                        </Space>
                                    }
                                >
                                    <Row gutter={[16, 16]}>
                                        <Col span={24}>
                                            <div style={styles.statsWrapper}>
                                                <Row gutter={16}>
                                                    <Col span={8}>
                                                        <Statistic
                                                            title="创建者"
                                                            value={newsInfo.author}
                                                            valueStyle={{ color: '#1890ff' }}
                                                        />
                                                    </Col>
                                                    <Col span={8}>
                                                        <Statistic
                                                            title="发布时间"
                                                            value={newsInfo.publishTime ? moment(newsInfo.publishTime).format('YYYY/MM/DD HH:mm:ss') : '-'}
                                                        />
                                                    </Col>
                                                    <Col span={8}>
                                                        <Statistic
                                                            title="擅长领域"
                                                            value={newsInfo.region}
                                                        />
                                                    </Col>
                                                </Row>
                                            </div>
                                        </Col>
                                        <Col span={24}>
                                            <Row gutter={16}>
                                                <Col span={8}>
                                                    <Statistic
                                                        title="访问数量"
                                                        value={newsInfo.view}
                                                        prefix={<EyeOutlined />}
                                                        valueStyle={{ color: '#52c41a' }}
                                                    />
                                                </Col>
                                                <Col span={8}>
                                                    <Statistic
                                                        title="点赞数量"
                                                        value={newsInfo.star}
                                                        prefix={<StarOutlined />}
                                                        valueStyle={{ color: '#eb2f96' }}
                                                    />
                                                </Col>
                                                <Col span={8}>
                                                    <Statistic
                                                        title="评论数量"
                                                        value={newsInfo.comments?.length || 0}
                                                        prefix={<MessageOutlined />}
                                                        valueStyle={{ color: '#1890ff' }}
                                                    />
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </PageHeader>
                                <div style={styles.contentWrapper}>
                                    <div dangerouslySetInnerHTML={{
                                        __html: newsInfo.content
                                    }} />
                                </div>
                            </Card>

                            {/* 评论区 */}
                            <Card style={styles.commentSection}>
                                <Title level={4}>评论区</Title>
                                <Form form={form} onFinish={handleSubmitComment}>
                                    <Form.Item name="comment">
                                        <Input.TextArea
                                            rows={4}
                                            placeholder="请输入您的评论..."
                                            value={commentContent}
                                            onChange={(e) => setCommentContent(e.target.value)}
                                        />
                                    </Form.Item>
                                    <Form.Item>
                                        <Button type="primary" onClick={handleSubmitComment}>
                                            发表评论
                                        </Button>
                                    </Form.Item>
                                </Form>

                                <Divider />

                                <List
                                    dataSource={newsInfo.comments || []}
                                    renderItem={comment => (
                                        <List.Item
                                            actions={[
                                                userInfo && comment.userId === userInfo.id && (
                                                    <Popconfirm
                                                        title="确定要删除这条评论吗？"
                                                        onConfirm={() => handleDeleteComment(comment.id)}
                                                        okText="确定"
                                                        cancelText="取消"
                                                    >
                                                        <Button
                                                            type="text"
                                                            danger
                                                            icon={<DeleteOutlined />}
                                                        >
                                                            删除
                                                        </Button>
                                                    </Popconfirm>
                                                )
                                            ].filter(Boolean)}
                                        >
                                            <List.Item.Meta
                                                avatar={<Avatar icon={<UserOutlined />} />}
                                                title={
                                                    <Space>
                                                        <span>{comment.author}</span>
                                                        <span style={{ color: '#999', fontSize: '12px' }}>
                                                            {moment(comment.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                                                        </span>
                                                    </Space>
                                                }
                                                description={comment.content}
                                            />
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        </Col>

                        <Col span={6}>
                            {/* 作者信息卡片 */}
                            <Card style={styles.authorCard}>
                                <div style={{ textAlign: 'center' }}>
                                    <Avatar size={64} icon={<UserOutlined />} />
                                    <Title level={4} style={{ marginTop: '16px' }}>{newsInfo.author}</Title>
                                    <Paragraph>专业律师 | {newsInfo.region}</Paragraph>
                                    <Space>
                                        <Button type="primary" icon={<TeamOutlined />}>关注</Button>
                                        <Button icon={<MessageOutlined />} onClick={handleMessage}>私信</Button>
                                    </Space>
                                </div>
                            </Card>

                            {/* 相关文章 */}
                            <Card title="相关文章" style={styles.relatedArticles}>
                                <List
                                    dataSource={relatedArticles}
                                    renderItem={item => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={<FileTextOutlined />}
                                                title={
                                                    <a
                                                        onClick={() => handleArticleClick(item.id)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        {item.title}
                                                    </a>
                                                }
                                                description={
                                                    <Space direction="vertical" size={0}>
                                                        <span>{moment(item.publishTime).format('YYYY-MM-DD')}</span>
                                                        <Tag color="blue">{item.category?.title || '未分类'}</Tag>
                                                    </Space>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* 固定操作按钮 */}
                    <Affix offsetTop={100}>
                        <div style={styles.actionButtons}>
                            <Tooltip title="点赞">
                                <Button type="primary" shape="circle" icon={<LikeOutlined />} />
                            </Tooltip>
                            <Tooltip title="收藏">
                                <Button type="primary" shape="circle" icon={<StarFilled />} />
                            </Tooltip>
                            <Tooltip title="分享">
                                <Button type="primary" shape="circle" icon={<ShareAltOutlined />} onClick={handleShare} />
                            </Tooltip>
                            <Tooltip title="目录">
                                <Button type="primary" shape="circle" icon={<BookOutlined />} />
                            </Tooltip>
                        </div>
                    </Affix>
                </div>
            }
        </div>
    )
}
