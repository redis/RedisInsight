import { DynamicModule, Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import config, { Config } from 'src/utils/config';
import { Response } from 'express';
import { AutoUpdatedStaticsProvider } from './providers/auto-updated-statics.provider';

const SERVER_CONFIG = config.get('server') as Config['server'];
const PATH_CONFIG = config.get('dir_path') as Config['dir_path'];
const TUTORIALS_CONFIG = config.get('tutorials') as Config['tutorials'];

const CONTENT_CONFIG = config.get('content');

const setXFrameOptionsHeader = (res: Response) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
};

const downloadableStaticFiles = (res: Response) => {
  if (res.req?.query?.download === 'true') {
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment;');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  }
};

@Module({})
export class StaticsManagementModule {
  static register({ autoUpdate, initDefaults }): DynamicModule {
    return {
      module: StaticsManagementModule,
      imports: [
        ServeStaticModule.forRoot({
          serveRoot: SERVER_CONFIG.tutorialsUri,
          rootPath: join(PATH_CONFIG.tutorials),
          serveStaticOptions: {
            fallthrough: false,
            setHeaders: downloadableStaticFiles,
          },
        }),
        ServeStaticModule.forRoot({
          serveRoot: SERVER_CONFIG.customTutorialsUri,
          rootPath: join(PATH_CONFIG.customTutorials),
          serveStaticOptions: {
            fallthrough: false,
            setHeaders: downloadableStaticFiles,
          },
        }),
        ServeStaticModule.forRoot({
          serveRoot: SERVER_CONFIG.contentUri,
          rootPath: join(PATH_CONFIG.content),
          serveStaticOptions: {
            fallthrough: false,
            setHeaders: setXFrameOptionsHeader,
          },
        }),
        ServeStaticModule.forRoot({
          serveRoot: SERVER_CONFIG.defaultPluginsUri,
          rootPath: join(PATH_CONFIG.defaultPlugins),
          serveStaticOptions: {
            fallthrough: false,
            setHeaders: setXFrameOptionsHeader,
          },
        }),
        ServeStaticModule.forRoot({
          serveRoot: SERVER_CONFIG.customPluginsUri,
          rootPath: join(PATH_CONFIG.customPlugins),
          serveStaticOptions: {
            fallthrough: false,
            setHeaders: setXFrameOptionsHeader,
          },
        }),
        ServeStaticModule.forRoot({
          serveRoot: SERVER_CONFIG.staticUri,
          rootPath: join(PATH_CONFIG.staticDir),
          serveStaticOptions: {
            fallthrough: false,
            setHeaders: setXFrameOptionsHeader,
          },
        }),
        ...(SERVER_CONFIG.staticContent
          ? [
              ServeStaticModule.forRoot({
                rootPath: join(
                  __dirname,
                  '..',
                  '..',
                  '..',
                  '..',
                  '..',
                  'ui',
                  'dist',
                ),
                exclude: [
                  '/api/{*splat}',
                  `${SERVER_CONFIG.customPluginsUri}/{*splat}`,
                  `${SERVER_CONFIG.staticUri}/{*splat}`,
                ],
                serveRoot: SERVER_CONFIG.proxyPath
                  ? `/${SERVER_CONFIG.proxyPath}`
                  : '',
                serveStaticOptions: {
                  index: false,
                  setHeaders: setXFrameOptionsHeader,
                },
              }),
            ]
          : []),
      ],
      providers: [
        {
          provide: 'TutorialsProvider',
          useFactory: () =>
            new AutoUpdatedStaticsProvider({
              name: 'TutorialsProvider',
              destinationPath: PATH_CONFIG.tutorials,
              defaultSourcePath: PATH_CONFIG.defaultTutorials,
              autoUpdate,
              initDefaults,
              ...TUTORIALS_CONFIG,
            }),
        },
        {
          provide: 'ContentProvider',
          useFactory: () =>
            new AutoUpdatedStaticsProvider({
              name: 'ContentProvider',
              destinationPath: PATH_CONFIG.content,
              defaultSourcePath: PATH_CONFIG.defaultContent,
              autoUpdate,
              initDefaults,
              ...CONTENT_CONFIG,
            }),
        },
      ],
    };
  }
}
