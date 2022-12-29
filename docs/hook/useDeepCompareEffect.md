<p>用法与 React.useEffect 一致，但 deps 通过 lodash isEqual 进行深比较。</p>

#### API

```code
useDeepCompareEffect(
  effect: React.EffectCallback,
  deps: React.DependencyList
);
```

#### 基础用法

```js
import { useDeepCompareEffect } from 'ahooks';
import React, { useEffect, useState, useRef } from 'react';

const [count, setCount] = useState(0);
const effectCountRef = useRef(0);
const deepCompareCountRef = useRef(0);

useEffect(() => {
  effectCountRef.current += 1;
}, [{}]);

useDeepCompareEffect(() => {
  deepCompareCountRef.current += 1;
  return () => {
    // do something
  };
}, [{}]);

<div>
  <p>effectCount: {effectCountRef.current}</p>
  <p>deepCompareCount: {deepCompareCountRef.current}</p>
  <p>
    <button type="button" onClick={() => setCount((c) => c + 1)}>
      reRender
    </button>
  </p>
</div>;
```
