import { when } from 'jest-when';
import { Test, TestingModule } from '@nestjs/testing';
import {
  mockAutoDatabaseDiscoveryService,
  mockPreSetupDatabaseDiscoveryService,
  mockSessionMetadata,
  mockSettingsService,
  MockType,
} from 'src/__mocks__';
import config, { Config } from 'src/utils/config';
import { PreSetupDatabaseDiscoveryService } from 'src/modules/database-discovery/pre-setup.database-discovery.service';
import { LocalDatabaseDiscoveryService } from 'src/modules/database-discovery/local.database-discovery.service';
import { AutoDatabaseDiscoveryService } from 'src/modules/database-discovery/auto.database-discovery.service';
import { SettingsService } from 'src/modules/settings/settings.service';

jest.mock(
  'src/utils/config',
  jest.fn(() => jest.requireActual('src/utils/config') as object),
);

const mockServerConfig = config.get('server') as Config['server'];

describe('PreSetupDatabaseDiscoveryService', () => {
  let service: LocalDatabaseDiscoveryService;
  let settingsService: MockType<SettingsService>;
  let preSetupDatabaseDiscoveryService: MockType<PreSetupDatabaseDiscoveryService>;
  let autoDatabaseDiscoveryService: MockType<AutoDatabaseDiscoveryService>;
  let configGetSpy: jest.SpyInstance;

  beforeEach(async () => {
    jest.clearAllMocks();

    configGetSpy = jest.spyOn(config, 'get');

    mockServerConfig.buildType = 'ELECTRON';
    when(configGetSpy).calledWith('server').mockReturnValue(mockServerConfig);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalDatabaseDiscoveryService,
        {
          provide: SettingsService,
          useFactory: mockSettingsService,
        },
        {
          provide: PreSetupDatabaseDiscoveryService,
          useFactory: mockPreSetupDatabaseDiscoveryService,
        },
        {
          provide: AutoDatabaseDiscoveryService,
          useFactory: mockAutoDatabaseDiscoveryService,
        },
      ],
    }).compile();

    service = module.get(LocalDatabaseDiscoveryService);
    settingsService = module.get(SettingsService);
    preSetupDatabaseDiscoveryService = module.get(
      PreSetupDatabaseDiscoveryService,
    );
    autoDatabaseDiscoveryService = module.get(AutoDatabaseDiscoveryService);
  });

  describe('discover', () => {
    it('should skip when buildType = REDIS_STACK', async () => {
      mockServerConfig.buildType = 'REDIS_STACK';

      await expect(service.discover(mockSessionMetadata)).resolves.toEqual(
        undefined,
      );

      expect(settingsService.getAppSettings).not.toHaveBeenCalled();
      expect(preSetupDatabaseDiscoveryService.discover).not.toHaveBeenCalled();
      expect(autoDatabaseDiscoveryService.discover).not.toHaveBeenCalled();
    });

    it('should skip there is no eula consent', async () => {
      settingsService.getAppSettings.mockResolvedValueOnce({});

      await expect(service.discover(mockSessionMetadata)).resolves.toEqual(
        undefined,
      );

      expect(settingsService.getAppSettings).toHaveBeenCalledWith(
        mockSessionMetadata,
      );
      expect(preSetupDatabaseDiscoveryService.discover).not.toHaveBeenCalled();
      expect(autoDatabaseDiscoveryService.discover).not.toHaveBeenCalled();
    });

    it('should discover pre setup databases', async () => {
      settingsService.getAppSettings.mockResolvedValueOnce({
        agreements: { eula: true },
      });
      preSetupDatabaseDiscoveryService.discover.mockResolvedValueOnce({
        discovered: 3,
      });

      await expect(service.discover(mockSessionMetadata)).resolves.toEqual(
        undefined,
      );

      expect(settingsService.getAppSettings).toHaveBeenCalledWith(
        mockSessionMetadata,
      );
      expect(preSetupDatabaseDiscoveryService.discover).toHaveBeenCalledWith(
        mockSessionMetadata,
      );
      expect(autoDatabaseDiscoveryService.discover).not.toHaveBeenCalled();
    });

    it('should discover pre setup databases and not auto discover on first start', async () => {
      settingsService.getAppSettings.mockResolvedValueOnce({
        agreements: { eula: true },
      });
      preSetupDatabaseDiscoveryService.discover.mockResolvedValueOnce({
        discovered: 3,
      });

      await expect(
        service.discover(mockSessionMetadata, true),
      ).resolves.toEqual(undefined);

      expect(settingsService.getAppSettings).toHaveBeenCalledWith(
        mockSessionMetadata,
      );
      expect(preSetupDatabaseDiscoveryService.discover).toHaveBeenCalledWith(
        mockSessionMetadata,
      );
      expect(autoDatabaseDiscoveryService.discover).not.toHaveBeenCalled();
    });

    it('should not run auto discover when no pre setup databases discovered but it is not first start', async () => {
      settingsService.getAppSettings.mockResolvedValueOnce({
        agreements: { eula: true },
      });
      preSetupDatabaseDiscoveryService.discover.mockResolvedValueOnce({
        discovered: 0,
      });

      await expect(service.discover(mockSessionMetadata)).resolves.toEqual(
        undefined,
      );

      expect(settingsService.getAppSettings).toHaveBeenCalledWith(
        mockSessionMetadata,
      );
      expect(preSetupDatabaseDiscoveryService.discover).toHaveBeenCalledWith(
        mockSessionMetadata,
      );
      expect(autoDatabaseDiscoveryService.discover).not.toHaveBeenCalled();
    });

    it('should run auto discover when no pre setup databases discovered and it is first start', async () => {
      settingsService.getAppSettings.mockResolvedValueOnce({
        agreements: { eula: true },
      });
      preSetupDatabaseDiscoveryService.discover.mockResolvedValueOnce({
        discovered: 0,
      });

      await expect(
        service.discover(mockSessionMetadata, true),
      ).resolves.toEqual(undefined);

      expect(settingsService.getAppSettings).toHaveBeenCalledWith(
        mockSessionMetadata,
      );
      expect(preSetupDatabaseDiscoveryService.discover).toHaveBeenCalledWith(
        mockSessionMetadata,
      );
      expect(autoDatabaseDiscoveryService.discover).toHaveBeenCalledWith(
        mockSessionMetadata,
      );
    });

    it('should not fail inn case of any error', async () => {
      settingsService.getAppSettings.mockRejectedValueOnce(new Error());

      await expect(
        service.discover(mockSessionMetadata, true),
      ).resolves.toEqual(undefined);

      expect(settingsService.getAppSettings).toHaveBeenCalledWith(
        mockSessionMetadata,
      );
      expect(preSetupDatabaseDiscoveryService.discover).not.toHaveBeenCalled();
      expect(autoDatabaseDiscoveryService.discover).not.toHaveBeenCalled();
    });
  });
});
