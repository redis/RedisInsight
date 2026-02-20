import { DynamicModule, Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { RedisearchService } from 'src/modules/browser/redisearch/redisearch.service';
import { KeyIndexesService } from 'src/modules/browser/redisearch/key-indexes.service';
import { RedisearchController } from 'src/modules/browser/redisearch/redisearch.controller';

@Module({})
export class RedisearchModule {
  static register({ route }): DynamicModule {
    return {
      module: RedisearchModule,
      imports: [
        RouterModule.register([
          {
            path: route,
            module: RedisearchModule,
          },
        ]),
      ],
      controllers: [RedisearchController],
      providers: [RedisearchService, KeyIndexesService],
    };
  }
}
