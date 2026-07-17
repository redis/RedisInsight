import { Injectable } from '@nestjs/common';

import { AgentMemoryClientMetadata } from 'src/modules/agent-memory/models';
import { AgentMemoryClientProvider } from 'src/modules/agent-memory/providers/agent-memory.client.provider';
import {
  AgentMemoryConfiguration,
  AgentMemoryNewMessage,
  AgentMemoryScopeFilter,
  DiscoveryFiltersResponse,
  LongTermMemorySearchResponse,
  SummaryView,
  SummaryViewPartitionFilters,
  WorkingMemoryResponse,
} from 'src/modules/agent-memory/agent-memory.types';
import { SearchLongTermMemoryDto } from 'src/modules/agent-memory/dto';

/**
 * Proxies inspector data reads/writes to the connected agent memory
 * backend. All methods resolve a pooled client for the requesting session
 * first, so the endpoint's credentials never leave the backend.
 */
@Injectable()
export class AgentMemoryDataService {
  constructor(private readonly clientProvider: AgentMemoryClientProvider) {}

  async listSessions(
    metadata: AgentMemoryClientMetadata,
    filter: AgentMemoryScopeFilter,
  ): Promise<string[]> {
    const client = await this.clientProvider.getOrCreate(metadata);
    return client.listSessions(filter);
  }

  async getWorkingMemory(
    metadata: AgentMemoryClientMetadata,
    sessionId: string,
    filter: AgentMemoryScopeFilter,
  ): Promise<WorkingMemoryResponse> {
    const client = await this.clientProvider.getOrCreate(metadata);
    return client.getWorkingMemory(sessionId, filter);
  }

  async deleteWorkingMemory(
    metadata: AgentMemoryClientMetadata,
    sessionId: string,
    filter: AgentMemoryScopeFilter,
  ): Promise<void> {
    const client = await this.clientProvider.getOrCreate(metadata);
    return client.deleteWorkingMemory(sessionId, filter);
  }

  async appendMessage(
    metadata: AgentMemoryClientMetadata,
    sessionId: string,
    filter: AgentMemoryScopeFilter,
    message: AgentMemoryNewMessage,
  ): Promise<void> {
    const client = await this.clientProvider.getOrCreate(metadata);
    return client.appendMessage(sessionId, filter, message);
  }

  async searchLongTermMemory(
    metadata: AgentMemoryClientMetadata,
    dto: SearchLongTermMemoryDto,
  ): Promise<LongTermMemorySearchResponse> {
    const client = await this.clientProvider.getOrCreate(metadata);
    return client.searchLongTermMemory(dto);
  }

  async deleteLongTermMemories(
    metadata: AgentMemoryClientMetadata,
    ids: string[],
  ): Promise<void> {
    const client = await this.clientProvider.getOrCreate(metadata);
    return client.deleteLongTermMemories(ids);
  }

  async discoverFilters(
    metadata: AgentMemoryClientMetadata,
  ): Promise<DiscoveryFiltersResponse> {
    const client = await this.clientProvider.getOrCreate(metadata);
    return client.discoverFilters();
  }

  async getConfiguration(
    metadata: AgentMemoryClientMetadata,
  ): Promise<AgentMemoryConfiguration> {
    const client = await this.clientProvider.getOrCreate(metadata);
    return client.getConfiguration();
  }

  async listSummaryViews(
    metadata: AgentMemoryClientMetadata,
  ): Promise<SummaryView[] | null> {
    const client = await this.clientProvider.getOrCreate(metadata);
    return client.listSummaryViews();
  }

  async createDefaultSummaryViews(
    metadata: AgentMemoryClientMetadata,
  ): Promise<SummaryView[]> {
    const client = await this.clientProvider.getOrCreate(metadata);
    return client.createDefaultSummaryViews();
  }

  async deleteSummaryView(
    metadata: AgentMemoryClientMetadata,
    viewId: string,
  ): Promise<void> {
    const client = await this.clientProvider.getOrCreate(metadata);
    return client.deleteSummaryView(viewId);
  }

  async runSummaryView(
    metadata: AgentMemoryClientMetadata,
    viewId: string,
  ): Promise<void> {
    const client = await this.clientProvider.getOrCreate(metadata);
    return client.runSummaryView(viewId);
  }

  async listSummaryViewPartitions(
    metadata: AgentMemoryClientMetadata,
    viewId: string,
    filters: SummaryViewPartitionFilters,
  ): Promise<object[]> {
    const client = await this.clientProvider.getOrCreate(metadata);
    return client.listSummaryViewPartitions(viewId, filters);
  }

  async runSummaryViewPartition(
    metadata: AgentMemoryClientMetadata,
    viewId: string,
    group: Record<string, string>,
  ): Promise<object> {
    const client = await this.clientProvider.getOrCreate(metadata);
    return client.runSummaryViewPartition(viewId, group);
  }
}
