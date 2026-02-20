import { PickType } from '@nestjs/swagger';
import { QueryLibraryItem } from 'src/modules/query-library/models/query-library';

export class CreateQueryLibraryItemDto extends PickType(QueryLibraryItem, [
  'indexName',
  'name',
  'query',
] as const) {}
