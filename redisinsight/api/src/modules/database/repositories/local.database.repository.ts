import { Injectable } from '@nestjs/common';
import { DatabaseRepository } from 'src/modules/database/repositories/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Not, Repository } from 'typeorm';
import { get, set, omit } from 'lodash';
import { DatabaseEntity } from 'src/modules/database/entities/database.entity';
import { Database } from 'src/modules/database/models/database';
import { classToClass } from 'src/utils';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { ModelEncryptor } from 'src/modules/encryption/model.encryptor';
import { CaCertificateRepository } from 'src/modules/certificate/repositories/ca-certificate.repository';
import { ClientCertificateRepository } from 'src/modules/certificate/repositories/client-certificate.repository';
import { SshOptionsEntity } from 'src/modules/ssh/entities/ssh-options.entity';
import { DatabaseAlreadyExistsException } from 'src/modules/database/exeptions';
import { SessionMetadata } from 'src/common/models';
import { TagRepository } from 'src/modules/tag/repository/tag.repository';
import { TAG_FIELDS_TO_ENCRYPT } from 'src/modules/tag/repository/local.tag.repository';

@Injectable()
export class LocalDatabaseRepository extends DatabaseRepository {
  private readonly modelEncryptor: ModelEncryptor;

  private readonly sshModelEncryptor: ModelEncryptor;

  private readonly tagModelEncryptor: ModelEncryptor;

  private uniqFieldsForCloudDatabase: string[] = [
    'host',
    'port',
    'username',
    'password',
    'caCert.certificate',
    'clientCert.certificate',
    'clientCert.key',
  ];

  constructor(
    @InjectRepository(DatabaseEntity)
    protected readonly repository: Repository<DatabaseEntity>,
    @InjectRepository(SshOptionsEntity)
    protected readonly sshOptionsRepository: Repository<SshOptionsEntity>,
    protected readonly caCertificateRepository: CaCertificateRepository,
    protected readonly clientCertificateRepository: ClientCertificateRepository,
    protected readonly encryptionService: EncryptionService,
    protected readonly tagRepository: TagRepository,
  ) {
    super();
    this.modelEncryptor = new ModelEncryptor(encryptionService, [
      'password',
      'sentinelMasterPassword',
    ]);
    this.sshModelEncryptor = new ModelEncryptor(encryptionService, [
      'username',
      'password',
      'privateKey',
      'passphrase',
    ]);
    this.tagModelEncryptor = new ModelEncryptor(
      encryptionService,
      TAG_FIELDS_TO_ENCRYPT,
    );
  }

  /**
   * @inheritDoc
   */
  public async exists(_: SessionMetadata, id: string): Promise<boolean> {
    return !!(await this.repository
      .createQueryBuilder('database')
      .where({ id })
      .select(['database.id'])
      .getOne());
  }

