import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PluginState {
  @ApiProperty({
    description: 'Plugin visualization id. Should be unique per all plugins',
    type: String,
  })
  @Expose()
  visualizationId: string;

  @ApiProperty({
    description: 'Command Execution id',
    type: String,
  })
  @Expose()
  commandExecutionId: string;

  @ApiProperty({
    type: String,
    example: 'any',
    description: 'Stored state',
  })
  @Expose()
  state: any;

  @ApiProperty({
    description: 'Date of creation',
    type: Date,
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Date of updating',
    type: Date,
  })
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<PluginState> = {}) {
    Object.assign(this, partial);
  }
}
