import { ApiPropertyOptional } from '@nestjs/swagger';
import { MAX_TTL_NUMBER } from 'src/constants';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { KeyDto } from './key.dto';

export class KeyWithExpireDto extends KeyDto {
  @ApiPropertyOptional({
    type: Number,
    description:
      'Set a timeout on key in seconds. After the timeout has expired, the key will automatically be deleted.',
    minimum: 1,
    maximum: MAX_TTL_NUMBER,
  })
  @IsOptional()
  @IsInt({ always: true })
  @Min(1)
  @Max(MAX_TTL_NUMBER)
  expire?: number;
}