  /**
   * @inheritDoc
   */
  public async get(
    _: SessionMetadata,
    id: string,
    ignoreEncryptionErrors: boolean = false,
    omitFields: string[] = [],
  ): Promise<Database> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) {
      return null;
    }

    const model = classToClass(
      Database,
      await this.decryptEntity(entity, ignoreEncryptionErrors),
    );

    if (entity.caCert) {
      model.caCert = await this.caCertificateRepository.get(entity.caCert.id);
    }

    if (entity.clientCert) {
      model.clientCert = await this.clientCertificateRepository.get(
        entity.clientCert.id,
      );
    }
    return classToClass(Database, omit(model, omitFields));
  }

  /**
   * @inheritDoc
   */
  public async list(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: SessionMetadata,
  ): Promise<Database[]> {
    const entities = await this.repository
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.cloudDetails', 'cd')
      .leftJoinAndSelect('d.tags', 'tags')
      .select([
        'd.id',
        'd.name',
        'd.host',
        'd.port',
        'd.db',
        'd.new',
        'd.timeout',
        'd.connectionType',
        'd.modules',
        'd.lastConnection',
        'd.provider',
        'd.providerDetails',
        'd.version',
        'cd',
        'd.createdAt',
        'tags',
      ])
      .getMany();

    return Promise.all(
      entities.map(async (entity) =>
        classToClass(Database, await this.decryptEntity(entity)),
      ),
    );
  }

  /**
   * Create database with encrypted sensitive fields
   * @param _
   * @param database
   * @param uniqueCheck
   */
  public async create(
    _: SessionMetadata,
    database: Database,
    uniqueCheck: boolean,
  ): Promise<Database> {
    if (uniqueCheck) {
      await this.checkUniqueness(database);
    }
    const entity = classToClass(
      DatabaseEntity,
      await this.populateForeignData(database),
    );
    return classToClass(
      Database,
      await this.decryptEntity(
        await this.repository.save(await this.encryptEntity(entity)),
      ),
    );
  }

  /**
   * Update database entity with fields encryption logic
   * Should always throw an encryption error to determine that something wrong
   * with encryption strategy
   *
   * @param id
   * @param database
   * @throws TBD
   */
  public async update(
    sessionMetadata: SessionMetadata,
    id: string,
    database: Partial<Database>,
  ): Promise<Database> {
    const oldEntity = await this.decryptEntity(
      await this.repository.findOne({ where: { id } }),
      true,
    );
    const newEntity = classToClass(
      DatabaseEntity,
      await this.populateForeignData(database as Database),
    );

    const mergeResult = this.repository.merge(oldEntity, newEntity);
    mergeResult.tags = newEntity.tags;

    if (newEntity.caCert === null) {
      mergeResult.caCert = null;
    }

    if (newEntity.clientCert === null) {
      mergeResult.clientCert = null;
    }

    if (newEntity.sshOptions === null) {
      mergeResult.sshOptions = null;
    }

    if (newEntity.tags) {
      mergeResult.tags = newEntity.tags;
    }

    const encrypted = await this.encryptEntity(mergeResult);

    await this.repository.save(encrypted);

    if (database.tags) {
      await this.tagRepository.cleanupUnusedTags();
    }

    // workaround for one way cascade deletion
    if (newEntity.sshOptions === null) {
      await this.sshOptionsRepository
        .createQueryBuilder()
        .delete()
        .where('databaseId IS NULL')
        .execute();
    }

    return this.get(sessionMetadata, id);
  }

  /**
   * @inheritDoc
   */
  public async delete(_: SessionMetadata, id: string): Promise<void> {
    await this.repository.delete(id);
    await this.tagRepository.cleanupUnusedTags();
  }

  /**
   * Get certificates or create certificates if needed
   * TODO: Rethink implementation to avoid possible transaction issues
   * @param database
   * @private
   */
  private async populateForeignData(database: Database): Promise<Database> {
    const model = classToClass(Database, database);

    // fetch ca cert if needed to be able to connect
    if (!model.caCert?.id && model.caCert?.certificate) {
      model.caCert = await this.caCertificateRepository.create(model.caCert);
    }

    // fetch client cert if needed to be able to connect
    if (
      !model.clientCert?.id &&
      (model.clientCert?.certificate || model.clientCert?.key)
    ) {
      model.clientCert = await this.clientCertificateRepository.create(
        model.clientCert,
      );
    }

    // process tags
    if (model.tags?.length) {
      model.tags = await this.tagRepository.getOrCreateByKeyValuePairs(
        model.tags,
      );
    }

    return model;
  }

  /**
   * Encrypt Database entity and SshOptions entity if present
   * @param entity
   * @private
   */
  private async encryptEntity(entity: DatabaseEntity): Promise<DatabaseEntity> {
    const encryptedEntity = await this.modelEncryptor.encryptEntity(entity);

    if (encryptedEntity.sshOptions) {
      encryptedEntity.sshOptions = await this.sshModelEncryptor.encryptEntity(
        encryptedEntity.sshOptions,
      );
    }

    if (encryptedEntity.tags?.length > 0) {
      encryptedEntity.tags = await this.tagModelEncryptor.encryptEntities(
        encryptedEntity.tags,
      );
    }

    return encryptedEntity;
  }

  /**
   * Decrypt Database entity and SshOptions entity if present
   * @param entity
   * @param ignoreEncryptionErrors
   * @private
   */
  private async decryptEntity(
    entity: DatabaseEntity,
    ignoreEncryptionErrors = false,
  ): Promise<DatabaseEntity> {
    const decryptedEntity = await this.modelEncryptor.decryptEntity(
      entity,
      ignoreEncryptionErrors,
    );

    if (decryptedEntity.sshOptions) {
      decryptedEntity.sshOptions = await this.sshModelEncryptor.decryptEntity(
        decryptedEntity.sshOptions,
        ignoreEncryptionErrors,
      );
    }

    if (decryptedEntity.tags?.length > 0) {
      decryptedEntity.tags = await this.tagModelEncryptor.decryptEntities(
        decryptedEntity.tags,
        ignoreEncryptionErrors,
      );
    }

    return decryptedEntity;
  }

  /**
   * Check uniqueness of the database
   * @param database
   * @private
   * @throws DatabaseAlreadyExistsException
   */
  private async checkUniqueness(database: Database): Promise<void> {
    // Do not create a connection if it triggered from cloud and have the same fields
    if (database.cloudDetails?.cloudId) {
      const entity = await this.encryptEntity(
        classToClass(DatabaseEntity, { ...database }),
      );

      if (entity.caCert) {
        entity.caCert = await new ModelEncryptor(this.encryptionService, [
          'certificate',
        ]).encryptEntity(entity.caCert);
      }

      if (entity.clientCert) {
        entity.clientCert = await new ModelEncryptor(this.encryptionService, [
          'certificate',
          'key',
        ]).encryptEntity(entity.clientCert);
      }

      const query: FindOptionsWhere<DatabaseEntity> = {};
      this.uniqFieldsForCloudDatabase.forEach((field) => {
        set(query, field, get(entity, field));
      });

      const existingDatabase = await this.repository.findOne({ where: query });
      if (existingDatabase) {
        throw new DatabaseAlreadyExistsException(existingDatabase.id);
      }
    }
  }

  /**
   * @inheritDoc
   */
  async cleanupPreSetup(excludeIds?: string[]): Promise<{ affected: number }> {
    const { affected } = await this.repository
      .createQueryBuilder()
      .delete()
      .where({
        isPreSetup: true,
        id: Not(In(excludeIds)),
      })
      .execute();

    return { affected };
  }
}
