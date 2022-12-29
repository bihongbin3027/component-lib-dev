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
  Empty,
  message,
  Form,
  Input,
  Select,
  Cascader,
  DatePicker,
  TimePicker,
  Switch,
  Spin,
  Radio,
  Checkbox,
  TreeSelect,
  Rate,
  RadioChangeEvent,
} from 'antd';
import moment from 'moment';
import _ from 'lodash';
import { RowProps } from 'antd/es/row';
import { ColProps } from 'antd/es/col';
import { FormProps, Rule, FormItemProps } from 'antd/es/form';
import { RangePickerSharedProps } from 'rc-picker/lib/RangePicker';
import { PickerSharedProps } from 'rc-picker/lib/Picker';
import { TimePickerProps } from 'antd/es/time-picker';
import { RateProps } from 'antd/es/rate';
import { TreeSelectProps } from 'antd/es/tree-select';
import { SelectProps } from 'antd/es/select';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import { DataNode, DefaultValueType } from 'rc-tree-select/es/interface';
import { FormInstance } from 'rc-field-form/es/interface';
import { DatePickerProps, RangePickerProps } from 'antd/es/date-picker';
import { v4 as uuidV4 } from 'uuid';
import { isEqualWith, typeofEqual } from '../unrelated/utils';
import useSetState from '../unrelated/hooks/useSetState';
import ConfigProvider from '../unrelated/ConfigProvider';
import { AnyObjectType, SelectType } from '../unrelated/typings';
import './index.less';

export interface DefaultOptionType {
  value?: string | number;
  label?: React.ReactNode;
  disabled?: boolean;
  isLeaf?: boolean;
  loading?: boolean;
  children?: Array<DefaultOptionType>;
  [key: string]: any;
}

