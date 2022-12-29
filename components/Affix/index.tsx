/*
 * @Description 固钉
 * @Author bihongbin
 * @Date 2021-07-01 11:44:07
 * @LastEditors bihongbin
 * @LastEditTime 2022-08-19 11:41:18
 */
import React from 'react';
import { Affix } from 'antd';
import { AffixProps } from 'antd/es/affix';

type PropType = AffixProps & {
  targetId?: string;
};

/** 固钉，当内容区域比较长，需要滚动页面时，这部分内容对应的操作或者导航需要在滚动范围内始终展现 */
const AffixBox = (props: PropType) => {
  let formatProps = { ...props };
  let targetId = '';
  if (formatProps.targetId) {
    targetId = formatProps.targetId;
    delete formatProps.targetId;
  }

  return (
    <Affix
      target={() => {
        return document.getElementById(targetId || 'router-render') || window;
      }}
      {...formatProps}
    />
  );
};

export default React.memo(AffixBox);
