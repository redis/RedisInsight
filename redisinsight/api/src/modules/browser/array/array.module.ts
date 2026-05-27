import { DynamicModule, Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { ArrayService } from 'src/modules/browser/array/array.service';
import { ArrayController } from 'src/modules/browser/array/array.controller';

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
