```js
import React, { useState } from 'react';
import { Button } from 'antd';

const [visible, setVisible] = useState(false);
const [data, setData] = useState([
  {
    id: 1,
    name: '张三',
    six: '男',
    age: 16,
    weight: '65kg',
    spec: '篮球',
  },
  {
    id: 2,
    name: '李四',
    six: '女',
    age: 18,
    weight: '45kg',
    spec: '羽毛球',
  },
]);
const [formList, setFormList] = useState([
  {
    componentName: 'Input',
    name: 'name',
    label: '姓名',
    placeholder: '请输入姓名',
  },
  {
    componentName: 'Input',
    name: 'six',
    label: '性别',
    placeholder: '请输入性别',
  },
  {
    componentName: 'Input',
    name: 'age',
    label: '年龄',
    placeholder: '请输入年龄',
  },
  {
    componentName: 'Input',
    name: 'weight',
    label: '体重',
    placeholder: '请输入体重',
  },
  {
    componentName: 'Input',
    name: 'spec',
    label: '兴趣爱好',
    placeholder: '请输入兴趣爱好',
  },
]);

<>
  <Button type="primary" onClick={() => setVisible(true)}>
    表单批量编辑
  </Button>
  <QuicklyProcessForms
    visible={visible}
    submitApi={() => {
      // 模拟ajax请求
      return new Promise((resolve, reject) => {
        resolve(true);
      });
    }}
    formList={formList}
    data={data}
    onCancel={() => setVisible(false)}
  />
</>;
```
