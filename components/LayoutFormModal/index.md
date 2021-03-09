```js
import React, { useState } from 'react';
import { Button } from 'antd';

const selectData = [
  {
    label: '张三',
    value: 0,
  },
  {
    label: '李四',
    value: 1,
  },
];

const [visible, setVisible] = useState(false);
const [data, setData] = useState([
  {
    componentName: 'Input',
    name: 'a',
    label: '输入框',
    placeholder: '请输入内容',
    rules: [{ required: true, message: '请输入内容' }], // 表单验证
  },
  {
    componentName: 'Select',
    name: 'b',
    label: '下拉框',
    placeholder: '请选择',
    selectData: selectData,
  },
  {
    componentName: 'AutoComplete',
    name: 'd',
    label: '多行输入（展开后可对选项进行搜索）',
    placeholder: '请选择',
    selectData: selectData,
  },
  {
    componentName: 'Multiple',
    name: 'e',
    label: '下拉框多选',
    placeholder: '请选择',
    selectData: selectData,
  },
  {
    componentName: 'RemoteSearch',
    name: 'f',
    label: '下拉框（远程搜索）',
    placeholder: '请选择',
    remoteConfig: {
      remoteApi: (val) => {
        console.log('触发ajax请求');
        return new Promise((resolve, reject) => {
          resolve(selectData);
        });
      },
    },
  },
  {
    componentName: 'DatePicker',
    name: 'g',
    label: '时间选择器',
    placeholder: '请选择时间',
  },
  {
    componentName: 'RangePicker',
    name: 'h',
    label: '时间范围选择器',
    placeholder: '请选择时间',
  },
  {
    componentName: 'Radio',
    name: 'i',
    label: '单选框',
    selectData: selectData,
  },
  {
    componentName: 'Checkbox',
    name: 'j',
    label: '多选框',
    selectData: selectData,
  },
  {
    label: '多个input值',
    componentName: 'Union',
    unionConfig: {
      unionItems: [
        {
          componentName: 'Input',
          name: 'saleRealMin',
          placeholder: '销量',
        },
        {
          componentName: 'Input',
          name: 'saleRealMax',
          placeholder: '销量',
        },
      ],
    },
  },
  {
    componentName: 'TextArea',
    name: 'c',
    label: '多行输入',
    placeholder: '请输入内容',
    rows: 3,
    colProps: { span: 24 },
  },
]);

const visibleModal = (data) => {
  setVisible(data);
};

<>
  <Button type="primary" onClick={() => visibleModal(true)}>
    打开弹窗表单
  </Button>
  <LayoutFormModal
    title="弹窗表单"
    visible={visible}
    formList={data}
    submitApi={() => {
      // 模拟ajax请求
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve({
            code: 1,
          });
        }, 1000);
      });
    }}
    onCancel={() => {
      visibleModal(false);
    }}
  />
</>;
```
