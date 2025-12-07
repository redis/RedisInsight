import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { CaCertificateRepository } from 'src/modules/certificate/repositories/ca-certificate.repository';
import { CaCertificateEntity } from 'src/modules/certificate/entities/ca-certificate.entity';
import { CaCertificate } from 'src/modules/certificate/models/ca-certificate';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { classToClass } from 'src/utils';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { ModelEncryptor } from 'src/modules/encryption/model.encryptor';
import { DatabaseEntity } from 'src/modules/database/entities/database.entity';

@Injectable()
export class LocalCaCertificateRepository extends CaCertificateRepository {
  private readonly logger = new Logger('LocalCaCertificateRepository');

  private modelEncryptor: ModelEncryptor;

  constructor(
    @InjectRepository(CaCertificateEntity)
    private readonly repository: Repository<CaCertificateEntity>,
    @InjectRepository(DatabaseEntity)
    private readonly databaseRepository: Repository<DatabaseEntity>,
    private readonly encryptionService: EncryptionService,
  ) {
    super();
    this.modelEncryptor = new ModelEncryptor(encryptionService, [
      'certificate',
    ]);
  }

  /**
   * @inheritDoc
   */
  async get(id: string): Promise<CaCertificate> {
    return classToClass(
      CaCertificate,
      await this.modelEncryptor.decryptEntity(
        await this.repository.findOneBy({ id }),
      ),
    );
  }

  /**
   * @inheritDoc
   */
  async list(): Promise<CaCertificate[]> {
    return (
      await this.repository
        .createQueryBuilder('c')
        .select(['c.id', 'c.name'])
        .getMany()
    ).map((entity) => classToClass(CaCertificate, entity));
  }

  /**
   * @inheritDoc
   */
  async create(
    caCertificate: CaCertificate,
    uniqueCheck = true,
  ): Promise<CaCertificate> {
    if (uniqueCheck) {
      // todo: use unique constraint and proper error handling to check for duplications
      const found = await this.repository.findOneBy({
        name: caCertificate.name,
      });

      if (found) {
        this.logger.error(
          `Failed to create certificate: ${caCertificate.name}. ${ERROR_MESSAGES.CA_CERT_EXIST}`,
        );
        throw new BadRequestException(ERROR_MESSAGES.CA_CERT_EXIST);
      }
    }

    const entity = await this.repository.save(
      await this.modelEncryptor.encryptEntity(
        this.repository.create(caCertificate),
      ),
    );

    return this.get(entity.id);
  }

  /**
   * @inheritDoc
   */
  async delete(id: string): Promise<{ affectedDatabases: string[] }> {
    this.logger.debug(`Deleting certificate. id: ${id}`);

    // todo: 1. why we need to check if entity exists?
    //  2. why we fetch it instead of check delete response?
    //  3. why we need to fail if no cert found?
    //  4. why there is no error message?
    const found = await this.repository.findOneBy({ id });
    if (!found) {
      this.logger.error(`Failed to delete ca certificate: ${id}`);
      throw new NotFoundException();
    }

    const affectedDatabases = (
      await this.databaseRepository
        .createQueryBuilder('d')
        .leftJoinAndSelect('d.caCert', 'c')
        .where({ caCert: id })
        .select(['d.id'])
        .getMany()
    ).map((e) => e.id);

    await this.repository.delete(id);
    this.logger.debug(`Succeed to delete ca certificate: ${id}`);

    return { affectedDatabases };
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
