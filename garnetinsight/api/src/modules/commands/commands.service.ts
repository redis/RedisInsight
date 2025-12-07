import { assign, forEach } from 'lodash';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { CommandsJsonProvider } from 'src/modules/commands/commands-json.provider';

// 5 min
const COMMANDS_TTL = 300000;

@Injectable()
export class CommandsService implements OnModuleInit {
  private commandsProviders;

  private commandsGroups;

  private timer;

  constructor(commandsProviders: CommandsJsonProvider[] = []) {
    this.commandsProviders = commandsProviders;
  }

  /**
   * Updates latest jsons on startup
   */
  async onModuleInit() {
    // async operation to not wait for it and not block user in case when no internet connection
    Promise.all(
      this.commandsProviders.map((provider) => provider.updateLatestJson()),
    );
  }

  /**
   * Get all commands merged into single object
   */
  async getAll(): Promise<any> {
    const commands = {};

    Object.entries(await this.getCommandsGroups()).forEach(
      ([provider, groupCommands]) => {
        return forEach(groupCommands as {}, (value: {}, command) => {
          commands[command] = { ...value, provider };
        });
      },
    );

    return commands;
  }

  async getCommandsGroups(): Promise<any> {
    if (!!this.timer && this.timer + COMMANDS_TTL > new Date().getTime()) {
      return this.commandsGroups;
    }
    this.commandsGroups = assign(
      {},
      ...(await Promise.all(
        this.commandsProviders.map((provider) => provider.getCommands()),
      )),
    );
    this.timer = new Date().getTime();
    return this.commandsGroups;
  }
}
