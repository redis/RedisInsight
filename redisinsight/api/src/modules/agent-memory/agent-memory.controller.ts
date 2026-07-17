import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import {
  AgentMemoryClientMetadata,
  AgentMemoryEndpoint,
} from 'src/modules/agent-memory/models';
import { AgentMemoryService } from 'src/modules/agent-memory/agent-memory.service';
import { AgentMemoryCapabilities } from 'src/modules/agent-memory/agent-memory.types';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import {
  CreateAgentMemoryEndpointDto,
  DeleteAgentMemoryEndpointsDto,
  UpdateAgentMemoryEndpointDto,
} from 'src/modules/agent-memory/dto';
import { RequestAgentMemoryClientMetadata } from 'src/modules/agent-memory/decorators';
import { RequestSessionMetadata } from 'src/common/decorators';
import { SessionMetadata } from 'src/common/models';

@ApiTags('Agent Memory')
// The input transform needs the 'security' group so the group-guarded
// apiKey field survives into the DTO. Responses are serialized by the
// interceptor WITHOUT groups, so apiKey still never leaves the backend.
@UsePipes(
  new ValidationPipe({
    transform: true,
    transformOptions: { groups: ['security'] },
  }),
)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('agent-memory')
export class AgentMemoryController {
  constructor(private readonly service: AgentMemoryService) {}

  @Get()
  @ApiEndpoint({
    description: 'Get agent memory endpoints list',
    responses: [{ status: 200, isArray: true, type: AgentMemoryEndpoint }],
  })
  async list(): Promise<AgentMemoryEndpoint[]> {
    return this.service.list();
  }

  @Get('/:id')
  @ApiEndpoint({
    description: 'Get agent memory endpoint by id',
    responses: [{ status: 200, type: AgentMemoryEndpoint }],
  })
  async get(@Param('id') id: string): Promise<AgentMemoryEndpoint> {
    return this.service.get(id);
  }

  @Post()
  @ApiEndpoint({
    description: 'Create agent memory endpoint',
    statusCode: 201,
    responses: [{ status: 201, type: AgentMemoryEndpoint }],
  })
  async create(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
    @Body() dto: CreateAgentMemoryEndpointDto,
  ): Promise<AgentMemoryEndpoint> {
    return this.service.create(sessionMetadata, dto);
  }

  @Patch('/:id')
  @ApiEndpoint({
    description: 'Update agent memory endpoint',
    responses: [{ status: 200, type: AgentMemoryEndpoint }],
  })
  async update(
    @RequestAgentMemoryClientMetadata() metadata: AgentMemoryClientMetadata,
    @Body() dto: UpdateAgentMemoryEndpointDto,
  ): Promise<AgentMemoryEndpoint> {
    return this.service.update(metadata, dto);
  }

  @Delete()
  @ApiEndpoint({
    description: 'Delete agent memory endpoints',
    responses: [{ status: 200 }],
  })
  async delete(
    @Body() dto: DeleteAgentMemoryEndpointsDto,
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
  ): Promise<void> {
    return this.service.delete(sessionMetadata, dto.ids);
  }

  @Get(':id/connect')
  @ApiEndpoint({
    description:
      'Connect to the agent memory endpoint and get its capabilities',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Successfully connected to the agent memory endpoint',
      },
    ],
  })
  async connect(
    @RequestAgentMemoryClientMetadata() metadata: AgentMemoryClientMetadata,
  ): Promise<AgentMemoryCapabilities> {
    return this.service.connect(metadata);
  }
}
