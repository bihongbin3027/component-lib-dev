import _ from 'lodash';
import { FormListType } from '../../GenerateForm';
import { SelectType } from '../../unrelated/typings';

/**
 * @Description 组件是否重新渲染比较
 * @Author bihongbin
 * @Date 2021-08-26 14:10:48
 */
export const isEqualWith = (prevProps: any, nextProps: any) => {
  return _.isEqual(prevProps, nextProps);
};

/**
 * @Description 检查数据类型是否符合
 * @Author bihongbin
 * @Date 2021-011-09 11:26:15
 */
export const typeofEqual = (data: {
  data: any;
  type: 'Object' | 'Array' | 'String' | 'Number';
}) => {
  return Object.prototype.toString.call(data.data) === `[object ${data.type}]`;
};

/**
 * @Description 获取下拉菜单的对应值
 * @Author bihongbin
 * @Date 2021-11-11 15:00:30
 */
export const getSelectValue = (list: SelectType[], value: string | number) => {
  for (let item of list) {
    let v = item.value;
    if (typeof value === 'number') {
      v = parseInt(item.value as string);
    }
    if (v === value) {
      return item.label;
    }
  }
  return value;
};

/**
 * @Description 默认下拉菜单增加全部这一选项
 * @Author bihongbin
 * @Date 2020-11-06 13:57:22
 */
export const dropDownMenuPushAll = (data: FormListType[] | undefined) => {
  if (data) {
    return data.map((item) => {
      if (item.componentName === 'Select' && item.selectData && item.selectData.length) {
        if (!item.selectData.some((s) => s.label === '全部')) {
          item.selectData = [{ label: '全部', value: '' }, ...item.selectData];
        }
      }
      return item;
    });
  } else {
    return [];
  }
};
