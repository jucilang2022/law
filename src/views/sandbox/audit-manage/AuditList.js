import React, { useEffect, useState } from 'react'
import { Table, Button, Tag, notification } from 'antd'
import { UploadOutlined, SyncOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import axios from 'axios'
export default function AuditList(props) {
  const [dataSource, setdataSource] = useState([])
  const { username } = JSON.parse(localStorage.getItem("token"))
  useEffect(() => {
    axios(`/news?author=${username}&auditState_ne=0&publishState_lte=1&_expand=category`).then(res => {
      setdataSource(res.data)
    })
  }, [username])

  const columns = [
    {
      title: '案件名称',
      dataIndex: 'title',
      render: (title, item) => {
        return <a href={`#/news-manage/preview/${item.id}`}><b>{title}</b></a>
      }
    },
    {
      title: '作者',
      dataIndex: 'author',
    },
    {
      title: '案件分类',
      dataIndex: 'category',
      render: (category) => {
        return <div>{category.title}</div>
      }
    }, {
      title: '审核状态',
      dataIndex: 'auditState',
      render: (auditState) => {
        const auditList = ["未审核", "审核中", "已通过", "未通过"]
        const colorList = ['#388af4', 'orange', 'green', 'red']
        return <Tag color={colorList[auditState]}>{auditList[auditState]}</Tag>
      }
    },
    {
      title: '操作',
      render: (item) => {
        return <div>
          {item.auditState === 1 && <div><span style={{ color: 'red', fontSize: '12px' }}>撤销</span><Button onClick={() => handleRervert(item)} danger shape='circle' icon={<ArrowLeftOutlined />}></Button></div>
          }
          {item.auditState === 2 && <div><span style={{ color: 'black', fontSize: '12px' }}>发布</span><Button onClick={() => handlePublish(item)} shape='circle' icon={<UploadOutlined />} ></Button></div>}
          {item.auditState === 3 && <div><span style={{ color: '#388af4', fontSize: '12px' }}>更新</span><Button onClick={() => handleUpdate(item)} type="primary" shape='circle' icon={<SyncOutlined />} ></Button></div>}
        </div >
      }
    }
  ];

  const handleRervert = (item) => {
    setdataSource(dataSource.filter(data => data.id !== item.id))
    axios.patch(`/news/${item.id}`, { auditState: 0 }).then(res => {
      notification.info({
        message: `通知`,
        description: `您可以到草稿箱中重新编辑该案件`,
        placement: 'bottomRight',
      });
    })
  }
  const handleUpdate = (item) => {
    props.history.push(`/news-manage/update/${item.id}`)
  }
  const handlePublish = (item) => {
    axios.patch(`/news/${item.id}`, {
      'publishState': 2,
      'publishTime': Date.now()
    }).then(res => {
      props.history.push('/publish-manage/published')
      notification.info({
        message: `通知`,
        description: `您可以到[信息管理/已发布]中重新编辑该案件`,
        placement: 'bottomRight',
      });
    })
  }

  return (
    <div>
      <Table dataSource={dataSource} columns={columns} pagination={{
        pageSize: 5
      }} rowkey={Item => Item.id} />
    </div>
  )
}
