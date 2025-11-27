import { Socket, Server } from 'socket.io';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  Body,
  Logger,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import config, { Config } from 'src/utils/config';
import { BulkActionsServerEvents } from 'src/modules/bulk-actions/constants';
import { CreateBulkActionDto } from 'src/modules/bulk-actions/dto/create-bulk-action.dto';
import { BulkActionsService } from 'src/modules/bulk-actions/bulk-actions.service';
import { AckWsExceptionFilter } from 'src/modules/pub-sub/filters/ack-ws-exception.filter';
import { BulkActionIdDto } from 'src/modules/bulk-actions/dto/bulk-action-id.dto';
import { SessionMetadata } from 'src/common/models';
import { WSSessionMetadata } from 'src/modules/auth/session-metadata/decorators/ws-session-metadata.decorator';

const SOCKETS_CONFIG = config.get('sockets') as Config['sockets'];

@UsePipes(new ValidationPipe({ transform: true }))
@UseFilters(AckWsExceptionFilter)
@WebSocketGateway({
  path: SOCKETS_CONFIG.path,
  namespace: 'bulk-actions',
  cors: SOCKETS_CONFIG.cors.enabled
    ? {
        origin: SOCKETS_CONFIG.cors.origin,
        credentials: SOCKETS_CONFIG.cors.credentials,
      }
    : false,
  serveClient: SOCKETS_CONFIG.serveClient,
})
export class BulkActionsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;

  private logger: Logger = new Logger('BulkActionsGateway');

  constructor(private service: BulkActionsService) {}

  @SubscribeMessage(BulkActionsServerEvents.Create)
  create(
    @WSSessionMetadata() sessionMetadata: SessionMetadata,
    @ConnectedSocket() socket: Socket,
    @Body() dto: CreateBulkActionDto,
  ) {
    this.logger.debug('Creating new bulk action.');
    return this.service.create(sessionMetadata, dto, socket);
  }

  @SubscribeMessage(BulkActionsServerEvents.Get)
  get(
    @WSSessionMetadata() sessionMetadata: SessionMetadata,
    @Body() dto: BulkActionIdDto,
  ) {
    this.logger.debug('Subscribing to bulk action.');
    return this.service.get(dto);
  }

  @SubscribeMessage(BulkActionsServerEvents.Abort)
  abort(
    @WSSessionMetadata() sessionMetadata: SessionMetadata,
    @Body() dto: BulkActionIdDto,
  ) {
    this.logger.debug('Aborting bulk action.');
    return this.service.abort(dto);
  }

  @SubscribeMessage(BulkActionsServerEvents.SubscribeBulkActionReport)
  subscribeBulkActionReport(
    @ConnectedSocket() socket: Socket,
    @Body() dto: BulkActionIdDto,
  ) {
    this.logger.debug('Subscribing to bulk action report.');
    return this.service.subscribeToReport(socket, dto.id);
  }

  @SubscribeMessage(BulkActionsServerEvents.UnsubscribeBulkActionReport)
  unsubscribeBulkActionReport(
    @ConnectedSocket() socket: Socket,
    @Body() dto: BulkActionIdDto,
  ) {
    this.logger.debug('Unsubscribing from bulk action report.');
    return this.service.unsubscribeFromReport(socket, dto.id);
  }

  @SubscribeMessage(BulkActionsServerEvents.StartBulkActionExecution)
  startBulkActionExecution(@Body() dto: BulkActionIdDto) {
    this.logger.debug('Starting bulk action execution.');
    return this.service.startExecution(dto.id);
  }

  async handleConnection(socket: Socket): Promise<void> {
    this.logger.debug(`Client connected: ${socket.id}`);
  }

  async handleDisconnect(socket: Socket): Promise<void> {
    this.logger.debug(`Client disconnected: ${socket.id}`);
    this.service.disconnect(socket.id);
  }
}
