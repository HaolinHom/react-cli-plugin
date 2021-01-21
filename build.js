process.env.NODE_ENV = 'production';

const webpack = require('webpack');
const webpackConfigGenerator = require('./config/webpack.cli.config');

module.exports = function (context, args, callback) {
  const { std } = context.utils;

  std.label('start webpack building')();

  const webpackConfig = webpackConfigGenerator(context, args);

  const compiler = webpack(webpackConfig);

  return compiler.run(() => {
    std.green.label('webpack building completed')();
    if (typeof callback === 'function') {
      return callback();
    }
  });
};