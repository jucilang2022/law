import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Descriptions, PageHeader } from 'antd';
import { HeartTwoTone } from "@ant-design/icons"
import moment from 'moment';

export default function Detail(props) {

    const [newsInfo, setnewsInfo] = useState(null)

    useEffect(() => {
        axios.get(`/news/${props.match.params.id}?_expand=category&_expand=role`)
            .then(res => {
                setnewsInfo({
                    ...res.data,
                    view: res.data.view + 1
                });
                return res.data;
            }).then(res => {
                axios.patch(`/news/${props.match.params.id}`, {
                    view: res.view + 1
                })
            })
    }, [props.match.params.id]);
    const handleStar = () => {
        setnewsInfo({
            ...newsInfo,
            star: newsInfo.star + 1
        });
        axios.patch(`/news/${props.match.params.id}`, {
            star: newsInfo.star + 1
        })
    }
    return (
        <div>
            {
                newsInfo && <div>
                    <div style={{ height: '25px', backgroundColor: 'rgb(0, 129, 129)', textAlign: 'center', color: "#ffffff" }}>智能化在线法律援助平台</div>
                    <PageHeader
                        className="site-page-header-responsive"
                        onBack={() => window.history.back()}
                        title={newsInfo.title}
                        subTitle={<div>
                            {newsInfo.category.title}
                            <HeartTwoTone twoToneColor="#eb2f96" onClick={() => handleStar()} />
                        </div>}

                    >
                        <Descriptions size="small" column={3}>
                            <Descriptions.Item label="创建者">{newsInfo.author}</Descriptions.Item>
                            <Descriptions.Item label="发布时间">{newsInfo.publishTime ? moment(newsInfo.publishTime).format('YYYY/MM/DD HH:mm:ss') : '-'}</Descriptions.Item>
                            <Descriptions.Item label="擅长领域">{newsInfo.region}</Descriptions.Item>
                            <Descriptions.Item label="访问数量"><b style={{ color: 'green' }}>{newsInfo.view}</b></Descriptions.Item>
                            <Descriptions.Item label="点赞数量"><b style={{ color: 'green' }}>{newsInfo.star}</b></Descriptions.Item>
                            <Descriptions.Item label="评论数量"><b style={{ color: 'green' }}>0</b></Descriptions.Item>
                        </Descriptions>
                    </PageHeader>
                    <div dangerouslySetInnerHTML={{
                        __html: newsInfo.content
                    }} style={{
                        margin: '0 24px',
                        border: '1px solid gray'
                    }}>
                    </div>
                </div>
            }
        </div>
    )
}
