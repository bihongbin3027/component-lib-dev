import React, { useRef, useMemo, useEffect, useCallback } from 'react';
import { Row, Col, Button, Space, message } from 'antd';
import moment from 'moment';
import { LeftCircleFilled, RightCircleFilled } from '@ant-design/icons';
import GenerateForm, { FormCallType, FormListType } from '../GenerateForm';
import useSetState from '../unrelated/hooks/useSetState';
import Dialog from '../Dialog';
import { AjaxResultType, AnyObjectType } from '../unrelated/typings';
import './index.less';

export interface QuicklyProcessTypes {
  /** 打开或关闭 */
  visible: boolean;
  id?: string | null | undefined;
  /** 弹窗标题 */
  title?: string | null | undefined;
  /** 弹窗宽度 */
  width?: number;
  /** 需要转换成时间格式的参数 */
  transformTime?: string[];
  /** 处理数据 */
  data: AnyObjectType[];
  /** 表单数据 */
  formList: FormListType[];
  /** 提交表单的接口 */
  submitApi: (data: any, method: 'put' | 'post') => Promise<AjaxResultType>;
  /** 上一页下一页切换回调 */
  onChange?: (data: AnyObjectType) => void;
  /** 关闭弹窗回调 */
  onCancel?: () => void;
}

interface StateType {
  id: QuicklyProcessTypes['id'];
  saveLoading: boolean;
  data: QuicklyProcessTypes['data'];
}

