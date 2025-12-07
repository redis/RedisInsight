import { DynamicModule, Module, Type } from '@nestjs/common';
import { LocalInitService } from 'src/modules/init/local.init.service';
import { InitService } from 'src/modules/init/init.service';

@Module({})
export class InitModule {
  static register(
    imports = [],
    initService: Type<InitService> = LocalInitService,
  ): DynamicModule {
    return {
      module: InitModule,
      imports,
      providers: [
        {
          provide: InitService,
          useClass: initService,
        },
      ],
    };
  }
}
