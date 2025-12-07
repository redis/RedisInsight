import { PickType } from '@nestjs/swagger';
import { CommandExecution } from 'src/modules/workbench/models/command-execution';

export class CreateCommandExecutionDto extends PickType(CommandExecution, [
  'command',
  'mode',
  'resultsMode',
  'type',
] as const) {}
