import { Module, Type } from '@nestjs/common';
import { AgentMemoryController } from 'src/modules/agent-memory/agent-memory.controller';
import { AgentMemoryDataController } from 'src/modules/agent-memory/agent-memory-data.controller';
import { AgentMemoryService } from 'src/modules/agent-memory/agent-memory.service';
import { AgentMemoryDataService } from 'src/modules/agent-memory/agent-memory-data.service';
import { AgentMemoryEndpointRepository } from 'src/modules/agent-memory/repository/agent-memory-endpoint.repository';
import { LocalAgentMemoryEndpointRepository } from 'src/modules/agent-memory/repository/local.agent-memory-endpoint.repository';
import { AgentMemoryClientProvider } from 'src/modules/agent-memory/providers/agent-memory.client.provider';
import { AgentMemoryClientStorage } from 'src/modules/agent-memory/providers/agent-memory.client.storage';
import { AgentMemoryClientFactory } from 'src/modules/agent-memory/providers/agent-memory.client.factory';

@Module({})
export class AgentMemoryModule {
  static register(
    endpointRepository: Type<AgentMemoryEndpointRepository> = LocalAgentMemoryEndpointRepository,
  ) {
    return {
      module: AgentMemoryModule,
      controllers: [AgentMemoryController, AgentMemoryDataController],
      providers: [
        AgentMemoryService,
        AgentMemoryDataService,
        AgentMemoryClientProvider,
        AgentMemoryClientStorage,
        AgentMemoryClientFactory,
        {
          provide: AgentMemoryEndpointRepository,
          useClass: endpointRepository,
        },
      ],
    };
  }
}
