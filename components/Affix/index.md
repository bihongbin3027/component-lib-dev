```js
import { Button, Row, Col } from 'antd';

<Row gutter={10}>
  <Col>
    <AffixBox offsetTop={0}>
      <Button>固定到顶部</Button>
    </AffixBox>
  </Col>
  <Col>
    <AffixBox offsetBottom={0}>
      <Button>固定到底部</Button>
    </AffixBox>
  </Col>
</Row>;
```
