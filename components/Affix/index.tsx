/*
 * @Description 固钉
 * @Author bihongbin
 * @Date 2021-07-01 11:44:07
 * @LastEditors bihongbin
 * @LastEditTime 2021-08-26 10:47:05
 */
import React from 'react';
import { Affix } from 'antd';
import { AffixProps } from 'antd/es/affix';

type PropType = AffixProps & {
  targetId?: string;
};

/** 固钉 */
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
