import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, ValidateIf } from 'class-validator';

export class UpdatePipelineDraftDto {
  @ApiPropertyOptional({
    description: 'Draft data as a JSON object. Structure is not validated.',
    type: Object,
  })
  // skip validation only when omitted, not when explicitly null
  @ValidateIf((dto) => dto.data !== undefined)
  @IsNotEmpty()
  @IsObject()
  data?: object;
}
