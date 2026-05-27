import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { KeyDto } from 'src/modules/browser/keys/dto';

export class GetArrayElementsDto extends KeyDto {
  @ApiPropertyOptional({
    description:
      'Start index for ARSCAN. Pass 0 to start from the beginning of the array.',
    type: Number,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  cursor?: number = 0;

  @ApiProperty({
    description: 'Number of elements to return per page.',
    type: Number,
    minimum: 1,
    default: 500,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  count: number = 500;
}
