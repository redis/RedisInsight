import { CloudCapiKey } from 'src/modules/cloud/capi-key/model';
import { CloudCapiKeyRepository } from 'src/modules/cloud/capi-key/repository/cloud-capi-key.repository';
import { ModelEncryptor } from 'src/modules/encryption/model.encryptor';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CloudCapiKeyEntity } from 'src/modules/cloud/capi-key/entity/cloud-capi-key.entity';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { classToClass } from 'src/utils';
import { CloudApiBadRequestException } from 'src/modules/cloud/common/exceptions';

export class LocalCloudCapiKeyRepository extends CloudCapiKeyRepository {
  private readonly modelEncryptor: ModelEncryptor;

  constructor(
    @InjectRepository(CloudCapiKeyEntity)
    private readonly repository: Repository<CloudCapiKeyEntity>,
    private readonly encryptionService: EncryptionService,
  ) {
    super();
    this.modelEncryptor = new ModelEncryptor(encryptionService, [
      'capiKey',
      'capiSecret',
    ]);
  }

  /**
   * @inheritDoc
   */
  async get(id: string): Promise<CloudCapiKey> {
    const entity = await this.repository.findOneBy({ id });
    if (!entity) {
      return null;
    }

    return classToClass(
      CloudCapiKey,
      await this.modelEncryptor.decryptEntity(entity, true),
    );
  }

  /**
   * @inheritDoc
   */
  public async update(
    id: string,
    data: Partial<CloudCapiKey>,
  ): Promise<CloudCapiKey> {
    const oldEntity = await this.modelEncryptor.decryptEntity(
      await this.repository.findOneBy({ id }),
      true,
    );
    const newEntity = classToClass(CloudCapiKeyEntity, data);

    const encrypted = await this.modelEncryptor.encryptEntity(
      this.repository.merge(oldEntity, newEntity),
    );
    await this.repository.save(encrypted);

    return this.get(id);
  }

  /**
   * @inheritDoc
   */
  async getByUserAccount(
    userId: string,
    cloudUserId: number,
    cloudAccountId: number,
  ): Promise<CloudCapiKey> {
    const entity = await this.repository.findOneBy({
      userId,
      cloudUserId,
      cloudAccountId,
    });

    if (!entity) {
      return null;
    }

    return classToClass(
      CloudCapiKey,
      await this.modelEncryptor.decryptEntity(entity, true),
    );
  }

  /**
   * @inheritDoc
   */
  async create(model: CloudCapiKey): Promise<CloudCapiKey> {
    try {
      const entity = classToClass(CloudCapiKeyEntity, model);

      return classToClass(
        CloudCapiKey,
        await this.modelEncryptor.decryptEntity(
          await this.repository.save(
            await this.modelEncryptor.encryptEntity(entity),
          ),
          true,
        ),
      );
    } catch (e) {
      if (e.code === 'SQLITE_CONSTRAINT') {
        throw new CloudApiBadRequestException('Such capi key already exists');
      }

      throw e;
    }
  }

  /**
   * @inheritDoc
   */
  async list(userId: string): Promise<CloudCapiKey[]> {
    const entities = await this.repository
      .createQueryBuilder('k')
      .select(['k.id', 'k.name', 'k.valid', 'k.createdAt', 'k.lastUsed'])
      .where({ userId })
      .orderBy('k.createdAt', 'DESC')
      .getMany();

    return entities.map((entity) => classToClass(CloudCapiKey, entity));
  }

  /**
   * @inheritDoc
   */
  async delete(userId: string, id: string): Promise<void> {
    await this.repository.delete({ id, userId });
  }

  /**
   * @inheritDoc
   */
  async deleteAll(userId: string): Promise<void> {
    await this.repository.delete({ userId });
  }
}
