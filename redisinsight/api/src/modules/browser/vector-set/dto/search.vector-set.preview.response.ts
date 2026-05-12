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
      'The endpoint requires exactly one of `elementName` / `vectorValues` ' +
      '/ `vectorFp32` to be present — under- or over-specified payloads are ' +
      'rejected with `400` (same rules as the search endpoint).',
  })
  preview: string;
}
