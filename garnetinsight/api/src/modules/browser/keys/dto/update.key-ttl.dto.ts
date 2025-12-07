import { ApiProperty } from '@nestjs/swagger';
import { MAX_TTL_NUMBER } from 'src/constants';
import { IsInt, IsNotEmpty, Max } from 'class-validator';
import { KeyDto } from './key.dto';

export class UpdateKeyTtlDto extends KeyDto {
  @ApiProperty({
    type: Number,
    description:
      'Set a timeout on key in seconds. After the timeout has expired, the key will automatically be deleted. ' +
      'If the property has value of -1, then the key timeout will be removed.',
    maximum: MAX_TTL_NUMBER,
  })
  @IsNotEmpty()
  @IsInt({ always: true })
  @Max(MAX_TTL_NUMBER)
  ttl: number;
}
