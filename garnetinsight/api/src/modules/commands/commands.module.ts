import { Module } from '@nestjs/common';
import { CommandsController } from 'src/modules/commands/commands.controller';
import { CommandsService } from 'src/modules/commands/commands.service';
import { CommandsJsonProvider } from 'src/modules/commands/commands-json.provider';
import config from 'src/utils/config';

const COMMANDS_CONFIGS = config.get('commands');

@Module({
  controllers: [CommandsController],
  providers: [
    {
      provide: CommandsService,
      useFactory: () =>
        new CommandsService(
          COMMANDS_CONFIGS.map(
            ({ name, url }) => new CommandsJsonProvider(name, url),
          ),
        ),
    },
  ],
  exports: [CommandsService],
})
export class CommandsModule {}
