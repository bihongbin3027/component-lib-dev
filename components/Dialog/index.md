```js
import { useState } from 'react';
import { Button } from 'antd';

const [state, setState] = useState(false);

<>
  <Button
    onClick={() => {
      setState(!state);
    }}
  >
    打开弹窗
  </Button>
  <Dialog
    visible={state}
    title="弹窗"
    onCancel={() => {
      setState(false);
    }}
    onOk={() => {
      setState(false);
    }}
  >
    弹窗内容。。。
  </Dialog>
</>;
```
