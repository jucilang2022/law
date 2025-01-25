import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Descriptions, PageHeader } from 'antd';
import moment from 'moment';

export default function NewsPreview(props) {

    const [newsInfo, setnewsInfo] = useState(null)

    useEffect(() => {
        axios.get(`/news/${props.match.params.id}?_expand=category&_expand=role`)
            .then(res => {
                setnewsInfo(res.data);
            })
    }, [props.match.params.id]);

    const auditList = ["未审核", "审核中", "已通过", "未通过"]
    const publishList = ["未发布", "待发布", "已发布", "已下线"]

    const colorList = ['#388af4', 'orange', 'green', 'red']

    return (
        <div>
            {
                newsInfo && <div>

                    <PageHeader
                        className="site-page-header-responsive"
                        onBack={() => window.history.back()}
                        title={newsInfo.title}
                        subTitle={newsInfo.category.title}
                    >
                        <Descriptions size="small" column={3}>
                            <Descriptions.Item label="创建者">{newsInfo.author}</Descriptions.Item>
                            <Descriptions.Item label="创建时间">{moment(newsInfo.createTime).format('YYYY/MM/DD HH:mm:ss')}</Descriptions.Item>
                            <Descriptions.Item label="发布时间">{newsInfo.publishTime ? moment(newsInfo.publishTime).format('YYYY/MM/DD HH:mm:ss') : '-'}</Descriptions.Item>
                            <Descriptions.Item label="区域">{newsInfo.region}</Descriptions.Item>
                            <Descriptions.Item label="审核状态"><b style={{ color: colorList[newsInfo.auditState] }}>{auditList[newsInfo.auditState]}</b></Descriptions.Item>
                            <Descriptions.Item label="发布状态"><b style={{ color: colorList[newsInfo.publishState] }}>{publishList[newsInfo.publishState]}</b></Descriptions.Item>
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
