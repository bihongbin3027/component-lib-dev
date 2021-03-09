```js
import React, { useRef } from 'react';
import axios from 'axios';
import { Button, Space, Typography, Divider } from 'antd';

const tableRef = useRef(null);

const data = [
  {
    id: 1,
    a: '小明',
    b: '男',
    c: '15岁',
    d: '170cm',
    e: '60kg',
    f: '泡妞',
  },
];

const loadList = () => {
  if (tableRef.current) {
    tableRef.current.getTableList();
  }
};

<>
  <h3>静态表格</h3>
  <GenerateTable
    columns={[
      {
        width: 85,
        title: '姓名',
        dataIndex: 'a',
        editable: true, // 打开可编辑功能
      },
      {
        width: 85,
        title: '性别',
        dataIndex: 'b',
      },
      {
        width: 85,
        title: '年龄',
        dataIndex: 'c',
      },
      {
        width: 85,
        title: '身高',
        dataIndex: 'd',
      },
      {
        width: 85,
        title: '体重',
        dataIndex: 'e',
      },
      {
        width: 85,
        title: '个人爱好',
        dataIndex: 'f',
      },
      {
        width: 100,
        title: '操作',
        fixed: 'right',
        render: (text, record) => {
          return (
            <Space>
              <Typography.Link>编辑</Typography.Link>
            </Space>
          );
        },
      },
    ]}
    data={data}
  />
  <pre />
  <pre />
  <h3>带api请求表格</h3>
  <Button type="primary" onClick={loadList}>
    加载数据
  </Button>
  <pre />
  <GenerateTable
    ref={tableRef}
    rowType="checkbox"
    columns={[
      {
        width: 200,
        title: 'Name',
        dataIndex: 'name',
      },
      {
        width: 200,
        title: 'Gender',
        dataIndex: 'gender',
        filters: [
          { text: 'Male', value: 'male' },
          { text: 'Female', value: 'female' },
        ],
      },
      {
        width: 200,
        title: 'Email',
        dataIndex: 'email',
      },
    ]}
    apiMethod={(params) => {
      return new Promise((resolve) => {
        axios
          .get('https://randomuser.me/api', {
            params,
          })
          .then(() => {
            resolve({
              data: {
                content: [
                  {
                    id: 1,
                    name: 'Tita da Costa',
                    gender: 'female',
                    email: 'tita.dacosta@example.com',
                  },
                  {
                    id: 2,
                    name: 'Tita da Costa',
                    gender: 'female',
                    email: 'tita.dacosta@example.com',
                  },
                  {
                    id: 3,
                    name: 'Tita da Costa',
                    gender: 'female',
                    email: 'tita.dacosta@example.com',
                  },
                  {
                    id: 4,
                    name: 'Tita da Costa',
                    gender: 'female',
                    email: 'tita.dacosta@example.com',
                  },
                  {
                    id: 5,
                    name: 'Tita da Costa',
                    gender: 'female',
                    email: 'tita.dacosta@example.com',
                  },
                  {
                    id: 6,
                    name: 'Tita da Costa',
                    gender: 'female',
                    email: 'tita.dacosta@example.com',
                  },
                  {
                    id: 7,
                    name: 'Tita da Costa',
                    gender: 'female',
                    email: 'tita.dacosta@example.com',
                  },
                  {
                    id: 8,
                    name: 'Tita da Costa',
                    gender: 'female',
                    email: 'tita.dacosta@example.com',
                  },
                  {
                    id: 9,
                    name: 'Tita da Costa',
                    gender: 'female',
                    email: 'tita.dacosta@example.com',
                  },
                  {
                    id: 10,
                    name: 'Tita da Costa',
                    gender: 'female',
                    email: 'tita.dacosta@example.com',
                  },
                ],
                total: 20,
              },
            });
          });
      });
    }}
  />
</>;
```
