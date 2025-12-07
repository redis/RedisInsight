import { isNull, isNumber } from 'lodash';
import { createClient, createCluster } from 'redis';
import {
  IRedisClientCommandOptions,
  RedisClient,
  RedisClientCommand,
} from 'src/modules/redis/client';
import { RedisString } from 'src/common/constants';

export type NodeRedis = ReturnType<typeof createClient>;
export type NodeRedisCluster = ReturnType<typeof createCluster>;

export abstract class NodeRedisClient extends RedisClient {
  protected readonly client: NodeRedis | NodeRedisCluster;

  static prepareCommandOptions(options: IRedisClientCommandOptions): any {
    let replyEncoding = null;

    if (options?.replyEncoding === 'utf8') {
      replyEncoding = 'utf8';
    }

    return {
      returnBuffers: isNull(replyEncoding),
    };
  }

  static prepareCommandArgs(args: RedisClientCommand): RedisString[] {
    const strArgs = args.map((arg) =>
      isNumber(arg) ? arg.toString() : arg,
    ) as string[];
    return [...strArgs.shift().split(' '), ...strArgs];
  }

  async nodes(): Promise<RedisClient[]> {
    return [this];
  }

  /**
   * @inheritDoc
   */
  isConnected(): boolean {
    // todo: find a way
    return true;
    //   try {
    //     return this.client.status === 'ready';
    //   } catch (e) {
    //     return false;
    //   }
  }

  /**
   * @inheritDoc
   */
  async publish(channel: string, message: string): Promise<number> {
    return this.client.publish(channel, message);
  }

  /**
   * @inheritDoc
   */
  async subscribe(channel: string): Promise<void> {
    const listener = (message: string, messageChannel: string) => {
      this.emit('message', messageChannel, message);
    };
    return this.client.subscribe(channel, listener);
  }

  /**
   * @inheritDoc
   */
  async pSubscribe(channel: string): Promise<void> {
    const listener = (message: string, messageChannel: string) => {
      this.emit('pmessage', channel, messageChannel, message);
    };
    return this.client.pSubscribe(channel, listener);
  }

  /**
   * @inheritDoc
   */
  async unsubscribe(channel: string): Promise<void> {
    return this.client.unsubscribe(channel);
  }

  /**
   * @inheritDoc
   */
  async pUnsubscribe(channel: string): Promise<void> {
    return this.client.pUnsubscribe(channel);
  }

  /**
   * @inheritDoc
   */
  async monitor(): Promise<any> {
    // TODO: Implement this method after the monitor in the node-redis is available.
    throw new Error('Not implemented');
  }

  /**
   * @inheritDoc
   */
  async disconnect(): Promise<void> {
    this.client.disconnect();
  }

  /**
   * @inheritDoc
   */
  async quit(): Promise<void> {
    await this.client.quit();
  }

  /**
   * @inheritDoc
   */
  async getCurrentDbIndex(): Promise<number> {
    return this.clientMetadata.db || 0;
  }
}
