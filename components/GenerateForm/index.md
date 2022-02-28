```js
import React, { useRef } from 'react';
import { Row, Col, Button } from 'antd';

const formRef = useRef(null);

const selectData = [
  {
    label: '张三',
    value: 0,
  },
  {
    label: '李四',
    value: 1,
  },
];

const submit = async () => {
  if (formRef.current) {
    const result = await formRef.current.formSubmit();
    alert(JSON.stringify(result));
    console.log('表单提交值：', result);
  }
};

const reset = () => {
  if (formRef.current) {
    formRef.current.formReset();
  }
};

const manualSet = () => {
  if (formRef.current) {
    formRef.current.setFormValues({
      a: '这是手动设置的值!',
    });
  }
};

<>
  <GenerateForm
    ref={formRef}
    // form config 支持antd所有默认参数
    formConfig={{
      labelCol: { span: 24 },
      // 表单默认值
      initialValues: {
        i: 0,
        j: [0, 1],
      },
    }}
    // 表单项gutter=[左右， 上下]边距
    rowGridConfig={{ gutter: [20, 0] }}
    // 每项宽度（每行分21小段，12占据一半）
    colGirdConfig={{ span: 12 }}
    // 表单数据
    list={[
      {
        componentName: 'Input',
        name: 'a',
        label: '输入框',
        placeholder: '请输入内容',
        rules: [{ required: true, message: '请输入内容' }], // 表单验证
      },
      {
        componentName: 'Select',
        name: 'b',
        label: '下拉框',
        placeholder: '请选择',
        selectData: selectData,
      },
      {
        componentName: 'AutoComplete',
        name: 'd',
        label: '多行输入（展开后可对选项进行搜索）',
        placeholder: '请选择',
        selectData: selectData,
      },
      {
        componentName: 'Multiple',
        name: 'e',
        label: '下拉框多选',
        placeholder: '请选择',
        selectData: selectData,
      },
      {
        componentName: 'RemoteSearch',
        name: 'f',
        label: '下拉框（远程搜索）',
        placeholder: '请选择',
        remoteConfig: {
          remoteApi: (val) => {
            return new Promise((resolve, reject) => {
              console.log('下拉框（远程搜索）触发ajax请求', val);
              setTimeout(() => {
                resolve(selectData);
              }, 30);
            });
          },
        },
      },
      {
        componentName: 'TreeSelect',
        name: 'f1',
        label: '下拉树选择',
        placeholder: '请选择',
        treeSelectConfig: {
          data: {
            title: 'a',
            value: 'b',
            onChange: (value, formItem) => {
              console.log('value', value);
              formItem.name = 'dt';
              return formItem;
            },
            api: () => {
              console.log('下拉树选择触发');
              return new Promise((resolve, reject) => {
                resolve([
                  {
                    a: 'Node1',
                    b: '0-0',
                    children: [
                      {
                        a: 'Child Node1',
                        b: '0-0-1',
                      },
                    ],
                  },
                  {
                    a: 'Node2',
                    b: '0-1',
                  },
                ]);
              });
            },
          },
        },
      },
      {
        componentName: 'DatePicker',
        name: 'startTime',
        label: '时间选择器',
        placeholder: '请选择时间',
      },
      {
        componentName: 'RangePicker',
        name: 'h',
        label: '时间范围选择器',
        rangePickerConfig: { showTime: true },
      },
      {
        componentName: 'Radio',
        name: 'i',
        label: '单选框',
        selectData: selectData,
      },
      {
        componentName: 'Checkbox',
        name: 'j',
        label: '多选框',
        selectData: selectData,
      },
      {
        componentName: 'Union',
        label: '价格',
        name: 'a',
        rules: [{ required: true }],
        unionConfig: {
          unionItems: [
            {
              componentName: 'RemoteSearch',
              name: 'a11',
              placeholder: '价格',
              remoteConfig: {
                remoteApi: (val) => {
                  console.log('下拉框（远程搜索）触发ajax请求', val);
                  return new Promise((resolve, reject) => {
                    resolve(selectData);
                  });
                },
              },
              rules: [{ required: true, message: '请输入价格' }],
            },
            {
              componentName: 'RemoteSearch',
              name: 'b11',
              placeholder: '价格',
              remoteConfig: {
                remoteApi: (val) => {
                  console.log('下拉框（远程搜索）触发ajax请求', val);
                  return new Promise((resolve, reject) => {
                    resolve(selectData);
                  });
                },
              },
              rules: [{ required: true, message: '请输入价格' }],
            },
          ],
        },
      },
      {
        componentName: 'TextArea',
        name: 'c',
        label: '多行输入',
        placeholder: '请输入内容',
        rows: 3,
        colProps: { span: 24 },
      },
      {
        componentName: 'Rate',
        name: 'k',
        label: '评分',
      },
    ]}
  />
  <pre />
  <Row gutter={10}>
    <Col>
      <Button type="primary" onClick={submit}>
        提交表单
      </Button>
    </Col>
    <Col>
      <Button type="primary" onClick={reset}>
        表单重置
      </Button>
    </Col>
    <Col>
      <Button type="primary" onClick={manualSet}>
        手动设置name=a的表单值
      </Button>
    </Col>
  </Row>
</>;
```
