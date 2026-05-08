import { ApiProperty } from '@nestjs/swagger';

/**
 * Response from the VSIM preview endpoint. Returns the human-readable
 * command string that would be sent to Redis if the user submitted the
 * search with the supplied DTO right now.
 */
export class SearchVectorSetPreviewResponse {
  @ApiProperty({
    type: String,
    description:
      'Human-readable VSIM command preview built from the supplied DTO. ' +
      'Missing fields (vector / element / key) are rendered as `<…>` ' +
      'placeholders so the preview stays useful while the form is being filled in.',
  })
  preview: string;
}
