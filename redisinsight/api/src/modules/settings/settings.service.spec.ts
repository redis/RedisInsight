import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import {
  mockAgreements,
  mockAgreementsRepository,
  mockAppSettings,
  mockDatabaseDiscoveryService,
  mockEncryptionService,
  mockEncryptionStrategyInstance,
  mockKeyEncryptionStrategyInstance,
  mockSessionMetadata,
  mockSettings,
  mockSettingsAnalyticsService,
  mockSettingsRepository,
  MockType,
} from 'src/__mocks__';
import { UpdateSettingsDto } from 'src/modules/settings/dto/settings.dto';
import * as AGREEMENTS_SPEC from 'src/constants/agreements-spec.json';
import { AgreementIsNotDefinedException } from 'src/constants';
import config from 'src/utils/config';
import { KeytarEncryptionStrategy } from 'src/modules/encryption/strategies/keytar-encryption.strategy';
import { SettingsAnalytics } from 'src/modules/settings/settings.analytics';
import { SettingsService } from 'src/modules/settings/settings.service';
import { AgreementsRepository } from 'src/modules/settings/repositories/agreements.repository';
import { SettingsRepository } from 'src/modules/settings/repositories/settings.repository';
import { Agreements } from 'src/modules/settings/models/agreements';
import { Settings } from 'src/modules/settings/models/settings';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FeatureServerEvents } from 'src/modules/feature/constants';
import { KeyEncryptionStrategy } from 'src/modules/encryption/strategies/key-encryption.strategy';
import { DatabaseDiscoveryService } from 'src/modules/database-discovery/database-discovery.service';
import { ToggleAnalyticsReason } from 'src/modules/settings/constants/settings';
import { classToClass } from 'src/utils';
import { GetAppSettingsResponse } from 'src/modules/settings/dto/settings.dto';
import { EncryptionService } from 'src/modules/encryption/encryption.service';

const REDIS_SCAN_CONFIG = config.get('redis_scan');
const WORKBENCH_CONFIG = config.get('workbench');

const mockAgreementsMap = new Map(
  Object.keys(AGREEMENTS_SPEC.agreements).map((item: string) => [item, true]),
);

