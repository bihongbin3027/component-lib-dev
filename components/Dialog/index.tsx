import React from 'react';
import ReactDOM from 'react-dom';
import Draggable, { DraggableEvent, DraggableData } from 'react-draggable';
import { Modal } from 'antd';
import { ModalProps } from 'antd/es/modal';
import './index.less';

let dialogIndex = 1;

type PropType = ModalProps & {
  onOk?: (e?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onCancel?: (e?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
};

interface StateType {
  disabled: boolean;
  bounds: {
    left: number;
    top: number;
    bottom: number;
    right: number;
  };
}

/** 弹窗组件 */
export default class Dialog extends React.Component<PropType, StateType> {
  static show(props: any): Dialog {
    let body = document.body;
    let host = document.createElement('div');
    let onOk = props && props.onOk;
    let onCancel = props && props.onCancel;
    let dialog;

    host.id = 'dialog-' + dialogIndex++;
    host.style.cssText = 'position:absolute;top:0;left:0;';
    body.appendChild(host);

    props = props || {};
    props.visible = true;
    props.getContainer = false;
    props.destroyOnClose = true;

    props.onOk = () => {
      onOk && onOk();
      body.removeChild(host);
    };

    props.onCancel = () => {
      onCancel && onCancel();
      body.removeChild(host);
    };

    ReactDOM.render(<Dialog {...props} ref={(ref) => (dialog = ref)}></Dialog>, host);

    return dialog as any;
  }

  static confirm(title: string, children: React.ReactNode, onOk: Function) {
    return Dialog.show({
      title,
      children,
      onOk,
    });
  }

  draggleRef: any;

  constructor(props: PropType) {
    super(props);

    this.state = {
      disabled: true,
      bounds: { left: 0, top: 0, bottom: 0, right: 0 },
    };
  }

  onStart(event: DraggableEvent, uiData: DraggableData) {
    const { clientWidth, clientHeight } = window.document.documentElement;
    const targetRect = this.draggleRef?.current?.getBoundingClientRect();

    this.setState({
      bounds: {
        left: -targetRect?.left + uiData?.x,
        right: clientWidth - (targetRect?.right - uiData?.x),
        top: -targetRect?.top + uiData?.y,
        bottom: clientHeight - (targetRect?.bottom - uiData?.y),
      },
    });
  }

  render() {
    let props = this.props;
    let state = this.state;

    return (
      <Modal
        className="dialog"
        {...props}
        title={
          <div
            style={{ cursor: 'move' }}
            onMouseOver={() => {
              this.setState({
                disabled: false,
              });
            }}
            onMouseOut={() => {
              this.setState({
                disabled: true,
              });
            }}
            // fix eslintjsx-a11y/mouse-events-have-key-events
            // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/master/docs/rules/mouse-events-have-key-events.md
            onFocus={() => {}}
            onBlur={() => {}}
            // end
          >
            {props.title}
          </div>
        }
        modalRender={(modal) => (
          <Draggable
            disabled={state.disabled}
            bounds={state.bounds}
            onStart={(event, uiData) => this.onStart(event, uiData)}
          >
            <div ref={this.draggleRef}>{modal}</div>
          </Draggable>
        )}
      >
        {props.children}
      </Modal>
    );
  }

  close(onOk?: boolean) {
    let props = this.props;

    if (onOk) {
      props.onOk && props.onOk();
    } else {
      props.onCancel && props.onCancel();
    }
  }
}
