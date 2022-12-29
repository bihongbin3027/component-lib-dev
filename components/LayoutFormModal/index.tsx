import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Spin, Row, Col, Button, Space, message } from 'antd';
import moment from 'moment';
import _ from 'lodash';
import { FormInstance } from 'rc-field-form/es/interface';
import { FormProps } from 'antd/es/form';
import { ColProps } from 'antd/es/col';
import GenerateForm, { FormCallType, FormListType } from '../GenerateForm';
import useSetState from '../unrelated/hooks/useSetState';
import Dialog from '../Dialog';
import { AnyObjectType, SubmitApiType } from '../unrelated/typings';
import './index.less';

export interface LayoutFormPropTypes {
  /** 打开或关闭 */
  visible: boolean;
  /** 表单是否禁用 */
  disable?: boolean;
  id?: string | null | undefined;
  /** 弹窗标题 */
  title: string | React.ReactNode | null | undefined;
  /** 弹窗宽度 */
  width?: number;

  /** 表单弹窗头部显示的额外dom元素 */
  topRender?: React.ReactElement;
  /** 组件子元素插槽 */
  children?: React.ReactNode;
  /** 底部操作按钮自定义 */
  footer?: React.ReactNode;

  /** 手动参数转换 */
  manualParameterChange?: (params: AnyObjectType) => AnyObjectType;
  /** 手动验证表单 */
  manualVerification?: (params: AnyObjectType) => boolean;
  /** 提交表单需要移除的参数 */
  submitRemoveField?: string[];
  /** 需要提交表单的额外参数 */
  submitExtraParameters?: AnyObjectType;
  /** 开关组件值转换成0和1 */
  switchTransform?: string[];

  /** 提交表单的接口 */
  submitApi?: SubmitApiType;
  /** 关闭弹窗回调 */
  onCancel?: () => void;
  /** 确定或保存回调 */
  onConfirm?: (data: AnyObjectType) => void;
  /** 表单数据 */
  formList: FormListType[];
  /** 表单每行显示的数量 */
  colGirdConfig?: ColProps;
  /** 支持antd Form组件官方传参所有类型 */
  formConfig?: FormProps;
}

// 导出该组件可调用的方法类型
export interface LayoutFormModalCallType {
  setFormLoading: (data: boolean) => void;
  setFormSaveLoading: (data: boolean) => void;
  setFormFields: FormInstance['setFields'];
  getFormValues: (data: string[]) => AnyObjectType | undefined;
  setFormValues: (values: AnyObjectType) => void;
  getFormSubmitValues: () => Promise<AnyObjectType | undefined>;
}

export type LayoutFormModalListType = FormListType;

interface StateType {
  loading: boolean;
  saveLoading: boolean;
  disabled: boolean;
}

