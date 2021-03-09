```js
import React from 'react';
import { Row } from 'antd';

const data = [
  {
    name: '张三',
    value: 0,
  },
  {
    name: '李四',
    value: 1,
  },
];

<>
  <Row align="middle">
    单选：
    <ButtonGroup
      data={data}
      checkType="radio"
      onChange={(data) => {
        console.log(data);
      }}
    />
  </Row>
  <pre />
  <Row align="middle">
    多选：
    <ButtonGroup
      data={data}
      checkType="checkbox"
      onChange={(data) => {
        console.log(data);
      }}
    />
  </Row>
  <pre />
  <Row align="middle">
    带删除功能：
    <ButtonGroup
      deleteOpen
      data={data}
      onChange={(data) => {
        console.log(data);
      }}
    />
  </Row>
</>;
```
