import { Injectable } from '@nestjs/common';

import { PooledClientStorage } from 'src/common/client-storage/pooled-client.storage';
import { AgentMemoryClient } from 'src/modules/agent-memory/client/agent-memory.client';
import { AgentMemoryClientMetadata } from 'src/modules/agent-memory/models';
import { AGENT_MEMORY_SYNC_INTERVAL } from 'src/modules/agent-memory/constants';

@Injectable()
export class AgentMemoryClientStorage extends PooledClientStorage<
  AgentMemoryClient,
  AgentMemoryClientMetadata
> {
  constructor() {
    super(AgentMemoryClientStorage.name, AGENT_MEMORY_SYNC_INTERVAL);
  }

  protected generateId(metadata: AgentMemoryClientMetadata): string {
    return AgentMemoryClient.generateId(metadata);
  }

  async deleteManyByEndpointId(id: string): Promise<number> {
    return this.deleteManyByMetadataId(id);
  }
}
