import React, { useState } from 'react';
import { Card, Form, Select, Button, InputNumber, Typography, Divider, Space, Table, Tooltip } from 'antd';
import { CalculatorOutlined, InfoCircleOutlined, QuestionCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import './LitigationCalculator.css';
import { useHistory } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

const LitigationCalculator = () => {
    const [form] = Form.useForm();
    const [fee, setFee] = useState(null);
    const [feeDetails, setFeeDetails] = useState([]);
    const history = useHistory();

    // 案件类型选项
    const caseTypes = [
        {
            value: 'civil_property',
            label: '民事财产案件',
            description: '涉及财产关系的民事案件'
        },
        {
            value: 'civil_non_property',
            label: '民事非财产案件',
            description: '不涉及财产关系的民事案件'
        },
        {
            value: 'divorce',
            label: '离婚案件',
            description: '涉及离婚、财产分割等案件'
        },
        {
            value: 'administrative',
            label: '行政案件',
            description: '行政诉讼案件'
        },
        {
            value: 'intellectual',
            label: '知识产权案件',
            description: '涉及专利、商标、著作权等案件'
        },
        {
            value: 'labor',
            label: '劳动争议案件',
            description: '涉及劳动合同、工资等纠纷'
        },
        {
            value: 'marriage',
            label: '婚姻家庭案件',
            description: '涉及婚姻、收养、继承等案件'
        },
        {
            value: 'contract',
            label: '合同纠纷案件',
            description: '涉及各类合同纠纷的案件'
        }
    ];

    // 计算诉讼费
    const calculateFee = (values) => {
        const { caseType, amount } = values;
        let calculatedFee = 0;
        let details = [];

        switch (caseType) {
            case 'civil_property':
                // 民事财产案件诉讼费计算规则
                if (amount <= 10000) {
                    calculatedFee = 50;
                    details.push({ type: '基础费用', amount: 50, description: '标的额不超过1万元' });
                } else if (amount <= 100000) {
                    calculatedFee = amount * 0.025 - 200;
                    details.push({ type: '基础费用', amount: 50, description: '基础费用' });
                    details.push({ type: '比例费用', amount: amount * 0.025 - 250, description: '超过1万元部分按2.5%计算' });
                } else if (amount <= 200000) {
                    calculatedFee = amount * 0.02 + 300;
                    details.push({ type: '基础费用', amount: 50, description: '基础费用' });
                    details.push({ type: '比例费用', amount: amount * 0.02 + 250, description: '超过10万元部分按2%计算' });
                } else if (amount <= 500000) {
                    calculatedFee = amount * 0.015 + 1300;
                    details.push({ type: '基础费用', amount: 50, description: '基础费用' });
                    details.push({ type: '比例费用', amount: amount * 0.015 + 1250, description: '超过20万元部分按1.5%计算' });
                } else if (amount <= 1000000) {
                    calculatedFee = amount * 0.01 + 3800;
                    details.push({ type: '基础费用', amount: 50, description: '基础费用' });
                    details.push({ type: '比例费用', amount: amount * 0.01 + 3750, description: '超过50万元部分按1%计算' });
                } else if (amount <= 2000000) {
                    calculatedFee = amount * 0.009 + 4800;
                    details.push({ type: '基础费用', amount: 50, description: '基础费用' });
                    details.push({ type: '比例费用', amount: amount * 0.009 + 4750, description: '超过100万元部分按0.9%计算' });
                } else if (amount <= 5000000) {
                    calculatedFee = amount * 0.008 + 6800;
                    details.push({ type: '基础费用', amount: 50, description: '基础费用' });
                    details.push({ type: '比例费用', amount: amount * 0.008 + 6750, description: '超过200万元部分按0.8%计算' });
                } else if (amount <= 10000000) {
                    calculatedFee = amount * 0.007 + 11800;
                    details.push({ type: '基础费用', amount: 50, description: '基础费用' });
                    details.push({ type: '比例费用', amount: amount * 0.007 + 11750, description: '超过500万元部分按0.7%计算' });
                } else if (amount <= 20000000) {
                    calculatedFee = amount * 0.006 + 21800;
                    details.push({ type: '基础费用', amount: 50, description: '基础费用' });
                    details.push({ type: '比例费用', amount: amount * 0.006 + 21750, description: '超过1000万元部分按0.6%计算' });
                } else {
                    calculatedFee = amount * 0.005 + 41800;
                    details.push({ type: '基础费用', amount: 50, description: '基础费用' });
                    details.push({ type: '比例费用', amount: amount * 0.005 + 41750, description: '超过2000万元部分按0.5%计算' });
                }
                break;

            case 'civil_non_property':
                calculatedFee = 50;
                details.push({ type: '基础费用', amount: 50, description: '非财产案件基础费用' });
                break;

            case 'divorce':
                if (amount <= 200000) {
                    calculatedFee = 50;
                    details.push({ type: '基础费用', amount: 50, description: '离婚案件基础费用' });
                } else {
                    calculatedFee = amount * 0.005;
                    details.push({ type: '基础费用', amount: 50, description: '基础费用' });
                    details.push({ type: '比例费用', amount: amount * 0.005 - 50, description: '超过20万元部分按0.5%计算' });
                }
                break;

            case 'administrative':
                calculatedFee = 50;
                details.push({ type: '基础费用', amount: 50, description: '行政案件基础费用' });
                break;

            case 'intellectual':
                if (amount <= 100000) {
                    calculatedFee = 1000;
                    details.push({ type: '基础费用', amount: 1000, description: '标的额不超过10万元' });
                } else if (amount <= 500000) {
                    calculatedFee = 2000;
                    details.push({ type: '基础费用', amount: 1000, description: '基础费用' });
                    details.push({ type: '比例费用', amount: 1000, description: '超过10万元部分' });
                } else if (amount <= 1000000) {
                    calculatedFee = 3000;
                    details.push({ type: '基础费用', amount: 1000, description: '基础费用' });
                    details.push({ type: '比例费用', amount: 2000, description: '超过50万元部分' });
                } else if (amount <= 5000000) {
                    calculatedFee = 5000;
                    details.push({ type: '基础费用', amount: 1000, description: '基础费用' });
                    details.push({ type: '比例费用', amount: 4000, description: '超过100万元部分' });
                } else {
                    calculatedFee = 10000;
                    details.push({ type: '基础费用', amount: 1000, description: '基础费用' });
                    details.push({ type: '比例费用', amount: 9000, description: '超过500万元部分' });
                }
                break;

            case 'labor':
                calculatedFee = 10;
                details.push({ type: '基础费用', amount: 10, description: '劳动争议案件基础费用' });
                break;

            case 'marriage':
                calculatedFee = 50;
                details.push({ type: '基础费用', amount: 50, description: '婚姻家庭案件基础费用' });
                break;

            case 'contract':
                if (amount <= 10000) {
                    calculatedFee = 50;
                    details.push({ type: '基础费用', amount: 50, description: '标的额不超过1万元' });
                } else if (amount <= 100000) {
                    calculatedFee = amount * 0.025 - 200;
                    details.push({ type: '基础费用', amount: 50, description: '基础费用' });
                    details.push({ type: '比例费用', amount: amount * 0.025 - 250, description: '超过1万元部分按2.5%计算' });
                } else if (amount <= 200000) {
                    calculatedFee = amount * 0.02 + 300;
                    details.push({ type: '基础费用', amount: 50, description: '基础费用' });
                    details.push({ type: '比例费用', amount: amount * 0.02 + 250, description: '超过10万元部分按2%计算' });
                } else {
                    calculatedFee = amount * 0.015 + 1300;
                    details.push({ type: '基础费用', amount: 50, description: '基础费用' });
                    details.push({ type: '比例费用', amount: amount * 0.015 + 1250, description: '超过20万元部分按1.5%计算' });
                }
                break;

            default:
                calculatedFee = 0;
        }

        // 添加其他费用
        details.push({ type: '其他费用', amount: 0, description: '可能产生的其他费用（如鉴定费、公告费等）' });

        setFee(calculatedFee);
        setFeeDetails(details);
    };

    // 重置表单
    const handleReset = () => {
        form.resetFields();
        setFee(null);
        setFeeDetails([]);
    };

    // 费用明细表格列定义
    const columns = [
        {
            title: '费用类型',
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: '金额（元）',
            dataIndex: 'amount',
            key: 'amount',
            render: (text) => text.toFixed(2)
        },
        {
            title: '说明',
            dataIndex: 'description',
            key: 'description',
        }
    ];

    return (
        <div className="calculator-container">
            <Card className="calculator-card">
                <div className="calculator-header">
                    <Button
                        type="text"
                        onClick={() => history.push('/users')}
                        className="back-button"
                    >
                        -返回
                    </Button>
                    <CalculatorOutlined className="calculator-icon" />
                    <Title level={2}>诉讼费计算器</Title>
                </div>
                <Divider />

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={calculateFee}
                    className="calculator-form"
                >
                    <Form.Item
                        name="caseType"
                        label={
                            <Space>
                                案件类型
                                <Tooltip title="请选择最符合您案件性质的类型">
                                    <QuestionCircleOutlined />
                                </Tooltip>
                            </Space>
                        }
                        rules={[{ required: true, message: '请选择案件类型' }]}
                    >
                        <Select placeholder="请选择案件类型">
                            {caseTypes.map(type => (
                                <Option key={type.value} value={type.value}>
                                    <div>
                                        <div>{type.label}</div>
                                        <div className="case-type-description">{type.description}</div>
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="amount"
                        label="标的金额（元）"
                        rules={[{ required: true, message: '请输入标的金额' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            precision={2}
                            placeholder="请输入标的金额"
                            formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\¥\s?|(,*)/g, '')}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                计算诉讼费
                            </Button>
                            <Button onClick={handleReset}>
                                重置
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>

                {fee !== null && (
                    <div className="fee-result">
                        <Divider />
                        <div className="result-content">
                            <Text strong>预计诉讼费：</Text>
                            <Text className="fee-amount">¥ {fee.toFixed(2)}</Text>
                        </div>
                        <div className="fee-details">
                            <Table
                                columns={columns}
                                dataSource={feeDetails}
                                pagination={false}
                                size="small"
                                rowKey={(record, index) => index}
                            />
                        </div>
                        <div className="fee-note">
                            <InfoCircleOutlined /> 注：以上计算结果仅供参考，实际费用以法院最终核定为准
                        </div>
                    </div>
                )}

                <Divider />
                <div className="calculator-info">
                    <Title level={4}>计算说明</Title>
                    <ul>
                        <li>民事财产案件：根据《诉讼费用交纳办法》第十三条规定计算</li>
                        <li>民事非财产案件：每件交纳50元</li>
                        <li>离婚案件：每件交纳50元，涉及财产分割的，超过20万元部分按0.5%交纳</li>
                        <li>行政案件：每件交纳50元</li>
                        <li>知识产权案件：根据案件标的额分段计算</li>
                        <li>劳动争议案件：每件交纳10元</li>
                        <li>婚姻家庭案件：每件交纳50元</li>
                        <li>合同纠纷案件：参照民事财产案件标准计算</li>
                    </ul>
                </div>
            </Card>
        </div>
    );
};

export default LitigationCalculator; 