import { get, groupBy } from 'lodash';
import { Socket, Server } from 'socket.io';
import {
  ConnectedSocket,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Logger, OnModuleInit } from '@nestjs/common';
import config, { Config } from 'src/utils/config';
import { CommandLogService } from 'src/modules/command-log/command-log.service';
import { CommandLogEntry } from 'src/modules/command-log/models/command-log.entry';
import {
  COMMAND_LOG_NAMESPACE,
  CommandLogClientEvents,
  CommandLogServerEvents,
} from 'src/modules/command-log/constants';

const SOCKETS_CONFIG = config.get('sockets') as Config['sockets'];

/**
 * Streams commands issued by this application to the UI.
 *
 * Unlike the profiler gateway this does NOT talk to Redis: entries are
 * produced by the Redis client layer and handed over by CommandLogService.
 * Each connected panel joins a room named after its instance id, so several
 * browser tabs can watch the same instance independently.
 */
@WebSocketGateway({
  path: SOCKETS_CONFIG.path,
  namespace: COMMAND_LOG_NAMESPACE,
  cors: SOCKETS_CONFIG.cors.enabled
    ? {
        origin: SOCKETS_CONFIG.cors.origin,
        credentials: SOCKETS_CONFIG.cors.credentials,
      }
    : false,
  serveClient: SOCKETS_CONFIG.serveClient,
})
export class CommandLogGateway implements OnModuleInit, OnGatewayDisconnect {
  @WebSocketServer() wss: Server;

  private readonly logger = new Logger('CommandLogGateway');

  constructor(private readonly service: CommandLogService) {}

  onModuleInit(): void {
    this.service.onEntries((entries) => this.broadcast(entries));
  }

  @SubscribeMessage(CommandLogClientEvents.Subscribe)
  async subscribe(@ConnectedSocket() client: Socket): Promise<any> {
    try {
      const instanceId = CommandLogGateway.getInstanceId(client);

      if (!instanceId) {
        throw new WsException('instanceId is required');
      }

      await client.join(instanceId);

      return { status: 'ok' };
    } catch (error) {
      this.logger.error('Unable to subscribe to the command log', error);
      throw new WsException(error);
    }
  }

  @SubscribeMessage(CommandLogClientEvents.Unsubscribe)
  async unsubscribe(@ConnectedSocket() client: Socket): Promise<any> {
    try {
      const instanceId = CommandLogGateway.getInstanceId(client);

      if (instanceId) {
        await client.leave(instanceId);
      }

      return { status: 'ok' };
    } catch (error) {
      this.logger.error('Unable to unsubscribe from the command log', error);
      throw new WsException(error);
    }
  }

  handleDisconnect(client: Socket): void {
    const instanceId = CommandLogGateway.getInstanceId(client);

    if (instanceId) {
      client.leave(instanceId);
    }
  }

  /**
   * Routes each batch to the room of the instance that produced it.
   */
  private broadcast(entries: CommandLogEntry[]): void {
    if (!this.wss || !entries?.length) {
      return;
    }

    const byInstance = groupBy(entries, 'databaseId');

    Object.entries(byInstance).forEach(([instanceId, items]) => {
      if (!instanceId || instanceId === 'undefined') {
        return;
      }

      this.wss.to(instanceId).emit(CommandLogServerEvents.Data, items);
    });
  }

  static getInstanceId(client: Socket): string {
    return get(client, 'handshake.query.instanceId') as string;
  }
}
