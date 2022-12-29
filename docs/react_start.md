##### 什么是 react

- 用来构建 UI 的 JavaScript 库
- React 不是一个 MVC 框架，仅仅是视图（V）层的库

##### 为什么要用 React

- 使用组件化开发方式，符合现在 Web 开发的趋势
- 技术成熟，社区完善，配件齐全，适用于大型 Web 项目（生态系统健全）
- 由 Facebook 专门的团队维护，技术支持可靠
- React Native - 学习一次，随处写:用 React 构建移动应用程序
- 使用方式简单，性能非常高，支持服务端渲染

##### React 中的核心概念

- 虚拟 DOM（Virtual DOM）
- Diff 算法（虚拟 DOM 的加速器，提升 React 性能的法宝）

  #### 虚拟 DOM（Vitural DOM）

  - React 将 DOM 抽象为虚拟 DOM，虚拟 DOM 其实就是用一个对象来描述 DOM，通过对比前后两个对象的差异，最终只把变化的部分重新渲染，提高渲染的效率为什么用虚拟 dom，当 dom 反生更改时需要遍历 而原生 dom 可遍历属性多大 231 个 且大部分与渲染无关 更新页面代价太大

  #### VituralDOM 的处理方式

  - 用 JavaScript 对象结构表示 DOM 树的结构，然后用这个树构建一个真正的 DOM 树，插到文档当中
  - 当状态变更的时候，重新构造一棵新的对象树。然后用新的树和旧的树进行比较，记录两棵树差异
  - 把 2 所记录的差异应用到步骤 1 所构建的真正的 DOM 树上，视图就更新了

  #### Diff 算法

  - Diff 算法的说明 - 1

    1. 如果两棵树的根元素类型不同，React 会销毁旧树，创建新树

    ```html
    // 旧树
    <div>
      <Counter />
    </div>

    // 新树
    <span>
      <Counter />
    </span>

    执行过程：destory Counter -> insert Counter
    ```

  - Diff 算法的说明 - 2

    1. 对于类型相同的 React DOM 元素，React 会对比两者的属性是否相同，只更新不同的属性
    2. 当处理完这个 DOM 节点，React 就会递归处理子节点

       ```html
       // 旧
       <div className="before" title="stuff" />
       // 新
       <div className="after" title="stuff" />
       <p>只更新：className属性</p>

       // 旧
       <div style="{{color: 'red', fontWeight: 'bold'}}" />
       // 新
       <div style="{{color: 'green', fontWeight: 'bold'}}" />
       <p>只更新：color属性</p>
       ```

  - Diff 算法的说明 - 3

    1. 当在子节点的后面添加一个节点，这时候两棵树的转化工作执行的很好

       ```html
       // 旧
       <ul>
         <li>first</li>
         <li>second</li>
       </ul>

       // 新
       <ul>
         <li>first</li>
         <li>second</li>
         <li>third</li>
       </ul>

       执行过程： React会匹配新旧两个first，匹配两个second，然后添加third
       ```

    2. 但是如果你在开始位置插入一个元素，那么问题就来了

       ```html
       // 旧
       <ul>
         <li>Duke</li>
         <li>Villanova</li>
       </ul>

       // 新
       <ul>
         <li>Connecticut</li>
         <li>Duke</li>
         <li>Villanova</li>
       </ul>

       在没有key属性时执行过程：React将改变每一个子删除重新创建，而非保持Duke和Villanova不变
       ```

  - key 属性

    ```html
    <p>
      为了解决以上问题，React提供了一个 key
      属性。当子节点带有key属性，React会通过key来匹配原始树和后来的树
    </p>

    // 旧
    <ul>
      <li key="0">Duke</li>
      <li key="1">Villanova</li>
    </ul>

    // 新
    <ul>
      <li key="0">Connecticut</li>
      <li key="1">Villanova</li>
      <li key="2">Villanova</li>
    </ul>

    <p>执行过程：现在React知道带有key '0' 的元素是新的，对于 '1' 和 '2' 仅仅移动位置即可</p>
    ```

    - 说明：key 属性在 React 内部使用，但不会传递给你的组件
    - 推荐：在遍历数据时，推荐在组件中使用 key 属性：`<li key={item.id}>{item.name}</li>`
    - 注意：key 只需要保持与他的兄弟节点唯一即可，不需要全局唯一
    - 注意：尽可能的减少数组 index 作为 key，数组中插入元素的等操作时，会使得效率底下

##### React 中的组件

```bash
  React 组件可以让你把 UI 分割为独立、可复用的片段，并将每一片段视为相互独立的部分
  1. 组件是由一个个的HTML元素组成的
  2. 概念上来讲, 组件就像JS中的函数。它们接受用户输入（props），并且返回一个React对象，用来描述展示在页面中的内容
```

- 注意：1 函数名称必须为大写字母开头，React 通过这个特点来判断是不是一个组件
- 注意：2 函数必须有返回值，返回值可以是：JSX 对象或 null
- 注意：3 返回的 JSX，必须有一个根元素
- 注意：4 组件的返回值使用()包裹，避免换行问题

```jsx
function Page(props) {
  // 此处注释的写法
  return (
    <div className="shopping-list">
      {/** 此处注释的写法 必须要{}包裹 */}
      <h1>Shopping List for {props.name}</h1>
      <ul>
        <li>Instagram</li>
        <li>WhatsApp</li>
      </ul>
    </div>
  );
}

<Page name="Zhang" />;
```
