import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { RdiDryRunJobResult } from 'src/modules/rdi/models/rdi-dry-run';

export class RdiDryRunJobResponseDto {
  @ApiProperty({
    description: 'Dry run job transformations result',
    type: RdiDryRunJobResult,
  })
  @Expose()
  transformations: RdiDryRunJobResult;

  @ApiProperty({
    description: 'Dry run job commands result ',
    type: RdiDryRunJobResult,
  })
  @Expose()
  commands: RdiDryRunJobResult;
}
