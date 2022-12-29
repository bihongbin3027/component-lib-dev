<p>useUpdateEffect 用法等同于 React.useEffect，但是会忽略首次执行，只在依赖更新时执行。</p>

#### API

```code
useUpdateEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList,
)
```

#### 基础用法

```js
import React, { useEffect, useState } from 'react';
import { useUpdateEffect } from 'ahooks';

const [count, setCount] = useState(0);
const [effectCount, setEffectCount] = useState(0);
const [updateEffectCount, setUpdateEffectCount] = useState(0);

useEffect(() => {
  setEffectCount((c) => c + 1);
}, [count]);

useUpdateEffect(() => {
  setUpdateEffectCount((c) => c + 1);
  return () => {
    // do something
  };
}, [count]);

<div>
  <p>effectCount: {effectCount}</p>
  <p>updateEffectCount: {updateEffectCount}</p>
  <p>
    <button type="button" onClick={() => setCount((c) => c + 1)}>
      reRender
    </button>
  </p>
</div>;
```
