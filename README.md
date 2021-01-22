# react-cli-plugin

React front-end project cli plugin base on webpack5 and support typescript.

>This is a CLI plugin template of the front-end engineering development tool [a-cli](https://github.com/a-cli/a-cli),
which is used to quickly create a new CLI plugin.

>You can learn more by visiting [Develop CLI plugin](https://github.com/a-cli/a-cli#Develop-CLI-plugin).

## a-cli-config.js example

```javascript
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
  // webpack.config.environment
  environment: {},
  // webpack.config.define
  define: {},
  // webpack.config.provide
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
    },
    // {Boolean|Object} sass-loader.options.lessOptions
    less: false,
    // {Boolean|Object} sass-loader.options.sassOptions
    sass: true,
  },
  // use for @babel/preset-env, postcss-preset-env
  browsersList: undefined
};

```