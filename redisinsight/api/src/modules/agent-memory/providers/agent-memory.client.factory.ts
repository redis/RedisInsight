import { BadRequestException, Injectable } from '@nestjs/common';

import {
  AgentMemoryBackendType,
  AgentMemoryClientMetadata,
  AgentMemoryEndpoint,
} from 'src/modules/agent-memory/models';
import { AgentMemoryClient } from 'src/modules/agent-memory/client/agent-memory.client';
import { OssAgentMemoryClient } from 'src/modules/agent-memory/client/oss.agent-memory.client';
import { CloudAgentMemoryClient } from 'src/modules/agent-memory/client/cloud.agent-memory.client';
import { AGENT_MEMORY_ERROR_MESSAGES } from 'src/modules/agent-memory/constants';

@Injectable()
export class AgentMemoryClientFactory {
  async createClient(
    metadata: AgentMemoryClientMetadata,
    endpoint: AgentMemoryEndpoint,
  ): Promise<AgentMemoryClient> {
    let client: AgentMemoryClient;

    switch (endpoint.backendType) {
      case AgentMemoryBackendType.Oss:
        client = new OssAgentMemoryClient(metadata, endpoint);
        break;
      case AgentMemoryBackendType.Cloud:
        client = new CloudAgentMemoryClient(metadata, endpoint);
        break;
      default:
        throw new BadRequestException(
          AGENT_MEMORY_ERROR_MESSAGES.UNSUPPORTED_BACKEND,
        );
    }

    await client.connect();

    return client;
  }
}
