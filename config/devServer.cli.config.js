const errorOverlayMiddleware = require("react-dev-utils/errorOverlayMiddleware");
const noopServiceWorkerMiddleware = require("react-dev-utils/noopServiceWorkerMiddleware");

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
      before(app) {
        app.use(errorOverlayMiddleware());
        app.use(noopServiceWorkerMiddleware(''));
      },
    }
  );
};