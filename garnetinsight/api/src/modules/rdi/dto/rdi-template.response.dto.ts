import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class RdiTemplateResponseDto {
  @ApiProperty({
    description: 'Template for rdi file',
    type: String,
  })
  @Expose()
  template: string;
}
