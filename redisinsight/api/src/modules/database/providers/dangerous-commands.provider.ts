import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AppRedisInstanceEvents, RedisErrorCodes } from 'src/constants';
import { RedisClient } from 'src/modules/redis/client';

@Injectable()
export class DangerousCommandsProvider {
  private logger = new Logger('DangerousCommandsProvider');

  private cache: Map<string, string[]> = new Map();

  /**
   * Get cached dangerous commands list for the connection, or fetch and cache it.
   * Permanent failures (ACL unsupported or NOPERM) are also cached as [] so we
   * don't re-issue a command that will always fail for this database. Transient
   * failures (network, timeout, etc.) return [] but are NOT cached, so the next
   * call will try again.
   */
  async getDangerousCommands(client: RedisClient): Promise<string[]> {
    const { databaseId } = client.clientMetadata;
    if (this.cache.has(databaseId)) {
      return this.cache.get(databaseId)!;
    }

    try {
      const commands = await this.fetchDangerousCommands(client);
      this.cache.set(databaseId, commands);
      return commands;
    } catch (e) {
      if (this.isPermanentError(e)) {
        this.cache.set(databaseId, []);
        return [];
      }
      this.logger.debug(
        'Transient error fetching dangerous commands; not caching',
        e?.message,
      );
      return [];
    }
  }

  /**
   * Drop the cached entry for a given database id so the next call re-fetches.
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
   */
  private async fetchDangerousCommands(client: RedisClient): Promise<string[]> {
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
  }

  /**
   * A permanent error is one that will keep failing until the database or its
   * ACL config changes:
   *  - NOPERM: the connected user lacks permission to run ACL CAT
   *  - "unknown command": Redis < 6.0 (no ACL at all)
   * Everything else (connection reset, timeout, etc.) is treated as transient.
   */
  private isPermanentError(e: unknown): boolean {
    const message = (e as { message?: string })?.message ?? '';
    return (
      message.includes(RedisErrorCodes.NoPermission) ||
      message.includes(RedisErrorCodes.UnknownCommand)
    );
  }
}
