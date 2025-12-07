import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  RedisClientSubscriberEvents,
  RedisClientSubscriberStatus,
} from 'src/modules/pub-sub/constants';
import { RedisClient } from 'src/modules/redis/client';

export class RedisClientSubscriber extends EventEmitter2 {
  private logger: Logger = new Logger('RedisClientSubscriber');

  private client: RedisClient;

  private readonly databaseId: string;

  private readonly connectFn: () => Promise<RedisClient>;

  private status: RedisClientSubscriberStatus;

  constructor(databaseId: string, connectFn: () => Promise<RedisClient>) {
    super();
    this.databaseId = databaseId;
    this.connectFn = connectFn;
  }

  /**
   * Get existing client or wait until previous attempt fulfill or initiate new connection attempt
   * based on current status
   */
  async getClient(): Promise<RedisClient> {
    try {
      this.logger.debug(`Get client ${this}`);
      switch (this.status) {
        case RedisClientSubscriberStatus.Connected:
          return this.client;
        case RedisClientSubscriberStatus.Connecting:
          // wait until connect or error
          break;
        case RedisClientSubscriberStatus.Error:
        case RedisClientSubscriberStatus.End:
        default:
          await this.connect();
          return this.client;
      }

      return new Promise((resolve, reject) => {
        this.once(RedisClientSubscriberEvents.Connected, resolve);
        this.once(RedisClientSubscriberEvents.ConnectionError, reject);
      });
    } catch (e) {
      this.logger.error('Unable to connect to Redis', e);
      this.status = RedisClientSubscriberStatus.Error;
      this.emit(RedisClientSubscriberEvents.ConnectionError, e);
      throw e;
    }
  }

  /**
   * Connects to redis and change current status to Connected
   * Also emit Connected event after success
   * Also subscribe to needed channels
   * @private
   */
  private async connect() {
    this.status = RedisClientSubscriberStatus.Connecting;
    this.client = await this.connectFn();
    this.status = RedisClientSubscriberStatus.Connected;
    this.emit(RedisClientSubscriberEvents.Connected, this.client);

    this.client.on('message', (channel: string, message: string) => {
      this.emit(RedisClientSubscriberEvents.Message, `s:${channel}`, {
        channel,
        message,
        time: Date.now(),
      });
    });

    this.client.on(
      'pmessage',
      (pattern: string, channel: string, message: string) => {
        this.emit(RedisClientSubscriberEvents.Message, `p:${pattern}`, {
          channel,
          message,
          time: Date.now(),
        });
      },
    );

    this.client.on('end', () => {
      this.status = RedisClientSubscriberStatus.End;
      this.emit(RedisClientSubscriberEvents.End);
    });
  }

  /**
   * Unsubscribe all listeners and disconnect
   * Remove client and set current state to End
   */
  destroy() {
    this.client?.removeAllListeners();
    this.client?.quit().catch((e) => {
      this.logger.warn('Error when closing Redis client', e);
    });
    this.client = null;
    this.status = RedisClientSubscriberStatus.End;
  }

  toString() {
    return `RedisClient:${JSON.stringify({
      databaseId: this.databaseId,
      status: this.status,
    })}`;
  }
}
