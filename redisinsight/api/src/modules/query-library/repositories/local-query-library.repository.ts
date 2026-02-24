import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { filter, isNull, omitBy, isUndefined } from 'lodash';
import { plainToInstance } from 'class-transformer';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { ModelEncryptor } from 'src/modules/encryption/model.encryptor';
import { classToClass } from 'src/utils';
import { SessionMetadata } from 'src/common/models';
import { QueryLibraryEntity } from 'src/modules/query-library/entities/query-library.entity';
import { QueryLibraryItem } from 'src/modules/query-library/models/query-library';
import { QueryLibraryRepository } from './query-library.repository';
import { QueryLibraryFilterDto } from 'src/modules/query-library/dto';

@Injectable()
export class LocalQueryLibraryRepository extends QueryLibraryRepository {
  private logger = new Logger('LocalQueryLibraryRepository');

  private readonly modelEncryptor: ModelEncryptor;

  constructor(
    @InjectRepository(QueryLibraryEntity)
    private readonly repository: Repository<QueryLibraryEntity>,
    private readonly encryptionService: EncryptionService,
  ) {
    super();
    this.modelEncryptor = new ModelEncryptor(this.encryptionService, [
      'name',
      'query',
      'description',
    ]);
  }

  async create(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    item: Partial<QueryLibraryItem>,
  ): Promise<QueryLibraryItem> {
    this.logger.debug('Creating query library item', sessionMetadata);

    const entity = plainToInstance(QueryLibraryEntity, {
      ...item,
      databaseId,
    });

    const saved = await this.repository.save(
      await this.modelEncryptor.encryptEntity(entity),
    );

    this.logger.debug('Query library item created', sessionMetadata);

    return classToClass(
      QueryLibraryItem,
      await this.modelEncryptor.decryptEntity(saved, true),
    );
  }

  async getList(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    queryFilter: QueryLibraryFilterDto,
  ): Promise<QueryLibraryItem[]> {
    this.logger.debug('Getting query library items', sessionMetadata);

    const where: Record<string, any> = { databaseId };
    if (queryFilter.indexName) {
      where.indexName = queryFilter.indexName;
    }

    const entities = await this.repository.find({
      where,
      order: { createdAt: 'ASC' },
    });

    this.logger.debug('Succeed to get query library items', sessionMetadata);

    const decryptedEntities = await Promise.all(
      entities.map<Promise<QueryLibraryEntity>>(async (entity) => {
        try {
          return await this.modelEncryptor.decryptEntity(entity);
        } catch (e) {
          return null;
        }
      }),
    );

    let items = filter(decryptedEntities, (entity) => !isNull(entity)).map(
      (entity) => classToClass(QueryLibraryItem, entity),
    );

    if (queryFilter.search) {
      const term = queryFilter.search.toLowerCase();
      items = items.filter(
        (item) =>
          item.name?.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term) ||
          item.query?.toLowerCase().includes(term),
      );
    }

    return items;
  }

  async getOne(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    id: string,
  ): Promise<QueryLibraryItem> {
    this.logger.debug('Getting query library item', sessionMetadata);

    const entity = await this.repository.findOneBy({ id, databaseId });

    if (!entity) {
      this.logger.error(
        `Query library item with id:${id} and databaseId:${databaseId} was not found`,
        sessionMetadata,
      );
      throw new NotFoundException(
        `Query library item with id ${id} was not found`,
      );
    }

    this.logger.debug(
      `Succeed to get query library item ${id}`,
      sessionMetadata,
    );

    return classToClass(
      QueryLibraryItem,
      await this.modelEncryptor.decryptEntity(entity, true),
    );
  }

  async update(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    id: string,
    data: Partial<QueryLibraryItem>,
  ): Promise<QueryLibraryItem> {
    this.logger.debug('Updating query library item', sessionMetadata);

    const existing = await this.repository.findOneBy({ id, databaseId });

    if (!existing) {
      this.logger.error(
        `Query library item with id:${id} and databaseId:${databaseId} was not found`,
        sessionMetadata,
      );
      throw new NotFoundException(
        `Query library item with id ${id} was not found`,
      );
    }

    const decrypted = await this.modelEncryptor.decryptEntity(existing, true);
    const updateData = omitBy(data, isUndefined);

    const merged = plainToInstance(QueryLibraryEntity, {
      ...decrypted,
      ...updateData,
      id,
      databaseId,
    });

    const saved = await this.repository.save(
      await this.modelEncryptor.encryptEntity(merged),
    );

    this.logger.debug('Query library item updated', sessionMetadata);

    return classToClass(
      QueryLibraryItem,
      await this.modelEncryptor.decryptEntity(saved, true),
    );
  }

  async delete(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    id: string,
  ): Promise<void> {
    this.logger.debug('Deleting query library item', sessionMetadata);

    const existing = await this.repository.findOneBy({ id, databaseId });

    if (!existing) {
      this.logger.error(
        `Query library item with id:${id} and databaseId:${databaseId} was not found`,
        sessionMetadata,
      );
      throw new NotFoundException(
        `Query library item with id ${id} was not found`,
      );
    }

    await this.repository.delete({ id, databaseId });

    this.logger.debug('Query library item deleted', sessionMetadata);
  }

  async deleteByIndex(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    indexName: string,
  ): Promise<void> {
    this.logger.debug(
      `Deleting query library items for index: ${indexName}`,
      sessionMetadata,
    );

    await this.repository.delete({ databaseId, indexName });

    this.logger.debug('Query library items deleted by index', sessionMetadata);
  }

  async createBulk(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    items: Partial<QueryLibraryItem>[],
  ): Promise<QueryLibraryItem[]> {
    this.logger.debug('Bulk creating query library items', sessionMetadata);

    const results = await Promise.all(
      items.map(async (item) => {
        const entity = plainToInstance(QueryLibraryEntity, {
          ...item,
          databaseId,
        });
        return this.repository.save(
          await this.modelEncryptor.encryptEntity(entity),
        );
      }),
    );

    this.logger.debug('Query library items bulk created', sessionMetadata);

    const decrypted = await Promise.all(
      results.map(async (entity) =>
        this.modelEncryptor.decryptEntity(entity, true),
      ),
    );

    return decrypted.map((entity) => classToClass(QueryLibraryItem, entity));
  }

  async countByIndex(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    indexName: string,
    type?: string,
  ): Promise<number> {
    const where: Record<string, any> = { databaseId, indexName };
    if (type) {
      where.type = type;
    }
    return this.repository.count({ where });
  }
}
