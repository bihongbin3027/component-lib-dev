# 华旅云创 web 端组件

## 一、开发组件&文档

### 安装依赖

```
yarn install
or
npm install
```

### 调试、开发组件库启动文档服务

```
yarn doc
or
run run doc
```

### 组件开发

新组件以文件夹形式统一放到 `components` 下，最终在 `components` 下的 `index.js` 文件中导出

利用 plop 工具快速生成组件文件夹，会根据模板文件生成以组件命名的文件夹，同时修改`components` 下的 `index.js`

```
yarn plop <ComponentName>
or
npx plop <ComponentName>
```

### 文档打包

```
yarn build:doc
or
npm run build:doc
```

## 二、发布到 npm

如果之前没有登录过 npm 的话，需要先登录再执行发布命令。放到 npm scripts 里 pub 命令，其实就是打包和发布的组合命令，执行发布之前先打包文档部署。或者不想要部署文档就直接执行发布命令好了

```
yarn pub
or
npm run pub
```

## 三、组件库使用

1. 确保项目安装了 `antd` `react` `react-dom`
2. 直接 npm 安装使用包

## 体验 demo

安装 npm 包

```
yarn add hlyc-components-web
or
npm install hlyc-components-web
```

组件里使用

```
import React from 'react';
import { Empty } from 'hlyc-components-web'

function App() {
  return (
    <div className="App">
      <Empty />
    </div>
  );
}

export default App;
```
