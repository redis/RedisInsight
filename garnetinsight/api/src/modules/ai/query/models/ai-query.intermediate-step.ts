import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export enum AiQueryIntermediateStepType {
  TOOL = 'tool',
  TOOL_CALL = 'tool_call',
}

export class AiQueryIntermediateStep {
  @ApiProperty({
    enum: AiQueryIntermediateStepType,
  })
  @Expose()
  type: AiQueryIntermediateStepType;

  @ApiProperty({
    type: String,
  })
  @Expose()
  data: string = '';
}
