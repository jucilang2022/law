import React, { useEffect, useState, useRef } from 'react'
import { PageHeader, Steps, Button, Form, Input, Select, message, notification } from 'antd'
import axios from 'axios'
import style from './News.module.css'
import NewsEditor from '../../../components/news-manage/NewsEditor';
const { Step } = Steps;
const { Option } = Select;
export default function NewsAdd(props) {
  const [current, setCurrnet] = useState(0)
  const [categoriyList, setcategoriyList] = useState([])
  const [formInfo, setformInfo] = useState({})
  const [content, setcontent] = useState("")

  const User = JSON.parse(localStorage.getItem("token"))

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
        message.error('新闻内容不能为空')
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

  const handleSave = (auditState) => {
    axios.post('/news', {
      ...formInfo,
      "content": content,
      "region": User.region ? User.region : '全球',
      'author': User.username,
      'roleId': User.roleId,
      'auditState': auditState,
      'publishState': 0,
      'createTime': Date.now(),
      'star': 0,
      'view': 0,
      // 'idpublishTime': 0
    }).then(res => {
      props.history.push(auditState === 0 ? '/news-manage/draft' : '/dudit-manage/list')
      notification.info({
        message: `通知`,
        description: `您可以到${auditState === 0 ? '草稿箱' : '审核列表'}中查看您的新闻`,
        placement: 'bottomRight',
      });
    })
  }
  return (
    <div>
      <PageHeader
        className="site-page-header"
        title="撰写新闻"
        subTitle="Write News"
      />
      <Steps current={current}>
        <Step title="撰写新闻" description="新闻标题和分类" />
        <Step title="新闻内容" description="新闻主体内容" />
        <Step title="新闻提交" description="保存草稿或提交审核" />
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
              label="新闻标题"
              name="title"
              rules={[
                {
                  required: true,
                  message: '请输入新闻标题！',
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="新闻分类"
              name="categoryId"
              rules={[
                {
                  required: true,
                  message: '请选择新闻分类！',
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
        }}></NewsEditor>
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
