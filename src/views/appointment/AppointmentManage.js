import React, { useState, useEffect } from 'react';
import {
    Card, Table, Tag, Button, Modal, message,
    Typography, Space, Tooltip, Badge, Row, Col,
    Statistic, Progress, Divider
} from 'antd';
import {
    CheckCircleOutlined, CloseCircleOutlined,
    ClockCircleOutlined, UserOutlined,
    VideoCameraOutlined, HomeOutlined,
    ArrowLeftOutlined, CalendarOutlined,
    TeamOutlined, CheckSquareOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import { useHistory } from 'react-router-dom';
import './AppointmentManage.css';
import { createCaseFromAppointment } from '../../api/case';

const { Title, Text } = Typography;

export default function AppointmentManage() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lawyerInfo, setLawyerInfo] = useState(null);
    const history = useHistory();

    // 获取律师信息和预约记录
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const user = JSON.parse(token);
            setLawyerInfo(user);
            fetchAppointments(user.id);
        }
    }, []);

    // 获取预约记录
    const fetchAppointments = async (lawyerId) => {
        try {
            const response = await axios.get(`/users/${lawyerId}`);
            const lawyer = response.data;

            let appointmentList = [];
            if (lawyer.appointments) {
                try {
                    appointmentList = JSON.parse(lawyer.appointments);
                } catch (e) {
                    console.error('解析预约信息失败:', e);
                }
            }

            // 按时间排序
            appointmentList.sort((a, b) =>
                new Date(b.createTime) - new Date(a.createTime)
            );

            setAppointments(appointmentList);
        } catch (error) {
            console.error('获取预约记录失败:', error);
            message.error('获取预约记录失败');
        } finally {
            setLoading(false);
        }
    };

    // 处理预约状态
    const handleAppointmentStatus = async (appointment, newStatus) => {
        Modal.confirm({
            title: `确认${newStatus === 'confirmed' ? '接受' : '拒绝'}预约`,
            content: `确定要${newStatus === 'confirmed' ? '接受' : '拒绝'}这个预约吗？`,
            onOk: async () => {
                try {
                    // 获取最新的律师信息
                    const response = await axios.get(`/users/${lawyerInfo.id}`);
                    const lawyer = response.data;

                    // 更新预约状态
                    let appointments = JSON.parse(lawyer.appointments || '[]');
                    appointments = appointments.map(apt =>
                        apt.id === appointment.id
                            ? { ...apt, status: newStatus }
                            : apt
                    );

                    // 更新律师信息
                    await axios.patch(`/users/${lawyerInfo.id}`, {
                        ...lawyer,
                        appointments: JSON.stringify(appointments)
                    });

                    message.success(`预约已${newStatus === 'confirmed' ? '接受' : '拒绝'}`);
                    fetchAppointments(lawyerInfo.id);
                } catch (error) {
                    console.error('更新预约状态失败:', error);
                    message.error('操作失败，请重试');
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

    // 表格列配置
    const columns = [
        {
            title: '预约人',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    <UserOutlined />
                    <Text>{text}</Text>
                </Space>
            )
        },
        {
            title: '联系方式',
            dataIndex: 'phone',
            key: 'phone'
        },
        {
            title: '预约方式',
            dataIndex: 'appointmentType',
            key: 'appointmentType',
            render: (type) => (
                <Tag color={type === 'online' ? 'blue' : 'green'}>
                    {type === 'online' ? <VideoCameraOutlined /> : <HomeOutlined />}
                    {type === 'online' ? '线上咨询' : '线下咨询'}
                </Tag>
            )
        },
        {
            title: '预约时间',
            dataIndex: 'date',
            key: 'date',
            render: (date, record) => (
                <Space>
                    <ClockCircleOutlined />
                    <Text>{moment(date).format('YYYY-MM-DD')} {record.time}</Text>
                </Space>
            )
        },
        {
            title: '咨询内容',
            dataIndex: 'description',
            key: 'description',
            ellipsis: {
                showTitle: false,
            },
            render: (description) => (
                <Tooltip placement="topLeft" title={description}>
                    <Text>{description}</Text>
                </Tooltip>
            )
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status) => renderStatusTag(status)
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    {record.status === 'pending' && (
                        <>
                            <Button
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleAppointmentStatus(record, 'confirmed')}
                            >
                                接受
                            </Button>
                            <Button
                                danger
                                icon={<CloseCircleOutlined />}
                                onClick={() => handleAppointmentStatus(record, 'cancelled')}
                            >
                                拒绝
                            </Button>
                        </>
                    )}
                </Space>
            )
        }
    ];

    // 计算统计数据
    const calculateStats = () => {
        const total = appointments.length;
        const pending = appointments.filter(apt => apt.status === 'pending').length;
        const confirmed = appointments.filter(apt => apt.status === 'confirmed').length;
        const cancelled = appointments.filter(apt => apt.status === 'cancelled').length;
        const completed = appointments.filter(apt => apt.status === 'completed').length;

        return {
            total,
            pending,
            confirmed,
            cancelled,
            completed,
            completionRate: total ? Math.round((completed / total) * 100) : 0
        };
    };

    const stats = calculateStats();

    return (
        <div className="appointment-manage-container">
            <Card className="appointment-manage-card">
                <div className="appointment-manage-header">
                    <Space>
                        <Button
                            type="text"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => history.push('/home')}
                            className="back-button"
                        />
                        <Title level={3} style={{ margin: 0 }}>预约管理</Title>
                    </Space>
                    <Badge count={stats.pending} />
                </div>

                <Divider />

                {/* 统计卡片 */}
                <Row gutter={[16, 16]} className="stats-row">
                    <Col span={6}>
                        <Card className="stat-card">
                            <Statistic
                                title="总预约数"
                                value={stats.total}
                                prefix={<CalendarOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card className="stat-card">
                            <Statistic
                                title="待处理"
                                value={stats.pending}
                                valueStyle={{ color: '#1890ff' }}
                                prefix={<ClockCircleOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card className="stat-card">
                            <Statistic
                                title="已完成"
                                value={stats.completed}
                                valueStyle={{ color: '#52c41a' }}
                                prefix={<CheckSquareOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card className="stat-card">
                            <Statistic
                                title="完成率"
                                value={stats.completionRate}
                                suffix="%"
                                valueStyle={{ color: '#722ed1' }}
                                prefix={<TeamOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>

                <Divider />

                {/* 进度条 */}
                <div className="progress-section">
                    <Text strong>预约处理进度</Text>
                    <Progress
                        percent={stats.completionRate}
                        success={{ percent: stats.completionRate }}
                        status="active"
                        strokeColor={{
                            '0%': '#108ee9',
                            '100%': '#87d068',
                        }}
                    />
                </div>

                <Divider />

                {/* 预约列表 */}
                <div className="table-section">
                    <Text strong>预约列表</Text>
                    <Table
                        columns={columns}
                        dataSource={appointments}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            pageSize: 10,
                            showTotal: (total) => `共 ${total} 条预约记录`
                        }}
                    />
                </div>
            </Card>
        </div>
    );
} 