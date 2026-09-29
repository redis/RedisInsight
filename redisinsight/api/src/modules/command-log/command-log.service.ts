import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RedisClient } from 'src/modules/redis/client';
import { CommandLogEntry } from 'src/modules/command-log/models/command-log.entry';

/** Event name used internally to hand batches over to the gateway. */
export const COMMAND_LOG_EVENT = 'command-log.entries';

/**
 * Entries are buffered and flushed in batches: a single UI action (loading a
 * key list, opening a hash) can produce dozens of commands, and emitting one
 * socket message per command would be needlessly chatty.
 */
export const COMMAND_LOG_FLUSH_INTERVAL = 50;

/** Hard cap on the in-memory buffer so a bulk action cannot grow it forever. */
export const COMMAND_LOG_MAX_BUFFER = 1000;

/**
 * Collects every command sent to Redis by this API and forwards them, in
 * batches, to whoever subscribed (the command log gateway).
 *
 * Entries are produced by the Redis client layer through
 * `RedisClient.setCommandLogHandler`, which this service registers on module
 * init — so the service is the single owner of that hook.
 */
@Injectable()
export class CommandLogService implements OnModuleInit {
  private readonly logger = new Logger('CommandLogService');

  private readonly emitter = new EventEmitter2();

  private buffer: CommandLogEntry[] = [];

  private flushTimer: NodeJS.Timeout | null = null;

  /**
   * Hooks the service into the Redis client layer: from this point on every
   * command sent by any client of this process lands in the buffer.
   */
  onModuleInit(): void {
    RedisClient.setCommandLogHandler((entry) => this.add(entry));
  }

  /**
   * Registers a listener receiving flushed batches of entries.
   */
  public onEntries(listener: (entries: CommandLogEntry[]) => void): void {
    this.emitter.on(COMMAND_LOG_EVENT, listener);
  }

  /**
   * Records a single command. Called from the hot path of every Redis command,
   * therefore it must never throw and never block.
   */
  public add(entry: CommandLogEntry): void {
    try {
      this.buffer.push(entry);

      if (this.buffer.length > COMMAND_LOG_MAX_BUFFER) {
        this.buffer = this.buffer.slice(-COMMAND_LOG_MAX_BUFFER);
      }

      this.scheduleFlush();
    } catch (e) {
      // Recording must never interfere with the command itself.
    }
  }

  private scheduleFlush(): void {
    if (this.flushTimer) {
      return;
    }

    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      this.flush();
    }, COMMAND_LOG_FLUSH_INTERVAL);

    // The buffer alone should never keep the process alive.
    this.flushTimer.unref?.();
  }

  private flush(): void {
    if (!this.buffer.length) {
      return;
    }

    const entries = this.buffer;
    this.buffer = [];

    try {
      this.emitter.emit(COMMAND_LOG_EVENT, entries);
    } catch (e) {
      this.logger.error('Unable to broadcast command log entries', e);
    }
  }
}
