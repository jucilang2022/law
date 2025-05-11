import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Statistic, List, Typography, Tag, Divider, Spin, message, Button } from 'antd';
import {
    EnvironmentOutlined,
    PhoneOutlined,
    ClockCircleOutlined,
    TeamOutlined,
    SafetyCertificateOutlined,
    BankOutlined,
    GlobalOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
import './LegalMap.css';
import { useHistory } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

export default function LegalMap() {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [locationInfo, setLocationInfo] = useState(null);
    const history = useHistory();

    // 法律服务机构数据
    const legalServices = [
        {
            title: '长安区法律援助中心郭杜工作站',
            address: '中国陕西省西安市长安区综治中心内',
            phone: '029-82755855',
            hours: '周一至周五 9:00-18:00',
            description: '为郭杜街道及周边地区群众提供法律援助服务，包括法律咨询、代写法律文书、代理诉讼等'
        },
        {
            title: '陕西省西安市长安区公证处',
            address: '中国陕西省西安市长安区新华街212号',
            phone: '029-82733505',
            hours: '周一至周五 9:00-17:30',
            description: '提供民事、商事公证服务，包括合同公证、继承公证、委托公证等各类公证业务'
        },
        {
            title: '长安区工会职工纠纷人民调解委员会',
            address: '中国陕西省西安市长安区嘉华街',
            phone: '029-82766566',
            hours: '周一至周五 8:30-18:00',
            description: '专门处理劳动争议、工资纠纷等职工权益问题，提供免费调解服务'
        }
    ];

    // 西安市法律服务机构统计数据
    const legalStats = {
        aidCenters: 15,  // 西安市法律援助中心总数
        notaryOffices: 12,  // 西安市公证处总数
        mediationCommittees: 20  // 西安市调解委员会总数
    };

    // 初始化地图
    useEffect(() => {
        let mapInstance = null;
        let geolocationInstance = null;
        let script = null;

        const initMapInstance = () => {
            try {
                mapInstance = new window.AMap.Map('container', {
                    zoom: 15,
                    center: [108.940174, 34.341568], // 西安市中心
                    resizeEnable: true,
                    viewMode: '3D'
                });

                // 添加工具条和比例尺
                mapInstance.addControl(new window.AMap.ToolBar());
                mapInstance.addControl(new window.AMap.Scale());

                // 添加定位控件
                geolocationInstance = new window.AMap.Geolocation({
                    enableHighAccuracy: true,
                    timeout: 10000,
                    buttonPosition: 'RB',
                    buttonOffset: new window.AMap.Pixel(10, 20),
                    zoomToAccuracy: true,
                    GeoLocationFirst: true
                });

                mapInstance.addControl(geolocationInstance);

                // 获取当前位置
                geolocationInstance.getCurrentPosition((status, result) => {
                    if (status === 'complete') {
                        const { position, formattedAddress } = result;
                        setUserLocation([position.lng, position.lat]);
                        setLocationInfo({
                            address: formattedAddress,
                            lng: position.lng,
                            lat: position.lat
                        });
                        mapInstance.setCenter([position.lng, position.lat]);

                        // 添加当前位置标记
                        const marker = new window.AMap.Marker({
                            position: [position.lng, position.lat],
                            title: '当前位置',
                            map: mapInstance,
                            animation: 'AMAP_ANIMATION_DROP'
                        });

                        // 添加信息窗体
                        const infoWindow = new window.AMap.InfoWindow({
                            content: `
                                <div style="padding: 8px;">
                                    <h4 style="margin: 0 0 8px;">当前位置</h4>
                                    <p style="margin: 4px 0;">${formattedAddress}</p>
                                </div>
                            `,
                            offset: new window.AMap.Pixel(0, -30)
                        });

                        marker.on('click', () => {
                            infoWindow.open(mapInstance, marker.getPosition());
                        });
                    } else {
                        message.warning('定位失败，将使用默认位置');
                        const defaultLocation = [108.940174, 34.341568];
                        setUserLocation(defaultLocation);
                        setLocationInfo({
                            address: '西安市长安区西长安街',
                            lng: defaultLocation[0],
                            lat: defaultLocation[1]
                        });
                    }
                });

                setMap(mapInstance);
                setLoading(false);
            } catch (error) {
                console.error('地图初始化错误:', error);
                message.error('地图初始化失败，请刷新页面重试');
                setLoading(false);
            }
        };

        // 加载地图脚本
        script = document.createElement('script');
        script.src = `https://webapi.amap.com/maps?v=2.0&key=60430be3babfed1558a7a94d759ce6a9&plugin=AMap.Geolocation,AMap.ToolBar,AMap.Scale`;
        script.async = true;
        script.onload = () => {
            if (window.AMap) {
                window.AMap.plugin(['AMap.Geolocation', 'AMap.ToolBar', 'AMap.Scale'], () => {
                    initMapInstance();
                });
            }
        };
        script.onerror = () => {
            message.error('地图加载失败，请检查网络连接');
            setLoading(false);
        };
        document.head.appendChild(script);

        // 清理函数
        return () => {
            // 清理地图实例
            if (mapInstance) {
                try {
                    mapInstance.clearMap();
                    mapInstance.destroy();
                } catch (error) {
                    console.error('清理地图实例时出错:', error);
                }
            }

            // 清理定位实例
            if (geolocationInstance) {
                try {
                    geolocationInstance.destroy();
                } catch (error) {
                    console.error('清理定位实例时出错:', error);
                }
            }

            // 清理脚本
            if (script && script.parentNode) {
                document.head.removeChild(script);
            }

            // 清理状态
            setMap(null);
            setUserLocation(null);
            setLocationInfo(null);
        };
    }, []); // 空依赖数组，只在组件挂载和卸载时执行

    // 渲染法律服务机构列表
    const renderLegalServices = () => (
        <div className="legal-services-section">
            <Title level={4}>2km内法律服务机构</Title>
            <List
                itemLayout="vertical"
                dataSource={legalServices}
                renderItem={item => (
                    <List.Item>
                        <Card className="service-card">
                            <div className="service-header">
                                <Title level={5}>{item.title}</Title>
                                <Tag color="blue">法律服务机构</Tag>
                            </div>
                            <div className="service-content">
                                <p>
                                    <EnvironmentOutlined /> {item.address}
                                </p>
                                <p>
                                    <PhoneOutlined /> {item.phone}
                                </p>
                                <p>
                                    <ClockCircleOutlined /> {item.hours}
                                </p>
                                <Paragraph type="secondary">{item.description}</Paragraph>
                            </div>
                        </Card>
                    </List.Item>
                )}
            />
        </div>
    );

    // 渲染法律资源统计
    const renderLegalStats = () => (
        <div className="legal-stats-section">
            <Row gutter={[16, 16]}>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="法律援助中心"
                            value={legalStats.aidCenters}
                            prefix={<SafetyCertificateOutlined />}
                            suffix="家"
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="公证处"
                            value={legalStats.notaryOffices}
                            prefix={<BankOutlined />}
                            suffix="家"
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="调解委员会"
                            value={legalStats.mediationCommittees}
                            prefix={<TeamOutlined />}
                            suffix="家"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );

    return (
        <div className="legal-map-container">
            <Row gutter={[24, 24]}>
                <Col span={16}>
                    <Card className="map-card">
                        <div className="map-header">
                            <Button
                                type="text"
                                onClick={() => history.push('/users')}
                                className="back-button"
                            >
                                -返回
                            </Button>
                            <Title level={4}>法律地图</Title>
                            {locationInfo && (
                                <div className="location-info">
                                    <EnvironmentOutlined />
                                    <Text>{locationInfo.address}</Text>
                                </div>
                            )}
                        </div>
                        <div className="map-content">
                            <div id="container" className="map-container">
                                {loading && (
                                    <div className="map-loading">
                                        <Spin tip="地图加载中..." />
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card className="info-card">
                        <div className="info-section">
                            <Title level={4}>当前城市法律资源</Title>
                            {renderLegalStats()}
                            <Divider />
                            {renderLegalServices()}
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
} 