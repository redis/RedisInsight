import { KeyDto } from 'src/modules/browser/keys/dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { IsBiggerThan } from 'src/common/decorators';

export class GetStringInfoDto extends KeyDto {
  @ApiProperty({
    description: 'Start of string',
    type: Number,
    default: 0,
  })
  @IsOptional()
  @IsInt({ always: true })
  @Type(() => Number)
  @Min(0)
  start?: number = 0;

  @ApiProperty({
    description: 'End of string',
    type: Number,
  })
  @IsOptional()
  @IsInt({ always: true })
  @Type(() => Number)
  @Min(1)
  @IsBiggerThan('start')
  end?: number;
}
