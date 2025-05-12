import React, { useState, useEffect } from 'react';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import {
    Layout, Typography, Card, Breadcrumb, Button, Space,
    Divider, Tag, Rate, Tooltip, message, Spin
} from 'antd';
import {
    HomeOutlined, BookOutlined, DownloadOutlined,
    StarOutlined, ShareAltOutlined, PrinterOutlined,
    EyeOutlined, LikeOutlined, MessageOutlined, ArrowLeftOutlined
} from '@ant-design/icons';
import './KnowledgeDetail.css';

const { Header, Content } = Layout;
const { Title, Paragraph, Text } = Typography;

// 模拟知识库数据
const knowledgeData = {
    '婚姻家事': {
        title: '婚姻家事法律知识',
        category: '民事',
        views: 1234,
        likes: 89,
        rating: 4.5,
        content: `
            <h2>婚姻家事法律知识概述</h2>
            <p>婚姻家事法律是调整婚姻家庭关系的法律规范的总称，主要包括婚姻法、继承法、收养法等。这些法律规范共同构成了我国婚姻家庭法律制度体系。</p>
            
            <h3>一、婚姻关系</h3>
            <p>1. 结婚条件</p>
            <ul>
                <li>男女双方完全自愿</li>
                <li>达到法定婚龄（男22周岁，女20周岁）</li>
                <li>无禁止结婚的亲属关系</li>
                <li>无医学上认为不应当结婚的疾病</li>
                <li>双方均无配偶</li>
            </ul>
            
            <p>2. 婚姻登记</p>
            <ul>
                <li>必须亲自到婚姻登记机关办理</li>
                <li>需要提供身份证、户口本等证件</li>
                <li>登记机关审查后发给结婚证</li>
                <li>结婚证是婚姻关系成立的法定证明</li>
            </ul>
            
            <h3>二、离婚程序</h3>
            <p>1. 协议离婚</p>
            <ul>
                <li>双方自愿离婚</li>
                <li>对子女抚养、财产分割达成协议</li>
                <li>到婚姻登记机关办理离婚登记</li>
                <li>需要经过30天冷静期</li>
                <li>冷静期后双方共同到登记机关领取离婚证</li>
            </ul>
            
            <p>2. 诉讼离婚</p>
            <ul>
                <li>一方要求离婚</li>
                <li>向法院提起离婚诉讼</li>
                <li>法院调解或判决</li>
                <li>调解无效的，准予离婚的情形：
                    <ul>
                        <li>重婚或有配偶者与他人同居</li>
                        <li>实施家庭暴力或虐待、遗弃家庭成员</li>
                        <li>有赌博、吸毒等恶习屡教不改</li>
                        <li>因感情不和分居满二年</li>
                        <li>其他导致夫妻感情破裂的情形</li>
                    </ul>
                </li>
            </ul>
            
            <h3>三、财产分割</h3>
            <p>1. 夫妻共同财产</p>
            <ul>
                <li>工资、奖金</li>
                <li>生产、经营的收益</li>
                <li>知识产权的收益</li>
                <li>继承或赠与所得的财产（遗嘱或赠与合同中确定只归夫或妻一方的除外）</li>
                <li>其他应当归共同所有的财产</li>
            </ul>

            <p>2. 夫妻个人财产</p>
            <ul>
                <li>婚前财产</li>
                <li>因身体受到伤害获得的医疗费、残疾人生活补助费等费用</li>
                <li>遗嘱或赠与合同中确定只归夫或妻一方的财产</li>
                <li>一方专用的生活用品</li>
                <li>其他应当归一方的财产</li>
            </ul>

            <h3>四、子女抚养</h3>
            <p>1. 抚养权确定原则</p>
            <ul>
                <li>子女利益最大化原则</li>
                <li>考虑子女年龄、性别、健康状况</li>
                <li>考虑父母的经济能力、教育水平</li>
                <li>考虑子女的意愿（8周岁以上）</li>
            </ul>

            <p>2. 抚养费支付</p>
            <ul>
                <li>不直接抚养子女的一方应当支付抚养费</li>
                <li>抚养费包括生活费、教育费、医疗费等</li>
                <li>抚养费数额根据子女需要、父母负担能力和当地生活水平确定</li>
                <li>抚养费可以一次性支付或定期支付</li>
            </ul>

            <h3>五、继承制度</h3>
            <p>1. 法定继承</p>
            <ul>
                <li>第一顺序：配偶、子女、父母</li>
                <li>第二顺序：兄弟姐妹、祖父母、外祖父母</li>
                <li>继承开始后，由第一顺序继承人继承，第二顺序继承人不继承</li>
                <li>没有第一顺序继承人继承的，由第二顺序继承人继承</li>
            </ul>

            <p>2. 遗嘱继承</p>
            <ul>
                <li>公证遗嘱</li>
                <li>自书遗嘱</li>
                <li>代书遗嘱</li>
                <li>录音遗嘱</li>
                <li>口头遗嘱（危急情况下）</li>
            </ul>
        `,
        tags: ['婚姻法', '离婚', '财产分割', '子女抚养', '继承'],
        author: '张律师',
        publishDate: '2024-03-15',
        updateDate: '2024-03-20'
    },
    '劳动纠纷': {
        title: '劳动纠纷法律指南',
        category: '民事',
        views: 2345,
        likes: 156,
        rating: 4.8,
        content: `
            <h2>劳动纠纷法律指南</h2>
            <p>劳动纠纷是指劳动者与用人单位之间因劳动关系而产生的争议。本指南将帮助您了解劳动法律知识，维护自身合法权益。</p>
            
            <h3>一、劳动合同</h3>
            <p>1. 劳动合同的订立</p>
            <ul>
                <li>书面形式（建立劳动关系应当订立书面劳动合同）</li>
                <li>必备条款：
                    <ul>
                        <li>用人单位名称、住所和法定代表人</li>
                        <li>劳动者姓名、住址和身份证号码</li>
                        <li>劳动合同期限</li>
                        <li>工作内容和工作地点</li>
                        <li>工作时间和休息休假</li>
                        <li>劳动报酬</li>
                        <li>社会保险</li>
                        <li>劳动保护、劳动条件和职业危害防护</li>
                        <li>其他事项</li>
                    </ul>
                </li>
                <li>试用期规定：
                    <ul>
                        <li>劳动合同期限三个月以上不满一年的，试用期不得超过一个月</li>
                        <li>劳动合同期限一年以上不满三年的，试用期不得超过二个月</li>
                        <li>三年以上固定期限和无固定期限的劳动合同，试用期不得超过六个月</li>
                        <li>同一用人单位与同一劳动者只能约定一次试用期</li>
                    </ul>
                </li>
            </ul>
            
            <h3>二、工资待遇</h3>
            <p>1. 工资支付</p>
            <ul>
                <li>最低工资标准：不得低于当地最低工资标准</li>
                <li>加班工资计算：
                    <ul>
                        <li>工作日加班：不低于工资的150%</li>
                        <li>休息日加班：不低于工资的200%</li>
                        <li>法定节假日加班：不低于工资的300%</li>
                    </ul>
                </li>
                <li>工资支付时间：每月至少支付一次</li>
                <li>工资支付形式：货币形式，不得以实物或有价证券替代</li>
            </ul>

            <p>2. 工资构成</p>
            <ul>
                <li>基本工资</li>
                <li>绩效工资</li>
                <li>津贴补贴</li>
                <li>加班工资</li>
                <li>特殊情况下支付的工资</li>
            </ul>
            
            <h3>三、社会保险</h3>
            <p>1. 五险一金</p>
            <ul>
                <li>养老保险：
                    <ul>
                        <li>缴费比例：单位20%，个人8%</li>
                        <li>领取条件：达到法定退休年龄，缴费满15年</li>
                        <li>待遇计算：基础养老金+个人账户养老金</li>
                    </ul>
                </li>
                <li>医疗保险：
                    <ul>
                        <li>缴费比例：单位10%，个人2%</li>
                        <li>报销范围：门诊、住院、大病医疗等</li>
                        <li>报销比例：根据医院等级和费用类型确定</li>
                    </ul>
                </li>
                <li>失业保险：
                    <ul>
                        <li>缴费比例：单位2%，个人1%</li>
                        <li>领取条件：非本人意愿中断就业，已办理失业登记</li>
                        <li>领取期限：最长24个月</li>
                    </ul>
                </li>
                <li>工伤保险：
                    <ul>
                        <li>缴费比例：单位0.5%-2%，个人不缴费</li>
                        <li>保障范围：工伤医疗、伤残补助、工亡补助等</li>
                        <li>认定程序：工伤认定、劳动能力鉴定</li>
                    </ul>
                </li>
                <li>生育保险：
                    <ul>
                        <li>缴费比例：单位1%，个人不缴费</li>
                        <li>待遇项目：生育医疗费、生育津贴</li>
                        <li>享受条件：符合计划生育政策</li>
                    </ul>
                </li>
                <li>住房公积金：
                    <ul>
                        <li>缴费比例：单位和个人各5%-12%</li>
                        <li>使用范围：购房、租房、装修等</li>
                        <li>提取条件：购房、租房、退休等</li>
                    </ul>
                </li>
            </ul>

            <h3>四、工作时间与休息休假</h3>
            <p>1. 工作时间</p>
            <ul>
                <li>标准工时：每日不超过8小时，每周不超过40小时</li>
                <li>特殊工时：
                    <ul>
                        <li>综合计算工时</li>
                        <li>不定时工作制</li>
                        <li>缩短工时</li>
                    </ul>
                </li>
                <li>加班限制：每日不超过3小时，每月不超过36小时</li>
            </ul>

            <p>2. 休息休假</p>
            <ul>
                <li>法定节假日：元旦、春节、清明节、劳动节、端午节、中秋节、国庆节</li>
                <li>带薪年休假：
                    <ul>
                        <li>工作满1年不满10年：5天</li>
                        <li>工作满10年不满20年：10天</li>
                        <li>工作满20年：15天</li>
                    </ul>
                </li>
                <li>婚假、产假、丧假等</li>
            </ul>

            <h3>五、劳动争议解决</h3>
            <p>1. 解决途径</p>
            <ul>
                <li>协商：双方自行协商解决</li>
                <li>调解：通过调解组织调解</li>
                <li>仲裁：向劳动争议仲裁委员会申请仲裁</li>
                <li>诉讼：对仲裁裁决不服的，可以向法院提起诉讼</li>
            </ul>

            <p>2. 仲裁时效</p>
            <ul>
                <li>一般时效：一年</li>
                <li>起算时间：知道或者应当知道权利被侵害之日起</li>
                <li>时效中断：当事人主张权利、对方同意履行义务等</li>
                <li>时效中止：不可抗力等客观原因</li>
            </ul>
        `,
        tags: ['劳动合同', '工资待遇', '社会保险', '劳动争议', '工时休假'],
        author: '李律师',
        publishDate: '2024-03-10',
        updateDate: '2024-03-18'
    },
    '合同纠纷': {
        title: '合同纠纷法律指南',
        category: '民事',
        views: 3456,
        likes: 234,
        rating: 4.7,
        content: `
            <h2>合同纠纷法律指南</h2>
            <p>合同是民事主体之间设立、变更、终止民事法律关系的协议。本指南将帮助您了解合同法律知识，预防和解决合同纠纷。</p>

            <h3>一、合同订立</h3>
            <p>1. 合同成立要件</p>
            <ul>
                <li>当事人具有相应的民事行为能力</li>
                <li>意思表示真实</li>
                <li>不违反法律、行政法规的强制性规定</li>
                <li>不违背公序良俗</li>
            </ul>

            <p>2. 合同形式</p>
            <ul>
                <li>书面形式</li>
                <li>口头形式</li>
                <li>其他形式</li>
                <li>法律规定应当采用书面形式的，应当采用书面形式</li>
            </ul>

            <h3>二、合同效力</h3>
            <p>1. 有效合同</p>
            <ul>
                <li>主体适格</li>
                <li>意思表示真实</li>
                <li>内容合法</li>
                <li>形式符合法律规定</li>
            </ul>

            <p>2. 无效合同</p>
            <ul>
                <li>一方以欺诈、胁迫的手段订立合同，损害国家利益</li>
                <li>恶意串通，损害国家、集体或者第三人利益</li>
                <li>以合法形式掩盖非法目的</li>
                <li>损害社会公共利益</li>
                <li>违反法律、行政法规的强制性规定</li>
            </ul>

            <h3>三、合同履行</h3>
            <p>1. 履行原则</p>
            <ul>
                <li>全面履行原则</li>
                <li>诚实信用原则</li>
                <li>协作履行原则</li>
                <li>经济合理原则</li>
            </ul>

            <p>2. 履行抗辩权</p>
            <ul>
                <li>同时履行抗辩权</li>
                <li>先履行抗辩权</li>
                <li>不安抗辩权</li>
            </ul>

            <h3>四、违约责任</h3>
            <p>1. 违约形态</p>
            <ul>
                <li>预期违约</li>
                <li>实际违约：
                    <ul>
                        <li>不履行</li>
                        <li>迟延履行</li>
                        <li>不完全履行</li>
                    </ul>
                </li>
            </ul>

            <p>2. 违约责任形式</p>
            <ul>
                <li>继续履行</li>
                <li>采取补救措施</li>
                <li>赔偿损失</li>
                <li>支付违约金</li>
                <li>定金罚则</li>
            </ul>

            <h3>五、常见合同类型</h3>
            <p>1. 买卖合同</p>
            <ul>
                <li>标的物所有权转移</li>
                <li>标的物风险承担</li>
                <li>标的物质量保证</li>
                <li>价款支付</li>
            </ul>

            <p>2. 租赁合同</p>
            <ul>
                <li>租赁期限</li>
                <li>租金支付</li>
                <li>租赁物维修</li>
                <li>转租限制</li>
            </ul>

            <p>3. 借款合同</p>
            <ul>
                <li>借款用途</li>
                <li>利率限制</li>
                <li>还款期限</li>
                <li>担保方式</li>
            </ul>

            <h3>六、合同纠纷解决</h3>
            <p>1. 解决方式</p>
            <ul>
                <li>协商和解</li>
                <li>调解</li>
                <li>仲裁</li>
                <li>诉讼</li>
            </ul>

            <p>2. 诉讼时效</p>
            <ul>
                <li>一般诉讼时效：3年</li>
                <li>特殊诉讼时效：法律另有规定的除外</li>
                <li>时效起算：知道或者应当知道权利被侵害时</li>
                <li>时效中断和中止</li>
            </ul>
        `,
        tags: ['合同法', '合同订立', '合同履行', '违约责任', '纠纷解决'],
        author: '王律师',
        publishDate: '2024-03-12',
        updateDate: '2024-03-19'
    },
    '交通事故': {
        title: '交通事故法律指南',
        category: '民事',
        views: 4567,
        likes: 345,
        rating: 4.9,
        content: `
            <h2>交通事故法律指南</h2>
            <p>交通事故是指在道路上发生的车辆碰撞、碾压、刮擦等造成人身伤亡或财产损失的事件。本指南将帮助您了解交通事故处理流程和赔偿标准。</p>

            <h3>一、事故处理流程</h3>
            <p>1. 现场处理</p>
            <ul>
                <li>保护现场</li>
                <li>救助伤者</li>
                <li>报警处理</li>
                <li>拍照取证</li>
                <li>等待交警处理</li>
            </ul>

            <p>2. 责任认定</p>
            <ul>
                <li>交警现场勘查</li>
                <li>制作事故认定书</li>
                <li>责任划分：
                    <ul>
                        <li>全部责任</li>
                        <li>主要责任</li>
                        <li>同等责任</li>
                        <li>次要责任</li>
                        <li>无责任</li>
                    </ul>
                </li>
            </ul>

            <h3>二、赔偿项目</h3>
            <p>1. 人身损害赔偿</p>
            <ul>
                <li>医疗费</li>
                <li>误工费</li>
                <li>护理费</li>
                <li>交通费</li>
                <li>住院伙食补助费</li>
                <li>营养费</li>
                <li>残疾赔偿金</li>
                <li>死亡赔偿金</li>
                <li>被扶养人生活费</li>
                <li>精神损害抚慰金</li>
            </ul>

            <p>2. 财产损失赔偿</p>
            <ul>
                <li>车辆维修费</li>
                <li>车辆贬值损失</li>
                <li>拖车费</li>
                <li>停车费</li>
                <li>其他财产损失</li>
            </ul>

            <h3>三、保险理赔</h3>
            <p>1. 交强险</p>
            <ul>
                <li>赔偿限额：
                    <ul>
                        <li>死亡伤残：18万元</li>
                        <li>医疗费用：1.8万元</li>
                        <li>财产损失：0.2万元</li>
                    </ul>
                </li>
                <li>理赔程序</li>
                <li>免赔情形</li>
            </ul>

            <p>2. 商业险</p>
            <ul>
                <li>第三者责任险</li>
                <li>车损险</li>
                <li>车上人员责任险</li>
                <li>不计免赔险</li>
                <li>其他附加险</li>
            </ul>

            <h3>四、责任承担</h3>
            <p>1. 机动车之间</p>
            <ul>
                <li>按过错程度承担责任</li>
                <li>双方都有过错的，按过错比例分担</li>
                <li>无法确定过错的，平均分担</li>
            </ul>

            <p>2. 机动车与非机动车、行人</p>
            <ul>
                <li>机动车一方承担主要责任</li>
                <li>非机动车、行人有过错的，减轻机动车责任</li>
                <li>机动车一方无过错的，承担不超过10%的赔偿责任</li>
            </ul>

            <h3>五、争议解决</h3>
            <p>1. 解决方式</p>
            <ul>
                <li>协商和解</li>
                <li>调解</li>
                <li>诉讼</li>
            </ul>

            <p>2. 诉讼程序</p>
            <ul>
                <li>管辖法院选择</li>
                <li>证据准备</li>
                <li>诉讼时效</li>
                <li>执行程序</li>
            </ul>
        `,
        tags: ['交通事故', '责任认定', '保险理赔', '损害赔偿', '纠纷解决'],
        author: '赵律师',
        publishDate: '2024-03-14',
        updateDate: '2024-03-21'
    },
    '知识产权': {
        title: '知识产权法律指南',
        category: '商事',
        views: 3456,
        likes: 234,
        rating: 4.6,
        content: `
            <h2>知识产权法律指南</h2>
            <p>知识产权是指权利人对其智力劳动成果所享有的专有权利。本指南将帮助您了解知识产权保护的基本知识。</p>

            <h3>一、著作权</h3>
            <p>1. 保护对象</p>
            <ul>
                <li>文字作品</li>
                <li>口述作品</li>
                <li>音乐、戏剧、曲艺、舞蹈作品</li>
                <li>美术、建筑作品</li>
                <li>摄影作品</li>
                <li>电影作品和以类似摄制电影的方法创作的作品</li>
                <li>工程设计图、产品设计图、地图、示意图等图形作品和模型作品</li>
                <li>计算机软件</li>
                <li>其他作品</li>
            </ul>

            <p>2. 权利内容</p>
            <ul>
                <li>发表权</li>
                <li>署名权</li>
                <li>修改权</li>
                <li>保护作品完整权</li>
                <li>复制权</li>
                <li>发行权</li>
                <li>出租权</li>
                <li>展览权</li>
                <li>表演权</li>
                <li>放映权</li>
                <li>广播权</li>
                <li>信息网络传播权</li>
                <li>摄制权</li>
                <li>改编权</li>
                <li>翻译权</li>
                <li>汇编权</li>
                <li>其他权利</li>
            </ul>

            <h3>二、专利权</h3>
            <p>1. 专利类型</p>
            <ul>
                <li>发明专利</li>
                <li>实用新型专利</li>
                <li>外观设计专利</li>
            </ul>

            <p>2. 申请程序</p>
            <ul>
                <li>提交申请</li>
                <li>初步审查</li>
                <li>公开</li>
                <li>实质审查（仅发明专利）</li>
                <li>授权公告</li>
            </ul>

            <p>3. 保护期限</p>
            <ul>
                <li>发明专利：20年</li>
                <li>实用新型专利：10年</li>
                <li>外观设计专利：15年</li>
            </ul>

            <h3>三、商标权</h3>
            <p>1. 商标注册</p>
            <ul>
                <li>申请条件</li>
                <li>注册程序</li>
                <li>审查标准</li>
                <li>异议程序</li>
            </ul>

            <p>2. 商标使用</p>
            <ul>
                <li>使用规范</li>
                <li>许可使用</li>
                <li>转让程序</li>
                <li>续展程序</li>
            </ul>

            <h3>四、商业秘密</h3>
            <p>1. 构成要件</p>
            <ul>
                <li>秘密性</li>
                <li>价值性</li>
                <li>保密性</li>
            </ul>

            <p>2. 保护措施</p>
            <ul>
                <li>保密协议</li>
                <li>竞业限制</li>
                <li>技术措施</li>
                <li>管理措施</li>
            </ul>

            <h3>五、知识产权保护</h3>
            <p>1. 行政保护</p>
            <ul>
                <li>行政查处</li>
                <li>行政处罚</li>
                <li>行政调解</li>
            </ul>

            <p>2. 司法保护</p>
            <ul>
                <li>民事诉讼</li>
                <li>刑事诉讼</li>
                <li>行政诉讼</li>
            </ul>

            <p>3. 维权途径</p>
            <ul>
                <li>协商和解</li>
                <li>调解</li>
                <li>仲裁</li>
                <li>诉讼</li>
            </ul>
        `,
        tags: ['著作权', '专利权', '商标权', '商业秘密', '知识产权保护'],
        author: '陈律师',
        publishDate: '2024-03-13',
        updateDate: '2024-03-20'
    },
    '公司治理': {
        title: '公司治理法律指南',
        category: '商事',
        views: 5678,
        likes: 456,
        rating: 4.8,
        content: `
            <h2>公司治理法律指南</h2>
            <p>公司治理是指公司内部各利益相关者之间的权利制衡和利益分配机制。本指南将帮助您了解公司治理的基本法律知识。</p>

            <h3>一、公司设立</h3>
            <p>1. 公司类型</p>
            <ul>
                <li>有限责任公司</li>
                <li>股份有限公司</li>
                <li>一人有限责任公司</li>
                <li>国有独资公司</li>
            </ul>

            <p>2. 设立程序</p>
            <ul>
                <li>制定公司章程</li>
                <li>股东出资</li>
                <li>申请设立登记</li>
                <li>领取营业执照</li>
                <li>办理其他手续</li>
            </ul>

            <h3>二、公司组织机构</h3>
            <p>1. 股东会/股东大会</p>
            <ul>
                <li>职权范围</li>
                <li>会议制度</li>
                <li>表决机制</li>
                <li>决议效力</li>
            </ul>

            <p>2. 董事会</p>
            <ul>
                <li>组成方式</li>
                <li>职权范围</li>
                <li>会议制度</li>
                <li>董事责任</li>
            </ul>

            <p>3. 监事会</p>
            <ul>
                <li>组成方式</li>
                <li>职权范围</li>
                <li>监督职责</li>
                <li>监事责任</li>
            </ul>

            <h3>三、公司运营</h3>
            <p>1. 公司资本</p>
            <ul>
                <li>注册资本</li>
                <li>实收资本</li>
                <li>资本变更</li>
                <li>出资方式</li>
            </ul>

            <p>2. 公司财务</p>
            <ul>
                <li>财务会计制度</li>
                <li>利润分配</li>
                <li>公积金制度</li>
                <li>财务报告</li>
            </ul>

            <h3>四、公司变更</h3>
            <p>1. 变更类型</p>
            <ul>
                <li>公司合并</li>
                <li>公司分立</li>
                <li>公司增资</li>
                <li>公司减资</li>
                <li>公司形式变更</li>
            </ul>

            <p>2. 变更程序</p>
            <ul>
                <li>内部决议</li>
                <li>外部审批</li>
                <li>变更登记</li>
                <li>公告程序</li>
            </ul>

            <h3>五、公司解散与清算</h3>
            <p>1. 解散事由</p>
            <ul>
                <li>公司章程规定的营业期限届满</li>
                <li>股东会决议解散</li>
                <li>公司合并或分立需要解散</li>
                <li>依法被吊销营业执照</li>
                <li>法院判决解散</li>
            </ul>

            <p>2. 清算程序</p>
            <ul>
                <li>成立清算组</li>
                <li>通知债权人</li>
                <li>清理财产</li>
                <li>清偿债务</li>
                <li>分配剩余财产</li>
                <li>注销登记</li>
            </ul>

            <h3>六、公司法律责任</h3>
            <p>1. 民事责任</p>
            <ul>
                <li>股东责任</li>
                <li>董事责任</li>
                <li>监事责任</li>
                <li>高级管理人员责任</li>
            </ul>

            <p>2. 行政责任</p>
            <ul>
                <li>行政处罚</li>
                <li>行政强制</li>
                <li>行政处分</li>
            </ul>

            <p>3. 刑事责任</p>
            <ul>
                <li>虚报注册资本罪</li>
                <li>虚假出资罪</li>
                <li>抽逃出资罪</li>
                <li>妨害清算罪</li>
                <li>其他公司犯罪</li>
            </ul>
        `,
        tags: ['公司设立', '公司治理', '公司运营', '公司变更', '公司清算'],
        author: '刘律师',
        publishDate: '2024-03-16',
        updateDate: '2024-03-22'
    },
    '刑事法律': {
        title: '刑事法律知识指南',
        category: '刑事',
        views: 6789,
        likes: 567,
        rating: 4.9,
        content: `
            <h2>刑事法律知识指南</h2>
            <p>刑事法律是规定犯罪、刑事责任和刑罚的法律规范的总称。本指南将帮助您了解基本的刑事法律知识。</p>

            <div class="tip-box">
                <div class="tip-box-title">重要提示</div>
                <div class="tip-box-content">
                    本指南仅供参考，具体案件请咨询专业律师。刑事案件涉及人身自由，建议及时寻求法律援助。
                </div>
            </div>

            <h3>一、犯罪构成</h3>
            <div class="card-grid">
                <div class="card-item">
                    <div class="card-title">犯罪主体</div>
                    <div class="card-content">
                        <ul>
                            <li>自然人犯罪</li>
                            <li>单位犯罪</li>
                            <li>刑事责任年龄</li>
                            <li>刑事责任能力</li>
                        </ul>
                    </div>
                </div>
                <div class="card-item">
                    <div class="card-title">犯罪客体</div>
                    <div class="card-content">
                        <ul>
                            <li>社会关系</li>
                            <li>人身权利</li>
                            <li>财产权利</li>
                            <li>公共安全</li>
                        </ul>
                    </div>
                </div>
                <div class="card-item">
                    <div class="card-title">犯罪主观方面</div>
                    <div class="card-content">
                        <ul>
                            <li>故意犯罪</li>
                            <li>过失犯罪</li>
                            <li>犯罪目的</li>
                            <li>犯罪动机</li>
                        </ul>
                    </div>
                </div>
                <div class="card-item">
                    <div class="card-title">犯罪客观方面</div>
                    <div class="card-content">
                        <ul>
                            <li>危害行为</li>
                            <li>危害结果</li>
                            <li>因果关系</li>
                            <li>犯罪时间地点</li>
                        </ul>
                    </div>
                </div>
            </div>

            <h3>二、常见犯罪类型</h3>
            <div class="step-list">
                <div class="step-item">
                    <h4>侵犯人身权利犯罪</h4>
                    <ul>
                        <li>故意杀人罪</li>
                        <li>故意伤害罪</li>
                        <li>强奸罪</li>
                        <li>绑架罪</li>
                        <li>非法拘禁罪</li>
                    </ul>
                </div>
                <div class="step-item">
                    <h4>侵犯财产权利犯罪</h4>
                    <ul>
                        <li>盗窃罪</li>
                        <li>抢劫罪</li>
                        <li>诈骗罪</li>
                        <li>侵占罪</li>
                        <li>敲诈勒索罪</li>
                    </ul>
                </div>
                <div class="step-item">
                    <h4>破坏社会秩序犯罪</h4>
                    <ul>
                        <li>寻衅滋事罪</li>
                        <li>聚众斗殴罪</li>
                        <li>妨害公务罪</li>
                        <li>扰乱公共秩序罪</li>
                    </ul>
                </div>
            </div>

            <h3>三、刑罚制度</h3>
            <table>
                <thead>
                    <tr>
                        <th>刑罚种类</th>
                        <th>适用对象</th>
                        <th>执行方式</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>主刑</td>
                        <td>管制、拘役、有期徒刑、无期徒刑、死刑</td>
                        <td>独立适用</td>
                    </tr>
                    <tr>
                        <td>附加刑</td>
                        <td>罚金、剥夺政治权利、没收财产</td>
                        <td>附加适用</td>
                    </tr>
                </tbody>
            </table>

            <h3>四、刑事诉讼程序</h3>
            <div class="step-list">
                <div class="step-item">
                    <h4>立案侦查</h4>
                    <ul>
                        <li>立案条件</li>
                        <li>侦查措施</li>
                        <li>强制措施</li>
                        <li>侦查期限</li>
                    </ul>
                </div>
                <div class="step-item">
                    <h4>审查起诉</h4>
                    <ul>
                        <li>审查内容</li>
                        <li>起诉条件</li>
                        <li>不起诉决定</li>
                        <li>补充侦查</li>
                    </ul>
                </div>
                <div class="step-item">
                    <h4>审判程序</h4>
                    <ul>
                        <li>一审程序</li>
                        <li>二审程序</li>
                        <li>死刑复核</li>
                        <li>审判监督</li>
                    </ul>
                </div>
            </div>
        `,
        tags: ['刑法', '犯罪构成', '刑罚', '刑事诉讼'],
        author: '孙律师',
        publishDate: '2024-03-17',
        updateDate: '2024-03-23'
    },
    '房地产法律': {
        title: '房地产法律指南',
        category: '民事',
        views: 7890,
        likes: 678,
        rating: 4.7,
        content: `
            <h2>房地产法律指南</h2>
            <p>房地产法律是调整房地产关系的法律规范的总称。本指南将帮助您了解房地产交易、租赁、物业管理等方面的法律知识。</p>

            <div class="tip-box">
                <div class="tip-box-title">购房提示</div>
                <div class="tip-box-content">
                    购房是人生大事，建议在交易前充分了解相关法律规定，必要时咨询专业律师。
                </div>
            </div>

            <h3>一、房屋买卖</h3>
            <div class="card-grid">
                <div class="card-item">
                    <div class="card-title">商品房买卖</div>
                    <div class="card-content">
                        <ul>
                            <li>预售条件</li>
                            <li>合同签订</li>
                            <li>付款方式</li>
                            <li>交付标准</li>
                            <li>产权登记</li>
                        </ul>
                    </div>
                </div>
                <div class="card-item">
                    <div class="card-title">二手房交易</div>
                    <div class="card-content">
                        <ul>
                            <li>产权核查</li>
                            <li>价格评估</li>
                            <li>税费计算</li>
                            <li>过户程序</li>
                            <li>风险防范</li>
                        </ul>
                    </div>
                </div>
            </div>

            <h3>二、房屋租赁</h3>
            <div class="step-list">
                <div class="step-item">
                    <h4>租赁合同</h4>
                    <ul>
                        <li>合同必备条款</li>
                        <li>租金支付</li>
                        <li>押金管理</li>
                        <li>维修责任</li>
                        <li>合同解除</li>
                    </ul>
                </div>
                <div class="step-item">
                    <h4>租赁权益</h4>
                    <ul>
                        <li>承租人权利</li>
                        <li>出租人义务</li>
                        <li>转租限制</li>
                        <li>优先购买权</li>
                    </ul>
                </div>
            </div>

            <h3>三、物业管理</h3>
            <table>
                <thead>
                    <tr>
                        <th>管理事项</th>
                        <th>管理内容</th>
                        <th>法律依据</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>物业服务</td>
                        <td>公共设施维护、环境卫生、安全保卫等</td>
                        <td>《物业管理条例》</td>
                    </tr>
                    <tr>
                        <td>物业收费</td>
                        <td>物业服务费、专项维修资金等</td>
                        <td>《物业服务收费管理办法》</td>
                    </tr>
                    <tr>
                        <td>业主权利</td>
                        <td>知情权、监督权、参与权等</td>
                        <td>《民法典》</td>
                    </tr>
                </tbody>
            </table>

            <h3>四、房屋征收与补偿</h3>
            <div class="step-list">
                <div class="step-item">
                    <h4>征收程序</h4>
                    <ul>
                        <li>征收决定</li>
                        <li>评估程序</li>
                        <li>补偿方案</li>
                        <li>安置方式</li>
                    </ul>
                </div>
                <div class="step-item">
                    <h4>补偿标准</h4>
                    <ul>
                        <li>房屋补偿</li>
                        <li>土地补偿</li>
                        <li>搬迁补偿</li>
                        <li>临时安置费</li>
                    </ul>
                </div>
            </div>
        `,
        tags: ['房地产', '房屋买卖', '房屋租赁', '物业管理'],
        author: '周律师',
        publishDate: '2024-03-18',
        updateDate: '2024-03-24'
    },
    '消费者权益': {
        title: '消费者权益保护指南',
        category: '民事',
        views: 8901,
        likes: 789,
        rating: 4.8,
        content: `
            <h2>消费者权益保护指南</h2>
            <p>消费者权益保护法是保护消费者合法权益的法律规范。本指南将帮助您了解消费者权益保护的基本知识。</p>

            <div class="tip-box">
                <div class="tip-box-title">维权提示</div>
                <div class="tip-box-content">
                    遇到消费纠纷时，请及时保存证据，可以通过协商、投诉、仲裁、诉讼等方式维护自身权益。
                </div>
            </div>

            <h3>一、消费者权利</h3>
            <div class="card-grid">
                <div class="card-item">
                    <div class="card-title">基本权利</div>
                    <div class="card-content">
                        <ul>
                            <li>安全保障权</li>
                            <li>知情权</li>
                            <li>自主选择权</li>
                            <li>公平交易权</li>
                            <li>求偿权</li>
                            <li>结社权</li>
                            <li>获得知识权</li>
                            <li>受尊重权</li>
                            <li>监督权</li>
                        </ul>
                    </div>
                </div>
            </div>

            <h3>二、常见消费纠纷</h3>
            <div class="step-list">
                <div class="step-item">
                    <h4>商品质量</h4>
                    <ul>
                        <li>商品缺陷</li>
                        <li>虚假宣传</li>
                        <li>假冒伪劣</li>
                        <li>售后服务</li>
                    </ul>
                </div>
                <div class="step-item">
                    <h4>服务纠纷</h4>
                    <ul>
                        <li>服务质量</li>
                        <li>价格欺诈</li>
                        <li>强制消费</li>
                        <li>格式条款</li>
                    </ul>
                </div>
            </div>

            <h3>三、维权途径</h3>
            <table>
                <thead>
                    <tr>
                        <th>维权方式</th>
                        <th>适用情形</th>
                        <th>处理程序</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>协商和解</td>
                        <td>争议较小，双方愿意协商</td>
                        <td>直接与经营者协商</td>
                    </tr>
                    <tr>
                        <td>投诉举报</td>
                        <td>经营者存在违法行为</td>
                        <td>向消协或行政部门投诉</td>
                    </tr>
                    <tr>
                        <td>仲裁</td>
                        <td>有仲裁协议</td>
                        <td>向仲裁机构申请仲裁</td>
                    </tr>
                    <tr>
                        <td>诉讼</td>
                        <td>其他方式无法解决</td>
                        <td>向人民法院起诉</td>
                    </tr>
                </tbody>
            </table>

            <h3>四、特殊消费保护</h3>
            <div class="step-list">
                <div class="step-item">
                    <h4>网络购物</h4>
                    <ul>
                        <li>七天无理由退货</li>
                        <li>网络平台责任</li>
                        <li>支付安全</li>
                        <li>个人信息保护</li>
                    </ul>
                </div>
                <div class="step-item">
                    <h4>预付式消费</h4>
                    <ul>
                        <li>合同签订</li>
                        <li>资金安全</li>
                        <li>退费规则</li>
                        <li>经营者责任</li>
                    </ul>
                </div>
            </div>
        `,
        tags: ['消费者权益', '消费维权', '商品质量', '服务纠纷'],
        author: '吴律师',
        publishDate: '2024-03-19',
        updateDate: '2024-03-25'
    }
};

