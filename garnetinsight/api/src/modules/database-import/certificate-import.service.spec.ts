import { when } from 'jest-when';
import {
  mockCaCertificate,
  mockCaCertificateCertificateEncrypted,
  mockCaCertificateCertificatePlain,
  mockCaCertificateEntity,
  mockClientCertificate,
  mockClientCertificateCertificateEncrypted,
  mockClientCertificateCertificatePlain,
  mockClientCertificateEntity,
  mockClientCertificateKeyEncrypted,
  mockClientCertificateKeyPlain,
  mockEncryptionService,
  mockRepository,
  MockType,
} from 'src/__mocks__';
import * as utils from 'src/common/utils';
import { Test, TestingModule } from '@nestjs/testing';
import {
  InvalidCaCertificateBodyException,
  InvalidCertificateNameException,
  InvalidClientCertificateBodyException,
  InvalidClientPrivateKeyException,
} from 'src/modules/database-import/exceptions';
import { CertificateImportService } from 'src/modules/database-import/certificate-import.service';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { Repository } from 'typeorm';
import { CaCertificateEntity } from 'src/modules/certificate/entities/ca-certificate.entity';
import { ClientCertificateEntity } from 'src/modules/certificate/entities/client-certificate.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

jest.mock('src/common/utils', () => ({
  ...(jest.requireActual('src/common/utils') as object),
  getPemBodyFromFileSync: jest.fn(),
}));

