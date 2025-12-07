import {
  IRedisClientCommandOptions,
  RedisClientCommand,
  RedisClientCommandReply,
  RedisClientConnectionType,
} from 'src/modules/redis/client';
import {
  NodeRedis,
  NodeRedisClient,
} from 'src/modules/redis/client/node-redis/node-redis.client';

export class StandaloneNodeRedisClient extends NodeRedisClient {
  protected readonly client: NodeRedis;

  /**
   * @inheritDoc
   */
  getConnectionType(): RedisClientConnectionType {
    return RedisClientConnectionType.STANDALONE;
  }

  /**
   * @inheritDoc
   */
  async sendPipeline(
    commands: RedisClientCommand[],
    options?: IRedisClientCommandOptions,
  ): Promise<Array<[Error | null, RedisClientCommandReply]>> {
    return Promise.all(
      commands.map((cmd) =>
        this.sendCommand(cmd, options)
          .then((res): [null, RedisClientCommandReply] => [null, res])
          .catch((e): [Error, null] => [e, null]),
      ),
    );
  }

  /**
   * @inheritDoc
   */
  async sendCommand(
    command: RedisClientCommand,
    options?: IRedisClientCommandOptions,
  ): Promise<RedisClientCommandReply> {
    return this.client.sendCommand(
      NodeRedisClient.prepareCommandArgs(command),
      NodeRedisClient.prepareCommandOptions(options),
    );
  }

  /**
   * @inheritDoc
   */
  /** TODO: It's necessary to investigate transactions
  async sendMulti(commands: RedisClientCommand[]): Promise<Array<[Error | null, RedisClientCommandReply]>> {
    return Promise.all(
      commands.map(
        (cmd) => this.sendCommand(cmd)
          .then((res): [null, RedisClientCommandReply] => [null, res])
          .catch((e): [Error, null] => [e, null]),
      ),
    );
  }
   */

  /**
   * @inheritDoc
   */
  async call(
    command: RedisClientCommand,
    options?: IRedisClientCommandOptions,
  ): Promise<RedisClientCommandReply> {
    return this.sendCommand(command, options);
  }
}
