```js
import { Button, Row, Col } from 'antd';

<Row gutter={10}>
  <Col>
    <Affix offsetTop={0}>
      <Button>固定到顶部</Button>
    </Affix>
  </Col>
  <Col>
    <Affix offsetBottom={0}>
      <Button>固定到底部</Button>
    </Affix>
  </Col>
</Row>;
```
