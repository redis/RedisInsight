import { Global, Type } from '@nestjs/common';
import { CloudSessionService } from 'src/modules/cloud/session/cloud-session.service';
import { CloudSessionRepository } from './repositories/cloud.session.repository';
import { LocalCloudSessionRepository } from './repositories/local.cloud.session.repository';

@Global()
export class CloudSessionModule {
  static register(
    cloudSessionRepository: Type<CloudSessionRepository> = LocalCloudSessionRepository,
  ) {
    return {
      module: CloudSessionModule,
      providers: [
        CloudSessionService,
        {
          provide: CloudSessionRepository,
          useClass: cloudSessionRepository,
        },
      ],
      exports: [CloudSessionService],
    };
  }
}
