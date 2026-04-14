import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetVectorSetElementAttributeResponse {
  @ApiPropertyOptional({
    type: String,
    description: 'The attributes string stored on the element, if any.',
  })
  attributes?: string;
}
