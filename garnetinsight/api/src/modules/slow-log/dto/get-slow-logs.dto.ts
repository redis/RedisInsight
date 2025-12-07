import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetSlowLogsDto {
  @ApiPropertyOptional({
    description: 'Specifying the number of slow logs to fetch per node.',
    type: Number,
    minimum: -1,
    default: 50,
  })
  @IsInt()
  @Min(-1)
  @Type(() => Number)
  @IsNotEmpty()
  @IsOptional()
  count?: number = 50;
}
