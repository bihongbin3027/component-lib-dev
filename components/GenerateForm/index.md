```js
import { useRef } from 'react';
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
    formRef.current.formSetValues({
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
            console.log('触发ajax请求');
            return new Promise((resolve, reject) => {
              resolve(selectData);
            });
          },
        },
      },
      {
        componentName: 'DatePicker',
        name: 'g',
        label: '时间选择器',
        placeholder: '请选择时间',
      },
      {
        componentName: 'RangePicker',
        name: 'h',
        label: '时间范围选择器',
        placeholder: '请选择时间',
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
        label: '多个input值',
        componentName: 'Union',
        unionConfig: {
          unionItems: [
            {
              componentName: 'Input',
              name: 'saleRealMin',
              placeholder: '销量',
            },
            {
              componentName: 'Input',
              name: 'saleRealMax',
              placeholder: '销量',
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
    ]}
  />
  <pre />
  <Row gutter={15}>
    <Col>
      <Button onClick={submit}>提交表单</Button>
    </Col>
    <Col>
      <Button onClick={reset}>表单重置</Button>
    </Col>
    <Col>
      <Button onClick={manualSet}>手动设置name=a的表单值</Button>
    </Col>
  </Row>
</>;
```
