import { PartialType } from '@nestjs/swagger';
import { CreatePipelineDraftDto } from 'src/modules/rdi/dto/create.pipeline-draft.dto';

export class UpdatePipelineDraftDto extends PartialType(
  CreatePipelineDraftDto,
) {}
