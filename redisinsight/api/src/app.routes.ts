import { CliModule } from 'src/modules/cli/cli.module';
import { WorkbenchModule } from 'src/modules/workbench/workbench.module';
import { SlowLogModule } from 'src/modules/slow-log/slow-log.module';
import { PubSubModule } from 'src/modules/pub-sub/pub-sub.module';
import { ClusterMonitorModule } from 'src/modules/cluster-monitor/cluster-monitor.module';
import { DatabaseAnalysisModule } from 'src/modules/database-analysis/database-analysis.module';
import { BulkActionsModule } from 'src/modules/bulk-actions/bulk-actions.module';
import { DatabaseRecommendationModule } from 'src/modules/database-recommendation/database-recommendation.module';
import { QueryLibraryModule } from 'src/modules/query-library/query-library.module';

export const routes = [
  {
    path: '/databases',
    children: [
      {
        path: '/:dbInstance',
        module: CliModule,
      },
      {
        path: '/:dbInstance',
        module: WorkbenchModule,
      },
      {
        path: '/:dbInstance',
        module: SlowLogModule,
      },
      {
        path: '/:dbInstance',
        module: PubSubModule,
      },
      {
        path: '/:dbInstance',
        module: ClusterMonitorModule,
      },
      {
        path: '/:dbInstance',
        module: DatabaseAnalysisModule,
      },
      {
        path: '/:dbInstance',
        module: BulkActionsModule,
      },
      {
        path: '/:dbInstance',
        module: DatabaseRecommendationModule,
      },
      {
        path: '/:dbInstance',
        module: QueryLibraryModule,
      },
    ],
  },
];
