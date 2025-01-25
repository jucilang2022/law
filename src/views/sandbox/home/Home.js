import { Col, Row, List, Avatar, Card, Drawer } from 'antd';
import React, { useEffect, useState, useRef } from 'react';
import { EditOutlined, EllipsisOutlined, FullscreenOutlined } from '@ant-design/icons';
import axios from 'axios';
import * as Echarts from 'echarts';
import _ from 'lodash';

const { Meta } = Card;

export default function Home() {
    const [viewList, setViewList] = useState([]);
    const [starList, setStarList] = useState([]);
    const [allList, setAllList] = useState([]);
    const [visible, setVisible] = useState(false);
    const [pieChart, setPieChart] = useState(null);
    const barRef = useRef();
    const pieRef = useRef();

    const { username, region, role: { roleName } } = JSON.parse(localStorage.getItem('token'));

    useEffect(() => {
        axios.get("/news?publishState=2&_expand=category&_sort=view&_order=desc&_limit=7").then(res => {
            setViewList(res.data);
        });
    }, []);

    useEffect(() => {
        axios.get("/news?publishState=2&_expand=category&_sort=star&_order=desc&_limit=7").then(res => {
            setStarList(res.data);
        });
    }, []);

    useEffect(() => {
        axios.get("/news?publishState=2&_expand=category").then(res => {
            renderBarView(_.groupBy(res.data, item => item.category.title));
            setAllList(res.data);
        });

        return () => {
            window.onresize = null;
        };
    }, []);

    const renderBarView = (obj) => {
        var myChart = Echarts.init(barRef.current);

        var option = {
            title: {
                text: '新闻分类图示'
            },
            tooltip: {},
            legend: {
                data: ['数量']
            },
            xAxis: {
                data: Object.keys(obj),
                axisLabel: {
                    rotate: "45",
                    interval: 0
                }
            },
            yAxis: {
                minInterval: 1
            },
            series: [
                {
                    name: '数量',
                    type: 'bar',
                    data: Object.values(obj).map(item => item.length)
                }
            ]
        };

        myChart.setOption(option);

        window.onresize = () => {
            myChart.resize();
        };
    };

    useEffect(() => {
        const renderPieView = () => {
            var currentList = allList.filter(item => item.author === username);
            var groupObj = _.groupBy(currentList, item => item.category.title);

            var list = [];
            for (var i in groupObj) {
                list.push({
                    name: i,
                    value: groupObj[i].length
                });
            }

            var myChart;
            if (!pieChart) {
                myChart = Echarts.init(pieRef.current);
                setPieChart(myChart);
            } else {
                myChart = pieChart;
            }
            var option;

            option = {
                title: {
                    text: '当前用户发布新闻类图示',
                    subtext: '饼状图',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'item'
                },
                legend: {
                    orient: 'vertical',
                    left: 'left'
                },
                series: [
                    {
                        name: '发布数量',
                        type: 'pie',
                        radius: '50%',
                        data: list,
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            };

            option && myChart.setOption(option);
        };

        if (visible) {
            renderPieView();
        }
    }, [visible, allList, username, pieChart, pieRef]);

    return (
        <div className="site-card-wrapper">
            <Row gutter={16}>
                <Col span={8}>
                    <Card title="用户最常浏览" bordered={true}>
                        <List
                            size="small"
                            dataSource={viewList}
                            renderItem={(item) => <List.Item><a href={`#/news-manage/preview/${item.id}`}>{item.title}</a></List.Item>}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title="用户最多点赞" bordered={true}>
                        <List
                            size="small"
                            dataSource={starList}
                            renderItem={(item) => <List.Item><a href={`#/news-manage/preview/${item.id}`}>{item.title}</a></List.Item>}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card
                        cover={
                            <img
                                alt="example"
                                src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
                            />
                        }
                        actions={[
                            <FullscreenOutlined key="setting" onClick={() => {
                                setVisible(true);
                            }} />,
                            <EditOutlined key="edit" />,
                            <EllipsisOutlined key="ellipsis" />,
                        ]}
                    >
                        <Meta
                            avatar={<Avatar src="https://img0.baidu.com/it/u=577272889,2607438384&fm=253&fmt=auto&app=138&f=PNG?w=285&h=285" />}
                            title={username}
                            description={
                                <div>
                                    <b>{region ? region : '全球'}</b>
                                    <span style={{ paddingLeft: '30px' }}>{roleName}</span>
                                </div>
                            }
                        />
                    </Card>
                </Col>
            </Row>
            <Drawer width="500px" title="个人新闻分类" placement="right" closable={true} onClose={() => { setVisible(false) }} visible={visible}>
                <div ref={pieRef} style={{ width: "100%", height: "400px", marginTop: "30px" }}></div>
            </Drawer>
            <div ref={barRef} style={{ width: "100%", height: "400px", marginTop: "30px" }}></div>
        </div>
    );
}