import React, { useState, useEffect } from 'react';
import {
    Card, List, Tag, Typography, Empty, Spin,
    Timeline, Button, Modal, message, Row, Col,
    Statistic, Space, Tooltip, Divider
} from 'antd';
import {
    ClockCircleOutlined, CheckCircleOutlined,
    CloseCircleOutlined, VideoCameraOutlined,
    HomeOutlined, UserOutlined, ArrowLeftOutlined,
    CalendarOutlined, HistoryOutlined, FileTextOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import { useHistory } from 'react-router-dom';
import './MyAppointments.css';

const { Title, Text } = Typography;

export default function MyAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState(null);
    const [statistics, setStatistics] = useState({
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0
    });
    const history = useHistory();

    // 获取用户信息和预约记录
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            message.warning('请先登录');
            history.push('/login');
            return;
        }
        const user = JSON.parse(token);
        if (user.roleId !== 3) {
            message.warning('只有普通用户可以查看预约记录');
            history.push('/');
            return;
        }
        setUserInfo(user);
        fetchAppointments(user.id);
    }, [history]);

    // 获取所有预约记录
    const fetchAppointments = async (userId) => {
        try {
            // 获取所有律师信息
            const response = await axios.get('/users?roleId=2');
            const lawyers = response.data;

            // 从所有律师的预约信息中筛选出当前用户的预约
            let userAppointments = [];
            lawyers.forEach(lawyer => {
                if (lawyer.appointments) {
                    try {
                        const lawyerAppointments = JSON.parse(lawyer.appointments);
                        const userAppointmentsFromLawyer = lawyerAppointments.filter(
                            appointment => appointment.userId === userId
                        );
                        // 添加律师信息到预约记录中
                        userAppointmentsFromLawyer.forEach(appointment => {
                            appointment.lawyerName = lawyer.username;
                            appointment.lawyerSpecialty = lawyer.specialty;
                        });
                        userAppointments = [...userAppointments, ...userAppointmentsFromLawyer];
                    } catch (e) {
                        console.error('解析律师预约信息失败:', e);
                    }
                }
            });

            // 按时间排序
            userAppointments.sort((a, b) =>
                new Date(b.createTime) - new Date(a.createTime)
            );

            setAppointments(userAppointments);
        } catch (error) {
            console.error('获取预约记录失败:', error);
            message.error('获取预约记录失败');
        } finally {
            setLoading(false);
        }
    };

    // 计算统计数据
    useEffect(() => {
        if (appointments.length > 0) {
            const stats = {
                total: appointments.length,
                pending: appointments.filter(a => a.status === 'pending').length,
                confirmed: appointments.filter(a => a.status === 'confirmed').length,
                completed: appointments.filter(a => a.status === 'completed').length,
                cancelled: appointments.filter(a => a.status === 'cancelled').length
            };
            setStatistics(stats);
        }
    }, [appointments]);

    // 取消预约
    const handleCancelAppointment = async (appointment) => {
        Modal.confirm({
            title: '确认取消预约',
            content: '确定要取消这个预约吗？',
            onOk: async () => {
                try {
                    // 获取律师信息
                    const lawyerResponse = await axios.get(`/users/${appointment.lawyerId}`);
                    const lawyer = lawyerResponse.data;

                    // 更新预约状态
                    let appointments = JSON.parse(lawyer.appointments || '[]');
                    appointments = appointments.map(apt =>
                        apt.id === appointment.id
                            ? { ...apt, status: 'cancelled' }
                            : apt
                    );

                    // 更新律师信息
                    await axios.patch(`/users/${appointment.lawyerId}`, {
                        ...lawyer,
                        appointments: JSON.stringify(appointments)
                    });

                    message.success('预约已取消');
                    // 重新获取预约记录
                    fetchAppointments(userInfo.id);
                } catch (error) {
                    console.error('取消预约失败:', error);
                    message.error('取消预约失败');
                }
            }
        });
    };

    // 渲染预约状态标签
    const renderStatusTag = (status) => {
        const statusConfig = {
            pending: { color: 'processing', text: '待确认', icon: <ClockCircleOutlined /> },
            confirmed: { color: 'success', text: '已确认', icon: <CheckCircleOutlined /> },
            cancelled: { color: 'error', text: '已取消', icon: <CloseCircleOutlined /> },
            completed: { color: 'default', text: '已完成', icon: <CheckCircleOutlined /> }
        };

        const config = statusConfig[status] || statusConfig.pending;
        return (
            <Tag color={config.color} icon={config.icon}>
                {config.text}
            </Tag>
        );
    };

    // 渲染预约方式标签
    const renderAppointmentTypeTag = (type) => (
        <Tag color={type === 'online' ? 'blue' : 'green'}>
            {type === 'online' ? <VideoCameraOutlined /> : <HomeOutlined />}
            {type === 'online' ? '线上咨询' : '线下咨询'}
        </Tag>
    );

    // 返回上一页
    const handleBack = () => {
        history.goBack();
    };

    // 查看预约详情
    const handleViewDetails = (appointment) => {
        Modal.info({
            title: '预约详情',
            width: 600,
            content: (
                <div className="appointment-details">
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <div className="detail-item">
                            <Text strong>预约律师：</Text>
                            <Text>{appointment.lawyerName}</Text>
                        </div>
                        <div className="detail-item">
                            <Text strong>专业领域：</Text>
                            <Text>{appointment.lawyerSpecialty || '专业律师'}</Text>
                        </div>
                        <div className="detail-item">
                            <Text strong>预约时间：</Text>
                            <Text>{moment(appointment.date).format('YYYY-MM-DD')} {appointment.time}</Text>
                        </div>
                        <div className="detail-item">
                            <Text strong>咨询方式：</Text>
                            <Text>{appointment.appointmentType === 'online' ? '线上咨询' : '线下咨询'}</Text>
                        </div>
                        <div className="detail-item">
                            <Text strong>预约状态：</Text>
                            {renderStatusTag(appointment.status)}
                        </div>
                        <div className="detail-item">
                            <Text strong>咨询内容：</Text>
                            <Text>{appointment.description}</Text>
                        </div>
                        {appointment.status === 'completed' && (
                            <div className="detail-item">
                                <Text strong>咨询记录：</Text>
                                <Button type="link" icon={<FileTextOutlined />}>
                                    查看咨询记录
                                </Button>
                            </div>
                        )}
                    </Space>
                </div>
            ),
            okText: '关闭'
        });
    };

    if (loading) {
        return (
            <div className="appointments-loading">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="my-appointments-container">
            <div className="appointments-header">
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={handleBack}
                    className="back-button"
                >
                    返回
                </Button>
                <Title level={3}>我的预约</Title>
            </div>

            {/* 统计信息卡片 */}
            <Row gutter={[16, 16]} className="statistics-row">
                <Col span={4}>
                    <Card className="statistic-card">
                        <Statistic
                            title="总预约数"
                            value={statistics.total}
                            prefix={<CalendarOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={4}>
                    <Card className="statistic-card">
                        <Statistic
                            title="待确认"
                            value={statistics.pending}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={4}>
                    <Card className="statistic-card">
                        <Statistic
                            title="已确认"
                            value={statistics.confirmed}
                            valueStyle={{ color: '#52c41a' }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={4}>
                    <Card className="statistic-card">
                        <Statistic
                            title="已完成"
                            value={statistics.completed}
                            valueStyle={{ color: '#722ed1' }}
                            prefix={<HistoryOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={4}>
                    <Card className="statistic-card">
                        <Statistic
                            title="已取消"
                            value={statistics.cancelled}
                            valueStyle={{ color: '#ff4d4f' }}
                            prefix={<CloseCircleOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Card className="appointments-card">
                {appointments.length === 0 ? (
                    <Empty
                        description="暂无预约记录"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                        <Button type="primary" onClick={() => history.push('/notary/appointment')}>
                            立即预约
                        </Button>
                    </Empty>
                ) : (
                    <Timeline>
                        {appointments.map(appointment => (
                            <Timeline.Item
                                key={appointment.id}
                                color={
                                    appointment.status === 'pending' ? 'blue' :
                                        appointment.status === 'confirmed' ? 'green' :
                                            appointment.status === 'completed' ? 'purple' :
                                                'red'
                                }
                            >
                                <Card
                                    className="appointment-item"
                                    hoverable
                                    onClick={() => handleViewDetails(appointment)}
                                >
                                    <div className="appointment-header">
                                        <div className="lawyer-info">
                                            <UserOutlined className="lawyer-icon" />
                                            <div>
                                                <Text strong>{appointment.lawyerName}</Text>
                                                <Text type="secondary" className="lawyer-specialty">
                                                    {appointment.lawyerSpecialty || '专业律师'}
                                                </Text>
                                            </div>
                                        </div>
                                        <div className="appointment-tags">
                                            {renderStatusTag(appointment.status)}
                                            {renderAppointmentTypeTag(appointment.appointmentType)}
                                        </div>
                                    </div>
                                    <Divider style={{ margin: '12px 0' }} />
                                    <div className="appointment-content">
                                        <div className="appointment-time">
                                            <ClockCircleOutlined />
                                            <Text>
                                                {moment(appointment.date).format('YYYY-MM-DD')} {appointment.time}
                                            </Text>
                                        </div>
                                        <div className="appointment-description">
                                            <Text type="secondary">{appointment.description}</Text>
                                        </div>
                                    </div>
                                    {appointment.status === 'pending' && (
                                        <div className="appointment-actions">
                                            <Space>
                                                <Button
                                                    type="link"
                                                    danger
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCancelAppointment(appointment);
                                                    }}
                                                >
                                                    取消预约
                                                </Button>
                                                <Button
                                                    type="link"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewDetails(appointment);
                                                    }}
                                                >
                                                    查看详情
                                                </Button>
                                            </Space>
                                        </div>
                                    )}
                                </Card>
                            </Timeline.Item>
                        ))}
                    </Timeline>
                )}
            </Card>
        </div>
    );
} 