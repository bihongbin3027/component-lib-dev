import React, {
  useRef,
  useEffect,
  useMemo,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';
import moment from 'moment';
import _ from 'lodash';
import { Row, Col, Space, Button, Card, Typography, message } from 'antd';
import { RowProps } from 'antd/lib/row';
import { ColProps } from 'antd/lib/col';
import { TableProps } from 'antd/es/table';
import { FormProps } from 'antd/es/form';
import GenerateForm, { FormListType, FormCallType } from '../GenerateForm';
import GenerateTable, {
  TableCallType,
  GenerateTableProp,
  TableColumns,
  getTableListQueryType,
} from '../GenerateTable';
import Dialog from '../Dialog';
import Empty from '../Empty';
import useSetState from '../unrelated/hooks/useSetState';
import { dropDownMenuPushAll } from '../unrelated/utils';
import { AnyObjectType, PromiseAxiosResultType } from '../unrelated/typings';
import './index.less';

export type LayoutTableModalCallType = TableCallType &
  FormCallType & {
    setSavaLoading: (data: boolean) => void;
  };

export interface SizeType {
  xs?: number; // 屏幕 < 576px 响应式栅格
  sm?: number; // 屏幕 ≥ 576px 响应式栅格
  md?: number; // 屏幕 ≥ 768px 响应式栅格
  lg?: number; // 屏幕 ≥ 992px 响应式栅格
  xl?: number; // 屏幕 ≥ 1200px 响应式栅格
  xxl?: number; // 屏幕 ≥ 1600px 响应式栅格
}

export interface LayoutTableModalPropType {
  /** 打开或关闭 */
  visible: boolean;
  /** 弹窗标题 */
  title: React.ReactNode;
  /** 弹窗宽度 */
  width?: number;
  /** 头部渲染额外元素 */
  topExtra?: React.ReactNode;
  /** 搜索表单数据 */
  searchFormList?: FormListType[];
  /** 表单方法 */
  formConfig?: FormProps;
  /** 查询时是否清除选中项 */
  clearSelectIds?: getTableListQueryType['clearSelectIds'];
  /** rowType=checkbox多选 radio单选 list=表格头 tableConfig=自定义配置，支持antd官方表格所有参数*/
  tableColumnsList: {
    /** checkbox多选 radio单选 */
    rowType?: 'checkbox' | 'radio' | undefined;
    /** 表格头 */
    list: TableColumns[];
    /** 自定义配置，支持antd官方表格所有参数 */
    tableConfig?: TableProps<any>;
  };
  /** 是否开启默认查询功能 */
  autoGetList?: boolean;
  /** 查询回调 */
  searchCallback?: (data: any) => Promise<Boolean>;
  /** 不需要重置的表单字段 */
  searchNoResetFiled?: string[];
  /** 列表请求函数 */
  apiMethod?: (data: any) => PromiseAxiosResultType;
  /** 查询表单手动参数转换 */
  manualParameterChange?: (params: AnyObjectType) => AnyObjectType;
  /** 静态表格数据 */
  data?: AnyObjectType[];
  /** 已选列表 */
  openSelected?: {
    /** 是否打开 */
    visible: boolean;
    /** 默认已选中 */
    defaultValues?: AnyObjectType[];
    /** 显示的字段名 */
    fileName?: string;
    /** 内容区域高度 */
    height?: number;
  };
  /** 排列方式布局Row */
  rowProps?: RowProps;
  /** 主内容Col */
  colProps?: ColProps;
  /** 左边插槽 */
  leftSlot?: {
    colProps: ColProps;
    jsx: React.ReactNode;
  };
  /** 右边插槽 */
  rightSlot?: {
    colProps: ColProps;
    jsx: React.ReactNode;
  };
  /** 数据调用成功回调 */
  getTableSuccessData?: (data: AnyObjectType) => void;
  /** 行选中回调 */
  onSelect?: GenerateTableProp['extra']['onSelect'];
  /** 关闭弹窗回调 */
  onCancel?: () => void;
  /** 确定弹窗回调 */
  onConfirm?: (rows: AnyObjectType[], ids: string[]) => Promise<boolean>;
}

interface StateType {
  /** 保存按钮loading */
  saveLoading: boolean;
  /** 已选中列表 */
  selectedRows: AnyObjectType[];
}

const { Link, Paragraph } = Typography;

/** 弹窗表格组件，常用来选择数据 */
function LayoutTableModal(props: LayoutTableModalPropType, ref: any) {
  const searchFormRef = useRef<FormCallType>(null);
  const tableRef = useRef<TableCallType>();
  const [state, setState] = useSetState<StateType>({
    saveLoading: false,
    selectedRows: [],
  });

  /**
   * @description table rowKey
   * @author bihongbin
   * @param {*}
   * @return {*}
   * @Date 2022-03-01 10:01:40
   */
  const rowKey = useMemo(
    () =>
      ((props.tableColumnsList &&
        props.tableColumnsList.tableConfig &&
        props.tableColumnsList.tableConfig.rowKey) ||
        'id') as string,
    [props.tableColumnsList],
  );

  /**
   * @Description 搜索表单宽度
   * @Author bihongbin
   * @Date 2021-09-17 17:50:34
   * @param {*} useMemo
   */
  const colGirdWidth = useMemo(() => {
    const width = props.width || 0;
    if (width >= 500 && width <= 800) {
      return {
        span: 7,
      };
    }
    if (width > 800 && width <= 1000) {
      return {
        span: 6,
      };
    } else if (width > 1000 && width <= 1200) {
      return {
        span: 5,
      };
    } else if (width > 1200) {
      return {
        span: 4,
      };
    } else {
      return {
        span: 8,
      };
    }
  }, [props.width]);

  /**
   * @description 移除已选列表项
   * @author bihongbin
   * @param {*} type all全部移除 odd单个移除
   * @param {AnyObjectType} item
   * @return {*}
   * @Date 2022-03-01 15:12:17
   */
  const onRemoveCol = (type: 'all' | 'odd', item?: AnyObjectType) => {
    if (tableRef.current) {
      let removeIds: string[] = [];
      let removeRows: AnyObjectType[] = [];
      if (type === 'all') {
        tableRef.current.clearSelectIds();
      }
      if (type === 'odd' && item) {
        removeIds = [item[rowKey]];
        removeRows = state.selectedRows.filter((rows) => rows[rowKey] !== item[rowKey]);
        tableRef.current.removeSelectIds(removeIds);
      }
      setState({
        selectedRows: removeRows,
      });
    }
  };

  /**
   * @description table-checkbox-onChange
   * @author bihongbin
   * @param {*}
   * @return {*}
   * @Date 2022-03-01 11:28:31
   */
  const onCheckChange = (selectedRows: AnyObjectType[], selectedRowKeys: string[]) => {
    setState({
      selectedRows: selectedRowKeys.map((key) => {
        let row: AnyObjectType = {};
        const currentSelected = selectedRows.find((t) => t[rowKey] === key);

        row[rowKey] = key;

        if (props.openSelected && props.openSelected.fileName) {
          row[props.openSelected.fileName] = key;
        }

        if (currentSelected) {
          row = currentSelected;
        }

        if (props.openSelected) {
          const fileName = props.openSelected.fileName;
          const defaultValues = props.openSelected.defaultValues;
          if (fileName) {
            if (defaultValues) {
              const find = defaultValues.find((t) => t[rowKey] === key);
              if (find) {
                row[fileName] = find[fileName];
              }
            }
          }
        }

        return row;
      }),
    });
  };

  /**
   * @Description 查询
   * @Author bihongbin
   * @Date 2021-03-05 09:52:56
   */
  const formSubmit = useCallback(async () => {
    if (searchFormRef.current && tableRef.current) {
      let result = await searchFormRef.current.formSubmit();
      if (result && Object.keys(result).length) {
        // 时间格式转换
        for (let o in result) {
          const formatStr = 'YYYY-MM-DD HH:mm:ss';
          if (moment(result[o], formatStr, true).isValid()) {
            result[o] = moment(result[o]).format(formatStr);
          }
        }
        result = {
          clearSelectIds: true,
          ...result,
        };
        if (props.clearSelectIds !== undefined) {
          result.clearSelectIds = props.clearSelectIds;
        }
        // 从父级手动转换参数
        if (props.manualParameterChange) {
          result = props.manualParameterChange(result);
        }
        if (props.searchCallback) {
          // 查询回调
          props.searchCallback(result).then((res) => {
            if (res) {
              tableRef.current?.getTableList(result);
            }
          });
        } else {
          tableRef.current.getTableList(result);
        }
      }
    } else {
      tableRef.current?.getTableList();
    }
  }, [props]);

  /**
   *
   * @Description 重置
   * @Author bihongbin
   * @Date 2020-07-31 10:27:40
   */
  const formReset = () => {
    if (searchFormRef.current) {
      let fileName: string[] = [];
      const searchNoResetFiled = props.searchNoResetFiled || [];

      if (props.searchFormList) {
        for (let n of props.searchFormList) {
          // 处理表单嵌套的情况
          if (n.unionConfig) {
            for (let k of n.unionConfig.unionItems) {
              // 找出禁止重置的字段
              if (k.name && !searchNoResetFiled.includes(k.name)) {
                fileName.push(k.name);
              }
            }
          }
          // 找出禁止重置的字段
          if (n.name && !searchNoResetFiled.includes(n.name)) {
            fileName.push(n.name);
          }
        }
      }

      searchFormRef.current.formReset(fileName);
    }
    formSubmit();
  };

  /**
   * @Description 确定
   * @Author bihongbin
   * @Date 2020-08-07 13:48:41
   */
  const handleConfirm = () => {
    let rows: AnyObjectType[] = [];
    let ids: string[] = [];
    if (props.openSelected && props.openSelected.visible) {
      rows = state.selectedRows;
    } else {
      rows = tableRef.current?.getSelectRowsArray() || [];
    }
    if (props.onConfirm) {
      if (tableRef.current) {
        ids = tableRef.current.getSelectIds();
      }
      setState({
        saveLoading: true,
      });
      props
        .onConfirm(rows, ids)
        .then((res) => {
          setState({
            saveLoading: false,
          });
          if (res) {
            props.onCancel && props.onCancel();
          }
        })
        .catch((err) => {
          setState({
            saveLoading: false,
          });
          message.warn(err, 1.5);
        });
    }
  };

  /**
   * @Description 开启默认查询功能
   * @Author bihongbin
   * @Date 2020-08-05 14:09:53
   */
  useEffect(() => {
    if (props.visible) {
      if (props.autoGetList) {
        formSubmit();
      }
      if (props.openSelected && props.openSelected.visible) {
        setState((prev) => {
          prev.selectedRows = props.openSelected?.defaultValues || [];
          tableRef.current?.setRowSelected(prev.selectedRows.map((item) => item[rowKey]));
          return prev;
        });
      }
    }
  }, [formSubmit, props.autoGetList, props.openSelected, props.visible, rowKey, setState]);

  // 暴漏给父组件调用
  useImperativeHandle<any, LayoutTableModalCallType>(ref, () => ({
    // 搜索表单方法
    ...(searchFormRef.current as FormCallType),
    // 表格实例对象方法
    ...(tableRef.current as TableCallType),
    /** 设置保存loading */
    setSavaLoading: (data) => {
      setState({
        saveLoading: data,
      });
    },
  }));

  return (
    <Dialog
      className="from-table-modal"
      width={props.width}
      visible={props.visible}
      title={props.title || '弹窗'}
      onCancel={props.onCancel}
      forceRender
      maskClosable={false}
      footer={null}
    >
      {props.topExtra}
      {props.searchFormList ? (
        <GenerateForm
          ref={searchFormRef}
          rowGridConfig={{ gutter: 10 }}
          colGirdConfig={colGirdWidth}
          list={dropDownMenuPushAll(props.searchFormList)}
          formConfig={props.formConfig}
          render={() => {
            if (props.searchFormList && props.searchFormList.length) {
              return (
                <Space size={10}>
                  <Button
                    type="primary"
                    onClick={() => {
                      formSubmit();
                    }}
                  >
                    查询
                  </Button>
                  <Button className="btn-reset" onClick={formReset}>
                    重置
                  </Button>
                </Space>
              );
            }
            return <></>;
          }}
        />
      ) : null}
      <Row {...props.rowProps}>
        {props.leftSlot ? <Col {...props.leftSlot.colProps}>{props.leftSlot.jsx}</Col> : null}
        <Col {...props.colProps}>
          <Row gutter={10}>
            <Col span={props.openSelected && props.openSelected.visible ? 16 : 24}>
              <GenerateTable
                ref={tableRef}
                extra={{
                  rowType: props.tableColumnsList.rowType,
                  apiMethod: props.apiMethod,
                  columns: props.tableColumnsList.list,
                  data: props.data,
                  onSelect: (selectedRows, selectedRowKeys) => {
                    onCheckChange(selectedRows, selectedRowKeys);
                    props.onSelect && props.onSelect(selectedRows, selectedRowKeys);
                  },
                  getTableSuccessData: props.getTableSuccessData,
                  tableConfig: props.tableColumnsList.tableConfig,
                  scroll: {
                    x: 'max-content',
                  },
                }}
              />
            </Col>
            {props.openSelected && props.openSelected.visible ? (
              <Col span={8}>
                <Card
                  title="已选列表"
                  size="small"
                  bodyStyle={{
                    height: props.openSelected.height || 330,
                    overflowY: 'auto',
                  }}
                  extra={<Link onClick={() => onRemoveCol('all')}>全部移除</Link>}
                >
                  {state.selectedRows.length ? (
                    state.selectedRows.map((item) => {
                      const key = rowKey;
                      const id = item[key];
                      const title = item[props.openSelected?.fileName as string];
                      return (
                        <Row key={id} gutter={12}>
                          <Col span={11} title={title}>
                            <Paragraph ellipsis>{title}</Paragraph>
                          </Col>
                          <Col span={9} title={id}>
                            <Paragraph ellipsis>{id}</Paragraph>
                          </Col>
                          <Col span={4}>
                            <Link onClick={() => onRemoveCol('odd', item)}>移除</Link>
                          </Col>
                        </Row>
                      );
                    })
                  ) : (
                    <Empty outerHeight={200} />
                  )}
                </Card>
              </Col>
            ) : null}
          </Row>
        </Col>
        {props.rightSlot ? <Col {...props.rightSlot.colProps}>{props.rightSlot.jsx}</Col> : null}
      </Row>
      <Row className="from-table-modal-foot" justify="center">
        <Col>
          <Space size={20}>
            {props.onCancel ? (
              <Button onClick={() => props.onCancel && props.onCancel()}>关闭</Button>
            ) : null}
            {props.onConfirm ? (
              <Button type="primary" loading={state.saveLoading} onClick={handleConfirm}>
                确定
              </Button>
            ) : null}
          </Space>
        </Col>
      </Row>
    </Dialog>
  );
}

export default forwardRef(LayoutTableModal);
