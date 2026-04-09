import { ApiProperty } from '@nestjs/swagger';

export class SetVectorSetElementAttributeResponse {
  @ApiProperty({
    type: String,
    description:
      'The attributes string as stored on the element after the update.',
  })
  attributes: string;
}
