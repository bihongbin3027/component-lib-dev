<p>用来管理页面交互状态，调用该方法React会重新调用render方法来重新渲染UI。</p>

#### API

```code
const [state, setState] = useSetState<T extends Record<string, any>>(
  initialState: T = {} as T
): [T, (patch: Partial<T> | ((prevState: T) => Partial<T>)) => void]
```

#### setState 有 2 种设置值的方式：

```code
<div>对象方式: setState({ a: 1 })</div>
<div>函数方式: setState((prev) => { return prev })</div>
```

#### 基础用法

```js
import { useSetState } from 'ahooks';

const [state, setState] = useSetState({ hello: '', count: 0 });

<div>
  <pre>{JSON.stringify(state, null, 2)}</pre>
  <p>
    <button type="button" onClick={() => setState({ hello: 'world' })}>
      set hello
    </button>
    <button type="button" onClick={() => setState({ foo: 'bar' })} style={{ margin: '0 8px' }}>
      set foo
    </button>
    <button type="button" onClick={() => setState((prev) => ({ count: prev.count + 1 }))}>
      count + 1
    </button>
  </p>
</div>;
```
