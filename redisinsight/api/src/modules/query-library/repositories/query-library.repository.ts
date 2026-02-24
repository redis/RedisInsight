import { SessionMetadata } from 'src/common/models';
import { QueryLibraryItem } from 'src/modules/query-library/models/query-library';
import { QueryLibraryFilterDto } from 'src/modules/query-library/dto';

export abstract class QueryLibraryRepository {
  abstract create(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    item: Partial<QueryLibraryItem>,
  ): Promise<QueryLibraryItem>;

  abstract getList(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    filter: QueryLibraryFilterDto,
  ): Promise<QueryLibraryItem[]>;

  abstract getOne(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    id: string,
  ): Promise<QueryLibraryItem>;

  abstract update(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    id: string,
    data: Partial<QueryLibraryItem>,
  ): Promise<QueryLibraryItem>;

  abstract delete(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    id: string,
  ): Promise<void>;

  abstract deleteByIndex(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    indexName: string,
  ): Promise<void>;

  abstract createBulk(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    items: Partial<QueryLibraryItem>[],
  ): Promise<QueryLibraryItem[]>;
}
