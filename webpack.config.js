const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const isDevelopment = argv.mode === 'development';
  const browser = env.browser || 'chrome';
  
  // 根据浏览器选择对应的manifest文件
  const manifestFile = `src/manifests/${browser}.json`;
  
  return {
    entry: {
      background: './src/background.js',
      content: './src/content_script.js',
      popup: './src/popup.js',
      inject: './src/inject_script.js',
      i18n: './src/i18n.js'
    },
    output: {
      path: path.resolve(__dirname, `dist/${browser}`),
      filename: '[name].js',
      clean: true
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader'
          ]
        }
      ]
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: manifestFile,
            to: 'manifest.json'
          },
          {
            from: 'src/_locales',
            to: '_locales'
          },
          {
            from: 'src/assets/icons',
            to: 'icons',
            noErrorOnMissing: true
          }
        ]
      }),
      new HtmlWebpackPlugin({
        template: './src/popup.html',
        filename: 'popup.html',
        chunks: ['popup'],
        inject: 'body'
      }),
      ...(isProduction ? [new MiniCssExtractPlugin({
        filename: '[name].css'
      })] : [])
    ],
    resolve: {
      extensions: ['.js', '.json']
    },
    optimization: {
      minimize: isProduction
    },
    devtool: isProduction ? false : 'cheap-module-source-map',
    // 开发模式配置
    ...(isDevelopment && {
      watch: true,
      watchOptions: {
        ignored: /node_modules/,
        aggregateTimeout: 300,
        poll: 1000
      }
    })
  };
};
