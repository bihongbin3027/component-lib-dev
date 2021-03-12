import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import moment from 'moment';
import _ from 'lodash';
import { Modal, Row, Col, Space, Button, message } from 'antd';
import { TableProps, ColumnType } from 'antd/es/table';
import GenerateForm, { FormListType, FormCallType } from '../GenerateForm';
import GenerateTable, { TableCallType } from '../GenerateTable';
import useSetState from '../../unrelated/hooks/useSetState';
import { dropDownMenuPushAll } from '../../unrelated/utils';
import { AnyObjectType, PromiseAxiosResultType } from '../../unrelated/typings';
import './index.less';

export interface LayoutTableModalCallType {
  setSavaLoading: (data: boolean) => void;
  LayoutTableListRef: () => TableCallType | undefined;
}

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
  /** 搜索表单数据 */
  searchFormList?: FormListType[];
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
  /** 列表请求函数 */
  apiMethod?: (data: any) => PromiseAxiosResultType;
  /** 查询表单手动参数转换 */
  manualParameterChange?: (params: AnyObjectType) => AnyObjectType;
  /** 静态表格数据 */
  data?: AnyObjectType[];
  /** 关闭弹窗回调 */
  onCancel?: () => void;
  /** 确定弹窗回调 */
  onConfirm?: (data: AnyObjectType[]) => Promise<boolean>;
}

interface StateType {
  autoGetList: boolean;
  saveLoading: boolean;
}

/** 弹窗表格组件，常用来选择数据 */
function LayoutTableModal(props: LayoutTableModalPropType, ref: any) {
  const searchFormRef = useRef<FormCallType>(null);
  const tableRef = useRef<TableCallType>();
  const [state, setState] = useSetState<StateType>({
    autoGetList: false, // 是否开启默认查询功能(true是 false否)
    saveLoading: false, // 保存按钮loading
  });

  /**
   * @Description 查询
   * @Author bihongbin
   * @Date 2021-03-05 09:52:56
   */
  const formSubmit = async () => {
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
        // 从父级手动转换参数
        if (props.manualParameterChange) {
          result = props.manualParameterChange(result);
        }
        tableRef.current?.getTableList(result);
      }
    }
  };

  /**
   *
   * @Description 重置
   * @Author bihongbin
   * @Date 2020-07-31 10:27:40
   */
  const formReset = () => {
    if (searchFormRef.current) {
      searchFormRef.current.formReset();
    }
    formSubmit();
  };

  /**
   * @Description 确定
   * @Author bihongbin
   * @Date 2020-08-07 13:48:41
   */
  const handleConfirm = () => {
    let data: AnyObjectType[] = [];
    if (props.onConfirm) {
      if (tableRef.current) {
        data = tableRef.current.getSelectRowsArray();
      }
      setState({
        saveLoading: true,
      });
      props
        .onConfirm(data)
        .then((res) => {
          setState({
            saveLoading: false,
          });
          if (res) {
            props.onCancel && props.onCancel();
          }
        })
        .catch((err) => {
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
    if (props.autoGetList) {
      setState({
        autoGetList: props.autoGetList,
      });
    }
  }, [props.autoGetList, setState]);

  /**
   * @Description 初始查询
   * @Author bihongbin
   * @Date 2020-10-29 17:17:51
   */
  useEffect(() => {
    if (props.visible && tableRef.current && state.autoGetList) {
      tableRef.current.getTableList({
        updateSelected: false,
      });
    }
  }, [props.visible, state.autoGetList]);

  // 暴漏给父组件调用
  useImperativeHandle<any, LayoutTableModalCallType>(ref, () => ({
    // 设置保存loading
    setSavaLoading: (data) => {
      setState({
        saveLoading: data,
      });
    },
    // 表格实例对象方法
    LayoutTableListRef: () => tableRef.current,
  }));

  return (
    <Modal
      className="from-table-modal"
      width={props.width}
      visible={props.visible}
      title={props.title || '弹窗'}
      onCancel={props.onCancel}
      forceRender
      maskClosable={false}
      footer={null}
    >
      {props.searchFormList ? (
        <GenerateForm
          className="search-form"
          ref={searchFormRef}
          rowGridConfig={{ gutter: 10 }}
          list={dropDownMenuPushAll(props.searchFormList)}
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
        rowType={props.tableColumnsList.rowType}
        apiMethod={props.apiMethod}
        columns={props.tableColumnsList.list}
        data={props.data}
        tableConfig={props.tableColumnsList.tableConfig}
      />
      <Row className="from-table-modal-foot" justify="center">
        <Col>
          <Space size={20}>
            <Button onClick={() => props.onCancel && props.onCancel()}>关闭</Button>
            <Button type="primary" loading={state.saveLoading} onClick={handleConfirm}>
              确定
            </Button>
          </Space>
        </Col>
      </Row>
    </Modal>
  );
}

export default forwardRef(LayoutTableModal);
