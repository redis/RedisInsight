import { Controller, Get } from '@nestjs/common';
import { CommandsService } from 'src/modules/commands/commands.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Commands')
@Controller('commands')
export class CommandsController {
  constructor(private readonly commandsService: CommandsService) {}

  @Get()
  async getAll(): Promise<Record<string, any>> {
    return this.commandsService.getAll();
  }
}
