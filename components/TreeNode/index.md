```js
import { Typography } from 'antd';

const { Link } = Typography;

const treeData = [
  {
    id: 1,
    title: 'parent 1',
    key: '0-0',
    processOpen: true,
    children: [
      {
        id: 2,
        title: 'parent 1-0',
        key: '0-0-0',
        status: 1,
        children: [
          {
            id: 3,
            title: 'leaf',
            key: '0-0-0-0',
            status: 1,
          },
          {
            id: 4,
            title: 'leaf',
            key: '0-0-0-1',
            status: 2,
          },
        ],
      },
      {
        id: 5,
        title: 'parent 1-1',
        key: '0-0-1',
        status: 1,
        children: [
          {
            id: 6,
            title: 'sss',
            key: '0-0-1-0',
            status: 2,
          },
        ],
      },
    ],
  },
];

<TreeNode
  processOpen
  data={treeData}
  customAction={(item) => {
    return <Link>删除</Link>;
  }}
  // 启用api
  lockApi={(id) => {
    console.log('id', id);
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }}
  // 挂起api
  unLockApi={(id) => {
    console.log('id', id);
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }}
  // 删除api
  deleteApi={(id) => {
    console.log('id', id);
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }}
/>;
```
