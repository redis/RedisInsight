import {
  ApiExtraModels,
  ApiProperty,
  ApiPropertyOptional,
  getSchemaPath,
} from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export enum RdiStatisticsStatus {
  Success = 'success',
  Fail = 'failed',
}

export enum RdiStatisticsViewType {
  Table = 'table',
  Blocks = 'blocks',
  Info = 'info',
}

// ============ Table View ============

export class RdiStatisticsColumn {
  @ApiProperty({
    description: 'Column identifier',
    type: String,
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Column header text',
    type: String,
  })
  @Expose()
  header: string;

  @ApiPropertyOptional({
    description: 'Column type for custom rendering',
    type: String,
  })
  @Expose()
  type?: string;
}

export class RdiStatisticsTableSection {
  @ApiProperty({
    description: 'Section name/title',
    type: String,
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'View type for rendering',
    enum: [RdiStatisticsViewType.Table],
    example: RdiStatisticsViewType.Table,
  })
  @Expose()
  view: RdiStatisticsViewType.Table;

  @ApiProperty({
    description: 'Column definitions',
    type: [RdiStatisticsColumn],
  })
  @Expose()
  @Type(() => RdiStatisticsColumn)
  columns: RdiStatisticsColumn[];

  @ApiProperty({
    description: 'Table rows data',
    type: [Object],
  })
  @Expose()
  data: Record<string, unknown>[];

  @ApiPropertyOptional({
    description: 'Footer row data',
    type: Object,
  })
  @Expose()
  footer?: Record<string, unknown>;
}

// ============ Blocks View ============

export class RdiStatisticsBlockItem {
  @ApiProperty({
    description: 'Block label',
    type: String,
  })
  @Expose()
  label: string;

  @ApiProperty({
    description: 'Block value',
    type: Number,
  })
  @Expose()
  value: number;

  @ApiProperty({
    description: 'Value units',
    type: String,
  })
  @Expose()
  units: string;
}

export class RdiStatisticsBlocksSection {
  @ApiProperty({
    description: 'Section name/title',
    type: String,
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'View type for rendering',
    enum: [RdiStatisticsViewType.Blocks],
    example: RdiStatisticsViewType.Blocks,
  })
  @Expose()
  view: RdiStatisticsViewType.Blocks;

  @ApiProperty({
    description: 'Block items data',
    type: [RdiStatisticsBlockItem],
  })
  @Expose()
  @Type(() => RdiStatisticsBlockItem)
  data: RdiStatisticsBlockItem[];
}

// ============ Info View ============

export class RdiStatisticsInfoItem {
  @ApiProperty({
    description: 'Info label',
    type: String,
  })
  @Expose()
  label: string;

  @ApiProperty({
    description: 'Info value',
    type: String,
  })
  @Expose()
  value: string;
}

export class RdiStatisticsInfoSection {
  @ApiProperty({
    description: 'Section name/title',
    type: String,
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'View type for rendering',
    enum: [RdiStatisticsViewType.Info],
    example: RdiStatisticsViewType.Info,
  })
  @Expose()
  view: RdiStatisticsViewType.Info;

  @ApiProperty({
    description: 'Info items data',
    type: [RdiStatisticsInfoItem],
  })
  @Expose()
  @Type(() => RdiStatisticsInfoItem)
  data: RdiStatisticsInfoItem[];
}

// ============ Union Type ============

export type RdiStatisticsSection =
  | RdiStatisticsTableSection
  | RdiStatisticsBlocksSection
  | RdiStatisticsInfoSection;

// ============ Result ============

@ApiExtraModels(
  RdiStatisticsTableSection,
  RdiStatisticsBlocksSection,
  RdiStatisticsInfoSection,
)
export class RdiStatisticsData {
  @ApiProperty({
    description: 'Statistics sections',
    type: 'array',
    items: {
      oneOf: [
        { $ref: getSchemaPath(RdiStatisticsTableSection) },
        { $ref: getSchemaPath(RdiStatisticsBlocksSection) },
        { $ref: getSchemaPath(RdiStatisticsInfoSection) },
      ],
      discriminator: {
        propertyName: 'view',
        mapping: {
          [RdiStatisticsViewType.Table]: getSchemaPath(
            RdiStatisticsTableSection,
          ),
          [RdiStatisticsViewType.Blocks]: getSchemaPath(
            RdiStatisticsBlocksSection,
          ),
          [RdiStatisticsViewType.Info]: getSchemaPath(RdiStatisticsInfoSection),
        },
      },
    },
  })
  @Expose()
  sections: RdiStatisticsSection[];
}

export class RdiStatisticsResult {
  @ApiProperty({
    description: 'Statistics status',
    enum: RdiStatisticsStatus,
  })
  @Expose()
  status: RdiStatisticsStatus;

  @ApiPropertyOptional({
    description: 'Statistics data',
    type: RdiStatisticsData,
  })
  @Expose()
  @Type(() => RdiStatisticsData)
  data?: RdiStatisticsData;

  @ApiPropertyOptional({
    description: 'Error message',
    type: String,
  })
  @Expose()
  error?: string;
}
