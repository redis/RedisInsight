import { PickType } from '@nestjs/swagger';
import { CommandExecution } from 'src/modules/workbench/models/command-execution';

export class CommandExecutionFilter extends PickType(CommandExecution, [
  'type',
] as const) {}
