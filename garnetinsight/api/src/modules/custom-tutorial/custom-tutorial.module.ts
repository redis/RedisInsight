import { Module, Type } from '@nestjs/common';
import { CustomTutorialController } from 'src/modules/custom-tutorial/custom-tutorial.controller';
import { CustomTutorialService } from 'src/modules/custom-tutorial/custom-tutorial.service';
import { CustomTutorialFsProvider } from 'src/modules/custom-tutorial/providers/custom-tutorial.fs.provider';
import { CustomTutorialManifestProvider } from 'src/modules/custom-tutorial/providers/custom-tutorial.manifest.provider';
import { CustomTutorialRepository } from 'src/modules/custom-tutorial/repositories/custom-tutorial.repository';
import { LocalCustomTutorialRepository } from 'src/modules/custom-tutorial/repositories/local.custom-tutorial.repository';
import { CustomTutorialAnalytics } from 'src/modules/custom-tutorial/custom-tutorial.analytics';

@Module({})
export class CustomTutorialModule {
  static register(
    repository: Type<CustomTutorialRepository> = LocalCustomTutorialRepository,
  ) {
    return {
      module: CustomTutorialModule,
      controllers: [CustomTutorialController],
      providers: [
        CustomTutorialService,
        CustomTutorialFsProvider,
        CustomTutorialManifestProvider,
        CustomTutorialAnalytics,
        {
          provide: CustomTutorialRepository,
          useClass: repository,
        },
      ],
    };
  }
}
