import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Table, Button, notification } from 'antd'

export default function Audit() {
  const [dataSource, setdataSource] = useState([])
  const { roleId, region, username } = JSON.parse(localStorage.getItem('token'))
  useEffect(() => {
    const roleObj = {
      "1": "superadmin",
      "2": "admin",
      "3": "editor"
    }
    axios.get(`/news?auditState=1&_expand=category`).then(res => {
      const list = res.data
      setdataSource(roleObj[roleId] === 'superadmin' ? list : [
        ...list.filter(item => item.author === username),
        ...list.filter(item => item.region === region && roleObj[item.roleId] === 'editor')
      ])
    })
  }, [roleId, region, username])

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
    }

    ,
    {
      title: '操作',
      render: (item) => {
        return <div><Button danger onClick={() => handleAudit(item, 3, 0)}>驳回</Button>
          <Button type="primary" onClick={() => handleAudit(item, 2, 1)}>通过</Button>
        </div>
      }
    }
  ];
  const handleAudit = (item, auditState, publishState) => {
    setdataSource(dataSource.filter(data => data.id !== item.id))
    axios.patch(`/news/${item.id}`, {
      auditState,
      publishState
    }).then(res => {
      notification.info({
        message: `通知`,
        description: `您可以到[案件审核/审核列表]中查看该案件审核状态`,
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
