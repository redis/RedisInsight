import { CommandExecution } from 'src/modules/workbench/models/command-execution';
import { OmitType, PartialType } from '@nestjs/swagger';

export class ShortCommandExecution extends PartialType(
  OmitType(CommandExecution, ['result'] as const),
) {}
