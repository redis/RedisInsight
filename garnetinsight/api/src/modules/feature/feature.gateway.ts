import { Server } from 'socket.io';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import config, { Config } from 'src/utils/config';
import { OnEvent } from '@nestjs/event-emitter';
import {
  FeatureEvents,
  FeatureServerEvents,
} from 'src/modules/feature/constants';

const SOCKETS_CONFIG = config.get('sockets') as Config['sockets'];

@WebSocketGateway({
  path: SOCKETS_CONFIG.path,
  cors: SOCKETS_CONFIG.cors.enabled
    ? {
        origin: SOCKETS_CONFIG.cors.origin,
        credentials: SOCKETS_CONFIG.cors.credentials,
      }
    : false,
  serveClient: SOCKETS_CONFIG.serveClient,
})
export class FeatureGateway {
  @WebSocketServer() wss: Server;

  @OnEvent(FeatureServerEvents.FeaturesRecalculated)
  feature(data: any) {
    this.wss.of('/').emit(FeatureEvents.Features, data);
  }
}
