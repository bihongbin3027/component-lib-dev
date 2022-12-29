<p>持久化 function 的 Hook，理论上，可以使用 useMemoizedFn 完全代替 useCallback。</p>
<p>在某些场景中，我们需要使用 useCallback 来记住一个函数，但是在第二个参数 deps 变化时，会重新生成函数，导致函数地址变化。</p>

```code
const [state, setState] = useState('');

// 在 state 变化时，func 地址会变化
const func = useCallback(() => {
  console.log(state);
}, [state]);
```

<p>使用 useMemoizedFn，可以省略第二个参数 deps，同时保证函数地址永远不会变化。</p>

```code
const [state, setState] = useState('');

// func 地址永远不会变化
const func = useMemoizedFn(() => {
  console.log(state);
});
```

#### API

```code
const fn = useMemoizedFn<T>(fn: T): T;;
```

#### 基础用法

```js
import React, { useState, useCallback } from 'react';
import { message } from 'antd';
import { useMemoizedFn } from 'ahooks';

const [count, setCount] = useState(0);

const callbackFn = useCallback(() => {
  message.info(`Current count is ${count}`);
}, [count]);

const memoizedFn = useMemoizedFn(() => {
  message.info(`Current count is ${count}`);
});

<>
  <p>count: {count}</p>
  <button
    type="button"
    onClick={() => {
      setCount((c) => c + 1);
    }}
  >
    Add Count
  </button>
  <div style={{ marginTop: 16 }}>
    <button type="button" onClick={callbackFn}>
      call callbackFn
    </button>
    <button type="button" onClick={memoizedFn} style={{ marginLeft: 8 }}>
      call memoizedFn
    </button>
  </div>
</>;
```

#### 性能提升

```js
import React, { useCallback, useRef, useState } from 'react';
const ExpensiveTree = React.memo(({ showCount }) => {
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;

  return (
    <div>
      <p>Render Count: {renderCountRef.current}</p>
      <button type="button" onClick={showCount}>
        showParentCount
      </button>
    </div>
  );
});

import { useMemoizedFn } from 'ahooks';
import { message } from 'antd';

const [count, setCount] = useState(0);

const callbackFn = useCallback(() => {
  message.info(`Current count is ${count}`);
}, [count]);

const memoizedFn = useMemoizedFn(() => {
  message.info(`Current count is ${count}`);
});

<>
  <p>count: {count}</p>
  <button
    type="button"
    onClick={() => {
      setCount((c) => c + 1);
    }}
  >
    添加计数
  </button>

  <p>你可以单击按钮来查看子任务的数量</p>

  <div style={{ marginTop: 32 }}>
    <h3>组件与useCallback函数:</h3>
    <ExpensiveTree showCount={callbackFn} />
  </div>

  <div style={{ marginTop: 32 }}>
    <h3>组件与useMemoizedFn函数</h3>
    <ExpensiveTree showCount={memoizedFn} />
  </div>
</>;
```
