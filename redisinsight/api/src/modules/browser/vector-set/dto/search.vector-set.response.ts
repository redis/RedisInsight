import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { KeyResponse } from 'src/modules/browser/keys/dto';
import { SearchVectorSetMatchDto } from 'src/modules/browser/vector-set/dto/search.vector-set-match.dto';

export class SearchVectorSetResponse extends KeyResponse {
  @ApiProperty({
    description: 'List of matches ordered by descending similarity score.',
    type: [SearchVectorSetMatchDto],
    isArray: true,
  })
  @Type(() => SearchVectorSetMatchDto)
  elements: SearchVectorSetMatchDto[];
}
