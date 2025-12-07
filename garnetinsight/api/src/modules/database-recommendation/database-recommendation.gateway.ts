import { Server } from 'socket.io';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import config, { Config } from 'src/utils/config';
import { OnEvent } from '@nestjs/event-emitter';
import { RecommendationServerEvents } from 'src/modules/database-recommendation/constants';
import { DatabaseRecommendationsResponse } from 'src/modules/database-recommendation/dto/database-recommendations.response';
import { SessionMetadata } from 'src/common/models';
import { getUserRoom } from 'src/constants/websocket-rooms';

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
export class DatabaseRecommendationGateway {
  @WebSocketServer() wss: Server;

  @OnEvent(RecommendationServerEvents.Recommendation)
  notify({ userId }: SessionMetadata, data: DatabaseRecommendationsResponse) {
    this.wss
      .to(getUserRoom(userId))
      .emit(RecommendationServerEvents.Recommendation, data);
  }
}
