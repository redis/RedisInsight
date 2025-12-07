import { when } from 'jest-when';
import { TestingModule, Test } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  mockEncryptionService,
  mockFeaturesConfigService,
  mockGetServerInfoResponse,
  mockServerRepository,
  mockSessionMetadata,
  MockType,
} from 'src/__mocks__';
import { ServerInfoNotFoundException } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { EncryptionStrategy } from 'src/modules/encryption/models';
import { ServerService } from 'src/modules/server/server.service';
import { ServerRepository } from 'src/modules/server/repositories/server.repository';
import { FeaturesConfigService } from 'src/modules/feature/features-config.service';
import { LocalServerService } from 'src/modules/server/local.server.service';
import { AppType, BuildType } from 'src/modules/server/models/server';
import config, { Config } from 'src/utils/config';

jest.mock(
  'src/utils/config',
  jest.fn(() => jest.requireActual('src/utils/config') as object),
);

const mockServerConfig = config.get('server') as Config['server'];

describe('LocalServerService', () => {
  let service: ServerService;
  let serverRepository: MockType<ServerRepository>;
  let eventEmitter: EventEmitter2;
  let encryptionService: MockType<EncryptionService>;
  let configGetSpy: jest.SpyInstance;

  beforeEach(async () => {
    jest.clearAllMocks();

    configGetSpy = jest.spyOn(config, 'get');

    mockServerConfig.buildType = BuildType.DockerOnPremise;
    mockServerConfig.appType = AppType.Docker;
    when(configGetSpy).calledWith('server').mockReturnValue(mockServerConfig);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventEmitter2,
        LocalServerService,
        {
          provide: ServerRepository,
          useFactory: mockServerRepository,
        },
        {
          provide: EncryptionService,
          useFactory: mockEncryptionService,
        },
        {
          provide: FeaturesConfigService,
          useFactory: mockFeaturesConfigService,
        },
      ],
    }).compile();

    serverRepository = module.get(ServerRepository);
    eventEmitter = module.get(EventEmitter2);
    encryptionService = module.get(EncryptionService);
    service = module.get(LocalServerService);
    jest.spyOn(eventEmitter, 'emit');
  });

  describe('init', () => {
    it('should create server instance on first application launch', async () => {
      serverRepository.exists.mockResolvedValueOnce(false);

      expect(await service.init()).toEqual(true);

      expect(serverRepository.exists).toHaveBeenCalled();
      expect(serverRepository.getOrCreate).toHaveBeenCalled();
    });
    it('should not create server instance on the second application launch', async () => {
      serverRepository.exists.mockResolvedValueOnce(true);

      expect(await service.init()).toEqual(false);

      expect(serverRepository.exists).toHaveBeenCalled();
      expect(serverRepository.getOrCreate).toHaveBeenCalled();
    });
  });

  describe('getInfo', () => {
    it('should return server info', async () => {
      encryptionService.getAvailableEncryptionStrategies.mockResolvedValue([
        EncryptionStrategy.PLAIN,
        EncryptionStrategy.KEYTAR,
      ]);
      const result = await service.getInfo(mockSessionMetadata);

      expect(result).toEqual({
        ...mockGetServerInfoResponse,
        sessionId: expect.any(Number),
        packageType: undefined, // should be undefined for non-electron applications
      });
    });
    it('should throw ServerInfoNotFoundException', async () => {
      serverRepository.getOrCreate.mockResolvedValue(null);

      try {
        await service.getInfo(mockSessionMetadata);
      } catch (err) {
        expect(err).toBeInstanceOf(ServerInfoNotFoundException);
        expect(err.message).toEqual(ERROR_MESSAGES.SERVER_INFO_NOT_FOUND());
      }
    });
    it('should throw InternalServerError', async () => {
      serverRepository.getOrCreate.mockRejectedValue(new Error('some error'));

      try {
        await service.getInfo(mockSessionMetadata);
        fail('Should throw an error');
      } catch (err) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });

  describe('getAppType', () => {
    afterEach(async () => {
      delete process.env.RI_APP_TYPE;
    });

    it('should return predefined appType via env variable', () => {
      mockServerConfig.appType = 'ELECTRON_ENTERPRISE';

      expect(ServerService.getAppType(BuildType.Electron)).toEqual(
        AppType.ElectronEnterprise,
      );
    });

    it('should return predefined appType via env variable (case insensitive)', () => {
      mockServerConfig.appType = 'elecTron_enterPrise';

      expect(ServerService.getAppType(BuildType.Electron)).toEqual(
        AppType.ElectronEnterprise,
      );
    });

    it('should determine app type based on input when type in app type env', () => {
      mockServerConfig.appType = 'electron_enterprise1';

      expect(ServerService.getAppType(BuildType.Electron)).toEqual(
        AppType.Electron,
      );
    });

    it('should determine app type based on input when no app type env defined', () => {
      mockServerConfig.appType = undefined;

      expect(ServerService.getAppType(BuildType.Electron)).toEqual(
        AppType.Electron,
      );
    });
  });
});
