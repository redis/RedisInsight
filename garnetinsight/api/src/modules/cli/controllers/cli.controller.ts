import {
  Body,
  Controller,
  Delete,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  CreateCliClientResponse,
  DeleteClientResponse,
  SendCommandDto,
  SendCommandResponse,
} from 'src/modules/cli/dto/cli.dto';
import { CliBusinessService } from 'src/modules/cli/services/cli-business/cli-business.service';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { ApiCLIParams } from 'src/modules/cli/decorators/api-cli-params.decorator';
import { CliClientMetadata } from 'src/modules/cli/decorators/cli-client-metadata.decorator';
import { ClientMetadata } from 'src/common/models';

@ApiTags('CLI')
@Controller('cli')
@UsePipes(new ValidationPipe({ transform: true }))
export class CliController {
  constructor(private service: CliBusinessService) {}

  @Post('')
  @ApiCLIParams(false)
  @ApiEndpoint({
    description: 'Create Redis client for CLI',
    statusCode: 201,
    responses: [
      {
        status: 201,
        description: 'Create Redis client for CLI',
        type: CreateCliClientResponse,
      },
    ],
  })
  async getClient(
    @CliClientMetadata() clientMetadata: ClientMetadata,
  ): Promise<CreateCliClientResponse> {
    return this.service.getClient(clientMetadata);
  }

  @Post('/:uuid/send-command')
  @ApiCLIParams()
  @ApiEndpoint({
    description: 'Send Redis CLI command',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Redis CLI command response',
        type: SendCommandResponse,
      },
    ],
  })
  async sendCommand(
    @CliClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: SendCommandDto,
  ): Promise<SendCommandResponse> {
    return this.service.sendCommand(clientMetadata, dto);
  }

  @Post('/:uuid/send-cluster-command')
  @ApiCLIParams()
  @ApiEndpoint({
    description: 'Send Redis CLI command',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Redis CLI command response',
        type: SendCommandResponse,
        isArray: true,
      },
    ],
  })
  async sendClusterCommand(
    @CliClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: SendCommandDto,
  ): Promise<SendCommandResponse> {
    return this.service.sendCommand(clientMetadata, dto);
  }

  @Delete('/:uuid')
  @ApiCLIParams()
  @ApiEndpoint({
    description: 'Delete Redis CLI client',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Delete Redis CLI client response',
        type: DeleteClientResponse,
      },
    ],
  })
  async deleteClient(
    @CliClientMetadata() clientMetadata: ClientMetadata,
  ): Promise<DeleteClientResponse> {
    return this.service.deleteClient(clientMetadata);
  }

  @Patch('/:uuid')
  @ApiCLIParams()
  @ApiEndpoint({
    description: 'Re-create Redis client for CLI',
    statusCode: 200,
  })
  async reCreateClient(
    @CliClientMetadata() clientMetadata: ClientMetadata,
  ): Promise<CreateCliClientResponse> {
    return this.service.reCreateClient(clientMetadata);
  }
}
