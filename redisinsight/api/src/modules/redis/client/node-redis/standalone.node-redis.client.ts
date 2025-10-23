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
import { EventEmitter2 } from '@nestjs/event-emitter';

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

  async monitor(): Promise<any> {
    const monitorObserver = new NodeRedisMonitorObserver();
    await this.client.monitor((replyStr: string) => {
      const len = replyStr.indexOf(" ");
      const timestamp = replyStr.slice(0, len);
      const argIndex = replyStr.indexOf('"');
      const args = replyStr
        .slice(argIndex + 1, -1)
        .split('" "')
        .map((elem) => elem.replace(/\\"/g, '"'));
      const dbAndSource = replyStr.slice(len + 2, argIndex - 2).split(" ");
      monitorObserver.emit("monitor", timestamp, args, dbAndSource[1], dbAndSource[0]);
    });

    this.client.on('end', () => monitorObserver.emit('end'));
    this.client.on('error', (e) => monitorObserver.emit('error', e));
    return monitorObserver;
  }
}

class NodeRedisMonitorObserver extends EventEmitter2 {
  disconnect() {
    console.log('TBD: disconnect')
  }
}
