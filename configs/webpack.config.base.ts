import webpack from 'webpack'
import TsconfigPathsPlugins from 'tsconfig-paths-webpack-plugin'
import webpackPaths from './webpack.paths'
import { dependencies as externals } from '../garnetinsight/package.json'
import { resolve } from 'path'

const configuration: webpack.Configuration = {
  externals: [...Object.keys(externals || {})],

  stats: 'errors-only',

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              compilerOptions: {
                module: 'esnext',
              },
            },
          },
        ],
      },
    ],
  },

  output: {
    path: webpackPaths.riPath,
    // https://github.com/webpack/webpack/issues/1114
    library: {
      type: 'commonjs2',
    },
  },

  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx', '.scss'],
    modules: [webpackPaths.apiPath, 'node_modules'],
    plugins: [new TsconfigPathsPlugins()],
    alias: {
      'class-transformer': resolve(
        './garnetinsight/api/node_modules/class-transformer/cjs',
      ),
    },
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
    }),

    new webpack.IgnorePlugin({
      checkResource(resource) {
        const lazyImports = [
          '@nestjs/microservices',
          // '@nestjs/platform-express',
          // 'pnpapi',
          'cache-manager',
          // 'class-validator',
          '@fastify/static',
          'fastify-swagger',
          // 'hiredis',
          // 'reflect-metadata',
          // 'swagger-ui-express',
          // 'class-transformer',
          // 'class-transformer/storage',
          // '@nestjs/websockets',
          // '@nestjs/core/adapters/http-adapter',
          // '@nestjs/core/helpers/router-method-factory',
          // '@nestjs/core/metadata-scanner',
          '@nestjs/microservices/microservices-module',
          // '@nestjs/websockets/socket-module',
        ]
        if (!lazyImports.includes(resource)) {
          return false
        }
        try {
          require.resolve(resource)
        } catch (err) {
          return true
        }
        return false
      },
    }),
  ],
}

export default configuration
