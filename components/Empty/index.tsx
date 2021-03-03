import React from 'react';
import { Empty, Row } from 'antd';
import { EmptyProps } from 'antd/lib/empty';
import './index.less';

type Props = EmptyProps & {
  /** 区域高度 */
  outerHeight?: number;
};

/** 空状态，展示占位图 */
function EmptyResult(props?: Props) {
  const params: Props = { ...props };
  delete params.outerHeight;

  return (
    <Row
      className="empty-wrap"
      style={{
        minHeight: props && props.outerHeight ? props.outerHeight : 500,
      }}
      align="middle"
      justify="center"
    >
      <Empty {...params} />
    </Row>
  );
}

export default React.memo(EmptyResult);
