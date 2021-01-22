const DEFAULT = require('./DEFAULT');
const {
  getValidParams,
  getBrowsersList,
} = require('./utils');

module.exports = function (context, args) {
  const isEnvProduction = process.env.NODE_ENV === 'production';

  let postcssPlugins = context.config.stylesLoader?.postcssPlugins;
  const _mixins = postcssPlugins?.mixins ?? DEFAULT.POSTCSS_PLUGINS.MIXINS;
  const _presetEnv = postcssPlugins?.presetEnv ?? DEFAULT.POSTCSS_PLUGINS.PRESET_ENV;
  const _clean = postcssPlugins?.clean ?? DEFAULT.POSTCSS_PLUGINS.CLEAN;
  const _normalize = postcssPlugins?.normalize ?? DEFAULT.POSTCSS_PLUGINS.NORMALIZE;

  return function(type) {
    let config = {
      ident: 'postcss',
      plugins: [],
    };

    if (type === 'sass') {
      config.syntax = require.resolve('postcss-scss');
    } else if (type === 'less') {
      config.syntax = require.resolve('postcss-less');
    }

    if (_mixins) {
      const postcss_mixins = require(require.resolve('postcss-mixins'));
      config.plugins.push(postcss_mixins);
    }

    if (isEnvProduction && _presetEnv) {
      const postcss_preset = require(require.resolve('postcss-preset-env'))(Object.assign(
        {},
        getBrowsersList(context.config.browsersList),
        getValidParams(_presetEnv)
      ));
      config.plugins.push(postcss_preset);
    }

    if (isEnvProduction && _clean) {
      const postcss_clean = require(require.resolve('postcss-clean'))();
      config.plugins.push(postcss_clean);
    }

    if (_normalize) {
      const postcss_normalize = require(require.resolve('postcss-normalize'))(getValidParams(_normalize));
      config.plugins.push(postcss_normalize);
    }

    return config;
  };
};