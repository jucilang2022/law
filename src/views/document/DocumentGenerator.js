import React, { useState } from 'react';
import {
    Layout, Card, Row, Col, Typography, Button, Select,
    Form, Input, message, Modal, List, Tag, Space, Divider, DatePicker
} from 'antd';
import {
    FileTextOutlined, DownloadOutlined, EditOutlined,
    SearchOutlined, FileSearchOutlined, FileAddOutlined, ArrowLeftOutlined
} from '@ant-design/icons';
import './DocumentGenerator.css';
import moment from 'moment';
import { useHistory } from 'react-router-dom';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// 文书模板数据
const documentTemplates = [
    {
        id: 1,
        title: '民事起诉状',
        category: '民事诉讼',
        description: '用于向法院提起民事诉讼的文书',
        fields: [
            { name: '原告姓名', type: 'text', required: true },
            { name: '原告性别', type: 'select', options: ['男', '女'], required: true },
            { name: '原告年龄', type: 'text', required: true },
            { name: '原告住址', type: 'text', required: true },
            { name: '原告电话', type: 'text', required: true },
            { name: '被告姓名', type: 'text', required: true },
            { name: '被告性别', type: 'select', options: ['男', '女'], required: true },
            { name: '被告年龄', type: 'text', required: true },
            { name: '被告住址', type: 'text', required: true },
            { name: '被告电话', type: 'text', required: true },
            { name: '诉讼请求', type: 'textarea', required: true },
            { name: '事实与理由', type: 'textarea', required: true },
            { name: '证据清单', type: 'textarea', required: true },
        ],
        template: (values) => `
民事起诉状

原告：${values['原告姓名']}，${values['原告性别']}，${values['原告年龄']}岁，住${values['原告住址']}，电话：${values['原告电话']}。

被告：${values['被告姓名']}，${values['被告性别']}，${values['被告年龄']}岁，住${values['被告住址']}，电话：${values['被告电话']}。

诉讼请求：
${values['诉讼请求']}

事实与理由：
${values['事实与理由']}

证据清单：
${values['证据清单']}

此致
${values['法院名称'] || '人民法院'}

    具状人：${values['原告姓名']}
    ${moment().format('YYYY年MM月DD日')}
`
    },
    {
        id: 2,
        title: '离婚协议书',
        category: '婚姻家事',
        description: '用于协议离婚的文书',
        fields: [
            { name: '男方姓名', type: 'text', required: true },
            { name: '男方身份证号', type: 'text', required: true },
            { name: '女方姓名', type: 'text', required: true },
            { name: '女方身份证号', type: 'text', required: true },
            { name: '结婚日期', type: 'date', required: true },
            { name: '子女情况', type: 'textarea', required: true },
            { name: '财产分割', type: 'textarea', required: true },
            { name: '子女抚养', type: 'textarea', required: true },
            { name: '债务处理', type: 'textarea', required: true },
        ],
        template: (values) => `
离婚协议书

男方：${values['男方姓名']}，身份证号：${values['男方身份证号']}。

女方：${values['女方姓名']}，身份证号：${values['女方身份证号']}。

双方于${moment(values['结婚日期']).format('YYYY年MM月DD日')}登记结婚，现因感情破裂，经双方协商一致，达成如下离婚协议：

一、子女情况
${values['子女情况']}

二、财产分割
${values['财产分割']}

三、子女抚养
${values['子女抚养']}

四、债务处理
${values['债务处理']}

五、其他约定
1. 本协议一式三份，双方各执一份，婚姻登记机关存档一份。
2. 本协议自双方签字之日起生效。

男方（签字）：${values['男方姓名']}
女方（签字）：${values['女方姓名']}
日期：${moment().format('YYYY年MM月DD日')}
`
    },
    {
        id: 3,
        title: '劳动合同',
        category: '劳动纠纷',
        description: '用于建立劳动关系的文书',
        fields: [
            { name: '用人单位', type: 'text', required: true },
            { name: '用人单位地址', type: 'text', required: true },
            { name: '劳动者姓名', type: 'text', required: true },
            { name: '劳动者身份证号', type: 'text', required: true },
            { name: '合同期限', type: 'text', required: true },
            { name: '试用期', type: 'text', required: true },
            { name: '工作内容', type: 'textarea', required: true },
            { name: '工作地点', type: 'text', required: true },
            { name: '工作时间', type: 'text', required: true },
            { name: '劳动报酬', type: 'textarea', required: true },
            { name: '社会保险', type: 'textarea', required: true },
            { name: '劳动保护', type: 'textarea', required: true },
        ],
        template: (values) => `
劳动合同

甲方（用人单位）：${values['用人单位']}
地址：${values['用人单位地址']}

乙方（劳动者）：${values['劳动者姓名']}
身份证号：${values['劳动者身份证号']}

根据《中华人民共和国劳动合同法》及有关法律、法规规定，甲乙双方在平等自愿、协商一致的基础上，签订本合同。

一、合同期限
${values['合同期限']}

二、试用期
${values['试用期']}

三、工作内容和工作地点
1. 工作内容：${values['工作内容']}
2. 工作地点：${values['工作地点']}

四、工作时间和休息休假
${values['工作时间']}

五、劳动报酬
${values['劳动报酬']}

六、社会保险
${values['社会保险']}

七、劳动保护、劳动条件和职业危害防护
${values['劳动保护']}

八、其他约定
1. 本合同一式两份，甲乙双方各执一份。
2. 本合同自双方签字之日起生效。

甲方（盖章）：${values['用人单位']}
乙方（签字）：${values['劳动者姓名']}
日期：${moment().format('YYYY年MM月DD日')}
`
    },
    {
        id: 4,
        title: '房屋租赁合同',
        category: '合同纠纷',
        description: '用于房屋租赁的文书',
        fields: [
            { name: '出租方', type: 'text', required: true },
            { name: '出租方身份证号', type: 'text', required: true },
            { name: '承租方', type: 'text', required: true },
            { name: '承租方身份证号', type: 'text', required: true },
            { name: '房屋地址', type: 'text', required: true },
            { name: '房屋面积', type: 'text', required: true },
            { name: '租赁期限', type: 'text', required: true },
            { name: '租金支付', type: 'textarea', required: true },
            { name: '押金', type: 'text', required: true },
            { name: '房屋用途', type: 'text', required: true },
            { name: '维修责任', type: 'textarea', required: true },
            { name: '违约责任', type: 'textarea', required: true },
        ],
        template: (values) => `
房屋租赁合同

出租方（甲方）：${values['出租方']}
身份证号：${values['出租方身份证号']}

承租方（乙方）：${values['承租方']}
身份证号：${values['承租方身份证号']}

根据《中华人民共和国合同法》及有关法律、法规规定，甲乙双方在平等自愿、协商一致的基础上，就房屋租赁事宜达成如下协议：

一、房屋基本情况
1. 房屋地址：${values['房屋地址']}
2. 房屋面积：${values['房屋面积']}

二、租赁期限
${values['租赁期限']}

三、租金及支付方式
${values['租金支付']}

四、押金
${values['押金']}

五、房屋用途
${values['房屋用途']}

六、维修责任
${values['维修责任']}

七、违约责任
${values['违约责任']}

八、其他约定
1. 本合同一式两份，甲乙双方各执一份。
2. 本合同自双方签字之日起生效。

甲方（签字）：${values['出租方']}
乙方（签字）：${values['承租方']}
日期：${moment().format('YYYY年MM月DD日')}
`
    },
    {
        id: 5,
        title: '借款合同',
        category: '合同纠纷',
        description: '用于个人或企业借款的文书',
        fields: [
            { name: '出借人', type: 'text', required: true },
            { name: '出借人身份证号', type: 'text', required: true },
            { name: '借款人', type: 'text', required: true },
            { name: '借款人身份证号', type: 'text', required: true },
            { name: '借款金额', type: 'text', required: true },
            { name: '借款期限', type: 'text', required: true },
            { name: '借款利率', type: 'text', required: true },
            { name: '还款方式', type: 'textarea', required: true },
            { name: '担保方式', type: 'textarea', required: true },
            { name: '违约责任', type: 'textarea', required: true },
        ],
        template: (values) => `
借款合同

出借人（甲方）：${values['出借人']}
身份证号：${values['出借人身份证号']}

借款人（乙方）：${values['借款人']}
身份证号：${values['借款人身份证号']}

根据《中华人民共和国合同法》及有关法律、法规规定，甲乙双方在平等自愿、协商一致的基础上，就借款事宜达成如下协议：

一、借款金额
${values['借款金额']}

二、借款期限
${values['借款期限']}

三、借款利率
${values['借款利率']}

四、还款方式
${values['还款方式']}

五、担保方式
${values['担保方式']}

六、违约责任
${values['违约责任']}

七、其他约定
1. 本合同一式两份，甲乙双方各执一份。
2. 本合同自双方签字之日起生效。

甲方（签字）：${values['出借人']}
乙方（签字）：${values['借款人']}
日期：${moment().format('YYYY年MM月DD日')}
`
    },
    {
        id: 6,
        title: '交通事故调解协议书',
        category: '交通事故',
        description: '用于交通事故调解的文书',
        fields: [
            { name: '甲方姓名', type: 'text', required: true },
            { name: '甲方身份证号', type: 'text', required: true },
            { name: '乙方姓名', type: 'text', required: true },
            { name: '乙方身份证号', type: 'text', required: true },
            { name: '事故时间', type: 'date', required: true },
            { name: '事故地点', type: 'text', required: true },
            { name: '事故经过', type: 'textarea', required: true },
            { name: '损失情况', type: 'textarea', required: true },
            { name: '赔偿金额', type: 'text', required: true },
            { name: '赔偿方式', type: 'textarea', required: true },
        ],
        template: (values) => `
交通事故调解协议书

甲方：${values['甲方姓名']}
身份证号：${values['甲方身份证号']}

乙方：${values['乙方姓名']}
身份证号：${values['乙方身份证号']}

经双方协商，就${moment(values['事故时间']).format('YYYY年MM月DD日')}在${values['事故地点']}发生的交通事故达成如下调解协议：

一、事故经过
${values['事故经过']}

二、损失情况
${values['损失情况']}

三、赔偿金额
${values['赔偿金额']}

四、赔偿方式
${values['赔偿方式']}

五、其他约定
1. 本协议一式三份，甲乙双方各执一份，调解机关存档一份。
2. 本协议自双方签字之日起生效。

甲方（签字）：${values['甲方姓名']}
乙方（签字）：${values['乙方姓名']}
日期：${moment().format('YYYY年MM月DD日')}
`
    }
];

