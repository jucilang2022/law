import React, { useState, useEffect } from 'react';
import {
    Card, Form, Input, Select, DatePicker,
    Button, message, Radio, Row, Col, Typography,
    Steps, Divider, Avatar, Tag
} from 'antd';
import {
    UserOutlined, EnvironmentOutlined, VideoCameraOutlined, HomeOutlined, CheckCircleOutlined,
    PhoneOutlined, ArrowLeftOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import './Appointment.css';
import { useHistory, useLocation } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;
const { Step } = Steps;

export default function Appointment() {
    const [form] = Form.useForm();
    const [lawyers, setLawyers] = useState([]);
    const [selectedLawyer, setSelectedLawyer] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [appointmentType, setAppointmentType] = useState('online');
    const [userInfo, setUserInfo] = useState(null);
    const history = useHistory();
    const location = useLocation();

    // 获取用户信息
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const user = JSON.parse(token);
            setUserInfo(user);

            // 检查用户角色
            if (user.roleId !== 3) { // 3 是普通用户角色
                message.error('只有普通用户可以预约服务');
                window.location.href = '/';
                return;
            }
        }
    }, []);

    // 获取律师列表
    useEffect(() => {
        if (userInfo && userInfo.roleId === 3) {
            axios.get("/users?roleId=2").then(res => {
                setLawyers(res.data);
            });
        }
    }, [userInfo]);

    // 生成可选时间段
    const generateTimeSlots = (date) => {
        const slots = [];
        const startHour = 9; // 上午9点开始
        const endHour = 18; // 下午6点结束

        for (let hour = startHour; hour < endHour; hour++) {
            slots.push(moment().set({ hour, minute: 0 }));
            slots.push(moment().set({ hour, minute: 30 }));
        }
        return slots;
    };

    // 处理日期选择
    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setAvailableTimeSlots(generateTimeSlots(date));
    };

    // 处理律师选择
    const handleLawyerSelect = (lawyerId) => {
        const lawyer = lawyers.find(l => l.id === lawyerId);
        setSelectedLawyer(lawyer);
    };

    // 提交预约
    const handleSubmit = async (values) => {
        try {
            const appointmentData = {
                id: Date.now(), // 生成唯一ID
                ...values,
                userId: userInfo.id,
                lawyerId: selectedLawyer.id,
                appointmentType,
                status: 'pending',
                createTime: new Date().toISOString()
            };

            // 获取律师当前信息
            const lawyerResponse = await axios.get(`/users/${selectedLawyer.id}`);
            const lawyer = lawyerResponse.data;

            // 获取现有的预约信息
            let appointments = [];
            if (lawyer.appointments) {
                try {
                    appointments = JSON.parse(lawyer.appointments);
                } catch (e) {
                    appointments = [];
                }
            }

            // 添加新的预约信息
            appointments.push(appointmentData);

            // 更新律师信息
            await axios.patch(`/users/${selectedLawyer.id}`, {
                ...lawyer,
                appointments: JSON.stringify(appointments)
            });

            message.success('预约申请已提交，请等待确认');
            setCurrentStep(2);
        } catch (error) {
            console.error('预约提交失败:', error);
            message.error('预约提交失败，请重试');
        }
    };

    // 渲染律师信息卡片
    const renderLawyerCard = (lawyer) => (
        <Card className="lawyer-card" key={lawyer.id}>
            <div className="lawyer-info">
                <Avatar size={64} icon={<UserOutlined />} />
                <div className="lawyer-details">
                    <Title level={4}>{lawyer.username}</Title>
                    <Text type="secondary">{lawyer.specialty || '专业律师'}</Text>
                    <div className="lawyer-tags">
                        <Tag color="blue">婚姻家事</Tag>
                        <Tag color="green">合同纠纷</Tag>
                        <Tag color="orange">劳动纠纷</Tag>
                    </div>
                </div>
            </div>
        </Card>
    );

    return (
        <div className="appointment-container">
            <Card className="appointment-card">
                <div className="appointment-header">
                    {location.state?.showBackButton && (
                        <Button
                            type="text"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => history.goBack()}
                            className="back-button"
                        >
                            返回
                        </Button>
                    )}
                    <Title level={3}>预约服务</Title>
                </div>
                <Steps current={currentStep} className="appointment-steps">
                    <Step title="选择律师" description="选择专业律师" />
                    <Step title="预约信息" description="填写预约信息" />
                    <Step title="预约确认" description="等待确认" />
                </Steps>

                <Divider />

                {currentStep === 0 && (
                    <div className="lawyer-selection">
                        <Title level={4}>选择律师</Title>
                        <Row gutter={[16, 16]}>
                            {lawyers.map(lawyer => (
                                <Col span={8} key={lawyer.id}>
                                    <div
                                        className={`lawyer-card-wrapper ${selectedLawyer?.id === lawyer.id ? 'selected' : ''}`}
                                        onClick={() => handleLawyerSelect(lawyer.id)}
                                    >
                                        {renderLawyerCard(lawyer)}
                                    </div>
                                </Col>
                            ))}
                        </Row>
                        <div className="step-actions">
                            <Button
                                type="primary"
                                onClick={() => setCurrentStep(1)}
                                disabled={!selectedLawyer}
                            >
                                下一步
                            </Button>
                        </div>
                    </div>
                )}

                {currentStep === 1 && (
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        className="appointment-form"
                    >
                        <Row gutter={24}>
                            <Col span={12}>
                                <Form.Item
                                    name="name"
                                    label="预约人姓名"
                                    rules={[{ required: true, message: '请输入姓名' }]}
                                >
                                    <Input prefix={<UserOutlined />} placeholder="请输入姓名" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="phone"
                                    label="联系电话"
                                    rules={[
                                        { required: true, message: '请输入联系电话' },
                                        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
                                    ]}
                                >
                                    <Input prefix={<PhoneOutlined />} placeholder="请输入手机号" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="appointmentType"
                            label="预约方式"
                            rules={[{ required: true, message: '请选择预约方式' }]}
                        >
                            <Radio.Group onChange={e => setAppointmentType(e.target.value)}>
                                <Radio.Button value="online">
                                    <VideoCameraOutlined /> 线上咨询
                                </Radio.Button>
                                <Radio.Button value="offline">
                                    <HomeOutlined /> 线下咨询
                                </Radio.Button>
                            </Radio.Group>
                        </Form.Item>

                        {appointmentType === 'offline' && (
                            <Form.Item
                                name="address"
                                label="线下地址"
                                rules={[{ required: true, message: '请输入线下地址' }]}
                            >
                                <Input prefix={<EnvironmentOutlined />} placeholder="请输入线下地址" />
                            </Form.Item>
                        )}

                        <Form.Item
                            name="date"
                            label="预约日期"
                            rules={[{ required: true, message: '请选择预约日期' }]}
                        >
                            <DatePicker
                                style={{ width: '100%' }}
                                onChange={handleDateSelect}
                                disabledDate={current => current && current < moment().startOf('day')}
                            />
                        </Form.Item>

                        <Form.Item
                            name="time"
                            label="预约时间"
                            rules={[{ required: true, message: '请选择预约时间' }]}
                        >
                            <Select placeholder="请选择预约时间">
                                {availableTimeSlots.map(slot => (
                                    <Option key={slot.format('HH:mm')} value={slot.format('HH:mm')}>
                                        {slot.format('HH:mm')}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label="咨询内容描述"
                            rules={[{ required: true, message: '请简要描述咨询内容' }]}
                        >
                            <Input.TextArea
                                rows={4}
                                placeholder="请简要描述您需要咨询的法律问题"
                            />
                        </Form.Item>

                        <div className="step-actions">
                            <Button onClick={() => setCurrentStep(0)}>上一步</Button>
                            <Button type="primary" htmlType="submit">
                                提交预约
                            </Button>
                        </div>
                    </Form>
                )}

                {currentStep === 2 && (
                    <div className="appointment-confirmation">
                        <div className="confirmation-icon">
                            <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />
                        </div>
                        <Title level={3}>预约申请已提交</Title>
                        <Text type="secondary">
                            您的预约申请已提交成功，我们会尽快与您联系确认。
                            您可以在个人中心查看预约状态。
                        </Text>
                        <div className="step-actions">
                            <Button type="primary" onClick={() => window.location.href = '/home'}>
                                返回首页
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
} 