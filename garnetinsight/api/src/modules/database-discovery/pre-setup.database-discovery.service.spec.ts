import { when } from 'jest-when';
import { Test, TestingModule } from '@nestjs/testing';
import * as preSetupDiscoveryUtil from 'src/modules/database-discovery/utils/pre-setup.discovery.util';
import {
  mockCaCertificateRepository,
  mockClientCertificateRepository,
  mockDatabaseRepository,
  mockDatabaseToImportFromEnvsPrepared,
  mockDatabaseToImportFromFilePrepared,
  mockDatabaseToImportWithCertsFromEnvsPrepared,
  mockDatabaseToImportWithCertsFromFilePrepared,
  mockSessionMetadata,
  MockType,
} from 'src/__mocks__';
import config, { Config } from 'src/utils/config';
import { PreSetupDatabaseDiscoveryService } from 'src/modules/database-discovery/pre-setup.database-discovery.service';
import { DatabaseRepository } from 'src/modules/database/repositories/database.repository';
import { CaCertificateRepository } from 'src/modules/certificate/repositories/ca-certificate.repository';
import { ClientCertificateRepository } from 'src/modules/certificate/repositories/client-certificate.repository';

jest.mock(
  'src/utils/config',
  jest.fn(() => jest.requireActual('src/utils/config') as object),
);

const mockServerConfig = config.get('server') as Config['server'];

