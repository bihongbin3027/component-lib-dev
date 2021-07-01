import React, { useState, useRef, useContext } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Form, Input, Select, DatePicker, Spin } from 'antd';
import { Rule } from 'rc-field-form/lib/interface';
import { v4 as uuidV4 } from 'uuid';
import { SelectType, AnyObjectType } from '../../unrelated/typings';

const { Option } = Select;
const EditableContext = React.createContext<any>(null);

type remoteValueType = string | undefined;
type remotePromiseType = (value: remoteValueType) => Promise<SelectType[]>;

export interface EditableColumnsType {
  editable: boolean | ((record: AnyObjectType, index: number) => boolean);
  inputType: 'number';
  /** 单元格表单类型 */
  valueType: 'Select' | 'AutoComplete' | 'RemoteSearch' | 'RecordSelect' | 'DatePicker';
  valueEnum: SelectType[];
  recordSelectField: string;
  /** 表单值改变触发 */
  formChange: (record: AnyObjectType) => AnyObjectType | void;
  remoteConfig: {
    /** 远程搜索的api */
    remoteApi: remotePromiseType;
    /** 远程搜索模式为多选或标签 */
    remoteMode?: 'multiple' | 'tags';
  };
  /** 可编辑单元格表单验证 */
  formItemProps: {
    rules: Rule[];
  };
}

/** 可编辑单元格 */
type EditableCellProps = {
  title: React.ReactNode;
  children: React.ReactNode;
  dataIndex: string;
  record: AnyObjectType;
  handleSave: (record: AnyObjectType) => void;
} & EditableColumnsType;

export const EditableRow: React.FC = (props, func) => {
  const [form] = Form.useForm();
  const [uuId] = useState(uuidV4());

  return (
    <Form size="small" component={false} name={uuId} form={form}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

/** 可编辑单元格 */
const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  inputType,
  valueType,
  valueEnum,
  recordSelectField,
  formChange,
  remoteConfig,
  formItemProps,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const form = useContext(EditableContext);
  // 远程搜索loading
  const [remoteFetching, setRemoteFetching] = useState(false);
  // 远程搜索数据结果
  const [remoteData, setRemoteData] = useState<{ [key: string]: SelectType[] }>({});

  /**
   * @Description 远程数据搜索
   * @Author bihongbin
   * @Date 2021-01-05 11:14:45
   */
  const fetchRemote = (
    value: remoteValueType,
    fieldName: string | undefined,
    remoteApi?: remotePromiseType,
  ) => {
    if (remoteApi) {
      setRemoteFetching(true);
      remoteApi(value).then((res) => {
        setRemoteFetching(false);
        if (fieldName) {
          setRemoteData({
            [fieldName]: res,
          });
        }
      });
    }
  };

  // 如果是表单表格项，初始化数据赋值
  if (editable) {
    let val = record[dataIndex];
    // 如果是时间类型，转换
    if (valueType === 'DatePicker') {
      val = moment(val);
    }
    setTimeout(() => {
      form.setFieldsValue({
        [dataIndex]: val,
      });
    });
  }

  // 显示不同类型的表单
  const filterFormType = (type: EditableCellProps['valueType'], title: string) => {
    let node: React.ReactNode = null;
    // 渲染option
    const optionNode = (data) => {
      if (_.isArray(data)) {
        return data.map((m: SelectType, i: number) => (
          <Option key={i} value={m.value}>
            {m.label}
          </Option>
        ));
      }
    };
    switch (type) {
      case 'RecordSelect':
        node = (
          <Select
            allowClear
            showSearch
            placeholder={title}
            onChange={save}
            optionFilterProp="children"
            filterOption={(input, option) =>
              option ? option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 : false
            }
          >
            {optionNode(record[recordSelectField])}
          </Select>
        );
        break;
      case 'Select':
        node = (
          <Select onChange={save} placeholder={title}>
            {optionNode(valueEnum)}
          </Select>
        );
        break;
      case 'DatePicker':
        node = <DatePicker onChange={save} placeholder={title} />;
        break;
      case 'AutoComplete':
        node = (
          <Select
            allowClear
            showSearch
            placeholder={title}
            onChange={save}
            optionFilterProp="children"
            filterOption={(input, option) =>
              option ? option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 : false
            }
          >
            {optionNode(valueEnum)}
          </Select>
        );
        break;
      case 'RemoteSearch':
        node = (
          <Select
            mode={remoteConfig.remoteMode}
            placeholder={title}
            notFoundContent={remoteFetching ? <Spin size="small" /> : null}
            filterOption={false}
            allowClear
            showSearch
            onChange={save}
            // 当获取焦点查询全部
            onFocus={() => fetchRemote(undefined, dataIndex, remoteConfig.remoteApi)}
            onSearch={(value) => fetchRemote(value, dataIndex, remoteConfig.remoteApi)}
          >
            {dataIndex && optionNode(remoteData[dataIndex])}
          </Select>
        );
        break;
      default:
        node = (
          <Input
            onPressEnter={save}
            onBlur={save}
            placeholder={title}
            type={inputType ? inputType : 'text'}
          />
        );
        break;
    }
    return node;
  };

  // 更新值到record
  const save = async () => {
    try {
      const values = await form.validateFields();
      let data = { ...record, ...values };
      for (let i in data) {
        // 如果是时间类型，转换
        if (moment.isMoment(data[i])) {
          data[i] = moment(data[i]).format('YYYY-MM-DD');
        }
      }
      if (formChange) {
        data = (await formChange(data)) || data; // 单元格值改变触发
      }
      handleSave(data);
    } catch (errInfo) {
      console.log('保存表单字段失败:', errInfo);
    }
  };

  let childNode = children;
  if (editable) {
    childNode = (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={formItemProps ? formItemProps.rules : undefined}
      >
        {filterFormType(valueType, title as string)}
      </Form.Item>
    );
  }

  return (
    <td {...restProps} title={title as string}>
      {childNode}
    </td>
  );
};

export default EditableCell;
