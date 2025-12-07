import { KeyDto } from 'src/modules/browser/keys/dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetListElementsDto extends KeyDto {
  @ApiProperty({
    description: 'Specifying the number of elements to skip.',
    type: Number,
    minimum: 0,
    default: '0',
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsNotEmpty()
  offset: number;

  @ApiProperty({
    description:
      'Specifying the number of elements to return from starting at offset.',
    type: Number,
    minimum: 1,
    default: 15,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsNotEmpty()
  count: number;
}
