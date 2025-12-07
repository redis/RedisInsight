import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class Tag {
  @ApiProperty({
    description: 'Tag id.',
    type: String,
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Key of the tag.',
    type: String,
  })
  @Expose()
  key: string;

  @ApiProperty({
    description: 'Value of the tag.',
    type: String,
  })
  @Expose()
  value: string;

  @ApiProperty({
    description: 'Creation date of the tag.',
    type: String,
    format: 'date-time',
    example: '2025-03-05T08:54:53.322Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date of the tag.',
    type: String,
    format: 'date-time',
  })
  @Expose()
  updatedAt: Date;
}
