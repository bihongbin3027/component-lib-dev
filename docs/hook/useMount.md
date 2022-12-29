<p>只在组件初始化时执行的 Hook。</p>

#### API

```code
useMount(fn: () => void);
```

#### 基础用法

```js
import { useMount, useBoolean } from 'ahooks';
import { message } from 'antd';
import React from 'react';

const MyComponent = () => {
  useMount(() => {
    message.info('mount');
  });

  return <div>Hello World</div>;
};
const [state, { toggle }] = useBoolean(false);

<>
  <button type="button" onClick={toggle}>
    {state ? 'unmount' : 'mount'}
  </button>
  {state && <MyComponent />}
</>;
```
