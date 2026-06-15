import { RedisDataType } from 'src/modules/browser/keys/dto';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ScanFilter {
  @ApiProperty({
    description: 'Key type',
    type: String,
    example: 'list',
  })
  @IsOptional()
  @Expose()
  @IsEnum(RedisDataType, {
    message: `type must be a valid enum value. Valid values: ${Object.values(
      RedisDataType,
    )}.`,
  })
  type?: RedisDataType = null;

  @ApiPropertyOptional({
    description: 'Match glob patterns',
    type: String,
    example: 'device:*',
    default: '*',
  })
  @IsOptional()
  @IsString()
  @Expose()
  match?: string = '*';

  @ApiPropertyOptional({
    description: '"count" argument for "scan" command per node',
    type: Number,
    example: 10_000,
    default: 10_000,
  })
  @IsOptional()
  @IsInt()
  @Expose()
  count?: number = 10_000;

  /**
   * Generate scan args array for filter
   */
  getScanArgsArray(): Array<number | string> {
    const args = ['match', this.match];

    if (this.type) {
      args.push('type', this.type);
    }

    return args;
  }

  getCount(): number {
    return this.count;
  }
}
