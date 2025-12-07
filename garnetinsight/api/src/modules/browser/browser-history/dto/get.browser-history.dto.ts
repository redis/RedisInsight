import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BrowserHistoryMode } from 'src/common/constants';
import { RedisDataType } from 'src/modules/browser/keys/dto';

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

  @ApiProperty({
    description: 'Match glob patterns',
    type: String,
    example: 'device:*',
    default: '*',
  })
  @IsOptional()
  @IsString()
  @Expose()
  match?: string = '*';
}

export class BrowserHistory {
  @ApiProperty({
    description: 'History id',
    type: String,
    default: '76dd5654-814b-4e49-9c72-b236f50891f4',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Database id',
    type: String,
    default: '76dd5654-814b-4e49-9c72-b236f50891f4',
  })
  @Expose()
  databaseId: string;

  @ApiProperty({
    description: 'Filters for scan operation',
    type: () => ScanFilter,
  })
  @Expose()
  @Type(() => ScanFilter)
  filter: ScanFilter = new ScanFilter();

  @ApiProperty({
    description: 'Mode of history',
    default: BrowserHistoryMode.Pattern,
    enum: BrowserHistoryMode,
  })
  @Expose()
  mode?: BrowserHistoryMode = BrowserHistoryMode.Pattern;

  @ApiProperty({
    description: 'History created date (ISO string)',
    type: Date,
    default: '2022-09-16T06:29:20.000Z',
  })
  @Expose()
  createdAt: Date;
}
