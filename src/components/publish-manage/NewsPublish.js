import React from 'react'
import { Table } from 'antd'
export default function NewsPublish(props) {
    const columns = [
        {
            title: '案件名称',
            dataIndex: 'title',
            render: (title, item) => {
                return <b><a href={`#/news-manage/preview/${item.id}`}>{title}</a></b>
            }
        },
        {
            title: '作者',
            dataIndex: 'author',
        },
        {
            title: '案件分类',
            dataIndex: 'category',
            render: (category) => {
                return <div>{category.title}</div>
            }
        },
        {
            title: '操作',
            render: (item) => {
                return <div>
                    {props.button(item.id)}
                </div>
            }
        }
    ];

    return (
        <div>
            <Table dataSource={props.dataSource} columns={columns} pagination={{
                pageSize: 5
            }}
                rowKey={item => item.id}
            />
        </div>
    )
}
