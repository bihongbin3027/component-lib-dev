import { FormListType } from '../../GenerateForm';

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
