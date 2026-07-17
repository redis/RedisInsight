import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { ModelEncryptor } from 'src/modules/encryption/model.encryptor';
import { AgentMemoryEndpointEntity } from 'src/modules/agent-memory/entities/agent-memory-endpoint.entity';
import { AgentMemoryEndpoint } from 'src/modules/agent-memory/models';
import { AgentMemoryEndpointRepository } from 'src/modules/agent-memory/repository/agent-memory-endpoint.repository';
import { classToClass } from 'src/utils';

@Injectable()
export class LocalAgentMemoryEndpointRepository extends AgentMemoryEndpointRepository {
  private readonly modelEncryptor: ModelEncryptor;

  constructor(
    @InjectRepository(AgentMemoryEndpointEntity)
    private readonly repository: Repository<AgentMemoryEndpointEntity>,
    private readonly encryptionService: EncryptionService,
  ) {
    super();
    this.modelEncryptor = new ModelEncryptor(this.encryptionService, [
      'apiKey',
    ]);
  }

  /**
   * @inheritDoc
   */
  public async get(
    id: string,
    ignoreEncryptionErrors: boolean = false,
  ): Promise<AgentMemoryEndpoint | null> {
    const entity = await this.repository.findOneBy({ id });

    if (!entity) {
      return null;
    }

    return classToClass(
      AgentMemoryEndpoint,
      await this.modelEncryptor.decryptEntity(entity, ignoreEncryptionErrors),
    );
  }

  /**
   * @inheritDoc
   */
  public async list(): Promise<AgentMemoryEndpoint[]> {
    const entities = await this.repository
      .createQueryBuilder('e')
      .select([
        'e.id',
        'e.name',
        'e.url',
        'e.backendType',
        'e.storeId',
        'e.lastConnection',
      ])
      .getMany();
    return entities.map((entity) => classToClass(AgentMemoryEndpoint, entity));
  }

  /**
   * @inheritDoc
   */
  public async create(
    endpoint: AgentMemoryEndpoint,
  ): Promise<AgentMemoryEndpoint> {
    const entity = classToClass(AgentMemoryEndpointEntity, endpoint);

    return classToClass(
      AgentMemoryEndpoint,
      await this.modelEncryptor.decryptEntity(
        await this.repository.save(
          await this.modelEncryptor.encryptEntity(entity),
        ),
      ),
    );
  }

  /**
   * @inheritDoc
   */
  public async update(
    id: string,
    endpoint: Partial<AgentMemoryEndpoint>,
  ): Promise<AgentMemoryEndpoint> {
    const existingEntity = await this.repository.findOneBy({ id });
    if (!existingEntity) {
      throw new Error(`Agent memory endpoint ${id} was not found`);
    }
    const oldEntity = await this.modelEncryptor.decryptEntity(
      existingEntity,
      true,
    );
    const newEntity = classToClass(AgentMemoryEndpointEntity, endpoint);

    const encrypted = await this.modelEncryptor.encryptEntity(
      this.repository.merge(oldEntity, newEntity),
    );

    return classToClass(
      AgentMemoryEndpoint,
      await this.modelEncryptor.decryptEntity(
        await this.repository.save(encrypted),
      ),
    );
  }

  /**
   * @inheritDoc
   */
  public async delete(ids: string[]): Promise<void> {
    await this.repository.delete(ids);
  }
}
