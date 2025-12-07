import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { classToClass } from 'src/utils';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { ModelEncryptor } from 'src/modules/encryption/model.encryptor';
import { ClientCertificateRepository } from 'src/modules/certificate/repositories/client-certificate.repository';
import { ClientCertificateEntity } from 'src/modules/certificate/entities/client-certificate.entity';
import { ClientCertificate } from 'src/modules/certificate/models/client-certificate';
import { DatabaseEntity } from 'src/modules/database/entities/database.entity';

@Injectable()
export class LocalClientCertificateRepository extends ClientCertificateRepository {
  private readonly logger = new Logger('LocalCaCertificateRepository');

  private modelEncryptor: ModelEncryptor;

  constructor(
    @InjectRepository(ClientCertificateEntity)
    private readonly repository: Repository<ClientCertificateEntity>,
    @InjectRepository(DatabaseEntity)
    private readonly databaseRepository: Repository<DatabaseEntity>,
    private readonly encryptionService: EncryptionService,
  ) {
    super();
    this.modelEncryptor = new ModelEncryptor(encryptionService, [
      'certificate',
      'key',
    ]);
  }

  /**
   * @inheritDoc
   */
  async get(id: string): Promise<ClientCertificate> {
    return classToClass(
      ClientCertificate,
      await this.modelEncryptor.decryptEntity(
        await this.repository.findOneBy({ id }),
      ),
    );
  }

  /**
   * @inheritDoc
   */
  async list(): Promise<ClientCertificate[]> {
    return (
      await this.repository
        .createQueryBuilder('c')
        .select(['c.id', 'c.name'])
        .getMany()
    ).map((model) => classToClass(ClientCertificate, model));
  }

  /**
   * @inheritDoc
   */
  async create(
    clientCertificate: ClientCertificate,
    uniqueCheck = true,
  ): Promise<ClientCertificate> {
    if (uniqueCheck) {
      // todo: use unique constraint and proper error handling to check for duplications
      const found = await this.repository.findOneBy({
        name: clientCertificate.name,
      });
      if (found) {
        this.logger.error(
          `Failed to create certificate: ${clientCertificate.name}. ${ERROR_MESSAGES.CLIENT_CERT_EXIST}`,
        );
        throw new BadRequestException(ERROR_MESSAGES.CLIENT_CERT_EXIST);
      }
    }

    const entity = await this.repository.save(
      await this.modelEncryptor.encryptEntity(
        this.repository.create(clientCertificate),
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
    const found = await this.repository.findOneBy({ id });
    if (!found) {
      this.logger.error(`Failed to delete client certificate: ${id}`);
      throw new NotFoundException();
    }

    const affectedDatabases = (
      await this.databaseRepository
        .createQueryBuilder('d')
        .leftJoinAndSelect('d.clientCert', 'c')
        .where({ clientCert: id })
        .select(['d.id'])
        .getMany()
    ).map((e) => e.id);

    await this.repository.delete(id);
    this.logger.debug(`Succeed to delete client certificate: ${id}`);

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
