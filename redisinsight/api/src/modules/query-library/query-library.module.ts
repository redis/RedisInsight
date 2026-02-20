import { DynamicModule, Global, Module, Type } from '@nestjs/common';
import { QueryLibraryController } from './query-library.controller';
import { QueryLibraryService } from './query-library.service';
import { QueryLibraryRepository } from './repositories/query-library.repository';
import { LocalQueryLibraryRepository } from './repositories/local-query-library.repository';

@Global()
@Module({})
export class QueryLibraryModule {
  static register(
    queryLibraryRepository: Type<QueryLibraryRepository> = LocalQueryLibraryRepository,
  ): DynamicModule {
    return {
      module: QueryLibraryModule,
      controllers: [QueryLibraryController],
      providers: [
        QueryLibraryService,
        {
          provide: QueryLibraryRepository,
          useClass: queryLibraryRepository,
        },
      ],
      exports: [QueryLibraryService],
    };
  }
}
