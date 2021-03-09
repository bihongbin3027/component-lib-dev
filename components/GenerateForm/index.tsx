import React, {
  useImperativeHandle,
  forwardRef,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import {
  Row,
  Col,
  message,
  Form,
  Input,
  Select,
  Cascader,
  DatePicker,
  Switch,
  Spin,
  Radio,
  Checkbox,
  TreeSelect,
} from 'antd';
import moment from 'moment';
import { RowProps } from 'antd/es/row';
import { ColProps } from 'antd/es/col';
import { FormProps, Rule } from 'antd/es/form';
import { DataNode } from 'rc-tree-select/es/interface';
import { CascaderOption } from 'rc-cascader/es/Cascader';
import { FieldData } from 'rc-field-form/es/interface';
import { DatePickerProps } from 'antd/es/date-picker';
import { v4 as uuidV4 } from 'uuid';
import _ from 'lodash';
import useSetState from '../unrelated/hooks/useSetState';
import ConfigProvider from '../unrelated/ConfigProvider';
import { AnyObjectType, SelectType } from '../unrelated/typings';
import './index.less';

type remoteValueType = string | undefined;
type remotePromiseType = (value: remoteValueType) => Promise<SelectType[]>;

interface UnionType {
  componentName: 'Input' | 'Select' | 'DatePicker';
  name: string; // 字段名
  placeholder?: string;
  selectData?: SelectType[];
}

// 表单参数配置
export interface FormListType {
  colProps?: ColProps; // 用来控制单个表单元素宽度
  visible?: boolean; // 用来控制显示隐藏
  // 组件显示类型
  componentName:
    | 'Input'
    | 'HideInput'
    | 'TextArea'
    | 'AutoComplete'
    | 'Select'
    | 'Multiple'
    | 'RemoteSearch'
    | 'DatePicker'
    | 'RangePicker'
    | 'Switch'
    | 'Radio'
    | 'Checkbox'
    | 'TreeSelect'
    | 'Union'
    | 'RegionSelection';
  name?: string; // 字段名
  label?: string | React.ReactNode; // 标题
  dependencies?: (string | number)[]; // 依赖字段
  placeholder?: string;
  rangePickerPlaceholder?: [string, string]; // 开始时间和结束时间提示文字
  disabled?: boolean; // 是否禁用
  valuePropName?: string; // 子节点的值的属性，如 Switch 的是 'checked'
  inputConfig?: {
    prefix?: string | React.ReactNode; // 带有前缀图标的 input
    suffix?: string | React.ReactNode; // 带有后缀图标的 input
    // 对应Input组件的输入类型
    inputMode?:
      | 'text'
      | 'password'
      | 'email'
      | 'url'
      | 'number'
      | 'range'
      | 'Date pickers'
      | 'search'
      | 'color';
  };
  datePickerConfig?: DatePickerProps; // datePicker 可选类型
  unionConfig?: {
    // 要显示n个表单的类型
    unionItems: UnionType[];
    divide?: string; // 分隔符
  };
  remoteConfig?: {
    remoteApi: remotePromiseType; // 远程搜索的api
    remoteMode?: 'multiple' | 'tags'; // 远程搜索模式为多选或标签
  };
  // 级联选择
  regionSelectionConfig?: {
    loadData: CascaderOption[]; // 级联数据
    selectLoad?: (parentId: string) => Promise<CascaderOption[]>;
  };
  rows?: number; // TextArea高度
  rules?: Rule[]; // 表单验证
  selectIsHideAll?: boolean; // 下拉菜单是否显示“全部”选项 true-隐藏下拉菜单全部选项
  selectData?: SelectType[]; // 下拉菜单数据
  treeSelectData?: DataNode[]; // 树下拉菜单数据
  render?: () => React.ReactElement; // 动态渲染插入额外元素
}

// 导出该组件可调用的方法类型
export interface FormCallType {
  formGetValues: (data: string[]) => AnyObjectType;
  formSetFields: (fields: FieldData[]) => void;
  formSetValues: (values: AnyObjectType) => void;
  formSubmit: () => Promise<AnyObjectType>;
  formReset: () => void;
}

// 组件传参配置props
interface GenerateFormProp {
  /** 组件类名 */
  className?: string;
  /** 渲染的表单元素 */
  list?: FormListType[];
  /** 支持antd Form组件官方传参所有类型 */
  formConfig?: FormProps;
  /** 支持antd Row组件官方传参所有类型 */
  rowGridConfig?: RowProps;
  /** 支持antd Col组件官方传参所有类型 */
  colGirdConfig?: ColProps;
  /** 动态渲染操作按钮或其他元素 */
  render?: () => React.ReactElement;
}

const { Option } = Select;
const { RangePicker } = DatePicker;

interface StateType {
  update: boolean;
  remoteFetching: boolean;
  remoteData: {
    [key: string]: SelectType[];
  };
}

/** 动态表单组件 */
function GenerateForm(props: GenerateFormProp, ref: any) {
  const [form] = Form.useForm();
  let { className, formConfig, rowGridConfig, colGirdConfig, list, render } = props;
  const remoteRef = useRef<StateType['remoteData']>({});
  const [state, setState] = useSetState<StateType>({
    update: false, // 取反值强制渲染dom
    remoteFetching: false, // 远程搜索loading
    remoteData: {}, // 远程搜索数据结果
  });

  /**
   * @Description 缓存生成的随机id
   * @Author bihongbin
   * @Date 2020-08-29 15:36:38
   */
  const uid = useMemo(() => uuidV4(), []);

  /**
   * @Description 远程数据搜索
   * @Author bihongbin
   * @Date 2020-07-25 10:01:02
   */
  const fetchRemote = useCallback(
    (value: remoteValueType, fieldName: string | undefined, remoteApi?: remotePromiseType) => {
      if (remoteApi) {
        setState({
          remoteFetching: true,
        });
        if (fieldName) {
          remoteRef.current[fieldName] = []; // 优化，防止fetchRemote被多次加载
        }
        remoteApi(value).then((res) => {
          setState({
            remoteFetching: false,
          });
          if (fieldName) {
            setState((prev) => {
              prev.remoteData[fieldName] = res;
              return prev;
            });
          }
        });
      }
    },
    [setState],
  );

  /**
   * @Description 级联选择数据查询
   * @Author bihongbin
   * @Date 2021-01-27 15:00:34
   */
  const regionLoadData = async (
    item: FormListType,
    selectedOptions: CascaderOption[] | undefined,
  ) => {
    if (selectedOptions) {
      const targetOption = selectedOptions[selectedOptions.length - 1];
      let result: CascaderOption[] = [];
      if (item.regionSelectionConfig?.selectLoad) {
        targetOption.loading = true;
        result = await item.regionSelectionConfig?.selectLoad(targetOption.id);
      } else {
        return;
      }
      targetOption.loading = false;
      if (result.length) {
        targetOption.children = result;
      } else {
        targetOption.isLeaf = true;
      }
      setState({
        update: !state.update, // 强制更新
      });
    }
  };

  /**
   * @Description 渲染组件
   * @Author bihongbin
   * @Date 2020-07-06 10:12:51
   */
  const formRender = () => {
    if (!list) {
      return;
    }
    // 渲染Union类型表单
    const unionRender = (item: FormListType, m: UnionType) => {
      if (m.componentName === 'Input') {
        return <Input disabled={item.disabled} placeholder={m.placeholder} />;
      }
      if (m.componentName === 'Select') {
        return (
          <Select disabled={item.disabled} placeholder={m.placeholder}>
            {m.selectData
              ? m.selectData.map((s: SelectType, k: number) => (
                  <Option value={s.value} key={k}>
                    {s.label}
                  </Option>
                ))
              : null}
          </Select>
        );
      }
      if (m.componentName === 'DatePicker') {
        return <DatePicker disabled={item.disabled} placeholder={m.placeholder} />;
      }
      return null;
    };
    return list.map((item: FormListType, index: number) => {
      let childForm: React.ReactNode = null;
      switch (item.componentName) {
        case 'Input':
          childForm = (
            <Input
              disabled={item.disabled}
              type={item.inputConfig?.inputMode ? item.inputConfig?.inputMode : 'text'}
              prefix={item.inputConfig?.prefix ? item.inputConfig?.prefix : null}
              suffix={item.inputConfig?.suffix ? item.inputConfig?.suffix : null}
              placeholder={item.placeholder}
            />
          );
          break;
        case 'HideInput':
          childForm = (
            <Input
              style={{ display: 'none' }}
              disabled={item.disabled}
              type="text"
              placeholder={item.placeholder}
            />
          );
          break;
        case 'TextArea':
          childForm = (
            <Input.TextArea
              rows={item.rows}
              disabled={item.disabled}
              placeholder={item.placeholder}
            />
          );
          break;
        case 'AutoComplete':
          childForm = (
            <Select
              allowClear
              showSearch
              placeholder={item.placeholder}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option ? option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 : false
              }
            >
              {item.selectData
                ? item.selectData.map((s, k) => (
                    <Option value={s.value} key={k}>
                      {s.label}
                    </Option>
                  ))
                : null}
            </Select>
          );
          break;
        case 'Select':
          childForm = (
            <Select disabled={item.disabled} placeholder={item.placeholder}>
              {item.selectData
                ? item.selectData.map((s, k) => (
                    <Option value={s.value} key={k}>
                      {s.label}
                    </Option>
                  ))
                : null}
            </Select>
          );
          break;
        case 'Multiple':
          childForm = (
            <Select
              mode="multiple"
              allowClear
              disabled={item.disabled}
              placeholder={item.placeholder}
            >
              {item.selectData
                ? item.selectData.map((s, k) => (
                    <Option value={s.value} key={k}>
                      {s.label}
                    </Option>
                  ))
                : null}
            </Select>
          );
          break;
        case 'RemoteSearch':
          childForm = (
            <Select
              mode={item.remoteConfig?.remoteMode}
              disabled={item.disabled}
              placeholder={item.placeholder}
              notFoundContent={state.remoteFetching ? <Spin size="small" /> : null}
              filterOption={false}
              allowClear
              showSearch
              // 当获取焦点查询全部
              onFocus={() => fetchRemote(undefined, item.name, item.remoteConfig?.remoteApi)}
              onSearch={(value) => fetchRemote(value, item.name, item.remoteConfig?.remoteApi)}
            >
              {item.name && state.remoteData[item.name]
                ? state.remoteData[item.name].map((s: SelectType, k) => (
                    <Option value={s.value} key={k}>
                      {s.label}
                    </Option>
                  ))
                : null}
            </Select>
          );
          break;
        case 'DatePicker':
          childForm = (
            <DatePicker
              disabled={item.disabled}
              placeholder={item.placeholder}
              {...item.datePickerConfig}
            />
          );
          break;
        case 'RangePicker':
          childForm = (
            <RangePicker disabled={item.disabled} placeholder={item.rangePickerPlaceholder} />
          );
          break;
        case 'Switch':
          childForm = (
            <Switch
              defaultChecked={false}
              checkedChildren="ON"
              unCheckedChildren="OFF"
              disabled={item.disabled}
            />
          );
          break;
        case 'Radio':
          childForm = (
            <Radio.Group>
              {item.selectData
                ? item.selectData.map((s: SelectType, k) => (
                    <Radio disabled={item.disabled} value={s.value} key={k}>
                      {s.label}
                    </Radio>
                  ))
                : null}
            </Radio.Group>
          );
          break;
        case 'Checkbox':
          childForm = (
            <Checkbox.Group>
              {item.selectData
                ? item.selectData.map((s: SelectType, k) => (
                    <Checkbox disabled={item.disabled} value={s.value} key={k}>
                      {s.label}
                    </Checkbox>
                  ))
                : null}
            </Checkbox.Group>
          );
          break;
        case 'TreeSelect':
          childForm = (
            <TreeSelect
              disabled={item.disabled}
              style={{ width: '100%' }}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              treeData={item.treeSelectData}
              placeholder={item.placeholder}
              treeDefaultExpandAll
            />
          );
          break;
        case 'Union':
          let width: string;
          let len = 0;
          if (item.unionConfig) {
            len = item.unionConfig.unionItems.length;
            width = `${100 / len}%`;
          }
          childForm = (
            <Row className="form-item-divide" gutter={16}>
              {item.unionConfig?.unionItems.map((m, k) => (
                <Col
                  style={{
                    width: width,
                  }}
                  key={k}
                >
                  <Form.Item name={m.name} noStyle>
                    {unionRender(item, m)}
                  </Form.Item>
                  {k < len - 1 ? (
                    <span className="divide">
                      {item.unionConfig &&
                        (item.unionConfig.divide ? item.unionConfig.divide : '~')}
                    </span>
                  ) : null}
                </Col>
              ))}
            </Row>
          );
          break;
        case 'RegionSelection': // 级联选择（可实现地区选择）
          const propsRegionConfig = item.regionSelectionConfig;
          childForm = (
            <Cascader
              disabled={item.disabled}
              placeholder={item.placeholder}
              options={(propsRegionConfig && propsRegionConfig.loadData) || []}
              loadData={(selectedOptions) => regionLoadData(item, selectedOptions)}
              changeOnSelect
            />
          );
          break;
        default:
          return null;
      }
      let resetItem: Partial<FormListType> = {
        ...item,
      };
      // 移除Form.Item不需要的属性
      resetItem = _.omit(resetItem, [
        'colProps',
        'componentName',
        'selectData',
        'inputConfig',
        'datePickerConfig',
        'unionConfig',
        'remoteConfig',
        'regionSelectionConfig',
        'rows',
        'render',
        'rangePickerPlaceholder',
        'visible',
        'selectIsHideAll',
      ]);
      // Form.Item内有多个表单（Union类型），如果有设置name移除name
      if (item.componentName === 'Union') {
        resetItem = _.omit(resetItem, ['name']);
      }
      // 为防止colProps和colGirdConfig重叠，优先显示colProps
      let grid: any = undefined;
      if (item.colProps) {
        grid = item.colProps;
      } else {
        grid = colGirdConfig;
      }
      return !item.visible ? (
        <Col {...grid} key={index}>
          <Form.Item
            className={item.componentName === 'HideInput' ? 'hide-item' : undefined}
            {...resetItem}
          >
            {childForm}
          </Form.Item>
          {item.render && item.render()}
        </Col>
      ) : null;
    });
  };

  /**
   * @Description 设置全局表单默认值
   * @Author bihongbin
   * @Date 2020-10-14 14:25:54
   */
  useEffect(() => {
    if (list) {
      let obj: AnyObjectType = {};
      for (let item of list) {
        // 序号
        if (item.name === 'sortSeq') {
          obj[item.name] = 10;
        }
        // 生效时间
        if (item.name === 'startTime') {
          obj[item.name] = moment();
        }
        // 失效时间
        if (item.name === 'endTime') {
          obj[item.name] = moment('20991231');
        }
        // 远程搜索默认查询
        if (item.componentName === 'RemoteSearch') {
          // remoteRef.current[item.name]，优化，防止fetchRemote被多次加载
          if (item.name && !remoteRef.current[item.name]) {
            if (item.remoteConfig && item.remoteConfig.remoteApi) {
              fetchRemote(undefined, item.name, item.remoteConfig.remoteApi);
            }
          }
        }
      }
      form.setFieldsValue(obj);
    }
  }, [fetchRemote, form, list]);

  // 暴漏给父组件调用
  useImperativeHandle<any, FormCallType>(ref, () => ({
    // 获取对应的字段值
    formGetValues: (data) => {
      return form.getFieldsValue(data);
    },
    // 设置一组字段状态
    formSetFields: (fields) => {
      form.setFields(fields);
    },
    // 设置表单值
    formSetValues: (values) => {
      form.setFieldsValue(values);
    },
    // 提交表单
    formSubmit: () => {
      return new Promise((resolve, reject) => {
        form
          .validateFields()
          .then((values) => {
            resolve(values);
          })
          .catch((err) => {
            message.warn('请输入或选择表单必填项', 1.5);
            reject(false);
          });
      });
    },
    // 重置表单
    formReset: () => {
      form.resetFields();
      return form.getFieldsValue();
    },
  }));

  return (
    <ConfigProvider>
      <Form
        name={uid}
        className={`generate-form ${className ? className : ''}`}
        form={form}
        {...formConfig}
      >
        <Row {...rowGridConfig}>
          {formRender()}
          {render ? (
            <Col>
              <Form.Item>{render && render()}</Form.Item>
            </Col>
          ) : null}
        </Row>
      </Form>
    </ConfigProvider>
  );
}

export default forwardRef(GenerateForm);
