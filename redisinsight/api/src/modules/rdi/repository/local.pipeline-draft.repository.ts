import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { filter, isNull, isUndefined, omitBy } from 'lodash';
import { plainToInstance } from 'class-transformer';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { ModelEncryptor } from 'src/modules/encryption/model.encryptor';
import { classToClass } from 'src/utils';
import { SessionMetadata } from 'src/common/models';
import { PipelineDraftEntity } from 'src/modules/rdi/entities/pipeline-draft.entity';
import { PipelineDraft } from 'src/modules/rdi/models';
import { PipelineDraftRepository } from 'src/modules/rdi/repository/pipeline-draft.repository';

@Injectable()
export class LocalPipelineDraftRepository extends PipelineDraftRepository {
  private logger = new Logger('LocalPipelineDraftRepository');

  private readonly modelEncryptor: ModelEncryptor;

  constructor(
    @InjectRepository(PipelineDraftEntity)
    private readonly repository: Repository<PipelineDraftEntity>,
    private readonly encryptionService: EncryptionService,
  ) {
    super();
    this.modelEncryptor = new ModelEncryptor(this.encryptionService, ['data']);
  }

  async create(
    sessionMetadata: SessionMetadata,
    rdiInstanceId: string,
    data: Partial<PipelineDraft>,
  ): Promise<PipelineDraft> {
    this.logger.debug('Creating pipeline draft', sessionMetadata);

    const entity = plainToInstance(PipelineDraftEntity, {
      ...data,
      rdiInstanceId,
    });

    const saved = await this.repository.save(
      await this.modelEncryptor.encryptEntity(entity),
    );

    this.logger.debug('Pipeline draft created', sessionMetadata);

    return classToClass(
      PipelineDraft,
      await this.modelEncryptor.decryptEntity(saved, true),
    );
  }

  async list(
    sessionMetadata: SessionMetadata,
    rdiInstanceId: string,
  ): Promise<PipelineDraft[]> {
    this.logger.debug('Getting pipeline drafts', sessionMetadata);

    const entities = await this.repository.find({
      where: { rdiInstanceId },
      order: { createdAt: 'ASC' },
    });

    const decryptedEntities = await Promise.all(
      entities.map(async (entity): Promise<PipelineDraftEntity | null> => {
        try {
          return await this.modelEncryptor.decryptEntity(entity);
        } catch (e) {
          return null;
        }
      }),
    );

    return filter(decryptedEntities, (entity) => !isNull(entity)).map(
      (entity) => classToClass(PipelineDraft, entity),
    );
  }

  async get(
    sessionMetadata: SessionMetadata,
    rdiInstanceId: string,
    id: string,
  ): Promise<PipelineDraft> {
    this.logger.debug('Getting pipeline draft', sessionMetadata);

    const entity = await this.repository.findOneBy({ id, rdiInstanceId });

    if (!entity) {
      this.logger.error(
        `Pipeline draft with id:${id} and rdiInstanceId:${rdiInstanceId} was not found`,
        sessionMetadata,
      );
      throw new NotFoundException(`Pipeline draft with id ${id} was not found`);
    }

    this.logger.debug('Succeed to get pipeline draft', sessionMetadata);

    return classToClass(
      PipelineDraft,
      await this.modelEncryptor.decryptEntity(entity, true),
    );
  }

  async update(
    sessionMetadata: SessionMetadata,
    rdiInstanceId: string,
    id: string,
    data: Partial<PipelineDraft>,
  ): Promise<PipelineDraft> {
    this.logger.debug('Updating pipeline draft', sessionMetadata);

    const existing = await this.repository.findOneBy({ id, rdiInstanceId });

    if (!existing) {
      this.logger.error(
        `Pipeline draft with id:${id} and rdiInstanceId:${rdiInstanceId} was not found`,
        sessionMetadata,
      );
      throw new NotFoundException(`Pipeline draft with id ${id} was not found`);
    }

    const decrypted = await this.modelEncryptor.decryptEntity(existing, true);
    const updateData = omitBy(data, isUndefined);

    const merged = plainToInstance(PipelineDraftEntity, {
      ...decrypted,
      ...updateData,
      id,
      rdiInstanceId,
    });

    const saved = await this.repository.save(
      await this.modelEncryptor.encryptEntity(merged),
    );

    this.logger.debug('Pipeline draft updated', sessionMetadata);

    return classToClass(
      PipelineDraft,
      await this.modelEncryptor.decryptEntity(saved, true),
    );
  }

  async delete(
    sessionMetadata: SessionMetadata,
    rdiInstanceId: string,
    id: string,
  ): Promise<void> {
    this.logger.debug('Deleting pipeline draft', sessionMetadata);

    const existing = await this.repository.findOneBy({ id, rdiInstanceId });

    if (!existing) {
      this.logger.error(
        `Pipeline draft with id:${id} and rdiInstanceId:${rdiInstanceId} was not found`,
        sessionMetadata,
      );
      throw new NotFoundException(`Pipeline draft with id ${id} was not found`);
    }

    await this.repository.delete({ id, rdiInstanceId });

    this.logger.debug('Pipeline draft deleted', sessionMetadata);
  }
}
