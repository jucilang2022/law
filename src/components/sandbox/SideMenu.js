import React, { useState, useEffect } from 'react'
import { Layout, Menu } from 'antd';
import './index.css'
import { withRouter } from 'react-router-dom';
import axios from 'axios'
import {
    UserOutlined, VideoCameraOutlined, UploadOutlined,
    RedditOutlined, RobotOutlined, GoldOutlined,
    AuditOutlined, HighlightOutlined, FormOutlined,
    EditOutlined, BorderOuterOutlined, UnorderedListOutlined,
    ExclamationCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, ColumnWidthOutlined
} from '@ant-design/icons';
const { Sider } = Layout;
const { SubMenu } = Menu;
// const menuList = [
//     {
//         key: '/home',
//         title: '首页',
//         icon: <UserOutlined />
//     }, {
//         key: '/user-manage',
//         title: '用户管理',
//         icon: <UserOutlined />,
//         children: [
//             {
//                 key: '/user-manage/list',
//                 title: '用户列表',
//                 icon: <UserOutlined />
//             }
//         ]
//     },
//     {
//         key: '/right-manage',
//         title: '权限管理',
//         icon: <UserOutlined />,
//         children: [
//             {
//                 key: '/right-manage/role/list',
//                 title: '角色列表',
//                 icon: <UserOutlined />
//             },
//             {
//                 key: '/right-manage/right/list',
//                 title: '权限列表',
//                 icon: <UserOutlined />
//             }
//         ]
//     }
// ]

const iconList = {
    "/home": <VideoCameraOutlined />,
    "/user-manage": <UserOutlined />,
    "/user-manage/list": <RobotOutlined />,
    "/right-manage": <GoldOutlined />,
    "/right-manage/role/list": <UploadOutlined />,
    "/right-manage/right/list": <UploadOutlined />,
    "/news-manage": <AuditOutlined />,
    "/news-manage/add": <HighlightOutlined />,
    "/news-manage/draft": <FormOutlined />,
    "/news-manage/category": <ColumnWidthOutlined />,
    "/publish-manage": <RedditOutlined />,
    "/publish-manage/unpublished": <ExclamationCircleOutlined />,
    "/publish-manage/published": <CheckCircleOutlined />,
    "/publish-manage/sunset": <CloseCircleOutlined />,
    "/audit-manage": <EditOutlined />,
    "/audit-manage/audit": <BorderOuterOutlined />,
    "/audit-manage/list": <UnorderedListOutlined />
}

function SideMenu(props) {
    const [menu, setMenu] = useState([])
    useEffect(() => {
        axios.get("http://localhost:5000/rights?_embed=children").then(res => {
            // console.log(res.data)
            setMenu(res.data)
        })
    }, [])
    const { role: { rights } } = JSON.parse(localStorage.getItem('token'))

    const checkPagePermission = (item) => {
        return item.pagepermisson && rights.includes(item.key)
    }
    const renderMenu = (menuList) => {
        return menuList.map(item => {
            if (item.children && item.children.length !== 0 && checkPagePermission(item)) {
                return <SubMenu key={item.key} icon={iconList[item.key]} title={item.title}>
                    {renderMenu(item.children)}
                </SubMenu>
            }
            return checkPagePermission(item) && <Menu.Item key={item.key} icon={iconList[item.key]} onClick={() => {
                props.history.push(item.key)
            }}>{item.title}</Menu.Item>
        })
    }

    const [collapsed] = useState(false);
    //setCollapsed未使用
    const selectKeys = [props.location.pathname]
    const openKeys = ["/" + props.location.pathname.split("/")[1]]

    return (
        <Sider trigger={null} collapsible collapsed={collapsed}>
            <div style={{ display: 'flex', height: '100%', "flexDirection": "column" }}>
                <div className="logo">环球新闻网</div>
                <div style={{ flex: '1', 'overflow': 'auto' }}>
                    <Menu theme="dark" mode="inline" selectedKeys={selectKeys}
                        defaultSelectedKeys={selectKeys} defaultOpenKeys={openKeys}>
                        {renderMenu(menu)}
                    </Menu>
                </div>
            </div>
        </Sider>
    )
}
export default withRouter(SideMenu)