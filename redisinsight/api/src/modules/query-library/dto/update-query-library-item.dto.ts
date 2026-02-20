import { PartialType, PickType } from '@nestjs/swagger';
import { QueryLibraryItem } from 'src/modules/query-library/models/query-library';

export class UpdateQueryLibraryItemDto extends PartialType(
  PickType(QueryLibraryItem, ['name', 'description', 'query'] as const),
) {}
