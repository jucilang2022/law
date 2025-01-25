import React, { useEffect, useState } from 'react'
import { Table, Button, Modal, Tree } from 'antd'
import axios from 'axios'
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
const { confirm } = Modal;

export default function RoleList() {
    const [dataSource, setdataSource] = useState([])
    const [rightList, setrightList] = useState([])
    const [currentRights, setcurrentRights] = useState([])
    const [currentId, setcurrentId] = useState(0)
    const [isModalVisible, setisModalVisible] = useState(false)

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            render: (id) => {
                return <b>{id}</b>
            }
        },
        {
            title: '角色名称',
            dataIndex: 'roleName',
            // render: (roleName) => {
            //     return <b>{roleName}</b>
            // }
        },
        {
            title: '操作',
            render: (item) => {
                return <div>
                    <Button danger shape='circle' icon={<DeleteOutlined />} onClick={() => confirmMethod(item)} />
                    <Button type='primary' shape='circle' icon={<EditOutlined />} onClick={() => {
                        setisModalVisible(true)
                        setcurrentRights(item.rights)
                        setcurrentId(item.id)
                    }} />
                </div>
            }
        }
    ]
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
        // console.log(item)
        setdataSource(dataSource.filter(data => data.id !== item.id))
        axios.delete(`http://localhost:5000/roles/${item.id}`)
    }
    useEffect(() => {
        axios.get('http://localhost:5000/roles').then(res => {
            setdataSource(res.data)
        })
    }, [])
    useEffect(() => {
        axios.get('http://localhost:5000/rights?_embed=children').then(res => {
            setrightList(res.data)
        })
    }, [])
    const handleOk = () => {
        setisModalVisible(false);
        // console.log(currentRights)
        setdataSource(dataSource.map(item => {
            if (item.id === currentId) {
                return {
                    ...item,
                    rights: currentRights
                }
            }
            return item
        }))
        axios.patch(`http://localhost:5000/roles/${currentId}`, {
            rights: currentRights
        })
    }
    const handleCancel = () => {
        setisModalVisible(false);
    }
    const onCheck = (checkKeys) => {
        setcurrentRights(checkKeys.checked)
    }

    return (
        <div>
            <Table dataSource={dataSource} columns={columns} rowKey={(item) => item.id} pagination={{
                pageSize: 5
            }} />
            <Modal title='权限分配' visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                <Tree checkable
                    checkedKeys={currentRights}
                    onCheck={onCheck}
                    checkStrictly={true}
                    treeData={rightList} />
            </Modal>
        </div>
    )
}