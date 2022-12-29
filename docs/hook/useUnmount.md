<p>在组件卸载（unmount）时执行的 Hook。</p>

#### API

```code
useUnmount(fn: () => void);
```

#### 基础用法

```js
import { useBoolean, useUnmount } from 'ahooks';
import { message } from 'antd';
import React from 'react';

const MyComponent = () => {
  useUnmount(() => {
    message.info('unmount');
  });

  return <p>Hello World!</p>;
};

const [state, { toggle }] = useBoolean(true);

<>
  <button type="button" onClick={toggle}>
    {state ? 'unmount' : 'mount'}
  </button>
  {state && <MyComponent />}
</>;
```
