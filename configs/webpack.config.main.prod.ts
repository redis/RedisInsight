import path from 'path'
import webpack from 'webpack'
import { merge } from 'webpack-merge'
import { toString } from 'lodash'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import baseConfig from './webpack.config.base.ts'
import DeleteSourceMaps from '../scripts/DeleteSourceMaps'
import { version } from '../garnetinsight/package.json'
import webpackPaths from './webpack.paths'

DeleteSourceMaps()

const devtoolsConfig =
  process.env.DEBUG_PROD === 'true'
    ? {
        devtool: 'source-map',
      }
    : {}

export default merge(baseConfig, {
  ...devtoolsConfig,

  mode: 'development',

  target: 'electron-main',

  entry: {
    main: path.join(webpackPaths.desktopPath, 'index.ts'),
    preload: path.join(webpackPaths.desktopPath, 'preload.ts'),
  },

  output: {
    path: webpackPaths.distMainPath,
    filename: '[name].js',
    library: {
      type: 'umd',
    },
  },

  // optimization: {
  //   minimizer: [
  //     new TerserPlugin({
  //       parallel: true,
  //     }),
  //   ],
  // },

  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode:
        process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true',
    }),

    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
      DEBUG_PROD: false,
      START_MINIMIZED: false,
      RI_APP_TYPE: process.env.RI_APP_TYPE || 'ELECTRON',
      RI_AUTO_BOOTSTRAP: 'false',
      RI_SERVER_TLS_CERT: process.env.RI_SERVER_TLS_CERT || '',
      RI_SERVER_TLS_KEY: process.env.RI_SERVER_TLS_KEY || '',
      RI_SERVE_STATICS: false,
      RI_APP_FOLDER_NAME: process.env.RI_APP_FOLDER_NAME || '',
      RI_UPGRADES_LINK: process.env.RI_UPGRADES_LINK || '',
      RI_DISABLE_AUTO_UPGRADE: process.env.RI_DISABLE_AUTO_UPGRADE || 'false',
      RI_ANALYTICS_START_EVENTS: 'true',
      RI_APP_HOST: '127.0.0.1',
      RI_BUILD_TYPE: 'ELECTRON',
      RI_APP_VERSION: version,
      RI_SEGMENT_WRITE_KEY:
        'RI_SEGMENT_WRITE_KEY' in process.env
          ? process.env.RI_SEGMENT_WRITE_KEY
          : 'SOURCE_WRITE_KEY',
      RI_CONNECTIONS_TIMEOUT_DEFAULT:
        'RI_CONNECTIONS_TIMEOUT_DEFAULT' in process.env
          ? process.env.RI_CONNECTIONS_TIMEOUT_DEFAULT
          : toString(30 * 1000), // 30 sec
      // cloud auth
      RI_CLOUD_IDP_AUTHORIZE_URL:
        'RI_CLOUD_IDP_AUTHORIZE_URL' in process.env
          ? process.env.RI_CLOUD_IDP_AUTHORIZE_URL
          : '',
      RI_CLOUD_IDP_TOKEN_URL:
        'RI_CLOUD_IDP_TOKEN_URL' in process.env
          ? process.env.RI_CLOUD_IDP_TOKEN_URL
          : '',
      RI_CLOUD_IDP_REVOKE_TOKEN_URL:
        'RI_CLOUD_IDP_REVOKE_TOKEN_URL' in process.env
          ? process.env.RI_CLOUD_IDP_REVOKE_TOKEN_URL
          : '',
      RI_CLOUD_IDP_ISSUER:
        'RI_CLOUD_IDP_ISSUER' in process.env
          ? process.env.RI_CLOUD_IDP_ISSUER
          : '',
      RI_CLOUD_IDP_CLIENT_ID:
        'RI_CLOUD_IDP_CLIENT_ID' in process.env
          ? process.env.RI_CLOUD_IDP_CLIENT_ID
          : '',
      RI_CLOUD_IDP_REDIRECT_URI:
        'RI_CLOUD_IDP_REDIRECT_URI' in process.env
          ? process.env.RI_CLOUD_IDP_REDIRECT_URI
          : '',
      RI_CLOUD_IDP_GOOGLE_ID:
        'RI_CLOUD_IDP_GOOGLE_ID' in process.env
          ? process.env.RI_CLOUD_IDP_GOOGLE_ID
          : '',
      RI_CLOUD_IDP_GH_ID:
        'RI_CLOUD_IDP_GH_ID' in process.env
          ? process.env.RI_CLOUD_IDP_GH_ID
          : '',
      RI_CLOUD_API_URL:
        'RI_CLOUD_API_URL' in process.env ? process.env.RI_CLOUD_API_URL : '',
      RI_CLOUD_CAPI_URL:
        'RI_CLOUD_CAPI_URL' in process.env ? process.env.RI_CLOUD_CAPI_URL : '',
      RI_CLOUD_API_TOKEN:
        'RI_CLOUD_API_TOKEN' in process.env
          ? process.env.RI_CLOUD_API_TOKEN
          : '',
      RI_AI_CONVAI_TOKEN:
        'RI_AI_CONVAI_TOKEN' in process.env
          ? process.env.RI_AI_CONVAI_TOKEN
          : '',
      RI_AI_QUERY_USER:
        'RI_AI_QUERY_USER' in process.env ? process.env.RI_AI_QUERY_USER : '',
      RI_AI_QUERY_PASS:
        'RI_AI_QUERY_PASS' in process.env ? process.env.RI_AI_QUERY_PASS : '',
      RI_FEATURES_CONFIG_URL:
        'RI_FEATURES_CONFIG_URL' in process.env
          ? process.env.RI_FEATURES_CONFIG_URL
          : '',
    }),

    new webpack.DefinePlugin({
      'process.type': '"browser"',
    }),
  ],

  /**
   * Disables webpack processing of __dirname and __filename.
   * If you run the bundle in node.js it falls back to these values of node.js.
   * https://github.com/webpack/webpack/issues/2010
   */
  node: {
    __dirname: false,
    __filename: false,
  },
})
