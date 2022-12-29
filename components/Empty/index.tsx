/*
 * @Description 空组件
 * @Author bihongbin
 * @Date 2021-09-03 10:02:49
 * @LastEditors bihongbin
 * @LastEditTime 2022-08-19 12:00:54
 */
import React from 'react';
import { Empty as Em, Row } from 'antd';
import { EmptyProps } from 'antd/lib/empty';
import './index.less';

/** 456789 */
type Props = EmptyProps & {
  /** 区域高度 */
  outerHeight?: number;
};

/** 控组件 */
function Empty(props?: Props) {
  const params: Props = { ...props };
  delete params.outerHeight;

  return (
    <Row
      className="empty-wrap"
      style={{
        minHeight: props && props.outerHeight ? props.outerHeight : 400,
      }}
      align="middle"
      justify="center"
    >
      <Em description="暂无数据" {...params} />
    </Row>
  );
}

/** 控组件 */
export default React.memo(Empty);