describe('PreSetupDatabaseDiscoveryService', () => {
  let service: PreSetupDatabaseDiscoveryService;
  let databaseRepository: MockType<DatabaseRepository>;
  let caCertificateRepository: MockType<CaCertificateRepository>;
  let clientCertificateRepository: MockType<ClientCertificateRepository>;
  let configGetSpy: jest.SpyInstance;

  beforeEach(async () => {
    jest.clearAllMocks();

    configGetSpy = jest.spyOn(config, 'get');

    mockServerConfig.buildType = 'ELECTRON';
    when(configGetSpy).calledWith('server').mockReturnValue(mockServerConfig);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PreSetupDatabaseDiscoveryService,
        {
          provide: DatabaseRepository,
          useFactory: mockDatabaseRepository,
        },
        {
          provide: CaCertificateRepository,
          useFactory: mockCaCertificateRepository,
        },
        {
          provide: ClientCertificateRepository,
          useFactory: mockClientCertificateRepository,
        },
      ],
    }).compile();

    service = module.get(PreSetupDatabaseDiscoveryService);
    databaseRepository = module.get(DatabaseRepository);
    caCertificateRepository = module.get(CaCertificateRepository);
    clientCertificateRepository = module.get(ClientCertificateRepository);
  });

  describe('addDatabase', () => {
    it('should add simple database', async () => {
      await expect(
        service['addDatabase'](
          mockSessionMetadata,
          mockDatabaseToImportFromEnvsPrepared,
        ),
      ).resolves.toEqual(mockDatabaseToImportFromEnvsPrepared.id);

      expect(caCertificateRepository.create).not.toHaveBeenCalled();
      expect(clientCertificateRepository.create).not.toHaveBeenCalled();
      expect(databaseRepository.create).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockDatabaseToImportFromEnvsPrepared,
        false,
      );
    });

    it('should add database with certificates', async () => {
      await expect(
        service['addDatabase'](
          mockSessionMetadata,
          mockDatabaseToImportWithCertsFromEnvsPrepared,
        ),
      ).resolves.toEqual(mockDatabaseToImportWithCertsFromEnvsPrepared.id);

      expect(caCertificateRepository.create).toHaveBeenCalledWith(
        mockDatabaseToImportWithCertsFromEnvsPrepared.caCert,
        false,
      );
      expect(clientCertificateRepository.create).toHaveBeenCalledWith(
        mockDatabaseToImportWithCertsFromEnvsPrepared.clientCert,
        false,
      );
      expect(databaseRepository.create).toHaveBeenCalledWith(
        mockSessionMetadata,
        {
          ...mockDatabaseToImportWithCertsFromEnvsPrepared,
          caCert: {
            id: mockDatabaseToImportWithCertsFromEnvsPrepared.caCert.id,
          },
          clientCert: {
            id: mockDatabaseToImportWithCertsFromEnvsPrepared.clientCert.id,
          },
        },
        false,
      );
    });

    it('should not fail on error', async () => {
      databaseRepository.create.mockRejectedValueOnce(
        new Error('some error during adding database'),
      );
      await expect(
        service['addDatabase'](
          mockSessionMetadata,
          mockDatabaseToImportFromEnvsPrepared,
        ),
      ).resolves.toEqual(null);
    });
  });

  describe('cleanupPreSetupData', () => {
    const mockExcludeIds = ['_1'];

    it('should cleanup databases and certificates', async () => {
      await expect(
        service['cleanupPreSetupData'](mockSessionMetadata, ['_1']),
      ).resolves.toEqual(undefined);

      expect(caCertificateRepository.cleanupPreSetup).toHaveBeenCalledWith(
        mockExcludeIds,
      );
      expect(clientCertificateRepository.cleanupPreSetup).toHaveBeenCalledWith(
        mockExcludeIds,
      );
      expect(databaseRepository.cleanupPreSetup).toHaveBeenCalledWith(
        mockExcludeIds,
      );
    });

    it('should not fail in case of an error', async () => {
      const mockError = new Error('Unable to cleanup data');
      caCertificateRepository.cleanupPreSetup.mockRejectedValueOnce(mockError);
      clientCertificateRepository.cleanupPreSetup.mockRejectedValueOnce(
        mockError,
      );
      databaseRepository.cleanupPreSetup.mockRejectedValueOnce(mockError);

      await expect(
        service['cleanupPreSetupData'](mockSessionMetadata, ['_1']),
      ).resolves.toEqual(undefined);
    });
  });

  describe('discover', () => {
    let addDatabaseSpy: jest.SpyInstance;
    let discoverEnvDatabasesToAddSpy: jest.SpyInstance;
    let discoverFileDatabasesToAddSpy: jest.SpyInstance;
    let cleanupPreSetupDataSpy: jest.SpyInstance;

    beforeEach(async () => {
      addDatabaseSpy = jest.spyOn(service as any, 'addDatabase');
      addDatabaseSpy.mockResolvedValue('_1');
      discoverEnvDatabasesToAddSpy = jest.spyOn(
        preSetupDiscoveryUtil,
        'discoverEnvDatabasesToAdd',
      );
      discoverEnvDatabasesToAddSpy.mockResolvedValue([
        mockDatabaseToImportFromEnvsPrepared,
        mockDatabaseToImportWithCertsFromEnvsPrepared,
      ]);
      discoverFileDatabasesToAddSpy = jest.spyOn(
        preSetupDiscoveryUtil,
        'discoverFileDatabasesToAdd',
      );
      discoverFileDatabasesToAddSpy.mockResolvedValue([
        mockDatabaseToImportFromFilePrepared,
        mockDatabaseToImportWithCertsFromFilePrepared,
      ]);
      cleanupPreSetupDataSpy = jest.spyOn(
        service as any,
        'cleanupPreSetupData',
      );
    });

    it('should skip when buildType = REDIS_STACK', async () => {
      mockServerConfig.buildType = 'REDIS_STACK';

      await expect(service.discover(mockSessionMetadata)).resolves.toEqual({
        discovered: 0,
      });

      expect(discoverEnvDatabasesToAddSpy).not.toHaveBeenCalled();
      expect(discoverFileDatabasesToAddSpy).not.toHaveBeenCalled();
      expect(addDatabaseSpy).not.toHaveBeenCalled();
      expect(cleanupPreSetupDataSpy).not.toHaveBeenCalled();
    });

    it('should not try to add database when nothing discovered but run cleanup function', async () => {
      discoverEnvDatabasesToAddSpy.mockResolvedValueOnce([]);
      discoverFileDatabasesToAddSpy.mockResolvedValueOnce([]);

      await expect(service.discover(mockSessionMetadata)).resolves.toEqual({
        discovered: 0,
      });

      expect(addDatabaseSpy).not.toHaveBeenCalled();
      expect(cleanupPreSetupDataSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        [],
      );
    });

    it('should add 4 databases', async () => {
      await expect(service.discover(mockSessionMetadata)).resolves.toEqual({
        discovered: 4,
      });

      expect(addDatabaseSpy).toHaveBeenCalledTimes(4);
      expect(cleanupPreSetupDataSpy).toHaveBeenCalledWith(mockSessionMetadata, [
        '_1',
        '_1',
        '_1',
        '_1',
      ]);
    });

    it('should add 3 out of 4 databases due to unique by id (env takes precedence)', async () => {
      discoverFileDatabasesToAddSpy.mockResolvedValue([
        {
          ...mockDatabaseToImportFromFilePrepared,
          id: mockDatabaseToImportFromEnvsPrepared.id,
        },
        mockDatabaseToImportWithCertsFromFilePrepared,
      ]);

      await expect(service.discover(mockSessionMetadata)).resolves.toEqual({
        discovered: 3,
      });

      expect(addDatabaseSpy).toHaveBeenCalledTimes(3);
      expect(addDatabaseSpy).toHaveBeenNthCalledWith(
        1,
        mockSessionMetadata,
        mockDatabaseToImportFromEnvsPrepared,
      );
      expect(addDatabaseSpy).toHaveBeenNthCalledWith(
        2,
        mockSessionMetadata,
        mockDatabaseToImportWithCertsFromEnvsPrepared,
      );
      expect(addDatabaseSpy).toHaveBeenNthCalledWith(
        3,
        mockSessionMetadata,
        mockDatabaseToImportWithCertsFromFilePrepared,
      );
      expect(cleanupPreSetupDataSpy).toHaveBeenCalledWith(mockSessionMetadata, [
        '_1',
        '_1',
        '_1',
      ]);
    });

    it('should add 2 out of 4 database filtered by null', async () => {
      addDatabaseSpy.mockResolvedValueOnce(null);
      addDatabaseSpy.mockResolvedValueOnce(null);

      await expect(service.discover(mockSessionMetadata)).resolves.toEqual({
        discovered: 2,
      });

      expect(addDatabaseSpy).toHaveBeenCalledTimes(4);
      expect(cleanupPreSetupDataSpy).toHaveBeenCalledWith(mockSessionMetadata, [
        '_1',
        '_1',
      ]);
    });

    it('should not fail in case of an error', async () => {
      addDatabaseSpy.mockRejectedValueOnce(new Error('some error'));

      await expect(service.discover(mockSessionMetadata)).resolves.toEqual({
        discovered: 0,
      });

      expect(cleanupPreSetupDataSpy).not.toHaveBeenCalled();
    });
  });
});
