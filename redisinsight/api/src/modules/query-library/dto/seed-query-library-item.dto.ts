import { PickType } from '@nestjs/swagger';
import { QueryLibraryItem } from 'src/modules/query-library/models/query-library';

export class SeedQueryLibraryItemDto extends PickType(QueryLibraryItem, [
  'indexName',
  'name',
  'description',
  'query',
] as const) {}