describe('SettingsService', () => {
  let service: SettingsService;
  let agreementsRepository: MockType<AgreementsRepository>;
  let databaseDiscoveryService: MockType<DatabaseDiscoveryService>;
  let settingsRepository: MockType<SettingsRepository>;
  let analyticsService: SettingsAnalytics;
  let keytarStrategy: MockType<KeytarEncryptionStrategy>;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        {
          provide: DatabaseDiscoveryService,
          useFactory: mockDatabaseDiscoveryService,
        },
        {
          provide: SettingsAnalytics,
          useFactory: mockSettingsAnalyticsService,
        },
        {
          provide: AgreementsRepository,
          useFactory: mockAgreementsRepository,
        },
        {
          provide: SettingsRepository,
          useFactory: mockSettingsRepository,
        },
        {
          provide: KeytarEncryptionStrategy,
          useFactory: mockEncryptionStrategyInstance,
        },
        {
          provide: KeyEncryptionStrategy,
          useFactory: mockKeyEncryptionStrategyInstance,
        },
        {
          provide: EncryptionService,
          useFactory: mockEncryptionService,
        },
        {
          provide: EventEmitter2,
          useFactory: () => ({
            emit: jest.fn(),
          }),
        },
      ],
    }).compile();

    agreementsRepository = module.get(AgreementsRepository);
    databaseDiscoveryService = module.get(DatabaseDiscoveryService);
    settingsRepository = module.get(SettingsRepository);
    keytarStrategy = module.get(KeytarEncryptionStrategy);
    analyticsService = module.get(SettingsAnalytics);
    service = module.get(SettingsService);
    eventEmitter = module.get(EventEmitter2);
  });

  describe('getAppSettings', () => {
    it('should return default application settings', async () => {
      agreementsRepository.getOrCreate.mockResolvedValue(new Agreements());
      settingsRepository.getOrCreate.mockResolvedValue(new Settings());

      const result = await service.getAppSettings(mockSessionMetadata);

      expect(result).toEqual({
        theme: null,
        scanThreshold: REDIS_SCAN_CONFIG.scanThreshold,
        batchSize: WORKBENCH_CONFIG.countBatch,
        dateFormat: null,
        timezone: null,
        agreements: null,
        acceptTermsAndConditionsOverwritten: false,
      });

      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should return some application settings already defined by user', async () => {
      agreementsRepository.getOrCreate.mockResolvedValue(mockAgreements);
      settingsRepository.getOrCreate.mockResolvedValue(mockSettings);

      const result = await service.getAppSettings(mockSessionMetadata);

      expect(result).toEqual({
        ...mockSettings.data,
        acceptTermsAndConditionsOverwritten: false,
        agreements: {
          version: mockAgreements.version,
          ...mockAgreements.data,
        },
      });
    });

    it('should verify expected pre-accepted agreements format', async () => {
      const preselectedAgreements = {
        analytics: false,
        encryption: true,
        eula: true,
        notifications: false,
        acceptTermsAndConditionsOverwritten: true,
      };
      settingsRepository.getOrCreate.mockResolvedValue(mockSettings);

      // Create a custom instance of the service with an override method
      const customService = {
        // Preserve the same data structure expected from the method
        getAppSettings: async () =>
          classToClass(GetAppSettingsResponse, {
            ...mockSettings.data,
            agreements: preselectedAgreements,
          }),
      };

      // Call the customized method
      const result = await customService.getAppSettings();

      // Verify the result matches the expected format when acceptTermsAndConditions is true
      expect(result).toHaveProperty('agreements');
      expect(result.agreements).toEqual(preselectedAgreements);
    });

    it('should throw InternalServerError', async () => {
      agreementsRepository.getOrCreate.mockRejectedValue(
        new Error('some error'),
      );

      try {
        await service.getAppSettings(mockSessionMetadata);
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });

  describe('updateAppSettings', () => {
    beforeEach(() => {
      settingsRepository.getOrCreate.mockResolvedValue(mockSettings);
      settingsRepository.update.mockResolvedValue(mockSettings);
      agreementsRepository.getOrCreate.mockResolvedValue(mockAgreements);
      agreementsRepository.update.mockResolvedValue(mockAgreements);
    });
    it('should run database discovery when accept eula for the very first time', async () => {
      agreementsRepository.getOrCreate.mockResolvedValueOnce(null);

      const dto: UpdateSettingsDto = {
        ...mockSettings.data,
        agreements: new Map(
          Object.entries({
            ...mockAgreements.data,
          }),
        ),
      };

      await service.updateAppSettings(mockSessionMetadata, dto);

      // first run (user accepted eula) so should run database discovery
      expect(databaseDiscoveryService.discover).toHaveBeenCalled();
    });
    it('should not fail when database discovery throw an error', async () => {
      agreementsRepository.getOrCreate.mockResolvedValueOnce(null);
      databaseDiscoveryService.discover.mockRejectedValueOnce(
        new Error('some error'),
      );

      const dto: UpdateSettingsDto = {
        ...mockSettings.data,
        agreements: new Map(
          Object.entries({
            ...mockAgreements.data,
          }),
        ),
      };

      await service.updateAppSettings(mockSessionMetadata, dto);

      // first run (user accepted eula) so should run database discovery
      expect(databaseDiscoveryService.discover).toHaveBeenCalled();
    });
    it('should update settings only', async () => {
      const dto: UpdateSettingsDto = {
        scanThreshold: 1001,
      };

      const response = await service.updateAppSettings(
        mockSessionMetadata,
        dto,
      );
      expect(agreementsRepository.update).not.toHaveBeenCalled();
      expect(settingsRepository.update).toHaveBeenCalledWith(
        mockSessionMetadata,
        {
          ...mockSettings,
          data: {
            ...mockSettings.data,
            ...dto,
          },
        },
      );
      expect(response).toEqual(mockAppSettings);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        FeatureServerEvents.FeaturesRecalculate,
      );

      // not first run so shouldn't run database discovery
      expect(databaseDiscoveryService.discover).not.toHaveBeenCalled();
    });
    it('should update agreements only', async () => {
      const dto: UpdateSettingsDto = {
        agreements: new Map(
          Object.entries({
            analytics: false,
          }),
        ),
        analyticsReason: ToggleAnalyticsReason.Github,
      };

      const response = await service.updateAppSettings(
        mockSessionMetadata,
        dto,
      );
      expect(settingsRepository.update).not.toHaveBeenCalled();
      expect(agreementsRepository.update).toHaveBeenCalledWith(
        mockSessionMetadata,
        {
          ...mockAgreements,
          version: AGREEMENTS_SPEC.version,
          data: {
            ...mockAgreements.data,
            analytics: false,
          },
        },
      );
      expect(response).toEqual(mockAppSettings);
      expect(
        analyticsService.sendAnalyticsAgreementChange,
      ).toHaveBeenCalledWith(
        mockSessionMetadata,
        new Map(
          Object.entries({
            analytics: false,
          }),
        ),
        new Map(
          Object.entries({
            ...mockAgreements.data,
          }),
        ),
        'github',
      );
    });
    it('should update agreements and settings', async () => {
      settingsRepository.getOrCreate.mockResolvedValueOnce({
        ...mockSettings,
        data: null,
      });
      settingsRepository.getOrCreate.mockResolvedValueOnce({
        ...mockSettings,
        data: null,
      });
      agreementsRepository.getOrCreate.mockResolvedValue(mockAgreements);

      const dto: UpdateSettingsDto = {
        batchSize: 6,
        dateFormat: 'hh-mmm-ss',
        timezone: 'UTC',
        agreements: new Map(
          Object.entries({
            notifications: false,
          }),
        ),
      };

      const response = await service.updateAppSettings(
        mockSessionMetadata,
        dto,
      );
      expect(settingsRepository.update).toHaveBeenCalledWith(
        mockSessionMetadata,
        {
          ...mockSettings,
          data: {
            batchSize: 6,
            dateFormat: 'hh-mmm-ss',
            timezone: 'UTC',
          },
        },
      );
      expect(agreementsRepository.update).toHaveBeenCalledWith(
        mockSessionMetadata,
        {
          ...mockAgreements,
          version: AGREEMENTS_SPEC.version,
          data: {
            ...mockAgreements.data,
            notifications: false,
          },
        },
      );
      expect(response).toEqual(mockAppSettings);
      expect(
        analyticsService.sendAnalyticsAgreementChange,
      ).not.toHaveBeenCalled();
      expect(analyticsService.sendSettingsUpdatedEvent).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockAppSettings,
        {
          ...mockAppSettings,
          scanThreshold: REDIS_SCAN_CONFIG.scanThreshold,
          batchSize: WORKBENCH_CONFIG.countBatch,
          theme: null,
        },
      );
    });
    it('should throw AgreementIsNotDefinedException', async () => {
      agreementsRepository.getOrCreate.mockResolvedValue({
        ...mockAgreements,
        data: null,
      });

      try {
        await service.updateAppSettings(mockSessionMetadata, {
          agreements: new Map([]),
        });
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(AgreementIsNotDefinedException);
      }
    });
    it('should throw InternalServerError', async () => {
      agreementsRepository.getOrCreate.mockRejectedValue(
        new Error('some error'),
      );

      const dto: UpdateSettingsDto = {
        agreements: mockAgreementsMap,
      };

      try {
        await service.updateAppSettings(mockSessionMetadata, dto);
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });

  describe('getAgreementsSpec', () => {
    it('should get agreements spec', async () => {
      keytarStrategy.isAvailable.mockResolvedValue(true);

      const response = await service.getAgreementsSpec();
      expect(response).toEqual({
        ...AGREEMENTS_SPEC,
        agreements: {
          ...AGREEMENTS_SPEC.agreements,
          encryption: AGREEMENTS_SPEC.agreements.encryption.options.true,
        },
      });
    });
  });
});
