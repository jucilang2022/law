import React, { useState } from 'react';
import { Layout, Dropdown, Menu, Space, Avatar } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    // DownOutlined,
    // SmileOutlined,
    // UserOutlined
} from '@ant-design/icons';
import { withRouter } from 'react-router-dom';

const { Header } = Layout;

function TopHeader(props) {
    const [collapsed, setCollapsed] = useState(false)
    const changeCollapsed = () => {
        setCollapsed(!collapsed)
    }
    const { role: { roleName }, username } = JSON.parse(localStorage.getItem('token'))

    const menu = (
        <Menu>
            <Menu.Item>
                <a rel="noopener noreferrer" href="/#/home">
                    {roleName}
                </a>
            </Menu.Item>
            <Menu.Item danger onClick={() => {
                localStorage.removeItem('token')
                props.history.replace('/login')
            }}>退出登录</Menu.Item>
        </Menu>
    );
    return (
        <Header
            className="site-layout-background"
            style={{
                padding: '0 20px',
            }}
        >
            {
                collapsed ? <MenuUnfoldOutlined onClick={changeCollapsed} /> : <MenuFoldOutlined onClick={changeCollapsed} />
            }
            <div style={{ float: 'right' }}>
                <span>欢迎<b><span style={{ color: '#1890ff' }}>{username}</span></b>回来&nbsp;</span>
                <Dropdown overlay={menu}>
                    <Space>
                        <Avatar src="https://img0.baidu.com/it/u=577272889,2607438384&fm=253&fmt=auto&app=138&f=PNG?w=285&h=285" />
                    </Space>
                </Dropdown>
            </div>
        </Header >
    )
}
export default withRouter(TopHeader)