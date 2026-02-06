import { Module, Type } from '@nestjs/common';
import { RdiController } from 'src/modules/rdi/rdi.controller';
import { RdiPipelineController } from 'src/modules/rdi/rdi-pipeline.controller';
import { RdiProxyController } from 'src/modules/rdi/rdi-proxy.controller';
import { RdiService } from 'src/modules/rdi/rdi.service';
import { RdiPipelineService } from 'src/modules/rdi/rdi-pipeline.service';
import { RdiProxyService } from 'src/modules/rdi/rdi-proxy.service';
import { RdiRepository } from 'src/modules/rdi/repository/rdi.repository';
import { LocalRdiRepository } from 'src/modules/rdi/repository/local.rdi.repository';
import { RdiClientProvider } from 'src/modules/rdi/providers/rdi.client.provider';
import { RdiClientStorage } from 'src/modules/rdi/providers/rdi.client.storage';
import { RdiClientFactory } from 'src/modules/rdi/providers/rdi.client.factory';
import { RdiAnalytics } from 'src/modules/rdi/rdi.analytics';
import { RdiPipelineAnalytics } from 'src/modules/rdi/rdi-pipeline.analytics';
import { RdiStatisticsController } from 'src/modules/rdi/rdi-statistics.controller';
import { RdiStatisticsService } from 'src/modules/rdi/rdi-statistics.service';

@Module({})
export class RdiModule {
  static register(rdiRepository: Type<RdiRepository> = LocalRdiRepository) {
    return {
      module: RdiModule,
      controllers: [
        // Proxy controller must be LAST to not interfere with specific routes
        // The more specific routes (statistics, pipeline) should be matched first
        RdiStatisticsController,  // /rdi/:id/statistics
        RdiPipelineController,    // /rdi/:id/pipeline
        RdiController,            // /rdi, /rdi/:id, /rdi/:id/connect
        RdiProxyController,       // /rdi/:id/:path(*) - catch-all for everything else
      ],
      providers: [
        RdiService,
        RdiPipelineService,
        RdiStatisticsService,
        RdiProxyService,
        RdiClientProvider,
        RdiClientStorage,
        RdiClientFactory,
        RdiAnalytics,
        RdiPipelineAnalytics,
        {
          provide: RdiRepository,
          useClass: rdiRepository,
        },
      ],
    };
  }
}
