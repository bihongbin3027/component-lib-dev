你可以直接导入组件并使用它。这种情况下，只有导入的组件才会被打包。

### 函数组件引入方式

```bash
import { AffixBox } from 'hlyc-web-pack'

function Page() {
  return <AffixBox />;
}

export default Page
```

### 类组件引入方式

```bash
import React from 'react'
import { AffixBox } from 'hlyc-web-pack'

class Page extends React.Component {
  render() {
    return <AffixBox />;
  }
}

export default Page
```
