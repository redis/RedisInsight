import { Controller, Get, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { getBlockingCommands } from 'src/utils/cli-helper';
import { getUnsupportedCommands } from 'src/modules/cli/utils/getUnsupportedCommands';
import { ServerService } from 'src/modules/server/server.service';
import { GetServerInfoResponse } from 'src/modules/server/dto/server.dto';
import { RequestSessionMetadata } from 'src/common/decorators';
import { SessionMetadata } from 'src/common/models';

@ApiTags('Info')
@Controller('info')
@UsePipes(new ValidationPipe({ transform: true }))
export class ServerController {
  constructor(private serverService: ServerService) {}

  @Get('')
  @ApiEndpoint({
    description: 'Get server info',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Server Info',
        type: GetServerInfoResponse,
      },
    ],
  })
  async getInfo(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
  ): Promise<GetServerInfoResponse> {
    return this.serverService.getInfo(sessionMetadata);
  }

  @Get('/cli-unsupported-commands')
  @ApiEndpoint({
    description: 'Get list of unsupported commands in CLI',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Unsupported commands',
        type: String,
        isArray: true,
      },
    ],
  })
  async getCliUnsupportedCommands(): Promise<string[]> {
    return getUnsupportedCommands();
  }

  @Get('/cli-blocking-commands')
  @ApiEndpoint({
    description: 'Get list of blocking commands in CLI',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Blocking commands',
        type: String,
        isArray: true,
      },
    ],
  })
  async getCliBlockingCommands(): Promise<string[]> {
    return getBlockingCommands();
  }
}
