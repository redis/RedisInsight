import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsArray, IsDefined, IsString, ArrayNotEmpty } from 'class-validator';
import { CommandExecution } from 'src/modules/workbench/models/command-execution';
import { Expose } from 'class-transformer';

export class CreateCommandExecutionsDto extends PickType(CommandExecution, [
  'mode',
  'resultsMode',
  'type',
] as const) {
  @ApiProperty({
    isArray: true,
    type: String,
    description: 'Redis commands',
  })
  @Expose()
  @IsArray()
  @ArrayNotEmpty()
  @IsDefined()
  @IsString({ each: true })
  commands: string[];
}
