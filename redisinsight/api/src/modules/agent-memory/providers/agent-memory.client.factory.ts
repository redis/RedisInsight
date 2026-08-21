import { BadRequestException, Injectable } from '@nestjs/common';

import {
  AgentMemoryBackendType,
  AgentMemoryClientMetadata,
  AgentMemoryEndpoint,
} from 'src/modules/agent-memory/models';
import { AgentMemoryClient } from 'src/modules/agent-memory/client/agent-memory.client';
import { CloudAgentMemoryClient } from 'src/modules/agent-memory/client/cloud.agent-memory.client';
import { AGENT_MEMORY_ERROR_MESSAGES } from 'src/modules/agent-memory/constants';

@Injectable()
export class AgentMemoryClientFactory {
  async createClient(
    metadata: AgentMemoryClientMetadata,
    endpoint: AgentMemoryEndpoint,
  ): Promise<AgentMemoryClient> {
    // Redis Agent Memory is the only supported backend.
    if (endpoint.backendType !== AgentMemoryBackendType.Cloud) {
      throw new BadRequestException(
        AGENT_MEMORY_ERROR_MESSAGES.UNSUPPORTED_BACKEND,
      );
    }

    const client = new CloudAgentMemoryClient(metadata, endpoint);
    await client.connect();

    return client;
  }
}
