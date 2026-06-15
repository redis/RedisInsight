import {
  ApiExtraModels,
  ApiProperty,
  ApiPropertyOptional,
  getSchemaPath,
} from '@nestjs/swagger';
import { SafeRejsonRlDataDto } from './safe.rejson-rl-data.dto';

@ApiExtraModels(SafeRejsonRlDataDto)
export class GetRejsonRlResponseDto {
  @ApiProperty({
    type: Boolean,
    description: 'Determines if json value was downloaded',
  })
  downloaded: boolean;

  @ApiPropertyOptional({
    type: String,
    description: 'Type of data in the requested path',
  })
  type?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Requested path',
  })
  path?: string;

  @ApiProperty({
    oneOf: [
      {
        type: 'array',
        items: { $ref: getSchemaPath(SafeRejsonRlDataDto) },
      },
      { type: 'string' },
      { type: 'number' },
      { type: 'boolean' },
      { type: 'null' },
    ],
    description: 'JSON data that can be of various types',
  })
  data: SafeRejsonRlDataDto[] | string | number | boolean | null;
}
