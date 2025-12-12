import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';
import { KeyDto } from 'src/modules/browser/keys/dto';

export class SearchResultDto {
  @ApiProperty({
    description: 'Element name',
    type: String,
  })
  @RedisStringType()
  name: RedisString;

  @ApiPropertyOptional({
    description: 'Similarity score (closer to 1 = more similar)',
    type: Number,
  })
  score?: number;

  @ApiPropertyOptional({
    description: 'Element attributes (when WITHATTRIBS is used)',
    type: Object,
  })
  attributes?: Record<string, any>;
}

export class SearchVectorSetResponse extends KeyDto {
  @ApiProperty({
    description: 'Array of search results ordered by similarity',
    type: () => SearchResultDto,
    isArray: true,
  })
  results: SearchResultDto[];
}
