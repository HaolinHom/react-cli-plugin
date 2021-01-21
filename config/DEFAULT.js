module.exports = {
  HOST: 'localhost',
  PORT: 3000,
	ENTRY_PATH: 'index.tsx',
  OUTPUT_PATH: 'dist',
  PUBLIC_PATH: '',
  DEV_TOOL: 'eval-source-map',
  THREAD_LOADER: true,
  THREAD_LOADER_WARM_UP: true,
  POSTCSS_PLUGINS: {
    MIXINS: true,
    PRESET_ENV: true,
    CLEAN: true,
    PX_TO_REM: true,
    CONVERT_FONT_SIZE: true,
  },
  SASS: true,
  LESS: true,
  BROWSERS_LIST: [
    'last 2 versions',
    'not dead',
  ],
};