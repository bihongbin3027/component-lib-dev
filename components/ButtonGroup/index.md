```js
const data = [
  {
    name: '张三',
    value: 0,
  },
  {
    name: '李四',
    value: 1,
  },
];
<>
  <ButtonGroup
    data={data}
    checkType="radio"
    onChange={(data) => {
      console.log(data);
    }}
  />
</>;
```