type remoteValueType = string | undefined;
type remotePromiseType = (value: remoteValueType, other?: any) => Promise<SelectType[]>;
type inputConfig = {
  prefix?: React.ReactNode; // 带有前缀图标的 input
  suffix?: React.ReactNode; // 带有后缀图标的 input
  addonAfter?: React.ReactNode; // 带标签的 input，设置后置标签
  addonBefore?: React.ReactNode; // 带标签的 input，设置前置标签
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

interface UnionType {
  componentName: 'Input' | 'Select' | 'DatePicker' | 'TimePicker' | 'RemoteSearch';
  name: FormListType['name']; // 字段名
  placeholder?: FormListType['placeholder'];
  selectData?: FormListType['selectData'];
  inputConfig?: FormListType['inputConfig'];
  remoteConfig?: FormListType['remoteConfig'];
  datePickerConfig?: FormListType['datePickerConfig'];
  rangePickerConfig?: FormListType['rangePickerConfig'];
  timePickerConfig?: FormListType['timePickerConfig'];
  rules?: FormListType['rules']; // 表单验证
}

// 表单参数配置
export type FormListType = {
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
    | 'TimePicker'
    | 'Switch'
    | 'Radio'
    | 'Checkbox'
    | 'TreeSelect'
    | 'Union'
    | 'RegionSelection'
    | 'Rate';
  name?: string; // 字段名
  label?: string | React.ReactNode; // 标题
  dependencies?: (string | number)[]; // 依赖字段
  placeholder?: string;
  rangePickerPlaceholder?: [string, string]; // 开始时间和结束时间提示文字
  disabled?: boolean; // 是否禁用
  maxLength?: number; // 可输入长度
  valuePropName?: string; // 子节点的值的属性，如 Switch 的是 'checked'
  inputConfig?: inputConfig;
  datePickerConfig?: DatePickerProps; // datePicker 可选类型
  rangePickerConfig?: RangePickerProps; // RangePicker 可选类型
  timePickerConfig?: TimePickerProps; // timePicker 可选类型
  unionConfig?: {
    // 要显示n个表单的类型
    unionItems: UnionType[];
    divide?: string; // 分隔符
  };
  selectConfig?: SelectProps<string>;
  selectIsHideAll?: boolean; // 下拉菜单是否显示“全部”选项 true-隐藏下拉菜单全部选项
  selectData?: SelectType[]; // 下拉菜单数据
  remoteConfig?: {
    initLoad?: false; // 是否默认加载 false（不加载）
    remoteApi: remotePromiseType; // 远程搜索的api
    remoteMode?: 'multiple' | 'tags'; // 远程搜索模式为多选或标签
    allowClear?: boolean; // 是否可清除内容
    showSearch?: boolean; // 使单选模式可搜索
  };
  // 级联选择
  regionSelectionConfig?: {
    loadData: DefaultOptionType[]; // 级联数据
    selectLoad?: (parentId: string) => Promise<DefaultOptionType[]>;
  };
  // 评分
  rateConfig?: RateProps;
  // 树选择
  treeSelectConfig?: {
    data?: {
      title: string;
      value: string;
      children?: string;
      api: (value?: string) => Promise<AnyObjectType[]>;
      onChange?: (value: DataNode[], formItem: FormListType) => FormListType | void;
    };
    extra?: TreeSelectProps<DefaultValueType>;
  };
  rows?: number; // TextArea高度
  rules?: Rule[]; // 表单验证
  inputChange?: (e: React.ChangeEvent<HTMLInputElement>, other?: any) => void;
  inputEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  textAreaChange?: (e: React.ChangeEvent<HTMLTextAreaElement>, other?: any) => void;
  autoCompleteChange?: (e: string, other?: any) => void;
  selectChange?: (e: string, other?: any) => void;
  multipleChange?: (e: string, other?: any) => void;
  remoteSearchChange?: (e: string, other?: any) => void;
  datePickerChange?: PickerSharedProps<any>['onChange'];
  rangePickerChange?: RangePickerSharedProps<any>['onChange'];
  timePickerChange?: PickerSharedProps<any>['onChange'];
  switchChange?: (e: boolean, other?: any) => void;
  radioChange?: (e: RadioChangeEvent, other?: any) => void;
  checkboxChange?: (e: CheckboxValueType[], other?: any) => void;
  cascaderChange?: (e: any, other?: any) => void;
  rateChange?: (e: number, other?: any) => void;
  render?: () => React.ReactElement; // 动态渲染插入额外元素
} & FormItemProps;

// 导出该组件可调用的方法类型
export interface FormCallType {
  getFormValues: (data: string[]) => AnyObjectType;
  setFormFields: FormInstance['setFields'];
  setFormValues: (values: AnyObjectType) => void;
  formSubmit: () => Promise<AnyObjectType>;
  formReset: (fields?: string[]) => void;
}

// 组件传参配置props
export interface GenerateFormPropType {
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
  treeSelectData: {
    [key: string]: DataNode[];
  };
  treeSelectFlattenData: {
    [key: string]: DataNode[];
  };
}

function GenerateForm(props: GenerateFormPropType, ref: any) {
  const [form] = Form.useForm();
  let { className, formConfig, rowGridConfig, colGirdConfig, render } = props;
  const remoteRef = useRef<StateType['remoteData']>({});
  const treeSelectRef = useRef<StateType['treeSelectData']>({});
  const [state, setState] = useSetState<StateType>({
    update: false, // 取反值强制渲染dom
    remoteFetching: false, // 远程搜索loading
    remoteData: {}, // 远程搜索数据结果
    treeSelectData: {}, // 树选择数据
    treeSelectFlattenData: {}, // 树选择打平后数据
  });

  /**
   * @Description 渲染的表单元素
   * @Author bihongbin
   * @Date 2021-03-16 09:35:24
   */
  let list = useMemo(() => (props.list ? [...props.list] : []), [props.list]);

  /**
   * @Description 缓存生成的随机id
   * @Author bihongbin
   * @Date 2020-08-29 15:36:38
   */
  const uid = useMemo(() => uuidV4(), []);

  /**
   * @Description 下拉菜单远程数据查询
   * @Author bihongbin
   * @Date 2020-07-25 10:01:02
   */
  const fetchRemote = useCallback(
    (value: remoteValueType, item: FormListType) => {
      const config = item.remoteConfig;
      const names = item.name as string;
      let current = remoteRef.current[names];
      if (config && config.remoteApi) {
        setState((prev) => {
          prev.remoteFetching = true;
          remoteRef.current[names] = [];
          prev.remoteData[names] = [];
          return prev;
        });
        config
          .remoteApi(value)
          .then((res) => {
            const deb = () => {
              if (current === undefined) {
                remoteRef.current[names] = [];
              }
              if (names) {
                setState((prev) => {
                  prev.remoteFetching = false;
                  remoteRef.current[names] = res;
                  prev.remoteData[names] = res;
                  return prev;
                });
              }
            };
            setTimeout(deb, 100);
          })
          .catch(() => {
            setState((prev) => {
              prev.remoteFetching = false;
              remoteRef.current[names] = [];
              prev.remoteData[names] = [];
              return prev;
            });
          });
      }
    },
    [setState],
  );

  /**
   * @Description 树选择查询
   * @Author bihongbin
   * @Date 2021-04-17 10:03:36
   * @param {*} useCallback
   */
  const fetchTreeSelect = useCallback(
    (item: FormListType, value?: string) => {
      const config = item.treeSelectConfig;
      if (config && config.data) {
        config.data.api(value).then((res) => {
          const names = item.name;
          if (names) {
            treeSelectRef.current[names] = [];
            let transformTreeSelect: DataNode[] = [];
            let flattenTreeSelect: DataNode[] = [];
            // 递归
            const deep = (original: AnyObjectType[], rear: DataNode[]) => {
              for (let [i, e] of original.entries()) {
                const children = config.data?.children || 'children';
                rear[i] = {};
                rear[i].title = e[config.data?.title as string];
                rear[i].value = e[config.data?.value as string];
                rear[i].key = rear[i].value;
                flattenTreeSelect.push(e); // 添加打平数据
                if (Array.isArray(e[children])) {
                  rear[i].children = [];
                  deep(e[children], rear[i].children as DataNode[]);
                }
              }
            };
            deep(res, transformTreeSelect);
            setState((prev) => {
              prev.treeSelectData[names] = transformTreeSelect;
              prev.treeSelectFlattenData[names] = flattenTreeSelect;
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
    selectedOptions: DefaultOptionType[] | undefined,
  ) => {
    if (selectedOptions) {
      const targetOption = selectedOptions[selectedOptions.length - 1];
      let result: DefaultOptionType[] = [];
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
    // Input
    const inputRender = (item: FormListType) => {
      return (
        <Input
          disabled={item.disabled}
          type={item.inputConfig?.inputMode || 'text'}
          maxLength={item.maxLength}
          prefix={item.inputConfig?.prefix}
          suffix={item.inputConfig?.suffix}
          addonAfter={item.inputConfig?.addonAfter}
          addonBefore={item.inputConfig?.addonBefore}
          placeholder={item.placeholder || `请输入${item.label}`}
          onChange={item.inputChange}
          onPressEnter={item.inputEnter}
        />
      );
    };
    // HideInput
    const hideInputRender = (item: FormListType) => {
      return (
        <Input
          style={{ display: 'none' }}
          maxLength={item.maxLength}
          disabled={item.disabled}
          type="text"
          placeholder={item.placeholder || `请输入${item.label}`}
          onChange={item.inputChange}
          onPressEnter={item.inputEnter}
        />
      );
    };
    // TextArea
    const textAreaRender = (item: FormListType) => {
      return (
        <Input.TextArea
          rows={item.rows}
          disabled={item.disabled}
          maxLength={item.maxLength}
          placeholder={item.placeholder || `请输入${item.label}`}
          onChange={item.textAreaChange}
        />
      );
    };
    // AutoComplete
    const autoCompleteRender = (item: FormListType) => {
      return (
        <Select
          allowClear
          showSearch
          disabled={item.disabled}
          placeholder={item.placeholder || `请选择${item.label}`}
          optionFilterProp="children"
          filterOption={(input, option) =>
            option ? option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 : false
          }
          onChange={item.autoCompleteChange}
          {...item.selectConfig}
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
    };
    // Select
    const selectRender = (item: FormListType) => {
      return (
        <Select
          disabled={item.disabled}
          placeholder={item.placeholder || `请选择${item.label}`}
          onChange={item.selectChange}
          {...item.selectConfig}
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
    };
    // Multiple
    const multipleRender = (item: FormListType) => {
      return (
        <Select
          mode="multiple"
          allowClear
          disabled={item.disabled}
          placeholder={item.placeholder || `请选择${item.label}`}
          onChange={item.multipleChange}
          filterOption={(input, option) =>
            option ? option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 : false
          }
          {...item.selectConfig}
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
    };
    // RemoteSearch
    const remoteSearchRender = (item: FormListType) => {
      const remoteConfig = item.remoteConfig;
      const isMode = remoteConfig && remoteConfig.remoteMode;
      const allowClear = remoteConfig && remoteConfig.allowClear;
      const showSearch = remoteConfig && remoteConfig.showSearch;
      return (
        <Select
          mode={isMode || undefined}
          disabled={item.disabled}
          placeholder={item.placeholder || `请选择${item.label}`}
          notFoundContent={
            state.remoteFetching ? (
              <Spin size="small" />
            ) : (
              <Empty
                style={{ marginTop: 8, marginBottom: 8 }}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )
          }
          filterOption={false}
          allowClear={allowClear === false ? false : true}
          showSearch={showSearch === false ? false : true}
          // 当获取焦点查询全部
          onFocus={() => fetchRemote(undefined, item)}
          onSearch={
            showSearch === false ? undefined : _.debounce((value) => fetchRemote(value, item), 300)
          }
          onChange={item.remoteSearchChange}
          {...item.selectConfig}
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
    };
    // DatePicker
    const datePickerRender = (item: FormListType) => {
      return (
        <DatePicker
          disabled={item.disabled}
          placeholder={item.placeholder || `请选择${item.label}`}
          onChange={item.datePickerChange}
          {...item.datePickerConfig}
        />
      );
    };
    // RangePicker
    const rangePickerRender = (item: FormListType) => {
      return (
        <RangePicker
          disabled={item.disabled}
          placeholder={item.rangePickerPlaceholder}
          onChange={item.rangePickerChange}
          {...item.rangePickerConfig}
        />
      );
    };
    // TimePicker
    const timePickerRender = (item: FormListType) => {
      return (
        <TimePicker
          disabled={item.disabled}
          placeholder={item.placeholder || `请选择${item.label}`}
          onChange={item.timePickerChange}
          {...item.timePickerConfig}
        />
      );
    };
    // Switch
    const switchRender = (item: FormListType) => {
      return (
        <Switch
          defaultChecked={false}
          checkedChildren="ON"
          unCheckedChildren="OFF"
          disabled={item.disabled}
          onChange={item.switchChange}
        />
      );
    };
    // Radio
    const radioRender = (item: FormListType) => {
      return (
        <Radio.Group onChange={item.radioChange}>
          {item.selectData
            ? item.selectData.map((s: SelectType, k) => (
                <Radio disabled={item.disabled} value={s.value} key={k}>
                  {s.label}
                </Radio>
              ))
            : null}
        </Radio.Group>
      );
    };
    // Checkbox
    const checkboxRender = (item: FormListType) => {
      return (
        <Checkbox.Group onChange={item.checkboxChange}>
          {item.selectData
            ? item.selectData.map((s: SelectType, k) => (
                <Checkbox disabled={item.disabled} value={s.value} key={k}>
                  {s.label}
                </Checkbox>
              ))
            : null}
        </Checkbox.Group>
      );
    };
    // TreeSelect
    const treeSelectRender = (item: FormListType, index: number) => {
      const names = item.name as string;
      return (
        <TreeSelect
          disabled={item.disabled}
          style={{ width: '100%' }}
          dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
          treeData={state.treeSelectData[names]}
          placeholder={item.placeholder || `请选择${item.label}`}
          onChange={(value) => {
            if (item.treeSelectConfig && item.treeSelectConfig.data) {
              const configData = item.treeSelectConfig.data;
              const onChange = configData.onChange;
              const flatten = state.treeSelectFlattenData[names];
              const type = Object.prototype.toString.call(value);
              let changeChild: any[] = [];
              let newItem = { ...item };
              if (type === '[object String]') {
                changeChild = flatten.filter((t) => t[configData.value] === value);
              }
              if (type === '[object Array]' && Array.isArray(value)) {
                for (let i = flatten.length; i--; ) {
                  if (value.some((t) => t === flatten[i][configData.value])) {
                    changeChild.push(flatten[i]);
                  }
                }
              }
              if (onChange) {
                const changeVal = onChange(changeChild, { ...item }) as FormListType;
                if (changeVal) {
                  newItem = changeVal;
                }
                if (newItem) {
                  list[index] = newItem;
                }
              }
              form.setFieldsValue({
                [newItem.name as string]: value, // 设置对应字段值
              });
              fetchTreeSelect(newItem); // 查询树选择数据
            }
          }}
          allowClear
          treeDefaultExpandAll
          {...item.treeSelectConfig?.extra}
        />
      );
    };
    // RegionSelection
    const regionSelectionRender = (item: FormListType) => {
      const propsRegionConfig = item.regionSelectionConfig;
      return (
        <Cascader
          disabled={item.disabled}
          placeholder={item.placeholder || `请选择${item.label}`}
          options={(propsRegionConfig && propsRegionConfig.loadData) || []}
          loadData={(selectedOptions) => regionLoadData(item, selectedOptions)}
          changeOnSelect
          onChange={item.cascaderChange}
        />
      );
    };
    // Rate
    const rateRender = (item: FormListType) => {
      return <Rate disabled={item.disabled} onChange={item.rateChange} {...item.rateConfig} />;
    };
    // 渲染Union类型表单
    const unionRender = (m: UnionType) => {
      if (m.componentName === 'Input') {
        return inputRender(m);
      }
      if (m.componentName === 'Select') {
        return selectRender(m);
      }
      if (m.componentName === 'DatePicker') {
        return datePickerRender(m);
      }
      if (m.componentName === 'TimePicker') {
        return timePickerRender(m);
      }
      if (m.componentName === 'RemoteSearch') {
        return remoteSearchRender(m);
      }
      return null;
    };
    // 类型是Union，有rule，添加必选项*号
    const unionRuleStyle = (i: Partial<FormListType>) => {
      let node = i.label;
      if (i.componentName === 'Union' && i.rules) {
        node = (
          <span>
            <i
              style={{
                marginRight: 4,
                color: '#ff4d4f',
                fontStyle: 'normal',
                fontFamily: 'SimSun, sans-serif',
              }}
            >
              *
            </i>
            {i.label}
          </span>
        );
      }
      return node;
    };
    return list.map((item: FormListType, index: number) => {
      let childForm: React.ReactNode = null;
      switch (item.componentName) {
        case 'Input':
          childForm = inputRender(item);
          break;
        case 'HideInput':
          childForm = hideInputRender(item);
          break;
        case 'TextArea':
          childForm = textAreaRender(item);
          break;
        case 'AutoComplete':
          childForm = autoCompleteRender(item);
          break;
        case 'Select':
          childForm = selectRender(item);
          break;
        case 'Multiple':
          childForm = multipleRender(item);
          break;
        case 'RemoteSearch':
          childForm = remoteSearchRender(item);
          break;
        case 'DatePicker':
          childForm = datePickerRender(item);
          break;
        case 'RangePicker':
          childForm = rangePickerRender(item);
          break;
        case 'TimePicker':
          childForm = timePickerRender(item);
          break;
        case 'Switch':
          childForm = switchRender(item);
          break;
        case 'Radio':
          childForm = radioRender(item);
          break;
        case 'Checkbox':
          childForm = checkboxRender(item);
          break;
        case 'TreeSelect':
          childForm = treeSelectRender(item, index);
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
                  <Form.Item name={m.name} rules={m.rules} noStyle>
                    {unionRender(m)}
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
          childForm = regionSelectionRender(item);
          break;
        case 'Rate':
          childForm = rateRender(item);
          break;
        default:
          return null;
      }
      let resetItem: Partial<FormListType> = {
        ...item,
      };
      // 类型是Union，有rule，添加必选项*号
      resetItem.label = unionRuleStyle(resetItem);
      // 移除Form.Item不需要的属性
      resetItem = _.omit(resetItem, [
        'colProps',
        'componentName',
        'selectData',
        'inputConfig',
        'datePickerConfig',
        'rangePickerConfig',
        'timePickerConfig',
        'unionConfig',
        'remoteConfig',
        'selectConfig',
        'regionSelectionConfig',
        'treeSelectConfig',
        'rows',
        'render',
        'rangePickerPlaceholder',
        'visible',
        'selectIsHideAll',
        'rateConfig',
        'inputChange',
        'inputEnter',
        'textAreaChange',
        'autoCompleteChange',
        'selectChange',
        'multipleChange',
        'remoteSearchChange',
        'datePickerChange',
        'rangePickerChange',
        'timePickerChange',
        'switchChange',
        'radioChange',
        'checkboxChange',
        'cascaderChange',
        'rateChange',
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
      return (
        <Col {...grid} key={index} style={{ display: item.visible === false ? 'none' : 'block' }}>
          <Form.Item
            className={item.componentName === 'HideInput' ? 'hide-item' : undefined}
            {...resetItem}
          >
            {childForm}
          </Form.Item>
          {item.render && item.render()}
        </Col>
      );
    });
  };

  /**
   * @Description 设置全局表单默认查询
   * @Author bihongbin
   * @Date 2020-10-14 14:25:54
   */
  useEffect(() => {
    if (list) {
      let obj: AnyObjectType = {};
      for (let item of list) {
        // 远程搜索默认查询
        if (item.componentName === 'RemoteSearch') {
          if (item.name && !remoteRef.current[item.name]) {
            if (item.remoteConfig && item.remoteConfig.initLoad !== false) {
              fetchRemote(undefined, item);
            }
          }
        }
        // 设置树数据
        if (item.componentName === 'TreeSelect') {
          if (item.name && !treeSelectRef.current[item.name]) {
            if (item.treeSelectConfig && item.treeSelectConfig.data) {
              fetchTreeSelect(item); // 查询树选择数据
            }
          }
        }
      }
      form.setFieldsValue(obj);
    }
  }, [fetchRemote, fetchTreeSelect, form, list]);

  // 暴漏给父组件调用
  useImperativeHandle<any, FormCallType>(ref, () => ({
    // 获取对应的字段值
    getFormValues: (data) => {
      return form.getFieldsValue(data);
    },
    // 设置一组字段状态
    setFormFields: (fields) => {
      form.setFields(fields);
    },
    // 设置表单值
    setFormValues: (values) => {
      form.setFieldsValue(values);
    },
    // 提交表单
    formSubmit: () => {
      return new Promise((resolve, reject) => {
        form
          .validateFields()
          .then((values) => {
            for (let item in values) {
              // String类型去掉前后空格
              if (
                typeofEqual({
                  data: values[item],
                  type: 'String',
                })
              ) {
                values[item] = values[item].replace(/(^\s*)|(\s*$)/g, '');
              }
            }
            resolve(values);
          })
          .catch((err) => {
            if (err.errorFields && err.errorFields.length) {
              console.warn('请输入或选择表单必填项：', err);
              message.warn('请输入或选择表单必填项', 1.5);
            }
            reject(false);
          });
      });
    },
    // 重置表单
    formReset: (fields) => {
      form.resetFields(fields);
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
        initialValues={{
          sortSeq: 10,
          startTime: moment(`${new Date().getFullYear()}-01-01`),
          endTime: moment('20991231'),
          ...(formConfig ? formConfig.initialValues : undefined),
        }}
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

/** 动态表单组件 */
export default React.memo(forwardRef(GenerateForm), isEqualWith);
