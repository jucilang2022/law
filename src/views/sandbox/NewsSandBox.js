import React, { useEffect } from 'react'
import SideMenu from '../../components/sandbox/SideMenu'
import TopHeader from '../../components/sandbox/TopHeader'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import './NewsSandBox.css'

import { Layout } from 'antd';
import NewsRouter from '../../components/sandbox/NewsRouter';
import { HomeOutlined, UserOutlined, FileTextOutlined, AuditOutlined, EditOutlined, CalendarOutlined } from '@ant-design/icons';
const { Content } = Layout;

const menuList = [
    {
        key: '/home',
        icon: <HomeOutlined />,
        label: '首页'
    },
    {
        key: '/user-manage',
        icon: <UserOutlined />,
        label: '用户管理'
    },
    {
        key: '/case-manage',
        icon: <FileTextOutlined />,
        label: '案件管理'
    },
    {
        key: '/case-audit',
        icon: <AuditOutlined />,
        label: '案件审核'
    },
    {
        key: '/publish-manage',
        icon: <EditOutlined />,
        label: '信息管理'
    },
    {
        key: '/appointment-manage',
        icon: <CalendarOutlined />,
        label: '预约管理'
    }
];

export default function NewsSandBox() {
    NProgress.start()
    useEffect(() => {
        NProgress.done()
    })
    return (
        <Layout>
            <SideMenu></SideMenu>
            <Layout className="site-layout">
                <TopHeader></TopHeader>


                <Content
                    className="site-layout-background"
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        overflow: 'auto'
                    }}
                >
                    <NewsRouter></NewsRouter>
                </Content>
            </Layout>
        </Layout>
    )
}
