import { DynamicModule, Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { ArrayController } from 'src/modules/browser/array/array.controller';
import { ArrayService } from 'src/modules/browser/array/array.service';

@Module({})
export class ArrayModule {
  static register({ route }): DynamicModule {
    return {
      module: ArrayModule,
      imports: [
        RouterModule.register([
          {
            path: route,
            module: ArrayModule,
          },
        ]),
      ],
      controllers: [ArrayController],
      providers: [ArrayService],
    };
  }
}
