import * as fs from 'fs';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleInit,
} from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import config, { Config } from 'src/utils/config';
import { PluginModule } from 'src/modules/plugin/plugin.module';
import { CommandsModule } from 'src/modules/commands/commands.module';
import { WorkbenchModule } from 'src/modules/workbench/workbench.module';
import { SlowLogModule } from 'src/modules/slow-log/slow-log.module';
import { PubSubModule } from 'src/modules/pub-sub/pub-sub.module';
import { NotificationModule } from 'src/modules/notification/notification.module';
import { BulkActionsModule } from 'src/modules/bulk-actions/bulk-actions.module';
import { ClusterMonitorModule } from 'src/modules/cluster-monitor/cluster-monitor.module';
import { DatabaseAnalysisModule } from 'src/modules/database-analysis/database-analysis.module';
import { LocalDatabaseModule } from 'src/local-database.module';
import { CoreModule } from 'src/core.module';
import { DatabaseImportModule } from 'src/modules/database-import/database-import.module';
import { SingleUserAuthMiddleware } from 'src/common/middlewares/single-user-auth.middleware';
import { CustomTutorialModule } from 'src/modules/custom-tutorial/custom-tutorial.module';
import { CloudModule } from 'src/modules/cloud/cloud.module';
import { AzureModule } from 'src/modules/azure/azure.module';
import { RdiModule } from 'src/modules/rdi/rdi.module';
import { AiChatModule } from 'src/modules/ai/chat/ai-chat.module';
import { AiQueryModule } from 'src/modules/ai/query/ai-query.module';
import { InitModule } from 'src/modules/init/init.module';
import { AnalyticsModule } from 'src/modules/analytics/analytics.module';
import { BrowserModule } from './modules/browser/browser.module';
import { RedisEnterpriseModule } from './modules/redis-enterprise/redis-enterprise.module';
import { RedisSentinelModule } from './modules/redis-sentinel/redis-sentinel.module';
import { ProfilerModule } from './modules/profiler/profiler.module';
import { CliModule } from './modules/cli/cli.module';
import { StaticsManagementModule } from './modules/statics-management/statics-management.module';
import { ExcludeRouteMiddleware } from './middleware/exclude-route.middleware';
import SubpathProxyMiddleware from './middleware/subpath-proxy.middleware';
import XFrameOptionsMiddleware from './middleware/x-frame-options.middleware';
import { routes } from './app.routes';
import {
  RedisConnectionMiddleware,
  redisConnectionControllers,
} from './middleware/redis-connection';
import { DatabaseSettingsModule } from './modules/database-settings/database-settings.module';
import { CredentialsModule } from './modules/database/credentials/credentials.module';
import { QueryLibraryModule } from './modules/query-library/query-library.module';

const SERVER_CONFIG = config.get('server') as Config['server'];
const PATH_CONFIG = config.get('dir_path') as Config['dir_path'];
const STATICS_CONFIG = config.get('statics') as Config['statics'];

@Module({
  imports: [
    LocalDatabaseModule,
    CoreModule,
    RouterModule.register(routes),
    RedisEnterpriseModule,
    CloudModule.register(),
    RedisSentinelModule,
    BrowserModule.register(),
    CliModule,
    WorkbenchModule.register(),
    PluginModule,
    CommandsModule,
    ProfilerModule,
    PubSubModule,
    SlowLogModule,
    NotificationModule.register(),
    BulkActionsModule,
    ClusterMonitorModule,
    CustomTutorialModule.register(),
    DatabaseAnalysisModule,
    DatabaseImportModule,
    CloudModule.register(),
    AzureModule,
    AiChatModule,
    AiQueryModule.register(),
    RdiModule.register(),
    StaticsManagementModule.register({
      initDefaults: STATICS_CONFIG.initDefaults,
      autoUpdate: STATICS_CONFIG.autoUpdate,
    }),
    InitModule.register([AnalyticsModule]),
    DatabaseSettingsModule.register(),
    CredentialsModule.register(),
    QueryLibraryModule.register(),
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements OnModuleInit, NestModule {
  onModuleInit() {
    // creating required folders
    const foldersToCreate = [
      PATH_CONFIG.pluginsAssets,
      PATH_CONFIG.customPlugins,
    ];

    foldersToCreate.forEach((folder) => {
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
      }
    });
  }

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SubpathProxyMiddleware, XFrameOptionsMiddleware)
      .forRoutes('*');

    consumer
      .apply(SingleUserAuthMiddleware)
      .exclude(...SERVER_CONFIG.excludeAuthRoutes)
      .forRoutes('*');

    consumer
      .apply(ExcludeRouteMiddleware)
      .forRoutes(...SERVER_CONFIG.excludeRoutes);

    consumer
      .apply(RedisConnectionMiddleware)
      .forRoutes(...redisConnectionControllers);
  }
}