describe('CertificateImportService', () => {
  let service: CertificateImportService;
  let caRepository: MockType<Repository<CaCertificateEntity>>;
  let clientRepository: MockType<Repository<ClientCertificateEntity>>;
  let encryptionService: MockType<EncryptionService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificateImportService,
        {
          provide: getRepositoryToken(CaCertificateEntity),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(ClientCertificateEntity),
          useFactory: mockRepository,
        },
        {
          provide: EncryptionService,
          useFactory: mockEncryptionService,
        },
      ],
    }).compile();

    service = await module.get(CertificateImportService);
    caRepository = await module.get(getRepositoryToken(CaCertificateEntity));
    clientRepository = await module.get(
      getRepositoryToken(ClientCertificateEntity),
    );
    encryptionService = await module.get(EncryptionService);

    when(encryptionService.decrypt)
      .calledWith(mockCaCertificateCertificateEncrypted, expect.anything())
      .mockResolvedValue(mockCaCertificateCertificatePlain);
    when(encryptionService.encrypt)
      .calledWith(mockCaCertificateCertificatePlain)
      .mockResolvedValue({
        data: mockCaCertificateCertificateEncrypted,
        encryption: mockCaCertificateEntity.encryption,
      });

    when(encryptionService.decrypt)
      .calledWith(mockClientCertificateCertificateEncrypted, expect.anything())
      .mockResolvedValue(mockClientCertificateCertificatePlain)
      .calledWith(mockClientCertificateKeyEncrypted, expect.anything())
      .mockResolvedValue(mockClientCertificateKeyPlain);
    when(encryptionService.encrypt)
      .calledWith(mockClientCertificateCertificatePlain)
      .mockResolvedValue({
        data: mockClientCertificateCertificateEncrypted,
        encryption: mockClientCertificateEntity.encryption,
      })
      .calledWith(mockClientCertificateKeyPlain)
      .mockResolvedValue({
        data: mockClientCertificateKeyEncrypted,
        encryption: mockClientCertificateEntity.encryption,
      });
  });

  let determineAvailableNameSpy;
  let getPemBodyFromFileSyncSpy;
  let prepareCaCertificateForImportSpy;
  let prepareClientCertificateForImportSpy;

  describe('processCaCertificate', () => {
    beforeEach(() => {
      getPemBodyFromFileSyncSpy = jest.spyOn(
        utils as any,
        'getPemBodyFromFileSync',
      );
      getPemBodyFromFileSyncSpy.mockReturnValue(mockCaCertificate.certificate);
      prepareCaCertificateForImportSpy = jest.spyOn(
        service as any,
        'prepareCaCertificateForImport',
      );
      prepareCaCertificateForImportSpy.mockResolvedValueOnce(mockCaCertificate);
    });

    it('should successfully process certificate', async () => {
      const response = await service['processCaCertificate']({
        name: mockCaCertificate.name,
        certificate: mockCaCertificate.certificate,
      });

      expect(response).toEqual(mockCaCertificate);
    });

    it('should fail when no name defined', async () => {
      try {
        await service['processCaCertificate']({
          name: undefined,
          certificate: mockCaCertificate.certificate,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidCertificateNameException);
      }
    });

    it('should successfully process certificate from file', async () => {
      const response = await service['processCaCertificate']({
        certificate: '/path/ca.crt',
      });

      expect(response).toEqual(mockCaCertificate);
      expect(prepareCaCertificateForImportSpy).toHaveBeenCalledWith({
        name: 'ca',
        certificate: mockCaCertificate.certificate,
      });
    });

    it('should fail when no file found', async () => {
      getPemBodyFromFileSyncSpy.mockImplementationOnce(() => {
        throw new Error();
      });

      try {
        await service['processCaCertificate']({
          name: undefined,
          certificate: '/path/ca.crt',
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidCaCertificateBodyException);
      }
    });
  });

  describe('prepareCaCertificateForImport', () => {
    beforeEach(() => {
      determineAvailableNameSpy = jest.spyOn(
        CertificateImportService,
        'determineAvailableName',
      );
    });

    it('should return existing certificate', async () => {
      caRepository
        .createQueryBuilder()
        .getOne.mockResolvedValueOnce(mockCaCertificate);

      const response = await service['prepareCaCertificateForImport']({
        name: mockCaCertificate.name,
        certificate: mockCaCertificate.certificate,
      });

      expect(response).toEqual(mockCaCertificate);
      expect(determineAvailableNameSpy).not.toHaveBeenCalled();
    });

    it('should return new certificate', async () => {
      caRepository.createQueryBuilder().getOne.mockResolvedValueOnce(null); // for cert search
      caRepository.createQueryBuilder().getOne.mockResolvedValueOnce(null); // for name search

      const response = await service['prepareCaCertificateForImport']({
        name: `${mockCaCertificate.name}_new`,
        certificate: mockCaCertificate.certificate,
      });

      expect(response).toEqual({
        ...mockCaCertificate,
        id: undefined, // return not-existing model
        name: `${mockCaCertificate.name}_new`,
      });
    });

    it('should generate name with prefix', async () => {
      caRepository.createQueryBuilder().getOne.mockResolvedValueOnce(null); // for cert search
      caRepository
        .createQueryBuilder()
        .getOne.mockResolvedValueOnce(mockCaCertificate); // for name search 1st attempt
      caRepository
        .createQueryBuilder()
        .getOne.mockResolvedValueOnce(mockCaCertificate); // for name search 2nd attempt
      caRepository.createQueryBuilder().getOne.mockResolvedValueOnce(null); // for name search 3rd attempt

      const response = await service['prepareCaCertificateForImport']({
        name: `${mockCaCertificate.name}_new`,
        certificate: mockCaCertificate.certificate,
      });

      expect(response).toEqual({
        ...mockCaCertificate,
        id: undefined, // return not-existing model
        name: `2_${mockCaCertificate.name}_new`,
      });
    });
  });

  describe('processClientCertificate', () => {
    beforeEach(() => {
      getPemBodyFromFileSyncSpy = jest.spyOn(
        utils as any,
        'getPemBodyFromFileSync',
      );
      prepareClientCertificateForImportSpy = jest.spyOn(
        service as any,
        'prepareClientCertificateForImport',
      );
      prepareClientCertificateForImportSpy.mockResolvedValueOnce(
        mockClientCertificate,
      );
    });

    it('should successfully process client certificate', async () => {
      const response = await service['processClientCertificate']({
        name: mockClientCertificate.name,
        certificate: mockClientCertificate.certificate,
        key: mockClientCertificate.key,
      });

      expect(response).toEqual(mockClientCertificate);
    });

    it('should fail when no name defined', async () => {
      try {
        await service['processClientCertificate']({
          name: undefined,
          certificate: mockClientCertificate.certificate,
          key: mockClientCertificate.key,
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidCertificateNameException);
      }
    });

    it('should successfully process certificate from file', async () => {
      getPemBodyFromFileSyncSpy.mockReturnValueOnce(
        mockClientCertificate.certificate,
      );
      getPemBodyFromFileSyncSpy.mockReturnValueOnce(mockClientCertificate.key);

      const response = await service['processClientCertificate']({
        certificate: '/path/client.crt',
        key: '/path/key.key',
      });

      expect(response).toEqual(mockClientCertificate);
      expect(prepareClientCertificateForImportSpy).toHaveBeenCalledWith({
        name: 'client',
        certificate: mockClientCertificate.certificate,
        key: mockClientCertificate.key,
      });
    });

    it('should fail when no cert file found', async () => {
      getPemBodyFromFileSyncSpy.mockImplementationOnce(() => {
        throw new Error();
      });

      try {
        await service['processClientCertificate']({
          name: undefined,
          certificate: '/path/client1.crt',
          key: '/path/key1.key',
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidClientCertificateBodyException);
      }
    });

    it('should fail when no key file found', async () => {
      getPemBodyFromFileSyncSpy.mockReturnValueOnce(
        mockClientCertificate.certificate,
      );
      getPemBodyFromFileSyncSpy.mockImplementationOnce(() => {
        throw new Error();
      });

      try {
        await service['processClientCertificate']({
          name: undefined,
          certificate: '/path/client.crt',
          key: '/path/key.key',
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidClientPrivateKeyException);
      }
    });
  });

  describe('prepareClientCertificateForImport', () => {
    beforeEach(() => {
      determineAvailableNameSpy = jest.spyOn(
        CertificateImportService,
        'determineAvailableName',
      );
    });

    it('should return existing certificate', async () => {
      clientRepository
        .createQueryBuilder()
        .getOne.mockResolvedValueOnce(mockClientCertificate);

      const response = await service['prepareClientCertificateForImport']({
        name: mockClientCertificate.name,
        certificate: mockClientCertificate.certificate,
        key: mockClientCertificate.key,
      });

      expect(response).toEqual(mockClientCertificate);
      expect(determineAvailableNameSpy).not.toHaveBeenCalled();
    });

    it('should return new certificate', async () => {
      clientRepository.createQueryBuilder().getOne.mockResolvedValueOnce(null); // for cert search
      clientRepository.createQueryBuilder().getOne.mockResolvedValueOnce(null); // for name search

      const response = await service['prepareClientCertificateForImport']({
        name: `${mockClientCertificate.name}_new`,
        certificate: mockClientCertificate.certificate,
        key: mockClientCertificate.key,
      });

      expect(response).toEqual({
        ...mockClientCertificate,
        id: undefined, // return not-existing model
        name: `${mockClientCertificate.name}_new`,
      });
    });

    it('should generate name with prefix', async () => {
      clientRepository.createQueryBuilder().getOne.mockResolvedValueOnce(null); // for cert search
      clientRepository
        .createQueryBuilder()
        .getOne.mockResolvedValueOnce(mockClientCertificate); // name 1st attempt
      clientRepository
        .createQueryBuilder()
        .getOne.mockResolvedValueOnce(mockClientCertificate); // name 2nd attempt
      clientRepository.createQueryBuilder().getOne.mockResolvedValueOnce(null); // name 3rd attempt

      const response = await service['prepareClientCertificateForImport']({
        name: `${mockClientCertificate.name}_new`,
        certificate: mockClientCertificate.certificate,
        key: mockClientCertificate.key,
      });

      expect(response).toEqual({
        ...mockClientCertificate,
        id: undefined, // return not-existing model
        name: `2_${mockClientCertificate.name}_new`,
      });
    });
  });
});
