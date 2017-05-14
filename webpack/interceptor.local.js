import path from 'path';
import OnBuildPlugin from 'on-build-webpack';
import nodemon from 'nodemon';
import WriteFilePlugin from 'write-file-webpack-plugin';

let serverStarted = false;

export default {
  devtool: 'eval',

  context: path.join(__dirname, '../src'),

  entry: {
    interceptor: [
      'babel-polyfill',
      './interceptor',
    ],
    server: [
      'babel-polyfill',
      './server.js',
    ],
  },

  output: {
    path: path.join(__dirname, '../build'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    publicPath: '/',
  },

  target: 'node',

  node: {
    __dirname: false,
    __filename: false,
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          'babel-loader',
        ],
        exclude: /node_modules/
      },
    ],
  },

  plugins: [
    new WriteFilePlugin(),
    new OnBuildPlugin(() => {
      if (!serverStarted) {
        const watcher = nodemon('./build/server');

        process.once('SIGINT', () => {
          watcher.once('exit', () => {
            process.exit();
          });
        });

        serverStarted = true;
      }
    })
  ],
}
