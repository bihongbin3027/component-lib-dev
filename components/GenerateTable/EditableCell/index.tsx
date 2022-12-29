import React, { useState, useContext, useRef } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Form, Input, Select, DatePicker, Spin } from 'antd';
import { InternalFieldProps } from 'rc-field-form/lib/Field';
import { useDrag, useDrop } from 'react-dnd';
import { SelectType, AnyObjectType } from '../../unrelated/typings';
import { typeofEqual, getSelectValue } from '../../unrelated/utils';
import './index.less';

const { Option } = Select;
const EditableContext = React.createContext<any>(null);

type remoteValueType = string | undefined;
type remotePromiseType = (value: remoteValueType, record: AnyObjectType) => Promise<SelectType[]>;

export interface EditableColumnsType {
  editable: boolean | ((record: AnyObjectType, index: number) => boolean);
  inputType: 'number';
  /** 单元格表单类型 */
  valueType: 'Select' | 'AutoComplete' | 'RecordSelect' | 'RemoteSearch' | 'DatePicker';
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
    rules: InternalFieldProps['rules'];
  };
  /** 自定义渲染值(在原有的内容上增加新的结构)，childNode是原有的内容 */
  controlRender: (record: AnyObjectType, childNode: React.ReactNode) => React.ReactNode;
}

/** 可编辑单元格 */
type EditableCellProps = {
  title: React.ReactNode;
  children: React.ReactNode;
  dataIndex: string;
  record: AnyObjectType;
  /** 保存表单的值 */
  handleSave: (record: AnyObjectType) => void;
} & EditableColumnsType;

interface DraggableBodyRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  open: boolean;
  index: number;
  moveRow: (dragIndex: number, hoverIndex: number) => void;
}

export const EditableRow = ({
  open,
  index,
  moveRow,
  className,
  style,
  ...restProps
}: DraggableBodyRowProps) => {
  const [form] = Form.useForm();

  // 列拖动功能
  const ref = useRef<HTMLTableRowElement>(null);
  const [{ isOver, dropClassName }, drop] = useDrop({
    accept: 'DraggableBodyRow',
    collect: (monitor) => {
      const { index: dragIndex } = monitor.getItem() || ({} as any);

      if (dragIndex === index) {
        return {};
      }

      return {
        isOver: monitor.isOver(),
        dropClassName: dragIndex < index ? ' drop-over-downward' : ' drop-over-upward',
      };
    },
    drop: (item: { index: number }) => {
      moveRow(item.index, index);
    },
  });
  const [, drag] = useDrag({
    type: 'DraggableBodyRow',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  if (open) {
    drop(drag(ref));
  }

  return (
    <Form size="small" component={false} form={form}>
      <EditableContext.Provider value={form}>
        <tr
          ref={ref}
          className={`${className}${isOver ? dropClassName : ''}`}
          style={{ cursor: open ? 'move' : 'auto', ...style }}
          {...restProps}
        />
      </EditableContext.Provider>
    </Form>
  );
};

/** 可编辑单元格 */
const EditableCell: React.FC<EditableCellProps> = ({
  record,
  dataIndex,
  title,
  editable,
  inputType,
  valueType,
  valueEnum,
  recordSelectField,
  controlRender,
  formChange,
  remoteConfig,
  children,
  formItemProps,
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
    record: AnyObjectType,
    remoteApi?: remotePromiseType,
  ) => {
    if (remoteApi) {
      setRemoteFetching(true);
      remoteApi(value, record).then((res) => {
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
      if (val) {
        val = moment(val);
      }
    }

    // 状态-转换为字符串
    if (dataIndex === 'status' && val !== undefined) {
      record[dataIndex] = String(val);
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
    const filterOption = (input: string, option: any) => {
      let str = '';
      // 递归
      const deep = function (o: any) {
        for (let i of o) {
          // 节点值可能为undefined或null
          if (i) {
            if (typeofEqual({ data: i, type: 'String' })) {
              str += i;
            } else {
              const children = i.props.children;
              if (typeofEqual({ data: children, type: 'Object' })) {
                deep([children]);
              }
              if (typeofEqual({ data: children, type: 'Array' })) {
                deep(children);
              }
              if (typeofEqual({ data: children, type: 'String' })) {
                str += children;
              }
            }
          }
        }
      };
      deep([option.children]);
      return str.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    };
    // 渲染option
    const optionNode = (data: SelectType[]) => {
      if (_.isArray(data)) {
        return data.map((m, i: number) => (
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
            dropdownMatchSelectWidth={false}
            placeholder={title}
            onChange={save}
            optionFilterProp="children"
            filterOption={filterOption}
          >
            {optionNode(record[recordSelectField])}
          </Select>
        );
        break;
      case 'Select':
        node = (
          <Select dropdownMatchSelectWidth={false} onChange={save} placeholder={title}>
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
            dropdownMatchSelectWidth={false}
            placeholder={title}
            onChange={save}
            optionFilterProp="children"
            filterOption={filterOption}
          >
            {optionNode(valueEnum)}
          </Select>
        );
        break;
      case 'RemoteSearch':
        let selectData = valueEnum;
        if (remoteData[dataIndex]) {
          selectData = remoteData[dataIndex];
        }
        node = (
          <Select
            mode={remoteConfig.remoteMode}
            placeholder={title}
            notFoundContent={remoteFetching ? <Spin size="small" /> : null}
            dropdownMatchSelectWidth={false}
            filterOption={false}
            allowClear
            showSearch
            onChange={save}
            // 当获取焦点查询全部
            onFocus={() => fetchRemote(undefined, dataIndex, record, remoteConfig.remoteApi)}
            onSearch={(value) => fetchRemote(value, dataIndex, record, remoteConfig.remoteApi)}
          >
            {dataIndex && optionNode(selectData)}
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
  } else {
    if (valueType) {
      if (valueEnum && (valueType === 'Select' || valueType === 'AutoComplete')) {
        childNode = getSelectValue(valueEnum, record[dataIndex]);
      }
      if (record[recordSelectField] && valueType === 'RecordSelect') {
        childNode = getSelectValue(record[recordSelectField], record[dataIndex]);
      }
    }
  }

  if (controlRender) {
    childNode = controlRender(record, childNode);
  }

  return (
    <td {...restProps} title={title as string}>
      {childNode}
    </td>
  );
};

export default EditableCell;
