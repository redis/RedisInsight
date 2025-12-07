import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SafeRejsonRlDataDto } from './safe.rejson-rl-data.dto';

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
    type: () => SafeRejsonRlDataDto,
    isArray: true,
  })
  data: SafeRejsonRlDataDto[] | string | number | boolean | null;
}
