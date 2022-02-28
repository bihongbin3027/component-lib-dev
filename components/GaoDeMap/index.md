```js
import React, { useRef } from 'react';
import { Button } from 'antd';

const gaoDeMapRef = useRef(null);

<>
  <Button
    type="primary"
    onClick={() => {
      gaoDeMapRef.current.setMapCenter([114.0716395569761, 22.627254134494013]);
    }}
  >
    设置经纬度
  </Button>
  <pre />
  <GaoDeMap
    ref={gaoDeMapRef}
    onChange={(data) => {
      console.log('data', data);
    }}
  />
</>;
```
