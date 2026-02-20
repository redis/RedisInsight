import { DynamicModule, Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { RedisearchService } from 'src/modules/browser/redisearch/redisearch.service';
import { RedisearchController } from 'src/modules/browser/redisearch/redisearch.controller';
import { QueryLibraryModule } from 'src/modules/query-library/query-library.module';

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
        QueryLibraryModule.register(),
      ],
      controllers: [RedisearchController],
      providers: [RedisearchService],
    };
  }
}
