import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum RejsonRlDataType {
  String = 'string',
  Number = 'number',
  Integer = 'integer',
  Boolean = 'boolean',
  Null = 'null',
  Array = 'array',
  Object = 'object',
}

export class SafeRejsonRlDataDto {
  @ApiProperty({
    type: String,
    description: 'Key inside json data',
  })
  key: string;

  @ApiProperty({
    type: String,
    description: 'Path of the json field',
  })
  path: string;

  @ApiPropertyOptional({
    type: Number,
    description:
      'Number of properties/elements inside field (for object and arrays only)',
  })
  cardinality?: number;

  @ApiProperty({
    enum: RejsonRlDataType,
    description: 'Type of the field',
  })
  type: RejsonRlDataType;

  @ApiPropertyOptional({
    type: String,
    description: 'Any value',
  })
  value?: string | number | boolean | null;
}
