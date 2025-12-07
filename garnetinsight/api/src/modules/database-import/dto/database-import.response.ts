import { isString, isNumber } from 'lodash';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';

export enum DatabaseImportStatus {
  Success = 'success',
  Partial = 'partial',
  Fail = 'fail',
}

export class DatabaseImportResult {
  @ApiProperty({
    description: 'Entry index from original json',
    type: Number,
  })
  @Expose()
  index: number;

  @ApiProperty({
    description: 'Import status',
    enum: DatabaseImportStatus,
  })
  @Expose()
  status: DatabaseImportStatus;

  @ApiPropertyOptional({
    description: 'Database host',
    type: String,
  })
  @Expose()
  @Transform(({ value }) => (isString(value) ? value : undefined), {
    toPlainOnly: true,
  })
  host?: string;

  @ApiPropertyOptional({
    description: 'Database port',
    type: Number,
  })
  @Expose()
  @Transform(({ value }) => (isNumber(value) ? value : undefined), {
    toPlainOnly: true,
  })
  port?: number;

  @ApiPropertyOptional({
    description: 'Error message if any',
    type: String,
  })
  @Expose()
  @Transform(
    ({ value: e }) => {
      if (!e) {
        return undefined;
      }

      return e.map((error) => {
        if (error?.response) {
          return error.response;
        }

        return {
          statusCode: 500,
          message: error?.message || 'Unhandled Error',
          error: 'Unhandled Error',
        };
      });
    },
    { toPlainOnly: true },
  )
  errors?: Error[];
}

export class DatabaseImportResponse {
  @ApiProperty({
    description: 'Total elements processed from the import file',
    type: Number,
  })
  @Expose()
  total: number;

  @ApiProperty({
    description: 'List of successfully imported database',
    type: DatabaseImportResult,
  })
  @Expose()
  @Type(() => DatabaseImportResult)
  success: DatabaseImportResult[];

  @ApiProperty({
    description: 'List of partially imported database',
    type: DatabaseImportResult,
  })
  @Expose()
  @Type(() => DatabaseImportResult)
  partial: DatabaseImportResult[];

  @ApiProperty({
    description: 'List of databases failed to import',
    type: DatabaseImportResult,
  })
  @Expose()
  @Type(() => DatabaseImportResult)
  fail: DatabaseImportResult[];
}
