/*
 * @Description 按钮组
 * @Author bihongbin
 * @Date 2021-03-01 14:22:57
 * @LastEditors bihongbin
 * @LastEditTime 2021-03-30 17:23:27
 */

import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import { Row, Col } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import useSetState from '../unrelated/hooks/useSetState';
import './index.less';

export interface ButtonGroupListType {
  name: string;
  value: string | number;
  selected?: boolean;
  disabled?: boolean;
  [key: string]: any;
}

export interface ButtonGroupTypeProps {
  /** 按钮组数据 */
  data: ButtonGroupListType[];
  className?: string;
  /** button的className */
  buttonClassName?: string;
  /** 按钮大小 */
  size?: 'large' | 'middle' | 'small';
  /** 单选和多选 */
  checkType?: 'checkbox' | 'radio';
  /** 是否打开删除功能 */
  deleteOpen?: boolean;
  /** 按钮删除和选中的回调 */
  onChange?: (data: ButtonGroupListType[]) => void;
}

export interface ButtonGroupCallType {
  getButtonGroupSelected: () => ButtonGroupListType[];
}

interface StateType {
  type: ButtonGroupTypeProps['checkType'];
  deleteOpen: boolean;
  data: ButtonGroupListType[];
}

const baseStr = 'button-group';

/** 按钮组，包含组件单选、多选和按钮组删除功能 */
function ButtonGroup(props: ButtonGroupTypeProps, ref: any) {
  const [state, setState] = useSetState<StateType>({
    type: 'checkbox', // 选择类型（单选和多选）
    deleteOpen: false, // 是否开启删除功能
    data: [], // 按钮数据
  });

  /**
   * @Description 渲染按钮样式
   * @Author bihongbin
   * @Date 2021-03-01 14:48:43
   */
  const buttonClassName = (item: ButtonGroupListType) => {
    let str = baseStr;
    if (props.buttonClassName) {
      str = `${str} ${props.buttonClassName}`;
    }
    if (props.size) {
      str = `${str} ${baseStr}-${props.size}`;
    }
    if (item.selected) {
      str = `${str} ${baseStr}-primary`;
    }
    return str;
  };

  /**
   * @Description 设置按钮状态选中
   * @Author bihongbin
   * @Date 2021-03-01 14:34:56
   */
  const handleSelected = (item: ButtonGroupListType, index: number) => {
    let formatList: ButtonGroupListType[] = [];
    // 当打开删除功能的时候，不能进行单选和多选
    if (props.deleteOpen) {
      return;
    }
    if (state.data) {
      // 多选
      if (state.type === 'checkbox') {
        state.data[index].selected = !item.selected;
        formatList = state.data;
      }
      // 单选
      if (state.type === 'radio') {
        formatList = state.data.map((t, i) => {
          let bool = false;
          if (index === i) {
            bool = !item.selected;
          }
          return {
            ...t,
            selected: bool,
          };
        });
      }
    }
    if (props.onChange) {
      props.onChange(formatList);
    }
    setState({
      data: formatList,
    });
  };

  /**
   * @Description 删除
   * @Author bihongbin
   * @Date 2021-03-01 14:36:22
   */
  const handleDelete = (index: number) => {
    if (state.data) {
      const formatList = state.data.filter((m, i) => index !== i);
      if (props.onChange) {
        props.onChange(formatList);
      }
      setState({
        data: formatList,
      });
    }
  };

  /**
   * @Description 父级设置状态
   * @Author bihongbin
   * @Date 2021-03-01 14:37:26
   */
  useEffect(() => {
    if (props.checkType) {
      setState({
        type: props.checkType,
      });
    }
    if (props.deleteOpen) {
      setState({
        deleteOpen: props.deleteOpen,
      });
    }
    if (props.data) {
      const data = props.data.map((item) => {
        if (item.selected === undefined) {
          item.selected = false;
        }
        return item;
      });
      setState({
        data: data,
      });
    }
  }, [props, setState]);

  /**
   * @Description 暴漏方法给父组件调用
   * @Author bihongbin
   * @Date 2020-08-04 11:51:33
   */
  useImperativeHandle<any, ButtonGroupCallType>(ref, () => ({
    // 当前选中的按钮
    getButtonGroupSelected: () => state.data.filter((item) => item.selected),
  }));

  return (
    <Row className={props.className} gutter={[10, 10]}>
      {state.data.map((item, index) => (
        <Col key={index}>
          <div className={buttonClassName(item)} onClick={() => handleSelected(item, index)}>
            {item.name}
            {state.deleteOpen ? <CloseOutlined onClick={() => handleDelete(index)} /> : null}
          </div>
        </Col>
      ))}
    </Row>
  );
}

export default forwardRef(ButtonGroup);
