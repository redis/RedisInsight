import { DynamicModule, Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { VectorSetService } from 'src/modules/browser/vector-set/vector-set.service';
import { VectorSetController } from 'src/modules/browser/vector-set/vector-set.controller';

@Module({})
export class VectorSetModule {
  static register({ route }): DynamicModule {
    return {
      module: VectorSetModule,
      imports: [
        RouterModule.register([
          {
            path: route,
            module: VectorSetModule,
          },
        ]),
      ],
      controllers: [VectorSetController],
      providers: [VectorSetService],
    };
  }
}
