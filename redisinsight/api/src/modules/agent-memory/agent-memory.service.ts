import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { isUndefined, omitBy } from 'lodash';

import {
  CreateAgentMemoryEndpointDto,
  UpdateAgentMemoryEndpointDto,
} from 'src/modules/agent-memory/dto';
import {
  AgentMemoryClientMetadata,
  AgentMemoryEndpoint,
} from 'src/modules/agent-memory/models';
import { AgentMemoryEndpointRepository } from 'src/modules/agent-memory/repository/agent-memory-endpoint.repository';
import { AgentMemoryClientProvider } from 'src/modules/agent-memory/providers/agent-memory.client.provider';
import { AgentMemoryClientFactory } from 'src/modules/agent-memory/providers/agent-memory.client.factory';
import { AgentMemoryCapabilities } from 'src/modules/agent-memory/agent-memory.types';
import { classToClass } from 'src/utils';
import { SessionMetadata } from 'src/common/models';
import { deepMerge } from 'src/common/utils';
import { wrapAgentMemoryError } from 'src/modules/agent-memory/exceptions';

@Injectable()
export class AgentMemoryService {
  private logger = new Logger('AgentMemoryService');

  static connectionFields: string[] = [
    'url',
    'backendType',
    'storeId',
    'apiKey',
  ];

  constructor(
    private readonly repository: AgentMemoryEndpointRepository,
    private readonly clientProvider: AgentMemoryClientProvider,
    private readonly clientFactory: AgentMemoryClientFactory,
  ) {}

  static isConnectionAffected(dto: UpdateAgentMemoryEndpointDto) {
    return Object.keys(omitBy(dto, isUndefined)).some((field) =>
      this.connectionFields.includes(field),
    );
  }

  async list(): Promise<AgentMemoryEndpoint[]> {
    return this.repository.list();
  }

  async get(id: string): Promise<AgentMemoryEndpoint> {
    const endpoint = await this.repository.get(id);

    if (!endpoint) {
      throw new NotFoundException(
        `Agent memory endpoint with id ${id} was not found`,
      );
    }

    return endpoint;
  }

  async create(
    sessionMetadata: SessionMetadata,
    dto: CreateAgentMemoryEndpointDto,
  ): Promise<AgentMemoryEndpoint> {
    const model = classToClass(AgentMemoryEndpoint, dto);
    model.lastConnection = new Date();

    const metadata: AgentMemoryClientMetadata = {
      sessionMetadata,
      id: uuidv4(),
    };

    try {
      // Validate connectivity before persisting
      await this.clientFactory.createClient(metadata, model);
    } catch (error) {
      this.logger.error(
        'Failed to create agent memory endpoint',
        sessionMetadata,
      );

      throw wrapAgentMemoryError(error);
    }

    this.logger.debug(
      'Succeed to create agent memory endpoint',
      sessionMetadata,
    );
    return this.repository.create(model);
  }

  async update(
    metadata: AgentMemoryClientMetadata,
    dto: UpdateAgentMemoryEndpointDto,
  ): Promise<AgentMemoryEndpoint> {
    const oldEndpoint = await this.get(metadata.id);
    const newEndpoint = await deepMerge(oldEndpoint, dto);

    try {
      if (AgentMemoryService.isConnectionAffected(dto)) {
        await this.clientFactory.createClient(metadata, newEndpoint);
        await this.clientProvider.deleteManyByEndpointId(metadata.id);
      }

      return await this.repository.update(metadata.id, newEndpoint);
    } catch (error) {
      this.logger.error(
        `Failed to update agent memory endpoint ${metadata.id}`,
        error,
        metadata,
      );
      throw wrapAgentMemoryError(error);
    }
  }

  async delete(sessionMetadata: SessionMetadata, ids: string[]): Promise<void> {
    try {
      await this.repository.delete(ids);
      await Promise.all(
        ids.map(async (id) => {
          await this.clientProvider.deleteManyByEndpointId(id);
        }),
      );
    } catch (error) {
      this.logger.error(
        `Failed to delete endpoint(s): ${ids}`,
        error,
        sessionMetadata,
      );
      throw new InternalServerErrorException();
    }
  }

  /**
   * Connect to the agent memory endpoint and report its capabilities so
   * the UI can gate backend-specific features (namespaces, optimize_query,
   * summary views).
   */
  async connect(
    metadata: AgentMemoryClientMetadata,
  ): Promise<AgentMemoryCapabilities> {
    try {
      const client = await this.clientProvider.getOrCreate(metadata);

      this.logger.debug(
        `Succeed to connect to agent memory endpoint ${metadata.id}`,
        metadata,
      );

      return client.getCapabilities();
    } catch (error) {
      this.logger.error(
        `Failed to connect to agent memory endpoint ${metadata.id}`,
        error,
        metadata,
      );
      throw wrapAgentMemoryError(error);
    }
  }
}
