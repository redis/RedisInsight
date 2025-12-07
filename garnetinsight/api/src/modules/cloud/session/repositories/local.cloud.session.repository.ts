import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { classToClass } from 'src/utils';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { ModelEncryptor } from 'src/modules/encryption/model.encryptor';
import { plainToInstance } from 'class-transformer';
import { CloudSessionRepository } from './cloud.session.repository';
import { CloudSessionEntity } from '../entities/cloud.session.entity';
import { CloudSessionData } from '../models/cloud-session';

const SESSION_ID = '1';

export class LocalCloudSessionRepository extends CloudSessionRepository {
  private readonly modelEncryptor: ModelEncryptor;

  constructor(
    @InjectRepository(CloudSessionEntity)
    private readonly repository: Repository<CloudSessionEntity>,
    private readonly encryptionService: EncryptionService,
  ) {
    super();
    this.modelEncryptor = new ModelEncryptor(this.encryptionService, ['data']);
  }

  async get(): Promise<CloudSessionData> {
    const entity = await this.repository.findOneBy({ id: SESSION_ID });

    if (!entity) {
      return null;
    }

    const decrypted = await this.modelEncryptor.decryptEntity(entity, false);

    return classToClass(CloudSessionData, decrypted);
  }

  async save(cloudAuth: Partial<CloudSessionData>): Promise<void> {
    const entity = await this.modelEncryptor.encryptEntity(
      plainToInstance(CloudSessionEntity, { ...cloudAuth, id: SESSION_ID }),
    );

    await this.repository.upsert(entity, ['id']);
  }
}
