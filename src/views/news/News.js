import React, { useEffect, useState } from 'react'
import axios from 'axios'
import _ from 'lodash'
import { Card, Col, Row, List } from 'antd';
// const { Meta } = Card;
import './News.css'
export default function News() {
    const [list, setlist] = useState([])
    useEffect(() => {
        axios.get("/news?publishState=2&_expand=category").then(res => {
            // console.log(Object.entries(_.groupBy(res.data, item => item.category.title)))
            setlist(Object.entries(_.groupBy(res.data, item => item.category.title)))
        })
    }, [])
    return (
        <div style={{
            width: '98%',
            margin: "0 auto",
            // backgroundImage: `url("https://img1.baidu.com/it/u=3304932178,162810209&fm=253&fmt=auto&app=138&f=JPEG?w=1422&h=800")`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover'
        }}>
            <div style={{ height: '25px', backgroundColor: 'rgb(0, 129, 129)', textAlign: 'center', color: "#ffffff" }}>环球新闻网</div>

            <Row gutter={[10, 10]}>
                {
                    list.map(item =>
                        <Col span={8} key={item[0]}>
                            <Card title={item[0]} bordered={true} hoverable>
                                <List
                                    size="small"
                                    bordered
                                    dataSource={item[1]}
                                    pagination={{
                                        pageSize: 3
                                    }}
                                    renderItem={(data) => <List.Item><a href={`#/detail/${data.id}`}>{data.title}</a></List.Item>}
                                />
                            </Card>
                        </Col>
                    )
                }
            </Row>
        </div >
    )
}
