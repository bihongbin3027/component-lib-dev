const antdVars = require('./antd-vars.json')

module.exports = {
  entry: './components/index.js',
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)?$/,
        loader: require.resolve('babel-loader'),
        options: {
          cacheDirectory: true,
          plugins: [['import', { libraryName: 'antd', style: true }]],
        },
      },
      {
        test: /\.(css|less)?$/,
        use: [
          { loader: require.resolve('style-loader') },
          { loader: require.resolve('css-loader') },
          {
            loader: require.resolve('less-loader'),
            options: {
              lessOptions: {
                javascriptEnabled: true,
                modifyVars: antdVars
              },
            },
          },
        ],
      },
      {
        test: /\.png?$/,
        use: 'file-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
};
