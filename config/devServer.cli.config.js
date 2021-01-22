const evalSourceMapMiddleware = require("react-dev-utils/evalSourceMapMiddleware");
const errorOverlayMiddleware = require("react-dev-utils/errorOverlayMiddleware");

module.exports = function (context, args) {
  const { devServer } = context.config;

  return Object.assign(
    {
      open: true,
      hot: true,
      quiet: true,
      disableHostCheck: true,
      https: false,
      overlay: false,
      headers: { 'Access-Control-Allow-Origin': '*' },
      proxy: {},
    },
    devServer || {},
    {
      before(app, server) {
        app.use(evalSourceMapMiddleware(server));
        app.use(errorOverlayMiddleware());
      },
    }
  );
};