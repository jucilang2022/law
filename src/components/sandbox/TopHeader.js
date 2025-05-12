import React, { useState } from 'react';
import { Layout, Dropdown, Menu, Space, Avatar } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    // DownOutlined,
    // SmileOutlined,
    UserOutlined,
    LogoutOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { withRouter } from 'react-router-dom';
import './TopHeader.css';

const { Header } = Layout;

function TopHeader(props) {
    const [collapsed, setCollapsed] = useState(false)
    const changeCollapsed = () => {
        setCollapsed(!collapsed)
    }
    const { role: { roleName }, username } = JSON.parse(localStorage.getItem('token'))
    const history = props.history;

    const handleAppointmentClick = () => {
        if (roleName === '用户') {
            history.push('/appointment/my');
        } else {
            history.push('/appointment-manage');
        }
    };

    const menu = (
        <Menu>
            <Menu.Item key="1" icon={<UserOutlined />} onClick={() => history.push('/users')}>
                {roleName}
            </Menu.Item>
            <Menu.Item key="2" icon={<CalendarOutlined />} onClick={handleAppointmentClick}>
                预约信息
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="3" icon={<LogoutOutlined />} danger onClick={() => {
                localStorage.removeItem('token')
                history.push('/login')
            }}>
                退出登录
            </Menu.Item>
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
                <Dropdown overlay={menu} placement="bottomRight">
                    <Space>
                        <Avatar icon={<UserOutlined />} />
                    </Space>
                </Dropdown>
            </div>
        </Header >
    )
}
export default withRouter(TopHeader)