const path = require('path');
const packagePath = path.resolve(__dirname, 'package.json');
const pkg = require(packagePath);

module.exports = {
  title: '华旅云创web端',
  version: pkg.version, // 同上 使用 package.json 的 version
  usageMode: 'expand', // 自动打开文档的缩放
  styleguideDir: 'dist', // 打包的目录
  pagePerSection: true, // 是否每页一个组件显示
  sections: [
    {
      name: '快速上手',
      content: 'docs/introduction.md',
      sections: [
        {
          name: '入门教程',
          content: 'docs/react_start.md',
        },
        {
          name: '安装',
          content: 'docs/install.md',
        },
        {
          name: '在项目中使用',
          content: 'docs/use.md',
        },
      ],
    },
    {
      name: 'Hooks',
      sections: [
        {
          name: 'useSetState',
          content: 'docs/hook/useSetState.md',
        },
        {
          name: 'useUpdateEffect',
          content: 'docs/hook/useUpdateEffect.md',
        },
        {
          name: 'useMount',
          content: 'docs/hook/useMount.md',
        },
        {
          name: 'useMemoizedFn',
          content: 'docs/hook/useMemoizedFn.md',
        },
        {
          name: 'useDeepCompareEffect',
          content: 'docs/hook/useDeepCompareEffect.md',
        },
        {
          name: 'useUnmount',
          content: 'docs/hook/useUnmount.md',
        },
      ],
    },
    {
      name: 'Component',
      components: 'components/*/*.tsx', // 写入对应目录的文档
    },
  ],
  exampleMode: 'expand', // 表示示例代码是否展开或者合上文档中代码示例的标签初始化状态，决定是否展开
  webpackConfig: require('./webpack.config'),
  propsParser: require('react-docgen-typescript').withCustomConfig('./tsconfig.json', {
    shouldRemoveUndefinedFromOptional: true,
  }).parse, // 用来支持 tsx
  compilerConfig: {
    target: { ie: 11 },
    transforms: {
      modules: false,
      // to make async/await work by default (no transformation)
      asyncAwait: false,
    },
  },
  // 优化文档中的组件名
  getComponentPathLine(componentPath) {
    const name = path.basename(componentPath.replace(/index.tsx/g, ''));
    return `import { ${name} } from '${pkg.name}'`;
  },
  updateDocs(docs, file) {
    if (docs.doclets.version) {
      const version = pkg.version;
      docs.doclets.version = version;
      docs.tags.version[0].description = version;
    }
    return docs;
  }, // 在使用 @version 时 使用 package.json 的 version
};
