import React, { useEffect, useState, useRef } from 'react'
import { PageHeader, Steps, Button, Form, Input, Select, message, notification } from 'antd'
import axios from 'axios'
import style from './News.module.css'
import NewsEditor from '../../../components/news-manage/NewsEditor';
const { Step } = Steps;
const { Option } = Select;
export default function NewsUpdate(props) {
    const [current, setCurrnet] = useState(0)
    const [categoriyList, setcategoriyList] = useState([])
    const [formInfo, setformInfo] = useState({})
    const [content, setcontent] = useState("")

    // const User = JSON.parse(localStorage.getItem("token"))

    const handleNext = () => {
        if (current === 0) {
            NewsForm.current.validateFields().then(res => {
                // console.log(res)
                setformInfo(res)
                setCurrnet(current + 1)
            }).catch(error => {
                // console.log(error)
            })
        } else {
            if (content === '' || content.trim() === '<p></p>') {
                message.error('案件内容不能为空')
            } else {
                setCurrnet(current + 1)
            }
        }
    }
    const handleprevious = () => {
        setCurrnet(current - 1)

    }
    const NewsForm = useRef(null)
    useEffect(() => {
        axios.get('/categories').then(res => {
            console.log(res.data)
            setcategoriyList(res.data)
        })
    }, [])


    useEffect(() => {
        axios.get(`/news/${props.match.params.id}?_expand=category&_expand=role`)
            .then(res => {
                // setnewsInfo(res.data);

                let { title, categoryId, content } = res.data
                NewsForm.current.setFieldsValue({
                    title,
                    categoryId
                })
                setcontent(content)
            })
    }, [props.match.params.id]);

    const handleSave = (auditState) => {
        axios.patch(`/news/${props.match.params.id}`, {
            ...formInfo,
            "content": content,
            // "region": User.region ? User.region : '全领域',
            // 'author': User.username,
            // 'roleId': User.roleId,
            'auditState': auditState,
            // 'publishState': 0,
            // 'createTime': Date.now(),
            // 'star': 0,
            // 'view': 0,
            // 'idpublishTime': 0
        }).then(res => {
            props.history.push(auditState === 0 ? '/news-manage/draft' : '/audit-manage/list')
            notification.info({
                message: `通知`,
                description: `您可以到${auditState === 0 ? '草稿箱' : '审核列表'}中查看该案件`,
                placement: 'bottomRight',
            });
        })
    }
    return (
        <div>
            <PageHeader
                className="site-page-header"
                title="修改案件"
                onBack={() => props.history.goBack()}
                subTitle="Write News"
            />
            <Steps current={current}>
                <Step title="案件上传" description="案件名称和分类" />
                <Step title="案件内容" description="案件主体内容" />
                <Step title="案件提交" description="保存草稿或提交审核" />
            </Steps>
            <div style={{ marginTop: '50px' }}>
                <div className={current === 0 ? '' : style.active}>
                    <Form
                        name="basic"
                        labelCol={{
                            span: 4,
                        }}
                        wrapperCol={{
                            span: 20,
                        }}
                        initialValues={{
                            remember: true,
                        }}
                        autoComplete="off"
                        ref={NewsForm}
                    >
                        <Form.Item
                            label="案件名称"
                            name="title"
                            rules={[
                                {
                                    required: true,
                                    message: '请输入案件名称！',
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="案件分类"
                            name="categoryId"
                            rules={[
                                {
                                    required: true,
                                    message: '请选择案件分类！',
                                },
                            ]}
                        ><Select>
                                {
                                    categoriyList.map(item =>
                                        <Option value={item.id} key={item.id}>{item.title}</Option>
                                    )
                                }
                            </Select>
                        </Form.Item>
                    </Form>
                </div>
            </div>
            <div className={current === 1 ? '' : style.active}>
                <NewsEditor getContent={(value) => {
                    // console.log(value)
                    setcontent(value)
                }} content={content}></NewsEditor>
            </div>
            <div className={current === 2 ? '' : style.active}>

            </div>

            <div style={{ marginTop: "50px" }}>
                {
                    current === 2 && <span>
                        <Button type="primary" onClick={() => handleSave(0)}>保存草稿</Button>
                        <Button danger onClick={() => handleSave(1)}>提交审核</Button>
                    </span>
                }
                {
                    current < 2 && <Button type="primary" onClick={handleNext}>下一步</Button>
                }
                {
                    current > 0 && <Button onClick={handleprevious}>上一步</Button>
                }
            </div>
        </div>

    )
}
