import { Module } from '@nestjs/common';
import { CommandsController } from 'src/modules/commands/commands.controller';
import { CommandsService } from 'src/modules/commands/commands.service';
import { CommandsJsonProvider } from 'src/modules/commands/commands-json.provider';
import vectorSetCommands from 'src/modules/commands/data/vector-set.json';
import config from 'src/utils/config';

const COMMANDS_CONFIGS = config.get('commands');

@Module({
  controllers: [CommandsController],
  providers: [
    {
      provide: CommandsService,
      useFactory: () =>
        new CommandsService([
          ...COMMANDS_CONFIGS.map(
            ({ name, url }) => new CommandsJsonProvider(name, url),
          ),
          // Vector Set commands are bundled — there is no upstream JSON to fetch.
          new CommandsJsonProvider('vector_set', '', vectorSetCommands),
        ]),
    },
  ],
  exports: [CommandsService],
})
export class CommandsModule {}
