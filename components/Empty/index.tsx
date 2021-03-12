import React from 'react';
import { Empty, Row } from 'antd';
import { EmptyProps } from 'antd/lib/empty';
import ConfigProvider from '../ConfigProvider';
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
    <ConfigProvider>
      <Row
        className="empty-wrap"
        style={{
          minHeight: props && props.outerHeight ? props.outerHeight : 400,
        }}
        align="middle"
        justify="center"
      >
        <Empty {...params} />
      </Row>
    </ConfigProvider>
  );
}

export default React.memo(EmptyResult);
