```js
import React, { useState } from 'react';
import { Button, Space } from 'antd';

const [visible, setVisible] = useState(false);
const [select, setSelect] = useState('');
const [searchFormList] = useState([
  {
    componentName: 'Input',
    name: 'name',
    label: '姓名',
    placeholder: '请输入姓名',
  },
]);
const [columns, setColumns] = useState({
  rowType: 'checkbox', // 多选或单选
  // 表格头
  list: [
    {
      title: '姓名',
      dataIndex: 'name',
    },
    {
      title: '性别',
      dataIndex: 'gender',
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
  ],
});
const [data] = useState([
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
]);

const openAjax = (params) => {
  // 模拟ajax请求
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        data: {
          content: [
            {
              id: 1,
              name: 'Tita da Costa1',
              gender: 'female',
              email: 'tita.dacosta@example.com',
            },
            {
              id: 2,
              name: 'Tita da Costa2',
              gender: 'female',
              email: 'tita.dacosta@example.com',
            },
            {
              id: 3,
              name: 'Tita da Costa3',
              gender: 'female',
              email: 'tita.dacosta@example.com',
            },
            {
              id: 4,
              name: 'Tita da Costa4',
              gender: 'female',
              email: 'tita.dacosta@example.com',
            },
            {
              id: 5,
              name: 'Tita da Costa5',
              gender: 'female',
              email: 'tita.dacosta@example.com',
            },
            {
              id: 6,
              name: 'Tita da Costa6',
              gender: 'female',
              email: 'tita.dacosta@example.com',
            },
            {
              id: 7,
              name: 'Tita da Costa7',
              gender: 'female',
              email: 'tita.dacosta@example.com',
            },
            {
              id: 8,
              name: 'Tita da Costa8',
              gender: 'female',
              email: 'tita.dacosta@example.com',
            },
            {
              id: 9,
              name: 'Tita da Costa9',
              gender: 'female',
              email: 'tita.dacosta@example.com',
            },
            {
              id: 10,
              name: 'Tita da Costa10',
              gender: 'female',
              email: 'tita.dacosta@example.com',
            },
          ].map((item, index) => {
            item.id = (params.page - 1) * params.size + index + 1;
            return item;
          }),
          total: 20,
        },
      });
    }, 1000);
  });
};

<>
  <div>已选择的数据：{select}</div>
  <pre />
  <Space size={10}>
    <Button type="primary" onClick={() => setVisible(true)}>
      打开弹窗
    </Button>
  </Space>
  <LayoutTableModal
    title="弹窗列表"
    width={800}
    visible={visible}
    searchFormList={searchFormList}
    tableColumnsList={columns}
    apiMethod={openAjax}
    autoGetList={true} // 打开自动查询
    rowProps={{ justify: 'space-between' }}
    openSelected={{
      visible: true,
      defaultValues: [{ id: 1, name: 'Tita da Costa1' }],
      fileName: 'name',
    }}
    onCancel={() => setVisible(false)}
    onConfirm={(data) => {
      setSelect(JSON.stringify(data));
      return Promise.resolve(true);
    }}
  />
</>;
```