export default function DocumentGenerator() {
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const history = useHistory();

    // 处理模板选择
    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
        setIsModalVisible(true);
        form.resetFields();
    };

    // 处理表单提交
    const handleFormSubmit = async (values) => {
        try {
            // 使用模板生成文书内容
            const documentContent = selectedTemplate.template(values);

            // 创建Word文档
            const blob = new Blob([documentContent], { type: 'application/msword' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${selectedTemplate.title}.doc`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            message.success('文书生成成功！');
            setIsModalVisible(false);
        } catch (error) {
            message.error('文书生成失败，请重试');
        }
    };

    // 过滤模板
    const filteredTemplates = documentTemplates.filter(template => {
        const matchesSearch = template.title.toLowerCase().includes(searchText.toLowerCase()) ||
            template.description.toLowerCase().includes(searchText.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // 渲染表单项
    const renderFormItem = (field) => {
        switch (field.type) {
            case 'select':
                return (
                    <Select>
                        {field.options.map(option => (
                            <Option key={option} value={option}>{option}</Option>
                        ))}
                    </Select>
                );
            case 'date':
                return <DatePicker style={{ width: '100%' }} />;
            case 'textarea':
                return <TextArea rows={4} />;
            default:
                return <Input />;
        }
    };

    return (
        <Layout className="document-generator-layout">
            <Header className="document-generator-header">
                <Button
                    type="text"
                    onClick={() => history.push('/users')}
                    className="back-button1"
                >
                    -返回
                </Button>
                <Title level={2}>
                    <FileTextOutlined /> 法律文书生成
                </Title>
            </Header>

            <Content className="document-generator-content">
                <div className="search-filter-section">
                    <Input
                        placeholder="搜索文书模板..."
                        prefix={<SearchOutlined />}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 300, marginRight: 16 }}
                    />
                    <Select
                        defaultValue="all"
                        style={{ width: 200 }}
                        onChange={setSelectedCategory}
                    >
                        <Option value="all">全部分类</Option>
                        <Option value="民事诉讼">民事诉讼</Option>
                        <Option value="婚姻家事">婚姻家事</Option>
                        <Option value="劳动纠纷">劳动纠纷</Option>
                        <Option value="合同纠纷">合同纠纷</Option>
                        <Option value="交通事故">交通事故</Option>
                    </Select>
                </div>

                <Row gutter={[24, 24]} className="template-list">
                    {filteredTemplates.map(template => (
                        <Col span={8} key={template.id}>
                            <Card
                                hoverable
                                className="template-card"
                                onClick={() => handleTemplateSelect(template)}
                            >
                                <div className="template-icon">
                                    <FileTextOutlined />
                                </div>
                                <Title level={4}>{template.title}</Title>
                                <Tag color="blue">{template.category}</Tag>
                                <Text className="template-description">{template.description}</Text>
                                <Button
                                    type="primary"
                                    icon={<FileAddOutlined />}
                                    className="generate-button"
                                >
                                    生成文书
                                </Button>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <Modal
                    title={`生成${selectedTemplate?.title}`}
                    open={isModalVisible}
                    onCancel={() => setIsModalVisible(false)}
                    footer={null}
                    width={800}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleFormSubmit}
                    >
                        {selectedTemplate?.fields.map((field, index) => (
                            <Form.Item
                                key={index}
                                label={field.name}
                                name={field.name}
                                rules={[{ required: field.required, message: `请输入${field.name}` }]}
                            >
                                {renderFormItem(field)}
                            </Form.Item>
                        ))}
                        <Form.Item>
                            <Space>
                                <Button type="primary" htmlType="submit" icon={<DownloadOutlined />}>
                                    生成并下载
                                </Button>
                                <Button onClick={() => setIsModalVisible(false)}>
                                    取消
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>
            </Content>
        </Layout>
    );
} 