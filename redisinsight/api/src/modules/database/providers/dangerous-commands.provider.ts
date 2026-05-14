import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AppRedisInstanceEvents } from 'src/constants';
import { RedisClient } from 'src/modules/redis/client';

@Injectable()
export class DangerousCommandsProvider {
  private logger = new Logger('DangerousCommandsProvider');

  private cache: Map<string, string[]> = new Map();

  /**
   * Get cached dangerous commands list for the connection, or fetch and cache it.
   */
  async getDangerousCommands(client: RedisClient): Promise<string[]> {
    const cached = this.cache.get(client.clientMetadata.databaseId);
    if (cached) {
      return cached;
    }

    const commands = await this.fetchDangerousCommands(client);
    this.cache.set(client.clientMetadata.databaseId, commands);
    return commands;
  }

  /**
   * Invalidate the cached entry for a given database id.
   * Should be called when the connection for this database is closed.
   */
  invalidate(databaseId: string): void {
    this.cache.delete(databaseId);
  }

  @OnEvent(AppRedisInstanceEvents.Deleted)
  handleInstanceDeletedEvent(databaseId: string): void {
    this.invalidate(databaseId);
  }

  /**
   * Run `ACL CAT dangerous` against the connected Redis instance.
   * Returns an upper-cased, deduplicated list of command names.
   * Returns an empty list if ACL is not supported (e.g. Redis < 6.0).
   */
  private async fetchDangerousCommands(client: RedisClient): Promise<string[]> {
    try {
      const reply = (await client.call(['acl', 'cat', 'dangerous'], {
        replyEncoding: 'utf8',
      })) as string[];

      if (!Array.isArray(reply)) {
        return [];
      }

      return Array.from(
        new Set(
          reply
            .filter((cmd): cmd is string => typeof cmd === 'string')
            .map((cmd) => cmd.toUpperCase()),
        ),
      );
    } catch (e) {
      this.logger.debug(
        'ACL CAT dangerous is not available on this Redis instance',
        e?.message,
      );
      return [];
    }
  }
}
