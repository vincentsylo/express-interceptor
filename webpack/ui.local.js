import path from 'path';
import webpack from 'webpack';
import CleanPlugin from 'clean-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import WriteFilePlugin from 'write-file-webpack-plugin';

export default {
  devtool: 'cheap-module-source-map',

  context: path.join(__dirname, '../src/ui'),

  entry: {
    app: [
      'babel-polyfill',
      'react-hot-loader/patch',
      'webpack-dev-server/client?http://localhost:8080',
      'webpack/hot/only-dev-server',
      './app',
    ],
  },

  output: {
    path: path.join(__dirname, '../build/public'),
    filename: '[name].js',
    // publicPath: '/',
  },

  target: 'web',

  devServer: {
    hot: true,
    contentBase: path.join(__dirname, '../build/public'),
    publicPath: '/',
    host: '0.0.0.0',
    inline: false,
    port: 8080,
    proxy: [
      {
        context: '**',
        target: 'http://localhost:8081',
        secure: false,
      },
    ],
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          'react-hot-loader/webpack',
          'babel-loader',
        ],
        exclude: /node_modules/,
      },
    ],
  },

  plugins: [
    new CleanPlugin(['build'], {
      root: process.cwd(),
    }),
    new WriteFilePlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
  ],
}
