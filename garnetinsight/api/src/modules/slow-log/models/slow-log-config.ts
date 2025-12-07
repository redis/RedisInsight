import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, Min, NotEquals, ValidateIf } from 'class-validator';

export class SlowLogConfig {
  @ApiPropertyOptional({
    description: 'Max logs to store inside Redis slowlog',
    example: 128,
    type: Number,
  })
  @NotEquals(null)
  @ValidateIf((object, value) => value !== undefined)
  @IsInt()
  @Min(0)
  slowlogMaxLen?: number;

  @ApiPropertyOptional({
    description:
      'Store logs with execution time greater than this value (in microseconds)',
    example: 10000,
    type: Number,
  })
  @NotEquals(null)
  @ValidateIf((object, value) => value !== undefined)
  @IsInt()
  @Min(-1)
  slowlogLogSlowerThan?: number;
}
