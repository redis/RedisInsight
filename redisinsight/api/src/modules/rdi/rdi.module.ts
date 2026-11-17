import { Module, Type } from '@nestjs/common';
import { RdiController } from 'src/modules/rdi/rdi.controller';
import { RdiPipelineController } from 'src/modules/rdi/rdi-pipeline.controller';
import { RdiService } from 'src/modules/rdi/rdi.service';
import { RdiPipelineService } from 'src/modules/rdi/rdi-pipeline.service';
import { RdiRepository } from 'src/modules/rdi/repository/rdi.repository';
import { LocalRdiRepository } from 'src/modules/rdi/repository/local.rdi.repository';
import { RdiClientProvider } from 'src/modules/rdi/providers/rdi.client.provider';
import { RdiClientStorage } from 'src/modules/rdi/providers/rdi.client.storage';
import { RdiClientFactory } from 'src/modules/rdi/providers/rdi.client.factory';
import { RdiAnalytics } from 'src/modules/rdi/rdi.analytics';
import { RdiPipelineAnalytics } from 'src/modules/rdi/rdi-pipeline.analytics';
import { RdiStatisticsController } from 'src/modules/rdi/rdi-statistics.controller';
import { RdiStatisticsService } from 'src/modules/rdi/rdi-statistics.service';
import { PipelineDraftController } from 'src/modules/rdi/pipeline-draft.controller';
import { PipelineDraftService } from 'src/modules/rdi/pipeline-draft.service';
import { PipelineDraftRepository } from 'src/modules/rdi/repository/pipeline-draft.repository';
import { LocalPipelineDraftRepository } from 'src/modules/rdi/repository/local.pipeline-draft.repository';
import { RdiProxyController } from 'src/modules/rdi/rdi-proxy.controller';
import { RdiProxyService } from 'src/modules/rdi/rdi-proxy.service';

@Module({})
export class RdiModule {
  static register(rdiRepository: Type<RdiRepository> = LocalRdiRepository) {
    return {
      module: RdiModule,
      controllers: [
        RdiController,
        RdiPipelineController,
        RdiStatisticsController,
        PipelineDraftController,
        RdiProxyController,
      ],
      providers: [
        RdiService,
        RdiPipelineService,
        RdiStatisticsService,
        PipelineDraftService,
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
        {
          provide: PipelineDraftRepository,
          useClass: LocalPipelineDraftRepository,
        },
      ],
    };
  }
}
