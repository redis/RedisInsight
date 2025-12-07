import { Injectable } from '@nestjs/common';
import { CaCertificate } from 'src/modules/certificate/models/ca-certificate';
import { InjectRepository } from '@nestjs/typeorm';
import { CaCertificateEntity } from 'src/modules/certificate/entities/ca-certificate.entity';
import { Repository } from 'typeorm';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { ModelEncryptor } from 'src/modules/encryption/model.encryptor';
import { ClientCertificate } from 'src/modules/certificate/models/client-certificate';
import { ClientCertificateEntity } from 'src/modules/certificate/entities/client-certificate.entity';
import { classToClass } from 'src/utils';
import {
  getCertNameFromFilename,
  getPemBodyFromFileSync,
  isValidPemCertificate,
  isValidPemPrivateKey,
} from 'src/common/utils';
import {
  InvalidCaCertificateBodyException,
  InvalidCertificateNameException,
  InvalidClientCertificateBodyException,
  InvalidClientPrivateKeyException,
} from 'src/modules/database-import/exceptions';

@Injectable()
export class CertificateImportService {
  private caCertEncryptor: ModelEncryptor;

  private clientCertEncryptor: ModelEncryptor;

  constructor(
    @InjectRepository(CaCertificateEntity)
    private readonly caCertRepository: Repository<CaCertificateEntity>,
    @InjectRepository(ClientCertificateEntity)
    private readonly clientCertRepository: Repository<ClientCertificateEntity>,
    private readonly encryptionService: EncryptionService,
  ) {
    this.caCertEncryptor = new ModelEncryptor(encryptionService, [
      'certificate',
    ]);
    this.clientCertEncryptor = new ModelEncryptor(encryptionService, [
      'certificate',
      'key',
    ]);
  }

  /**
   * Validate data + prepare CA certificate to be imported along with new database
   * @param cert
   */
  async processCaCertificate(
    cert: Partial<CaCertificate>,
  ): Promise<CaCertificate> {
    let toImport: Partial<CaCertificate> = {
      certificate: null,
      name: cert.name,
    };

    if (isValidPemCertificate(cert.certificate)) {
      toImport.certificate = cert.certificate;
    } else {
      try {
        toImport.certificate = getPemBodyFromFileSync(cert.certificate);
        toImport.name = getCertNameFromFilename(cert.certificate);
      } catch (e) {
        // ignore error
        toImport = null;
      }
    }

    if (
      !toImport?.certificate ||
      !isValidPemCertificate(toImport.certificate)
    ) {
      throw new InvalidCaCertificateBodyException();
    }

    if (!toImport?.name) {
      throw new InvalidCertificateNameException();
    }

    return this.prepareCaCertificateForImport(toImport);
  }

  /**
   * Use existing certificate if found
   * Generate unique name for new certificate
   * @param cert
   * @private
   */
  private async prepareCaCertificateForImport(
    cert: Partial<CaCertificate>,
  ): Promise<CaCertificate> {
    const encryptedModel = await this.caCertEncryptor.encryptEntity(
      cert as CaCertificate,
    );
    const existing = await this.caCertRepository
      .createQueryBuilder('c')
      .select('c.id')
      .where({ certificate: cert.certificate })
      .orWhere({ certificate: encryptedModel.certificate })
      .getOne();

    if (existing) {
      return existing;
    }

    const name = await CertificateImportService.determineAvailableName(
      cert.name,
      this.caCertRepository,
    );

    return classToClass(CaCertificate, {
      ...cert,
      name,
    });
  }

  /**
   * Validate data + prepare CA certificate to be imported along with new database
   * @param cert
   */
  async processClientCertificate(
    cert: Partial<ClientCertificateEntity>,
  ): Promise<ClientCertificate> {
    const toImport: Partial<ClientCertificate> = {
      certificate: null,
      key: null,
      name: cert.name,
    };

    if (isValidPemCertificate(cert.certificate)) {
      toImport.certificate = cert.certificate;
    } else {
      try {
        toImport.certificate = getPemBodyFromFileSync(cert.certificate);
        toImport.name = getCertNameFromFilename(cert.certificate);
      } catch (e) {
        // ignore error
        toImport.certificate = null;
        toImport.name = null;
      }
    }

    if (isValidPemPrivateKey(cert.key)) {
      toImport.key = cert.key;
    } else {
      try {
        toImport.key = getPemBodyFromFileSync(cert.key);
      } catch (e) {
        // ignore error
        toImport.key = null;
      }
    }

    if (
      !toImport?.certificate ||
      !isValidPemCertificate(toImport.certificate)
    ) {
      throw new InvalidClientCertificateBodyException();
    }

    if (!toImport?.key || !isValidPemPrivateKey(toImport.key)) {
      throw new InvalidClientPrivateKeyException();
    }

    if (!toImport?.name) {
      throw new InvalidCertificateNameException();
    }

    return this.prepareClientCertificateForImport(toImport);
  }

  /**
   * Use existing certificate if found
   * Generate unique name for new certificate
   * @param cert
   * @private
   */
  private async prepareClientCertificateForImport(
    cert: Partial<ClientCertificate>,
  ): Promise<ClientCertificate> {
    const encryptedModel = await this.clientCertEncryptor.encryptEntity(
      cert as ClientCertificate,
    );
    const existing = await this.clientCertRepository
      .createQueryBuilder('c')
      .select('c.id')
      .where({
        certificate: cert.certificate,
        key: cert.key,
      })
      .orWhere({
        certificate: encryptedModel.certificate,
        key: encryptedModel.key,
      })
      .getOne();

    if (existing) {
      return existing;
    }

    const name = await CertificateImportService.determineAvailableName(
      cert.name,
      this.clientCertRepository,
    );

    return classToClass(ClientCertificate, {
      ...cert,
      name,
    });
  }

  /**
   * Find available name for certificate using such pattern "{N}_{name}"
   * @param originalName
   * @param repository
   */
  static async determineAvailableName(
    originalName: string,
    repository: Repository<any>,
  ): Promise<string> {
    let index = 0;

    // temporary solution
    // investigate how to make working "regexp" for sqlite
    // https://github.com/kriasoft/node-sqlite/issues/55
    // https://www.sqlite.org/c3ref/create_function.html
    while (true) {
      let name = originalName;

      if (index) {
        name = `${index}_${name}`;
      }

      if (
        !(await repository
          .createQueryBuilder('c')
          .where({ name })
          .select(['c.id'])
          .getOne())
      ) {
        return name;
      }

      index += 1;
    }
  }
}
