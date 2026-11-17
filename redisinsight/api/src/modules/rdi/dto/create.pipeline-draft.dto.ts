import { OmitType } from '@nestjs/swagger';
import { PipelineDraft } from 'src/modules/rdi/models';

export class CreatePipelineDraftDto extends OmitType(PipelineDraft, [
  'id',
  'rdiInstanceId',
  'createdAt',
  'updatedAt',
] as const) {}
