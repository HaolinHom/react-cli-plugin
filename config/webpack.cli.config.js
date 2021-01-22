const path = require('path');
const fs = require('fs');
const os = require('os');
const webpack = require('webpack');
const threadLoader = require('thread-loader');
const DEFAULT = require('../config/DEFAULT');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin');
const postcssConfigGenerator = require('./postcss.cli.config');
const {
  getValidParams,
  getBrowsersList,
} = require('./utils');

module.exports = function (context, args) {
  const aCliConfig = context.config;
  const { parseArgs } = context.utils;

  const argObj = parseArgs(args);
  const isBundleAnalyzer = argObj.analyzer || false;

  const isEnvDevelopment = process.env.NODE_ENV === 'development';
  const isEnvProduction = process.env.NODE_ENV === 'production';

  const host = aCliConfig.devServer?.host || DEFAULT.HOST;
  const port = +(aCliConfig.devServer?.port || DEFAULT.PORT);

  const currentPath = process.cwd();
  const currentEntryPath = path.resolve(currentPath, aCliConfig.path?.entry || DEFAULT.ENTRY_PATH);
  const currentOutputPath = path.resolve(currentPath, aCliConfig.path?.output || DEFAULT.OUTPUT_PATH);
  const currentNodeModulesPath = path.resolve(currentPath, 'node_modules');
  const tsConfigPath = path.resolve(currentPath, 'tsconfig.json');
  const publicPath = aCliConfig.path?.public ?? DEFAULT.PUBLIC_PATH;

  const useThreadLoader = aCliConfig.threadLoader ?? DEFAULT.THREAD_LOADER;
  const useThreadLoaderWarmUp = useThreadLoader && (aCliConfig.threadLoaderWarmUp ?? DEFAULT.THREAD_LOADER_WARM_UP);

  const useTypeScript = fs.existsSync(tsConfigPath);

  const useSourceMap = isEnvDevelopment;
  const useSass = aCliConfig.stylesLoader?.sass ?? DEFAULT.SASS;
  const useLess = aCliConfig.stylesLoader?.less ?? DEFAULT.LESS;

  const alias = {};
  if (aCliConfig.alias) {
    Object.keys(aCliConfig.alias).forEach((key) => {
      alias[key] = path.resolve(currentPath, aCliConfig.alias[key]);
    });
  }

  const defaultThreadOptions = Object.assign(
    {},
    {
      workers: (os.cpus() || [1]).length,
      workerParallelJobs: 50,
      poolRespawn: false,
      poolParallelJobs: 400,
    },
    isEnvDevelopment ? {
      poolTimeout: Infinity,
    } : undefined
  );

  const workerPoolJSX = Object.assign(
    {
      name: 'JSX',
    },
    defaultThreadOptions
  );

  const workerPoolHtml = Object.assign(
    {
      name: 'HTML',
    },
    defaultThreadOptions
  );

  const workerPoolScss = Object.assign(
    {
      name: 'SCSS',
    },
    defaultThreadOptions
  );

  if (useThreadLoaderWarmUp) {
    threadLoader.warmup(
      workerPoolJSX,
      [
        require.resolve('babel-loader'),
        require.resolve('@babel/preset-env'),
        useTypeScript && require.resolve('@babel/preset-typescript'),
        require.resolve('@babel/preset-react'),
      ].filter(Boolean)
    );

    if (isEnvDevelopment) {
      threadLoader.warmup(
        workerPoolHtml,
        [
          require.resolve('html-loader'),
        ]
      );

      threadLoader.warmup(
        workerPoolScss,
        [
          require.resolve('style-loader'),
          require.resolve('css-loader'),
          require.resolve('postcss-loader'),
          useSass && require.resolve('sass-loader'),
          useLess && require.resolve('less-loader'),
        ].filter(Boolean)
      );
    }
  }

  const cssModuleOptions = {
    mode: 'local',
    localIdentName: '[path][name]__[local]',
  };

  const getPostcssConfig = postcssConfigGenerator(context, args);

  /*
  * @params options {Object?}
  * @params options.cssModules {Boolean}
  * @params options.type {string} ['css', 'sass', 'less']
  * */
  function getStyleLoaders(options) {
    const cssModules = options?.cssModules || false;
    const type = options?.type || 'css';

    let loaders = [
      isEnvProduction && MiniCssExtractPlugin.loader,
      isEnvDevelopment && {
        loader: require.resolve('css-hot-loader'),
      },
      (useThreadLoader && isEnvDevelopment) && {
        loader: require.resolve('thread-loader'),
        options: workerPoolScss,
      },
      isEnvDevelopment && {
        loader: require.resolve('style-loader'),
      },
      {
        loader: require.resolve('css-loader'),
        options: {
          sourceMap: useSourceMap,
          modules: cssModules && cssModuleOptions,
          importLoaders: type === 'css' ? 1 : 2,
        },
      },
      {
        loader: require.resolve('postcss-loader'),
        options: {
          sourceMap: useSourceMap,
          postcssOptions: getPostcssConfig(type),
        },
      },
    ].filter(Boolean);

    if (type === 'sass') {
      loaders.push({
        loader: require.resolve('sass-loader'),
        options: {
          sourceMap: useSourceMap,
          sassOptions: getValidParams(useSass),
        },
      });
    } else if (type === 'less') {
      loaders.push({
        loader: require.resolve('less-loader'),
        options: {
          sourceMap: useSourceMap,
          lessOptions: getValidParams(useLess),
        },
      });
    }

    return loaders;
  }

  return {
    mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',
    bail: isEnvProduction,
    entry: currentEntryPath,
    output: {
      path: isEnvProduction ? currentOutputPath : undefined,
      publicPath,
			filename: isEnvProduction
				? 'static/js/[name].[hash:8].js'
				: isEnvDevelopment && 'static/js/[name]/[name].js',
			chunkFilename: isEnvProduction
				? 'static/js/[name].[contenthash:8].chunk.js'
				: isEnvDevelopment && 'static/js/[name].chunk.js',
    },
    optimization: Object.assign(
			{},
			{
				emitOnErrors: false,
				moduleIds: 'named',
				removeAvailableModules: false,
				removeEmptyChunks: true,
				minimize: isEnvProduction,
				minimizer: [
					new TerserPlugin({
						test: /\.js(\?.*)?$/i,
						exclude: [/node_modules/],
						terserOptions: {
							parse: {
								ecma: 8,
							},
							compress: {
								ecma: 5,
								warnings: false,
								comparisons: false,
								inline: 2,
							},
							format: {
								comments: false,
							},
						},
						extractComments: false,
						parallel: true,
					}),
					new CssMinimizerPlugin({
						test: /.css$/g,
					}),
				],
				splitChunks: {
					chunks: 'all',
					name: false,
				},
			},
			isEnvDevelopment ? {
				runtimeChunk: { name: entryPoint => `runtime-${entryPoint.name}` },
			} : undefined
		),
    resolve: {
      alias,
      extensions: [
        useTypeScript && '.tsx',
        useTypeScript && '.ts',
        '.js',
        '.jsx',
      ].filter(Boolean),
    },
    cache: isEnvDevelopment ? {
      type: 'filesystem',
      cacheDirectory: path.join(currentPath, 'node_modules/.cache/webpack'),
    } : undefined,
    module: {
      strictExportPresence: isEnvDevelopment,
      rules: [
        {
          test: /\.(ts|js)x?$/,
          exclude: /node_modules/,
          use: [
            useThreadLoader && {
              loader: require.resolve('thread-loader'),
              options: workerPoolJSX,
            },
            {
              loader: require.resolve('babel-loader'),
              options: {
                presets: [
									[
										require.resolve("@babel/preset-env"),
										isEnvProduction && {
											targets: getBrowsersList(aCliConfig.browsersList),
											modules: false,
										}
									].filter(Boolean),
                  require.resolve('@babel/preset-react'),
                  useTypeScript && require.resolve('@babel/preset-typescript'),
                ].filter(Boolean),
                plugins: [
                  require.resolve('@babel/plugin-syntax-dynamic-import'),
                  require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'),
                  [
                    require.resolve('@babel/plugin-proposal-optional-chaining'),
                    { loose: true },
                  ],
                  [
                    require.resolve('@babel/plugin-proposal-decorators'),
                    { legacy: true },
                  ],
                  require.resolve('@babel/plugin-proposal-function-bind'),
                  isEnvDevelopment && require.resolve('react-refresh/babel'),
                ].filter(Boolean),
                babelrc: false,
                sourceMap: useSourceMap,
                cacheDirectory: isEnvDevelopment,
              },
            },
          ].filter(Boolean),
        },
        isEnvDevelopment && {
          test: /\.html/,
          exclude: /public[\/\\]index/,
          use: [
            useThreadLoader && {
              loader: require.resolve('thread-loader'),
              options: workerPoolHtml,
            },
            { loader: require.resolve('html-loader') },
          ].filter(Boolean),
        },
        {
          test: /\.(?:ico|proto|png|gif|mp4|m4a|mp3|jpg|svg|ttf|otf|eot|woff|woff2)$/,
          use: [
            {
              loader: require.resolve('file-loader'),
              options: {
                name: 'static/media/[name].[ext]',
                emitFile: true,
              },
            },
          ],
        },
        useSass && {
          test: /\.module\.s[ac]ss$/i,
          use: getStyleLoaders({
            cssModules: true,
            type: 'sass',
          }),
        },
        useSass && {
          test: /\.s[ac]ss$/i,
          exclude: /\.module\.s[ac]ss/i,
          use: getStyleLoaders({
            cssModules: false,
            type: 'sass',
          }),
        },
        useLess && {
          test: /\.module\.less$/i,
          use: getStyleLoaders({
            cssModules: true,
            type: 'less',
          }),
        },
        useLess && {
          test: /\.less$/i,
          exclude: /\.module\.less/i,
          use: getStyleLoaders({
            cssModules: false,
            type: 'less',
          }),
        },
        {
          test: /\.module\.(css)$/,
          use: getStyleLoaders({
            cssModules: true,
            type: 'css',
          }),
        },
        {
          test: /\.(css)$/,
          exclude: /\.module\.(css)/,
          use: getStyleLoaders({
            cssModules: false,
            type: 'css',
          }),
        },
      ].filter(Boolean),
    },
    plugins: [
      isEnvProduction && new CleanWebpackPlugin(),

      new HtmlWebpackPlugin(Object.assign(
        {},
        {
          template: path.join(currentPath, 'public/index.ejs'),
          templateParameters: aCliConfig.templateParameters || {},
          publicPath,
        },
				isEnvDevelopment ? { inject: true } : undefined,
        isEnvProduction ? {
          minify: {
            removeComments: true,
            collapseWhitespace: true,
            removeStyleLinkTypeAttributes: true,
            removeRedundantAttributes: true,
            removeEmptyAttributes: true,
            useShortDoctype: true,
            keepClosingSlash: true,
            minifyURLs: true,
            minifyCSS: true,
            minifyJS: true,
            removeTagWhitespace: true,
          },
        } : undefined
      )),

      new webpack.EnvironmentPlugin(aCliConfig.environment || {}),
      new webpack.DefinePlugin(aCliConfig.define || {}),

      new webpack.ProvidePlugin(aCliConfig.provide || {}),

      isEnvDevelopment && new CaseSensitivePathsPlugin(),

      isEnvDevelopment && new webpack.HotModuleReplacementPlugin(),
      isEnvDevelopment && new ReactRefreshWebpackPlugin(),

      isEnvDevelopment && new WatchMissingNodeModulesPlugin(currentNodeModulesPath),

      isEnvDevelopment && useTypeScript && new ForkTsCheckerWebpackPlugin({
        typescript: {
          diagnosticOptions: {
            semantic: true,
            syntactic: true,
          },
          mode: "write-references",
        },
      }),

      isBundleAnalyzer && new BundleAnalyzerPlugin({
        analyzerMode: 'server',
        analyzerHost: host,
        analyzerPort: port + 1,
        reportFilename: 'report.html',
        defaultSizes: 'parsed',
        openAnalyzer: false,
        generateStatsFile: false,
        statsFilename: 'stats.json',
        statsOptions: {
          exclude: ['acli', 'vendor', 'webpack', 'hot'],
        },
        excludeAssets: ['acli', 'webpack', 'hot'],
        logLevel: 'info',
      }),

      isEnvDevelopment && new FriendlyErrorsWebpackPlugin(),

      isEnvProduction && new MiniCssExtractPlugin({
        filename: "static/css/[name].[hash:8].css",
        chunkFilename: "static/css/[name].[contenthash:8].css",
      }),

      isEnvProduction && new WebpackManifestPlugin({
        fileName: 'asset-manifest.json',
        publicPath,
        generate: (seed, files, entrypoints) => {
          const manifestFiles = files.reduce((manifest, file) => {
            manifest[file.name] = file.path;
            return manifest;
          }, seed);
          const entrypointFiles = entrypoints.main.filter(
            fileName => !fileName.endsWith('.map')
          );

          return {
            files: manifestFiles,
            entrypoints: entrypointFiles,
          };
        },
      }),

      isEnvProduction && new SimpleProgressWebpackPlugin(),
    ].filter(Boolean),
		devtool: useSourceMap ? (aCliConfig.devtool ?? DEFAULT.DEV_TOOL) : false,
  };
};