import { Socket, Server } from 'socket.io';
import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Body, Logger, ValidationPipe } from '@nestjs/common';
import config, { Config } from 'src/utils/config';
import { CloudJobEvents } from 'src/modules/cloud/common/constants';
import { CloudJobService } from 'src/modules/cloud/job/cloud-job.service';
import { MonitorCloudJobDto } from 'src/modules/cloud/job/dto/monitor.cloud-job.dto';
import { Validator } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CloudJobInfo } from 'src/modules/cloud/job/models';
import { SessionMetadata } from 'src/common/models';
import { WSSessionMetadata } from 'src/modules/auth/session-metadata/decorators/ws-session-metadata.decorator';

const SOCKETS_CONFIG = config.get('sockets') as Config['sockets'];

@WebSocketGateway({
  path: SOCKETS_CONFIG.path,
  cors: SOCKETS_CONFIG.cors.enabled
    ? {
        origin: SOCKETS_CONFIG.cors.origin,
        credentials: SOCKETS_CONFIG.cors.credentials,
      }
    : false,
})
export class CloudJobGateway {
  @WebSocketServer() wss: Server;

  private readonly validator = new Validator();

  private exceptionFactory = new ValidationPipe().createExceptionFactory();

  private logger: Logger = new Logger('CloudJobGateway');

  constructor(private readonly cloudJobService: CloudJobService) {}

  @SubscribeMessage(CloudJobEvents.Monitor)
  async monitor(
    @WSSessionMetadata() sessionMetadata: SessionMetadata,
    @ConnectedSocket() client: Socket,
    @Body() data: MonitorCloudJobDto,
  ): Promise<CloudJobInfo> {
    try {
      const dto = plainToInstance(MonitorCloudJobDto, data);

      const errors = await this.validator.validate(dto, { whitelist: true });

      if (errors?.length) {
        throw this.exceptionFactory(errors);
      }

      return await this.cloudJobService.monitorJob(
        sessionMetadata,
        dto,
        client,
      );
    } catch (error) {
      this.logger.error('Unable to add listener', error);
      throw new WsException(error);
    }
  }
}
