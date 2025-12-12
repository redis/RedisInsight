import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { KeyDto } from 'src/modules/browser/keys/dto';

export class GetVectorSetElementsDto extends KeyDto {
  @ApiPropertyOptional({
    description: 'Number of elements to return (default: 10)',
    type: Number,
    default: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  count?: number;
}
