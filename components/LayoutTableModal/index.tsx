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
import { Row, Col, Space, Button, message } from 'antd';
import { TableProps, ColumnType } from 'antd/es/table';
import { FormProps } from 'antd/es/form';
import GenerateForm, { FormListType, FormCallType } from '../GenerateForm';
import GenerateTable, { TableCallType } from '../GenerateTable';
import useSetState from '../unrelated/hooks/useSetState';
import Dialog from '../Dialog';
import { dropDownMenuPushAll, isEqualWith } from '../unrelated/utils';
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
  /** rowType=checkbox多选 radio单选 list=表格头 tableConfig=自定义配置，支持antd官方表格所有参数*/
  tableColumnsList: {
    /** checkbox多选 radio单选 */
    rowType?: 'checkbox' | 'radio' | undefined;
    /** 表格头 */
    list: ColumnType<AnyObjectType>[];
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
  /** 数据调用成功回调 */
  getTableSuccessData?: (data: AnyObjectType) => void;
  /** 关闭弹窗回调 */
  onCancel?: () => void;
  /** 确定弹窗回调 */
  onConfirm?: (rows: AnyObjectType[], ids: string[]) => Promise<boolean>;
}

interface StateType {
  saveLoading: boolean;
}

/** 弹窗表格组件，常用来选择数据 */
function LayoutTableModal(props: LayoutTableModalPropType, ref: any) {
  const searchFormRef = useRef<FormCallType>(null);
  const tableRef = useRef<TableCallType>();
  const [state, setState] = useSetState<StateType>({
    saveLoading: false, // 保存按钮loading
  });

  /**
   * @Description 搜索表单宽度
   * @Author bihongbin
   * @Date 2021-09-17 17:50:34
   * @param {*} useMemo
   */
  const colGirdWidth = useMemo(() => {
    if (props.width >= 500 && props.width <= 800) {
      return {
        span: 7,
      };
    }
    if (props.width > 800 && props.width <= 1000) {
      return {
        span: 6,
      };
    } else if (props.width > 1000 && props.width <= 1200) {
      return {
        span: 5,
      };
    } else if (props.width > 1200) {
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
   * @Description 查询
   * @Author bihongbin
   * @Date 2021-03-05 09:52:56
   */
  const formSubmit = useCallback(async () => {
    if (searchFormRef.current && tableRef.current) {
      let result = await searchFormRef.current.formSubmit();
      if (result) {
        // 时间格式转换
        for (let o in result) {
          const formatStr = 'YYYY-MM-DD HH:mm:ss';
          if (moment(result[o], formatStr, true).isValid()) {
            result[o] = moment(result[o]).format(formatStr);
          }
        }
        result = {
          updateSelected: false,
          ...result,
        };
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
          tableRef.current?.getTableList(result);
        }
      }
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
    if (props.onConfirm) {
      if (tableRef.current) {
        ids = tableRef.current.getSelectIds();
        rows = tableRef.current.getSelectRowsArray();
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
    if (props.autoGetList && props.visible) {
      formSubmit();
    }
  }, [formSubmit, props.autoGetList, props.visible]);

  // 暴漏给父组件调用
  useImperativeHandle<any, LayoutTableModalCallType>(ref, () => ({
    // 搜索表单方法
    ...searchFormRef.current,
    // 表格实例对象方法
    ...tableRef.current,
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
                  <Button type="primary" onClick={formSubmit}>
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
      <GenerateTable
        ref={tableRef}
        extra={{
          rowType: props.tableColumnsList.rowType,
          apiMethod: props.apiMethod,
          columns: props.tableColumnsList.list,
          data: props.data,
          getTableSuccessData: props.getTableSuccessData,
          scroll: {
            x: 'max-content',
          },
          tableConfig: props.tableColumnsList.tableConfig,
        }}
      />
      <Row className="from-table-modal-foot" justify="center">
        <Col>
          <Space size={20}>
            {props.onCancel ? <Button onClick={() => props.onCancel()}>关闭</Button> : null}
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

export default React.memo(forwardRef(LayoutTableModal), isEqualWith);