/** 弹窗表单组件，支持多种表单类型，手动提交（设置onConfirm）和自动提交（设置submitApi）参数至服务器 */
const LayoutFormModal = (props: LayoutFormPropTypes, ref: any) => {
  const formRef = useRef<FormCallType>(); // 表单实例
  const [state, setState] = useSetState<StateType>({
    loading: false, // loading
    saveLoading: false, // 保存按钮loading
    disabled: false, // 表单是否可编辑，当不可编辑不能显示保存按钮
  });

  /**
   * @Description 提交表单
   * @Author bihongbin
   * @Date 2020-08-01 15:38:26
   */
  const formSubmit = async () => {
    let formParams = await formRef.current?.formSubmit();
    if (formParams) {
      if (
        formParams.endTime &&
        formParams.startTime &&
        moment(formParams.endTime).isBefore(formParams.startTime)
      ) {
        message.warn('生效日期不能大于失效日期', 1.5);
        return;
      }
      setState({
        saveLoading: true,
      });
      try {
        let result: AnyObjectType = {};
        // 合并父组件传过来的额外参数
        formParams = {
          ...formParams,
          ...props.submitExtraParameters,
        };
        // 转换开关组件的值是0或1
        if (props.switchTransform) {
          for (let i = 0; i < props.switchTransform.length; i++) {
            if (formParams[props.switchTransform[i]]) {
              formParams[props.switchTransform[i]] = '1';
            } else {
              formParams[props.switchTransform[i]] = '0';
            }
          }
        }
        // 额外指定参数移除
        if (props.submitRemoveField) {
          for (let i = 0; i < props.submitRemoveField.length; i++) {
            if (formParams[props.submitRemoveField[i]]) {
              delete formParams[props.submitRemoveField[i]];
            }
          }
        }
        // 时间格式转换
        for (let o in formParams) {
          const formatStr = 'YYYY-MM-DD HH:mm:ss';
          if (moment(formParams[o], formatStr, true).isValid()) {
            formParams[o] = moment(formParams[o]).format(formatStr);
          }
        }
        // 从父级手动转换参数
        if (props.manualParameterChange) {
          formParams = props.manualParameterChange(formParams);
        }
        // 手动验证表单
        if (props.manualVerification) {
          if (!props.manualVerification(formParams)) {
            console.warn('手动验证表单不通过');
            setState({
              saveLoading: false,
            });
            return;
          }
        }
        formParams = _.omitBy(formParams, _.isNil);
        if (props.submitApi && formParams) {
          if (props.id) {
            formParams.id = props.id;
            result = await props.submitApi(formParams, 'put');
          } else {
            result = await props.submitApi(formParams, 'post');
          }
          if (result.code === 1) {
            // 确定或保存回调
            if (props.onConfirm) {
              props.onConfirm(result);
            }
            message.success('操作成功', 1.5);
            props.onCancel && props.onCancel();
          }
          setState({
            saveLoading: false,
          });
        } else {
          // 确定或保存回调
          if (props.onConfirm && formParams) {
            props.onConfirm(formParams);
          }
        }
      } catch (error) {
        setState({
          saveLoading: false,
        });
      }
    }
  };

  /**
   * @Description 关闭弹窗，自动关闭loading
   * @Author bihongbin
   * @Date 2021-03-15 18:32:02
   */
  useEffect(() => {
    if (props.visible === false) {
      setState({
        saveLoading: false,
      });
    }
  }, [props.visible, setState]);

  /**
   * @Description 表单是否是禁用状态
   * @Author bihongbin
   * @Date 2020-08-05 11:37:06
   */
  useEffect(() => {
    setState({
      disabled: props.disable,
    });
  }, [props.disable, setState]);

  /**
   * @Description 暴漏给父组件调用
   * @Author bihongbin
   * @Date 2020-08-01 15:59:36
   */
  useImperativeHandle<any, LayoutFormModalCallType>(ref, () => ({
    // 设置loading
    setFormLoading: (data) => {
      setState({
        loading: data,
      });
    },
    // 设置保存loading
    setFormSaveLoading: (data) => {
      setState({
        saveLoading: data,
      });
    },
    // 设置一组字段状态
    setFormFields: (fields) => {
      if (formRef.current) {
        formRef.current.setFormFields(fields);
      }
    },
    // 读取表单值
    getFormValues: (data) => {
      return formRef.current?.getFormValues(data);
    },
    // 设置表单值
    setFormValues: (data) => {
      if (formRef.current) {
        formRef.current.setFormValues(data);
      }
    },
    // 获取表单提交的值
    getFormSubmitValues: async () => {
      if (formRef.current) {
        return await formRef.current?.formSubmit();
      } else {
        return {};
      }
    },
  }));

  return (
    <Dialog
      className="form-modal"
      width={props.width ? props.width : 600}
      visible={props.visible}
      title={props.title || '对话框'}
      onCancel={props.onCancel}
      destroyOnClose
      maskClosable={false}
      footer={null}
    >
      <Spin spinning={state.loading}>
        <div className="modal-form-height">
          {props.topRender ? props.topRender : null}
          <GenerateForm
            ref={formRef}
            formConfig={{
              labelCol: { span: 24 },
              ...props.formConfig,
            }}
            rowGridConfig={{ gutter: [20, 0] }}
            colGirdConfig={props.colGirdConfig || { span: 12 }}
            list={props.formList}
          />
          {props.children && props.children}
        </div>
        {props.footer ? (
          props.footer
        ) : (
          <Row className="form-modal-foot" justify="center">
            <Col>
              <Space size={20}>
                <Button onClick={() => props.onCancel && props.onCancel()}>关闭</Button>
                {!state.disabled && (
                  <Button type="primary" loading={state.saveLoading} onClick={formSubmit}>
                    提交
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        )}
      </Spin>
    </Dialog>
  );
};

export default forwardRef(LayoutFormModal);
