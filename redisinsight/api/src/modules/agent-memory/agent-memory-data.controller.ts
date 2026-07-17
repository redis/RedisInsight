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
  SummaryView,
  WorkingMemoryResponse,
} from 'src/modules/agent-memory/agent-memory.types';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import {
  AddSessionEventDto,
  DeleteLongTermMemoriesDto,
  RunSummaryViewPartitionDto,
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
    @Query('namespace') namespace?: string,
  ): Promise<string[]> {
    return this.service.listSessions(metadata, { userId, namespace });
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
    @Query('namespace') namespace?: string,
  ): Promise<WorkingMemoryResponse> {
    return this.service.getWorkingMemory(metadata, sessionId, {
      userId,
      namespace,
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
    @Query('namespace') namespace?: string,
  ): Promise<void> {
    return this.service.deleteWorkingMemory(metadata, sessionId, {
      userId,
      namespace,
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
    @Query('namespace') namespace?: string,
  ): Promise<void> {
    return this.service.appendMessage(
      metadata,
      sessionId,
      { userId, namespace },
      dto,
    );
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
    description:
      'Discover distinct user ids and namespaces present in long-term memory',
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

  @Get('/summary-views')
  @ApiEndpoint({
    description:
      'List summary views configured on the server. Returns null when ' +
      'the backend does not support summary views',
    responses: [{ status: 200 }],
  })
  async listSummaryViews(
    @RequestAgentMemoryClientMetadata() metadata: AgentMemoryClientMetadata,
  ): Promise<SummaryView[] | null> {
    return this.service.listSummaryViews(metadata);
  }

  @Post('/summary-views/default')
  @ApiEndpoint({
    description:
      'Create the default user-profile and session-profile summary views ' +
      'if missing, then return the full view list',
    statusCode: 201,
    responses: [{ status: 201 }],
  })
  async createDefaultSummaryViews(
    @RequestAgentMemoryClientMetadata() metadata: AgentMemoryClientMetadata,
  ): Promise<SummaryView[]> {
    return this.service.createDefaultSummaryViews(metadata);
  }

  @Delete('/summary-views/:viewId')
  @ApiEndpoint({
    description:
      "Delete a summary view's configuration (stored partition summaries " +
      'are left as-is)',
    responses: [{ status: 200 }],
  })
  async deleteSummaryView(
    @RequestAgentMemoryClientMetadata() metadata: AgentMemoryClientMetadata,
    @Param('viewId') viewId: string,
  ): Promise<void> {
    return this.service.deleteSummaryView(metadata, viewId);
  }

  @Post('/summary-views/:viewId/run')
  @ApiEndpoint({
    description:
      'Trigger an async background recompute of all partitions of a view',
    statusCode: 202,
    responses: [{ status: 202 }],
  })
  async runSummaryView(
    @RequestAgentMemoryClientMetadata() metadata: AgentMemoryClientMetadata,
    @Param('viewId') viewId: string,
  ): Promise<void> {
    return this.service.runSummaryView(metadata, viewId);
  }

  @Get('/summary-views/:viewId/partitions')
  @ApiEndpoint({
    description: 'List summary view partitions matching the given filters',
    responses: [{ status: 200 }],
  })
  async listSummaryViewPartitions(
    @RequestAgentMemoryClientMetadata() metadata: AgentMemoryClientMetadata,
    @Param('viewId') viewId: string,
    @Query('userId') userId?: string,
  ): Promise<object[]> {
    return this.service.listSummaryViewPartitions(metadata, viewId, {
      userId,
    });
  }

  @Post('/summary-views/:viewId/partitions/run')
  @ApiEndpoint({
    description: 'Force a fresh recompute of one summary view partition',
    statusCode: 200,
    responses: [{ status: 200 }],
  })
  async runSummaryViewPartition(
    @RequestAgentMemoryClientMetadata() metadata: AgentMemoryClientMetadata,
    @Param('viewId') viewId: string,
    @Body() dto: RunSummaryViewPartitionDto,
  ): Promise<object> {
    return this.service.runSummaryViewPartition(metadata, viewId, dto.group);
  }
}
