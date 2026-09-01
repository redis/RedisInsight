import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsObject } from 'class-validator';

export class PipelineDraft {
  @ApiProperty({
    description: 'Pipeline draft id.',
    type: String,
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Id of the RDI instance this draft belongs to.',
    type: String,
  })
  @Expose()
  rdiInstanceId: string;

  @ApiProperty({
    description: 'Draft data as a JSON object. Structure is not validated.',
    type: Object,
  })
  @Expose()
  @IsNotEmpty()
  @IsObject()
  data: object;

  @ApiProperty({
    description: 'Time the draft was created.',
    type: Date,
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Time the draft was last updated.',
    type: Date,
  })
  @Expose()
  updatedAt: Date;
}
