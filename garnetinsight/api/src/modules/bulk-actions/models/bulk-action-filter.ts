import { RedisDataType } from 'src/modules/browser/keys/dto';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { IBulkActionFilterOverview } from 'src/modules/bulk-actions/interfaces/bulk-action-filter-overview.interface';

export class BulkActionFilter {
  @IsOptional()
  @IsEnum(RedisDataType, {
    message: `type must be a valid enum value. Valid values: ${Object.values(
      RedisDataType,
    )}.`,
  })
  type?: RedisDataType = null;

  @IsOptional()
  @IsString()
  match?: string = '*';

  @IsOptional()
  @IsInt()
  count?: number = 10_000;

  /**
   * Generate scan args array for filter
   */
  getScanArgsArray(): Array<number | string> {
    const args = ['count', this.count, 'match', this.match];

    if (this.type) {
      args.push('type', this.type);
    }

    return args;
  }

  getCount(): number {
    return this.count;
  }

  getOverview(): IBulkActionFilterOverview {
    return {
      match: this.match,
      type: this.type,
    };
  }
}
