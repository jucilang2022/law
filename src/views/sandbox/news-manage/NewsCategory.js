import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { Button, Table, Modal } from 'antd'
const { confirm } = Modal;
export default function NewsCategory() {
  const [dataSource, setdataSource] = useState([
  ])
  useEffect(() => {
    axios.get("/categories").then(res => {
      setdataSource(res.data)
    })
  })
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      render: (id) => {
        return <b>{id}</b>
      }
    },
    {
      title: '栏目名称',
      dataIndex: 'title',
    },
    {
      title: '操作',
      render: (item) => {
        return <div>
          <Button danger shape='circle' icon={<DeleteOutlined />} onClick={() => confirmMethod(item)} />
        </div>
      }
    }
  ];
  const confirmMethod = (item) => {
    confirm({
      title: 'Do you want to Delete these items?',
      icon: <ExclamationCircleOutlined />,
      content: 'Some descriptions',
      onOk() {
        // console.log('OK');
        delectMethod(item);
      }, onCancel() {
        // console.log('Cancel');
      },
    });
  }
  const delectMethod = (item) => {
    // setdataSource(dataSource.filter(data => data.id !== item.id))
    // axios.delete(`/categories/${item.id}`)
  }
  return (
    <div>
      <Table dataSource={dataSource} columns={columns} pagination={{
        pageSize: 5
      }}
        rowKey={item => item.id}
      />
    </div>
  )
}
