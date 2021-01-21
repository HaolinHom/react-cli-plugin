process.env.NODE_ENV = 'development';

const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const webpackConfigGenerator = require('./config/webpack.cli.config');
const devServerConfigGenerator = require('./config/devServer.cli.config');
const DEFAULT = require('./config/DEFAULT');

module.exports = function (context, args) {
  const { std } = context.utils;
  const { devServer: devServerCfg } = context.config;

  const host = DEFAULT.HOST;
  const port = +devServerCfg.port || DEFAULT.PORT;
  const listener = `http://${host}:${port}`;

  const webpackConfig = webpackConfigGenerator(context, args);
  const devServerConfig = devServerConfigGenerator(context, args);

  function devServer() {
    const compiler = webpack(webpackConfig);
    const server = new webpackDevServer(compiler, devServerConfig);

    return server.listen(port, host, () => {
      std('dev server listening on:', listener);
    });
  }

  return devServer();
};