```js
import React, { useState } from 'react';
import { Button } from 'antd';

const [visible, setVisible] = useState(false);
const [name, setName] = useState('');

<>
  <div>
    <i className={`iconfont ${name}`} style={{ fontSize: '18px' }} />
  </div>
  <Button type="primary" onClick={() => setVisible(true)}>
    选择图标
  </Button>
  <IconSelectionModal
    visible={visible}
    onConfirm={(data) => {
      setVisible(false);
      setName(data);
    }}
    onCancel={() => setVisible(false)}
  />
</>;
```
