import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AgentMemoryClientMetadata } from 'src/modules/agent-memory/models';
import { AgentMemoryDataService } from 'src/modules/agent-memory/agent-memory-data.service';
import {
  AgentMemoryConfiguration,
  DiscoveryFiltersResponse,
  LongTermMemorySearchResponse,
  WorkingMemoryResponse,
} from 'src/modules/agent-memory/agent-memory.types';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import {
  AddSessionEventDto,
  DeleteLongTermMemoriesDto,
  SearchLongTermMemoryDto,
} from 'src/modules/agent-memory/dto';
import { RequestAgentMemoryClientMetadata } from 'src/modules/agent-memory/decorators';

@ApiTags('Agent Memory')
@UsePipes(new ValidationPipe({ transform: true }))
@UseInterceptors(ClassSerializerInterceptor)
@Controller('agent-memory/:id')
export class AgentMemoryDataController {
  constructor(private readonly service: AgentMemoryDataService) {}

  @Get('/sessions')
  @ApiEndpoint({
    description: 'List session ids on the connected agent memory endpoint',
    responses: [{ status: 200 }],
  })
  async listSessions(
    @RequestAgentMemoryClientMetadata() metadata: AgentMemoryClientMetadata,
    @Query('userId') userId?: string,
  ): Promise<string[]> {
    return this.service.listSessions(metadata, { userId });
  }

  @Get('/working-memory/:sessionId')
  @ApiEndpoint({
    description: 'Get working memory (message log + summary) for a session',
    responses: [{ status: 200 }],
  })
  async getWorkingMemory(
    @RequestAgentMemoryClientMetadata() metadata: AgentMemoryClientMetadata,
    @Param('sessionId') sessionId: string,
    @Query('userId') userId?: string,
  ): Promise<WorkingMemoryResponse> {
    return this.service.getWorkingMemory(metadata, sessionId, {
      userId,
    });
  }

  @Delete('/working-memory/:sessionId')
  @ApiEndpoint({
    description: 'Clear working memory for a session',
    responses: [{ status: 200 }],
  })
  async deleteWorkingMemory(
    @RequestAgentMemoryClientMetadata() metadata: AgentMemoryClientMetadata,
    @Param('sessionId') sessionId: string,
    @Query('userId') userId?: string,
  ): Promise<void> {
    return this.service.deleteWorkingMemory(metadata, sessionId, {
      userId,
    });
  }

  @Post('/working-memory/:sessionId/messages')
  @ApiEndpoint({
    description:
      "Append a message to a session's working memory (creates the session when the id is new)",
    statusCode: 201,
    responses: [{ status: 201 }],
  })
  async appendMessage(
    @RequestAgentMemoryClientMetadata() metadata: AgentMemoryClientMetadata,
    @Param('sessionId') sessionId: string,
    @Body() dto: AddSessionEventDto,
    @Query('userId') userId?: string,
  ): Promise<void> {
    return this.service.appendMessage(metadata, sessionId, { userId }, dto);
  }

  @Post('/long-term-memory/search')
  @ApiEndpoint({
    description: 'Search long-term memories (hybrid vector + keyword)',
    statusCode: 200,
    responses: [{ status: 200 }],
  })
  async searchLongTermMemory(
    @RequestAgentMemoryClientMetadata() metadata: AgentMemoryClientMetadata,
    @Body() dto: SearchLongTermMemoryDto,
  ): Promise<LongTermMemorySearchResponse> {
    return this.service.searchLongTermMemory(metadata, dto);
  }

  @Delete('/long-term-memory')
  @ApiEndpoint({
    description: 'Delete long-term memories by ids',
    responses: [{ status: 200 }],
  })
  async deleteLongTermMemories(
    @RequestAgentMemoryClientMetadata() metadata: AgentMemoryClientMetadata,
    @Body() dto: DeleteLongTermMemoriesDto,
  ): Promise<void> {
    return this.service.deleteLongTermMemories(metadata, dto.ids);
  }

  @Get('/discovery')
  @ApiEndpoint({
    description: 'Discover distinct user ids present in long-term memory',
    responses: [{ status: 200 }],
  })
  async discoverFilters(
    @RequestAgentMemoryClientMetadata() metadata: AgentMemoryClientMetadata,
  ): Promise<DiscoveryFiltersResponse> {
    return this.service.discoverFilters(metadata);
  }

  @Get('/config')
  @ApiEndpoint({
    description: 'Get the store configuration (general settings + memory TTLs)',
    responses: [{ status: 200 }],
  })
  async getConfiguration(
    @RequestAgentMemoryClientMetadata() metadata: AgentMemoryClientMetadata,
  ): Promise<AgentMemoryConfiguration> {
    return this.service.getConfiguration(metadata);
  }
}
