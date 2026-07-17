import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { AgentMemoryClient } from 'src/modules/agent-memory/client/agent-memory.client';
import { AgentMemoryClientMetadata } from 'src/modules/agent-memory/models';
import { AgentMemoryClientStorage } from 'src/modules/agent-memory/providers/agent-memory.client.storage';
import { AgentMemoryClientFactory } from 'src/modules/agent-memory/providers/agent-memory.client.factory';
import { AgentMemoryEndpointRepository } from 'src/modules/agent-memory/repository/agent-memory-endpoint.repository';
import {
  AGENT_MEMORY_ERROR_MESSAGES,
  LAST_CONNECTION_UPDATE_INTERVAL,
} from 'src/modules/agent-memory/constants';

@Injectable()
export class AgentMemoryClientProvider {
  private logger: Logger = new Logger('AgentMemoryClientProvider');

  /** Endpoint id -> when lastConnection was last persisted */
  private readonly lastConnectionWrites: Map<string, number> = new Map();

  constructor(
    private readonly repository: AgentMemoryEndpointRepository,
    private readonly clientStorage: AgentMemoryClientStorage,
    private readonly clientFactory: AgentMemoryClientFactory,
  ) {}

  async getOrCreate(
    metadata: AgentMemoryClientMetadata,
  ): Promise<AgentMemoryClient> {
    let client = await this.clientStorage.getByMetadata(metadata);
    if (client) {
      await client.ensureAuth();
      this.updateLastConnection(metadata);
      return client;
    }

    client = await this.create(metadata);

    return this.clientStorage.set(client);
  }

  async create(
    metadata: AgentMemoryClientMetadata,
  ): Promise<AgentMemoryClient> {
    const endpoint = await this.repository.get(metadata.id);

    if (!endpoint) {
      this.logger.error(
        `Agent memory endpoint with ${metadata.id} was not found`,
        metadata,
      );
      throw new NotFoundException(
        AGENT_MEMORY_ERROR_MESSAGES.INVALID_ENDPOINT_ID,
      );
    }
    const client = await this.clientFactory.createClient(metadata, endpoint);
    if (client) {
      this.updateLastConnection(metadata);
    }
    return client;
  }

  async deleteManyByEndpointId(id: string): Promise<number> {
    this.lastConnectionWrites.delete(id);
    return this.clientStorage.deleteManyByEndpointId(id);
  }

  /**
   * Persist lastConnection at most once per LAST_CONNECTION_UPDATE_INTERVAL
   * per endpoint - getOrCreate runs on every data request (auto-refresh can
   * make that frequent) and each write is a full decrypt/encrypt SQLite cycle.
   */
  private async updateLastConnection(
    metadata: AgentMemoryClientMetadata,
  ): Promise<void> {
    const lastWrite = this.lastConnectionWrites.get(metadata.id) ?? 0;
    if (Date.now() - lastWrite < LAST_CONNECTION_UPDATE_INTERVAL) {
      return;
    }
    this.lastConnectionWrites.set(metadata.id, Date.now());

    try {
      await this.repository.update(metadata.id, {
        lastConnection: new Date(),
      });
    } catch (e) {
      // ignore the error
    }
  }
}
