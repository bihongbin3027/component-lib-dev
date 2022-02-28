```js
import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Button, Space, Typography, Divider, Input } from 'antd';
import { FormOutlined } from '@ant-design/icons';

const oneTableRef = useRef(null);
const twoTableRef = useRef(null);
const [count, setCount] = useState(0);
const [data, setData] = useState([]);

// 规格项价格表格头一键设置值
const getColumnSearchProps = (dataIndex) => ({
  filterIcon: () => <FormOutlined />,
  filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
    <div style={{ padding: 8 }}>
      <Space>
        <Input
          size="small"
          type="number"
          placeholder="统一设置的值"
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          style={{ width: '108px' }}
        />
        <Button
          type="primary"
          size="small"
          onClick={() => {
            confirm();
            setData(
              data.map((item) => {
                let val = Number(selectedKeys[0]);
                item[dataIndex] = val ? val : '';
                return item;
              }),
            );
          }}
        >
          确定
        </Button>
      </Space>
    </div>
  ),
});

const loadList = () => {
  if (twoTableRef.current) {
    twoTableRef.current.getTableList();
  }
};

useEffect(() => {
  let i = 0;
  let arr = [];
  while (i < 100) {
    i++;
    arr.push({
      id: i,
      a: '小明',
      b: '男',
      c: '15岁',
      d: '170cm',
      e: '60kg',
      f: '0',
      g: '2021-06-10',
      h: '1',
      ss: [
        { label: '小花', value: '1' },
        { label: '小海', value: '2' },
      ],
    });
  }
  setData(arr);
}, [state]);

<>
  <h3>静态表格</h3>
  <div onClick={() => setCount(count + 1)}>计数器：{count}</div>
  <GenerateTable
    ref={oneTableRef}
    extra={useMemo(
      () => ({
        columns: [
          {
            width: 85,
            title: '姓名',
            dataIndex: 'a',
            ellipsis: true,
            editable: true, // 打开可编辑功能
          },
          {
            width: 85,
            title: '性别',
            dataIndex: 'b',
            editable: (record) => {
              return record.id === 2;
            },
          },
          Object.assign(
            {
              width: 85,
              title: '年龄',
              dataIndex: 'c',
              editable: true, // 打开可编辑功能
            },
            getColumnSearchProps('c'),
          ),
          {
            width: 85,
            title: '身高',
            dataIndex: 'd',
            sorter: (prev, next) => {
              return parseInt(prev.b) - parseInt(next.b);
            },
          },
          {
            width: 85,
            title: '出生日期',
            dataIndex: 'g',
            ellipsis: true,
            editable: true,
            valueType: 'DatePicker',
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
            valueType: 'AutoComplete',
            valueEnum: [
              { label: '泡妞', value: '0' },
              { label: '学习', value: '1' },
            ],
            // 自定义渲染值(在原有的内容上增加新的结构)，childNode是原有的内容
            controlRender: (record, childNode) => {
              return (
                <div>
                  <span>左</span>
                  {childNode}
                  <span>右</span>
                </div>
              );
            },
          },
          {
            title: '暗恋对象',
            dataIndex: 'h',
            editable: true,
            valueType: 'RecordSelect',
            recordSelectField: 'ss',
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
        ],
        data: data,
        scroll: {
          y: 500,
        },
      }),
      [data],
    )}
  />
  <Button
    type="primary"
    onClick={() => {
      console.log(oneTableRef.current.getStaticDataList());
    }}
  >
    获取静态数据
  </Button>
  <pre />
  <pre />
  <h3>带api请求表格</h3>
  <Button type="primary" onClick={loadList}>
    加载数据
  </Button>
  <pre />
  <GenerateTable
    ref={twoTableRef}
    extra={useMemo(
      () => ({
        rowType: 'checkbox',
        columns: [
          {
            width: 100,
            title: 'Name',
            dataIndex: 'name',
            ellipsis: true,
          },
          {
            width: 100,
            title: '年龄',
            dataIndex: 'age',
            sorter: (prev, next) => {
              return prev.age - next.age;
            },
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
            title: 'Email',
            dataIndex: 'email',
          },
        ],
        apiMethod: (params) => {
          console.log(123);
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
                        name: 'Tita da Costa, Tita da Costa, Tita da Costa',
                        age: 15,
                        gender: 'female',
                        email: 'tita.dacosta@example.com',
                      },
                      {
                        id: 2,
                        name: 'Tita da Costa',
                        age: 2,
                        gender: 'female',
                        email: 'tita.dacosta@example.com',
                      },
                      {
                        id: 3,
                        name: 'Tita da Costa',
                        age: 99,
                        gender: 'female',
                        email: 'tita.dacosta@example.com',
                      },
                      {
                        id: 4,
                        name: 'Tita da Costa',
                        age: 53,
                        gender: 'female',
                        email: 'tita.dacosta@example.com',
                      },
                      {
                        id: 5,
                        name: 'Tita da Costa',
                        age: 18,
                        gender: 'female',
                        email: 'tita.dacosta@example.com',
                      },
                      {
                        id: 6,
                        name: 'Tita da Costa',
                        age: 12,
                        gender: 'female',
                        email: 'tita.dacosta@example.com',
                      },
                      {
                        id: 7,
                        name: 'Tita da Costa',
                        age: 66,
                        gender: 'female',
                        email: 'tita.dacosta@example.com',
                      },
                      {
                        id: 8,
                        name: 'Tita da Costa',
                        age: 87,
                        gender: 'female',
                        email: 'tita.dacosta@example.com',
                      },
                      {
                        id: 9,
                        name: 'Tita da Costa',
                        age: 92,
                        gender: 'female',
                        email: 'tita.dacosta@example.com',
                      },
                      {
                        id: 10,
                        name: 'Tita da Costa',
                        age: 95,
                        gender: 'female',
                        email: 'tita.dacosta@example.com',
                      },
                    ].map((item, index) => {
                      item.id = (params.page - 1) * params.size + index + 1;
                      return item;
                    }),
                    total: 1000,
                  },
                });
              });
          });
        },
      }),
      [],
    )}
  />
</>;
```
