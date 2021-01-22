// This is an example of the configuration (a-cli-config.js) required by this plugin template.
module.exports = {
  name: 'react-cli-plugin',
  projectName: '',
  preset: {},

  path: {
    // webpack.config.entry
		entry: '',
    // webpack.config.output.path
    output: 'dist',
    // webpack.config.output.publicPath, HtmlWebpackPlugin.publicPath
    public: '',
  },
  // webpack.config.resolve.alias
  alias: {},
  // webpack-dev-server
  devServer: {
    port: 3000,
    proxy: {},
  },
  // webpack.config.devtool
  devtool: 'eval-source-map',
  // HtmlWebpackPlugin.templateParameters
  templateParameters: {},
  // webpack.EnvironmentPlugin
  environment: {},
  // webpack.DefinePlugin
  define: {},
  // webpack.ProvidePlugin
  provide: {},
  // use threadLoader {Boolean|Object} thread-loader.options
  threadLoader: true,
  // warm up threadLoader
  threadLoaderWarmUp: true,
  stylesLoader: {
    // postcss-loader.options.postcssOptions.plugins
    postcssPlugins: {
      // {Boolean} postcss-mixins
      mixins: true,
      // {Boolean|Object} postcss-preset-env
      presetEnv: true,
      // {Boolean|Object} postcss-clean
      clean: true,
      // {Boolean|Object} postcss-normalize
      normalize: true,
      // {Boolean|Object} postcss-pxtorem
      pxtorem: false,
    },
    // {Boolean|Object} sass-loader.options.lessOptions
    less: false,
    // {Boolean|Object} sass-loader.options.sassOptions
    sass: true,
  },
  // use for @babel/preset-env, postcss-preset-env
  browsersList: undefined
};
