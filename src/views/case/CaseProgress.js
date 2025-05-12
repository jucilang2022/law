import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Steps, Button, Modal, Form, Input, Select, message } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, SyncOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import './CaseProgress.css';

const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;

const CaseProgress = () => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCase, setSelectedCase] = useState(null);
    const [form] = Form.useForm();
    const [userInfo, setUserInfo] = useState(null);
    const [pendingAppointments, setPendingAppointments] = useState([]);

    // 案件状态枚举
    const CASE_STATUS = {
        PENDING: 'pending',
        ACCEPTED: 'accepted',
        PROCESSING: 'processing',
        COMPLETED: 'completed',
        CANCELLED: 'cancelled'
    };

    // 案件类型选项
    const CASE_TYPES = [
        { value: 'civil', label: '民事案件' },
        { value: 'criminal', label: '刑事案件' },
        { value: 'administrative', label: '行政案件' },
        { value: 'commercial', label: '商事案件' },
        { value: 'other', label: '其他案件' }
    ];

    // 状态标签配置
    const statusConfig = {
        [CASE_STATUS.PENDING]: { color: 'processing', text: '待审核', icon: <ClockCircleOutlined /> },
        [CASE_STATUS.ACCEPTED]: { color: 'success', text: '已受理', icon: <CheckCircleOutlined /> },
        [CASE_STATUS.PROCESSING]: { color: 'warning', text: '处理中', icon: <SyncOutlined spin /> },
        [CASE_STATUS.COMPLETED]: { color: 'success', text: '已完成', icon: <CheckCircleOutlined /> },
        [CASE_STATUS.CANCELLED]: { color: 'error', text: '已取消', icon: <CloseCircleOutlined /> }
    };

    // 获取用户信息
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const user = JSON.parse(token);
            setUserInfo(user);
        }
    }, []);

    // 获取案件列表和待处理预约
    const fetchData = async () => {
        setLoading(true);
        try {
            if (userInfo.roleId === 2) { // 律师
                const response = await axios.get(`/users/${userInfo.id}`);
                const user = response.data;

                // 获取案件列表
                if (user.cases) {
                    const caseList = JSON.parse(user.cases);
                    setCases(caseList);
                }

                // 获取待处理预约
                if (user.appointments) {
                    const appointments = JSON.parse(user.appointments);
                    const pending = appointments.filter(apt =>
                        apt.status === 'confirmed' &&
                        !cases.some(c => c.appointmentId === apt.id)
                    );
                    setPendingAppointments(pending);
                }
            } else if (userInfo.roleId === 3) { // 用户
                // 获取所有律师的案件列表
                const lawyersResponse = await axios.get('/users?roleId=2');
                const lawyers = lawyersResponse.data;

                let allCases = [];
                lawyers.forEach(lawyer => {
                    if (lawyer.cases) {
                        try {
                            const lawyerCases = JSON.parse(lawyer.cases);
                            // 只获取与当前用户相关的案件
                            const userCases = lawyerCases.filter(caseItem => {
                                // 通过预约ID关联查找
                                if (caseItem.appointmentId) {
                                    const appointment = JSON.parse(lawyer.appointments || '[]')
                                        .find(apt => apt.id === caseItem.appointmentId);
                                    return appointment && appointment.clientId === userInfo.id;
                                }
                                return false;
                            });
                            allCases = [...allCases, ...userCases];
                        } catch (e) {
                            console.error('解析案件数据失败:', e);
                        }
                    }
                });

                setCases(allCases);
            }
        } catch (error) {
            message.error('获取数据失败');
        }
        setLoading(false);
    };

    useEffect(() => {
        if (userInfo) {
            fetchData();
        }
    }, [userInfo]);

    // 处理状态更新
    const handleStatusUpdate = async (caseId, newStatus) => {
        try {
            const response = await axios.get(`/users/${userInfo.id}`);
            const user = response.data;
            let caseList = JSON.parse(user.cases || '[]');

            caseList = caseList.map(caseItem =>
                caseItem.id === caseId
                    ? { ...caseItem, status: newStatus, updateTime: new Date().toISOString() }
                    : caseItem
            );

            await axios.patch(`/users/${userInfo.id}`, {
                ...user,
                cases: JSON.stringify(caseList)
            });

            message.success('状态更新成功');
            fetchData();
        } catch (error) {
            message.error('状态更新失败');
        }
    };

    // 显示案件详情
    const showCaseDetail = (record) => {
        setSelectedCase(record);
        setModalVisible(true);
        form.setFieldsValue(record);
    };

    // 提交案件信息
    const handleSubmitCase = async (values) => {
        try {
            const response = await axios.get(`/users/${userInfo.id}`);
            const user = response.data;
            let caseList = JSON.parse(user.cases || '[]');

            const newCase = {
                id: Date.now().toString(),
                ...values,
                status: CASE_STATUS.ACCEPTED,
                createTime: new Date().toISOString(),
                updateTime: new Date().toISOString(),
                lawyerId: userInfo.id
            };

            caseList.push(newCase);

            await axios.patch(`/users/${userInfo.id}`, {
                ...user,
                cases: JSON.stringify(caseList)
            });

            message.success('案件创建成功');
            setModalVisible(false);
            fetchData();
        } catch (error) {
            message.error('创建失败');
        }
    };

    // 表格列配置
    const columns = [
        {
            title: '案件编号',
            dataIndex: 'caseNumber',
            key: 'caseNumber',
        },
        {
            title: '案件名称',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: '案件类型',
            dataIndex: 'type',
            key: 'type',
            render: (type) => {
                const caseType = CASE_TYPES.find(t => t.value === type);
                return caseType ? caseType.label : type;
            }
        },
        {
            title: '当前状态',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const config = statusConfig[status];
                return (
                    <Tag color={config.color} icon={config.icon}>
                        {config.text}
                    </Tag>
                );
            }
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            render: (time) => moment(time).format('YYYY-MM-DD HH:mm')
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Button type="link" onClick={() => showCaseDetail(record)}>
                    查看详情
                </Button>
            )
        }
    ];

    return (
        <div className="case-progress-container">
            <Card title="案件进度查询" className="case-progress-card">
                {userInfo?.roleId === 2 && (
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setSelectedCase(null);
                            form.resetFields();
                            setModalVisible(true);
                        }}
                        style={{ marginBottom: 16 }}
                    >
                        新建案件
                    </Button>
                )}
                <Table
                    columns={columns}
                    dataSource={cases}
                    loading={loading}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title={selectedCase ? "案件详情" : "新建案件"}
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={800}
            >
                {selectedCase ? (
                    <div className="case-detail">
                        <Steps
                            current={Object.values(CASE_STATUS).indexOf(selectedCase.status)}
                            status={selectedCase.status === CASE_STATUS.CANCELLED ? 'error' : 'process'}
                        >
                            <Step title="待审核" description="等待律师审核" />
                            <Step title="已受理" description="律师已接受案件" />
                            <Step title="处理中" description="案件正在处理" />
                            <Step title="已完成" description="案件处理完成" />
                        </Steps>

                        <div className="case-info">
                            <h3>案件信息</h3>
                            <p><strong>案件编号：</strong>{selectedCase.caseNumber}</p>
                            <p><strong>案件名称：</strong>{selectedCase.title}</p>
                            <p><strong>案件类型：</strong>{CASE_TYPES.find(t => t.value === selectedCase.type)?.label}</p>
                            <p><strong>创建时间：</strong>{moment(selectedCase.createTime).format('YYYY-MM-DD HH:mm')}</p>
                            <p><strong>案件描述：</strong>{selectedCase.description}</p>
                        </div>

                        {userInfo?.roleId === 2 && (
                            <div className="case-actions">
                                {selectedCase.status === CASE_STATUS.ACCEPTED && (
                                    <Button type="primary" onClick={() => handleStatusUpdate(selectedCase.id, CASE_STATUS.PROCESSING)}>
                                        开始处理
                                    </Button>
                                )}
                                {selectedCase.status === CASE_STATUS.PROCESSING && (
                                    <Button type="primary" onClick={() => handleStatusUpdate(selectedCase.id, CASE_STATUS.COMPLETED)}>
                                        完成案件
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmitCase}
                    >
                        <Form.Item
                            name="appointmentId"
                            label="关联预约"
                            rules={[{ required: true, message: '请选择关联预约' }]}
                        >
                            <Select placeholder="请选择关联预约">
                                {pendingAppointments.map(apt => (
                                    <Option key={apt.id} value={apt.id}>
                                        {`预约号：${apt.id} - ${apt.name} - ${moment(apt.date).format('YYYY-MM-DD')}`}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="caseNumber"
                            label="案件编号"
                            rules={[{ required: true, message: '请输入案件编号' }]}
                        >
                            <Input placeholder="请输入案件编号" />
                        </Form.Item>
                        <Form.Item
                            name="title"
                            label="案件名称"
                            rules={[{ required: true, message: '请输入案件名称' }]}
                        >
                            <Input placeholder="请输入案件名称" />
                        </Form.Item>
                        <Form.Item
                            name="type"
                            label="案件类型"
                            rules={[{ required: true, message: '请选择案件类型' }]}
                        >
                            <Select placeholder="请选择案件类型">
                                {CASE_TYPES.map(type => (
                                    <Option key={type.value} value={type.value}>{type.label}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="description"
                            label="案件描述"
                            rules={[{ required: true, message: '请输入案件描述' }]}
                        >
                            <TextArea rows={4} placeholder="请输入案件描述" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                创建案件
                            </Button>
                        </Form.Item>
                    </Form>
                )}
            </Modal>
        </div>
    );
};

export default CaseProgress; 