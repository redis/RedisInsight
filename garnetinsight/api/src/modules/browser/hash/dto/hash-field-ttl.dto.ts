import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Max } from 'class-validator';
import { MAX_TTL_NUMBER } from 'src/constants';
import { HashFieldDto } from 'src/modules/browser/hash/dto/hash-field.dto';

export class HashFieldTtlDto extends PickType(HashFieldDto, [
  'field',
] as const) {
  @ApiProperty({
    type: Number,
    description:
      'Set a timeout on key in seconds. After the timeout has expired, the field will automatically be deleted. ' +
      'If the property has value of -1, then the field timeout will be removed.',
    maximum: MAX_TTL_NUMBER,
  })
  @IsNotEmpty()
  @IsInt({ always: true })
  @Max(MAX_TTL_NUMBER)
  expire: number;
}