export default function KnowledgeDetail() {
    const { id } = useParams();
    const history = useHistory();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [knowledge, setKnowledge] = useState(null);

    useEffect(() => {
        // 模拟数据加载
        setTimeout(() => {
            const data = knowledgeData[id];
            if (data) {
                setKnowledge(data);
            } else {
                message.error('未找到相关知识内容');
                history.push('/news');
            }
            setLoading(false);
        }, 500);
    }, [id, history]);

    if (loading) {
        return (
            <div className="loading-container">
                <Spin size="large" tip="加载中..." />
            </div>
        );
    }

    if (!knowledge) {
        return null;
    }

    return (
        <Layout className="knowledge-detail-layout">
            <Header className="knowledge-detail-header">
                <div className="header-content">
                    <div className="header-left">
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
                        <Breadcrumb>
                            <Breadcrumb.Item href="/news">
                                <HomeOutlined /> 首页
                            </Breadcrumb.Item>
                            <Breadcrumb.Item href="/news#4">
                                <BookOutlined /> 法律知识库
                            </Breadcrumb.Item>
                            <Breadcrumb.Item>{knowledge.title}</Breadcrumb.Item>
                        </Breadcrumb>
                    </div>
                </div>
            </Header>

            <Content className="knowledge-detail-content">
                <Card className="knowledge-detail-card">
                    <div className="knowledge-header">
                        <Title level={2}>{knowledge.title}</Title>
                        <Space className="knowledge-meta">
                            <Text type="secondary">作者：{knowledge.author}</Text>
                            <Text type="secondary">发布时间：{knowledge.publishDate}</Text>
                            <Text type="secondary">更新时间：{knowledge.updateDate}</Text>
                        </Space>
                        <Space className="knowledge-stats">
                            <Tooltip title="浏览次数">
                                <span><EyeOutlined /> {knowledge.views}</span>
                            </Tooltip>
                            <Tooltip title="点赞数">
                                <span><LikeOutlined /> {knowledge.likes}</span>
                            </Tooltip>
                            <Tooltip title="评分">
                                <Rate disabled defaultValue={knowledge.rating} />
                            </Tooltip>
                        </Space>
                        <div className="knowledge-tags">
                            {knowledge.tags.map(tag => (
                                <Tag key={tag} color="blue">{tag}</Tag>
                            ))}
                        </div>
                    </div>

                    <Divider />

                    <div className="knowledge-actions">
                        <Space>
                            <Button icon={<DownloadOutlined />}>下载文档</Button>
                            <Button icon={<PrinterOutlined />}>打印</Button>
                            <Button icon={<ShareAltOutlined />}>分享</Button>
                            <Button icon={<StarOutlined />}>收藏</Button>
                        </Space>
                    </div>

                    <Divider />

                    <div
                        className="knowledge-content"
                        dangerouslySetInnerHTML={{ __html: knowledge.content }}
                    />

                    <Divider />

                    <div className="knowledge-footer">
                        <Space>
                            <Button type="primary" icon={<LikeOutlined />}>
                                点赞 ({knowledge.likes})
                            </Button>
                            <Button icon={<MessageOutlined />}>
                                评论
                            </Button>
                        </Space>
                    </div>
                </Card>
            </Content>
        </Layout>
    );
} 