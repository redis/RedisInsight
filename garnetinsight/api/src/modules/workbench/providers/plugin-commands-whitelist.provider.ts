import { Injectable } from '@nestjs/common';
import { filter, get, map } from 'lodash';
import {
  pluginBlockingCommands,
  pluginUnsupportedCommands,
} from 'src/constants';
import { RedisClient } from 'src/modules/redis/client';

@Injectable()
export class PluginCommandsWhitelistProvider {
  private databasesCommands: Map<string, string[]> = new Map();

  /**
   * Get cached commands list or determine it and cache
   * @param client
   */
  async getWhitelistCommands(client: RedisClient): Promise<string[]> {
    return (
      this.databasesCommands.get(client.clientMetadata.databaseId) ||
      this.determineWhitelistCommandsForDatabase(client)
    );
  }

  /**
   * Get or create Workbench redis client, fetch commands and cache them
   * @param client
   */
  async determineWhitelistCommandsForDatabase(
    client: RedisClient,
  ): Promise<string[]> {
    // no need to define AppTool since it was set on RedisTool creation. todo: do not forget after refactoring;

    const commands = await this.calculateWhiteListCommands(client);
    this.databasesCommands.set(client.clientMetadata.databaseId, commands);

    return commands;
  }

  /**
   * Get whitelisted commands available for plugins for particular database
   * Commands:
   *  +Readonly
   *  -Hardcoded unsupported commands
   *  -Hardcoded blocking commands
   *  -Redis dangerous
   *  -Redis blocking
   */
  async calculateWhiteListCommands(client: RedisClient): Promise<string[]> {
    let pluginWhiteListCommands = [];
    const replyEncoding = 'utf8';
    try {
      const availableCommands = (await client.call(['command'], {
        replyEncoding,
      })) as string[][];
      const readOnlyCommands = map(
        filter(availableCommands, (command) =>
          get(command, [2], []).includes('readonly'),
        ),
        (command) => command[0],
      );

      const blackListCommands = [
        ...pluginUnsupportedCommands,
        ...pluginBlockingCommands,
      ];
      try {
        const dangerousCommands = (await client.call(
          ['acl', 'cat', 'dangerous'],
          { replyEncoding },
        )) as string[];
        blackListCommands.push(...dangerousCommands);
      } catch (e) {
        // ignore error as acl cat available since Redis 6.0
      }

      try {
        const blockingCommands = (await client.call(
          ['acl', 'cat', 'blocking'],
          { replyEncoding },
        )) as string[];
        blackListCommands.push(...blockingCommands);
      } catch (e) {
        // ignore error as acl cat available since Redis 6.0
      }

      pluginWhiteListCommands = filter(
        readOnlyCommands,
        (command) => !blackListCommands.includes(command),
      );
    } catch (e) {
      // ignore any error to not block main process of client creation
    }

    return pluginWhiteListCommands.map((cmd) => cmd.toLowerCase());
  }
}
