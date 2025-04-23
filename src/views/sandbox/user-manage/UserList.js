import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Table, Modal, Switch } from 'antd';
import UserForm from '../../../components/user-manage/UserForm';

const { confirm } = Modal;

export default function UserList() {
    const [dataSource, setdataSource] = useState([]);
    const [isAddVisible, setAddVisible] = useState(false);
    const [isUpdateVisible, setisUpdateVisible] = useState(false);
    const [roleList, setroleList] = useState([]);
    const [regionList, setregionList] = useState([]);
    const [isUpdateDisabled, setisUpdateDisabled] = useState(false);
    const [current, setcurrent] = useState(null);

    const addForm = useRef(null);
    const updateForm = useRef(null);

    const { roleId, region, username } = JSON.parse(localStorage.getItem('token'));

    useEffect(() => {
        const roleObj = {
            "1": "superadmin",
            "2": "admin",
            "3": "editor"
        };
        axios.get("/users?_expand=role").then(res => {
            const list = res.data;
            setdataSource(roleObj[roleId] === 'superadmin' ? list : [
                ...list.filter(item => item.username === username),
                ...list.filter(item => item.region === region && roleObj[item.roleId] === 'editor')
            ]);
        });
    }, [roleId, region, username]);

    useEffect(() => {
        axios.get("/regions").then(res => {
            setregionList(res.data);
        });
    }, []);

    useEffect(() => {
        axios.get("/roles").then(res => {
            setroleList(res.data);
        });
    }, []);

    useEffect(() => {
        if (isUpdateVisible && current) {
            if (updateForm.current) {
                updateForm.current.setFieldsValue(current);
            }
        }
    }, [isUpdateVisible, current]);

    const columns = [
        {
            title: '用户名',
            dataIndex: 'username',
        },
        {
            title: '角色名称',
            dataIndex: 'role',
            render: (role) => {
                return role?.roleName;
            }
        },
        {
            title: '用户状态',
            dataIndex: 'roleState',
            render: (roleState, item) => {
                return <Switch checked={roleState} disabled={item.default} onChange={() => handleChange(item)} />;
            }
        },
        {
            title: '操作',
            render: (item) => {
                return <div>
                    <Button danger shape='circle' icon={<DeleteOutlined />} onClick={() => confirmMethod(item)} disabled={item.default} />
                    <Button type='primary' shape='circle' icon={<EditOutlined />} disabled={item.default} onClick={() => handleUpdate(item)} />
                </div>;
            }
        }
    ];

    const handleUpdate = (item) => {
        setcurrent(item);
        setisUpdateVisible(true);
        setisUpdateDisabled(item.roleId === 1);
    };

    const handleChange = (item) => {
        item.roleState = !item.roleState;
        setdataSource([...dataSource]);
        axios.patch(`/users/${item.id}`, {
            roleState: item.roleState
        });
    };

    const confirmMethod = (item) => {
        confirm({
            title: '你确定删除吗?',
            icon: <ExclamationCircleOutlined />,
            content: '此操作将永久删除该用户。',
            onOk() {
                delectMethod(item);
            }
        });
    };

    const delectMethod = (item) => {
        setdataSource(dataSource.filter(data => data.id !== item.id));
        axios.delete(`/users/${item.id}`);
    };

    const addFormOK = () => {
        addForm.current.validateFields().then(value => {
            setAddVisible(false);
            addForm.current.resetFields();
            axios.post(`/users`, {
                ...value,
                roleState: true,
                default: false
            }).then(res => {
                setdataSource([...dataSource, {
                    ...res.data,
                    role: roleList.find(item => item.id === value.roleId)
                }]);
            });
        }).catch(err => {
            console.log(err);
        });
    };

    const updateFormOK = () => {
        updateForm.current.validateFields().then(value => {
            setisUpdateVisible(false);
            setdataSource(dataSource.map(item => {
                if (item.id === current.id) {
                    return {
                        ...item,
                        ...value,
                        role: roleList.find(data => data.id === value.roleId)
                    };
                }
                return item;
            }));
            setisUpdateDisabled(!isUpdateDisabled);
            axios.patch(`/users/${current.id}`, value);
        });
    };

    return (
        <div>
            <Button type='primary' onClick={() => setAddVisible(true)}>添加用户</Button>
            <Table dataSource={dataSource} columns={columns} pagination={{ pageSize: 5 }} rowKey={item => item.id} />
            <Modal
                visible={isAddVisible}
                title="添加用户"
                okText="确定"
                cancelText="取消"
                onCancel={() => setAddVisible(false)}
                onOk={addFormOK}
            >
                <UserForm regionList={regionList} roleList={roleList} ref={addForm} />
            </Modal>
            <Modal
                visible={isUpdateVisible}
                title="更新用户"
                okText="更新"
                cancelText="取消"
                onCancel={() => {
                    setisUpdateVisible(false);
                    setisUpdateDisabled(!isUpdateDisabled);
                }}
                onOk={updateFormOK}
            >
                <UserForm regionList={regionList} roleList={roleList} ref={updateForm} isUpdateDisabled={isUpdateDisabled} isUpdate />
            </Modal>
        </div>
    );
}