/** 批量编辑，用来编辑表格列表数据 */
const QuicklyProcessForms = (props: QuicklyProcessTypes) => {
  const formRef = useRef<FormCallType>(); // 表单实例
  const [state, setState] = useSetState<StateType>({
    id: undefined,
    saveLoading: false,
    data: [],
  });

  // 左右操作按钮样式
  const leftRightStyle = {
    fontSize: 24,
  };

  /**
   * @Description 根据当前id找到数组对应的索引
   * @Author bihongbin
   * @Date 2020-11-29 11:00:13
   */
  const currentIndex = useMemo(() => {
    let k = 0;
    for (let [index, item] of state.data.entries()) {
      if (item.id === state.id) {
        k = index;
        break;
      }
    }
    return k;
  }, [state.data, state.id]);

  /**
   * @Description 保存
   * @Author bihongbin
   * @Date 2021-01-15 17:41:38
   */
  const save = useCallback(async () => {
    if (formRef.current) {
      const formResult = await formRef.current.formSubmit();
      formResult.id = state.data[currentIndex].id;
      setState({
        saveLoading: true,
      });
      try {
        props.submitApi(formResult, 'put');
        message.success('保存成功', 1.5);
      } catch (error) {}
      setState({
        saveLoading: false,
      });
    }
  }, [currentIndex, props, setState, state.data]);

  /**
   * @Description 上一页
   * @Author bihongbin
   * @Date 2020-11-29 10:57:43
   */
  const prev = useCallback(async () => {
    if (currentIndex === 0) {
      message.destroy();
      message.warn('已经是第一个啦~', 1.5);
      return;
    } else {
      if (formRef.current) {
        const formResult = await formRef.current.formSubmit();
        if (formResult) {
          formResult.id = state.data[currentIndex].id;
          try {
            const cutIndexObj = state.data[currentIndex - 1];
            props.submitApi(formResult, 'put');
            // 回调
            if (props.onChange) {
              props.onChange(cutIndexObj);
            }
            setState((prev) => {
              prev.id = cutIndexObj.id;
              prev.data[currentIndex] = {
                ...prev.data[currentIndex],
                ...formResult,
              };
              return prev;
            });
          } catch (error) {}
        }
      }
    }
  }, [currentIndex, props, setState, state.data]);

  /**
   * @Description 下一页
   * @Author bihongbin
   * @Date 2020-11-29 10:57:58
   */
  const next = useCallback(async () => {
    if (state.data.length === 0 || currentIndex === state.data.length - 1) {
      message.destroy();
      message.warn('已经是最后一个啦~', 1.5);
      return;
    } else {
      if (formRef.current) {
        const formResult = await formRef.current.formSubmit();
        if (formResult) {
          formResult.id = state.data[currentIndex].id;
          try {
            const plusIndexObj = state.data[currentIndex + 1];
            props.submitApi(formResult, 'put');
            // 回调
            if (props.onChange) {
              props.onChange(plusIndexObj);
            }
            setState((prev) => {
              prev.id = plusIndexObj.id;
              prev.data[currentIndex] = {
                ...prev.data[currentIndex],
                ...formResult,
              };
              return prev;
            });
          } catch (error) {}
        }
      }
    }
  }, [currentIndex, props, setState, state.data]);

  /**
   * @Description 键盘按下
   * @Author bihongbin
   * @Date 2020-11-29 14:07:47
   */
  const keyDown = useCallback(
    async (e: KeyboardEvent) => {
      // 上一页
      if (e.key === 'PageUp') {
        prev();
        e.preventDefault();
      }
      // 下一页
      if (e.key === 'PageDown') {
        next();
        e.preventDefault();
      }
      // 回车
      if (e.key === 'Enter') {
        save();
      }
    },
    [next, prev, save],
  );

  /**
   * @Description 设置表单数据
   * @Author bihongbin
   * @Date 2020-11-29 11:55:48
   */
  useEffect(() => {
    if (props.visible) {
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.formSetValues(state.data[currentIndex]);
        }
      }, 100);
    }
  }, [currentIndex, props.visible, state.data]);

  /**
   * @Description 如果表单参数用到时间选择组件，需要转换成moment对象
   * @Author bihongbin
   * @Date 2020-11-29 13:59:25
   */
  useEffect(() => {
    setState({
      id: props.id,
      data: props.data.map((item) => {
        if (props.transformTime) {
          for (let date of props.transformTime) {
            if (item[date]) {
              item[date] = moment(item[date]);
            }
          }
        }
        return item;
      }),
    });
  }, [props.data, props.id, props.transformTime, setState]);

  /**
   * @Description 键盘事件监听和移除
   * @Author bihongbin
   * @Date 2020-11-29 14:01:41
   */
  useEffect(() => {
    if (props.visible) {
      document.addEventListener('keydown', keyDown);
    } else {
      document.removeEventListener('keydown', keyDown);
    }
    return () => {
      document.removeEventListener('keydown', keyDown);
    };
  }, [keyDown, props.visible]);

  return (
    <Dialog
      className="quickly-form-modal"
      width={props.width ? props.width : 960}
      visible={props.visible}
      title={props.title || '快速编辑信息'}
      onCancel={props.onCancel}
      maskClosable={false}
      destroyOnClose
      footer={null}
    >
      <Row className="modal-form-height" gutter={16} align="middle" wrap={false}>
        <Col flex="60px">
          <Row justify="center">
            <Col>
              <LeftCircleFilled className="circle-filled" style={leftRightStyle} onClick={prev} />
            </Col>
          </Row>
        </Col>
        <Col flex="auto">
          <GenerateForm
            ref={formRef}
            formConfig={{
              labelCol: { span: 24 },
            }}
            rowGridConfig={{ gutter: [20, 0] }}
            colGirdConfig={{ span: 6 }}
            list={props.formList}
          />
        </Col>
        <Col flex="60px">
          <Row justify="center">
            <Col>
              <RightCircleFilled className="circle-filled" style={leftRightStyle} onClick={next} />
            </Col>
          </Row>
        </Col>
      </Row>
      <Row className="quickly-form-modal-foot" justify="center">
        <Col>
          <Space size={20}>
            <Button onClick={() => props.onCancel && props.onCancel()}>取消</Button>
            <Button type="primary" loading={state.saveLoading} onClick={save}>
              提交
            </Button>
          </Space>
        </Col>
      </Row>
    </Dialog>
  );
};

export default QuicklyProcessForms;
