import path from 'path'
import webpack from 'webpack'
import { merge } from 'webpack-merge'
import { toString } from 'lodash'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import { sentryWebpackPlugin } from '@sentry/webpack-plugin'
import baseConfig from './webpack.config.base'
import DeleteSourceMaps from '../scripts/DeleteSourceMaps'
import { version } from '../redisinsight/package.json'
import webpackPaths from './webpack.paths'

DeleteSourceMaps()

// Generate source maps when debugging the prod bundle, or when uploading them
// to Sentry (the upload plugin below deletes them again so they never ship).
const shouldUploadSourceMaps =
  !!process.env.RI_SENTRY_AUTH_TOKEN && process.env.RI_SENTRY_ENABLED === 'true'

// Label the uploaded source-map bundle by the OS it was built on, so the
// per-platform bundles are distinguishable in Sentry's Source Maps view.
const buildOs =
  (
    { darwin: 'macos', win32: 'windows', linux: 'linux' } as Record<
      string,
      string
    >
  )[process.platform] || process.platform
const devtoolsConfig =
  process.env.DEBUG_PROD === 'true' || shouldUploadSourceMaps
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
      RI_SENTRY_ENABLED: process.env.RI_SENTRY_ENABLED || '',
      RI_SENTRY_DSN: process.env.RI_SENTRY_DSN || '',
      RI_SENTRY_ENVIRONMENT: process.env.RI_SENTRY_ENVIRONMENT || 'development',
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
      RI_APP_BUILD_COMMIT_SHA: process.env.RI_APP_BUILD_COMMIT_SHA || '',
      RI_SHOW_BUILD_COMMIT_SHA: process.env.RI_SHOW_BUILD_COMMIT_SHA || 'false',
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

    // Upload Electron-main source maps to Sentry (debug IDs match bundle↔map),
    // then delete them so they never ship inside the app. Gated on
    // shouldUploadSourceMaps (Sentry enabled + auth token).
    ...(shouldUploadSourceMaps
      ? [
          sentryWebpackPlugin({
            org: process.env.RI_SENTRY_ORG,
            project: process.env.RI_SENTRY_PROJECT,
            authToken: process.env.RI_SENTRY_AUTH_TOKEN,
            // inject: false — release/dist are set in Sentry.init; this keeps
            // dist on the uploaded source-map bundle only, not on events.
            release: { name: version, dist: buildOs, inject: false },
            sourcemaps: {
              filesToDeleteAfterUpload: [
                './redisinsight/dist/main/**/*.js.map',
              ],
            },
            telemetry: false,
            // A failed source-map upload must not fail the build.
            errorHandler: (err) => {
              // eslint-disable-next-line no-console
              console.warn(
                '[Sentry] main source-map upload failed (continuing):',
                err.message,
              )
            },
          }),
        ]
      : []),
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
