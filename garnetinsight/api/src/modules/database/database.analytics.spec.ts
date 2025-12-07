import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  mockDatabase,
  mockDatabaseWithTlsAuth,
  mockRedisGeneralInfo,
  mockSessionMetadata,
} from 'src/__mocks__';
import { TelemetryEvents } from 'src/constants';
import { DEFAULT_SUMMARY as DEFAULT_REDIS_MODULES_SUMMARY } from 'src/utils/redis-modules-summary';
import { DatabaseAnalytics } from 'src/modules/database/database.analytics';
import {
  Encoding,
  HostingProvider,
} from 'src/modules/database/entities/database.entity';

describe('DatabaseAnalytics', () => {
  let service: DatabaseAnalytics;
  let sendEventSpy;
  let sendFailedEventSpy;
  const httpException = new InternalServerErrorException();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventEmitter2, DatabaseAnalytics],
    }).compile();

    service = await module.get(DatabaseAnalytics);
    sendEventSpy = jest.spyOn(service as any, 'sendEvent');
    sendFailedEventSpy = jest.spyOn(service as any, 'sendFailedEvent');
  });

  describe('sendInstanceAddedEvent', () => {
    it('should emit event with enabled tls and sni, and ssh', () => {
      service.sendInstanceAddedEvent(
        mockSessionMetadata,
        {
          ...mockDatabaseWithTlsAuth,
          ssh: true,
        },
        mockRedisGeneralInfo,
      );

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RedisInstanceAdded,
        {
          databaseId: mockDatabaseWithTlsAuth.id,
          connectionType: mockDatabaseWithTlsAuth.connectionType,
          provider: mockDatabaseWithTlsAuth.provider,
          useTLS: 'enabled',
          verifyTLSCertificate: 'enabled',
          useTLSAuthClients: 'enabled',
          useSNI: 'enabled',
          useSSH: 'enabled',
          version: mockRedisGeneralInfo.version,
          numberOfKeys: mockRedisGeneralInfo.totalKeys,
          numberOfKeysRange: '0 - 500 000',
          totalMemory: mockRedisGeneralInfo.usedMemory,
          numberedDatabases: mockRedisGeneralInfo.databases,
          numberOfModules: 0,
          timeout: mockDatabaseWithTlsAuth.timeout / 1_000, // milliseconds to seconds
          databaseIndex: 0,
          forceStandalone: 'false',
          useDecompression: mockDatabaseWithTlsAuth.compressor,
          serverName: 'valkey',
          keyNameFormat: Encoding.UNICODE,
          ...DEFAULT_REDIS_MODULES_SUMMARY,
        },
      );
    });
    it('should emit event with disabled tls and sni', () => {
      const instance = {
        ...mockDatabase,
      };

      service.sendInstanceAddedEvent(
        mockSessionMetadata,
        instance,
        mockRedisGeneralInfo,
      );

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RedisInstanceAdded,
        {
          databaseId: instance.id,
          connectionType: instance.connectionType,
          provider: instance.provider,
          useTLS: 'disabled',
          verifyTLSCertificate: 'disabled',
          useTLSAuthClients: 'disabled',
          useSNI: 'disabled',
          useSSH: 'disabled',
          version: mockRedisGeneralInfo.version,
          numberOfKeys: mockRedisGeneralInfo.totalKeys,
          numberOfKeysRange: '0 - 500 000',
          totalMemory: mockRedisGeneralInfo.usedMemory,
          numberedDatabases: mockRedisGeneralInfo.databases,
          numberOfModules: 0,
          timeout: mockDatabaseWithTlsAuth.timeout / 1_000, // milliseconds to seconds
          databaseIndex: 0,
          forceStandalone: 'false',
          useDecompression: mockDatabaseWithTlsAuth.compressor,
          serverName: 'valkey',
          keyNameFormat: Encoding.UNICODE,
          ...DEFAULT_REDIS_MODULES_SUMMARY,
        },
      );
    });
    it('should emit event without additional info', () => {
      const instance = {
        ...mockDatabaseWithTlsAuth,
        modules: [
          { name: 'search', version: 20000 },
          { name: 'rediSQL', version: 1 },
        ],
      };
      service.sendInstanceAddedEvent(mockSessionMetadata, instance, {
        version: mockRedisGeneralInfo.version,
      });

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RedisInstanceAdded,
        {
          databaseId: instance.id,
          connectionType: instance.connectionType,
          provider: instance.provider,
          useTLS: 'enabled',
          verifyTLSCertificate: 'enabled',
          useTLSAuthClients: 'enabled',
          useSNI: 'enabled',
          useSSH: 'disabled',
          version: mockRedisGeneralInfo.version,
          numberOfKeys: undefined,
          numberOfKeysRange: undefined,
          totalMemory: undefined,
          numberedDatabases: undefined,
          numberOfModules: 2,
          timeout: mockDatabaseWithTlsAuth.timeout / 1_000, // milliseconds to seconds
          databaseIndex: 0,
          forceStandalone: 'false',
          useDecompression: mockDatabaseWithTlsAuth.compressor,
          keyNameFormat: Encoding.UNICODE,
          ...DEFAULT_REDIS_MODULES_SUMMARY,
          RediSearch: {
            loaded: true,
            version: 20000,
          },
          customModules: [{ name: 'rediSQL', version: 1 }],
          serverName: null,
        },
      );
    });
    it('should emit event without db index', () => {
      const instance = {
        ...mockDatabaseWithTlsAuth,
        db: 2,
        modules: [
          { name: 'search', version: 20000 },
          { name: 'rediSQL', version: 1 },
        ],
      };
      service.sendInstanceAddedEvent(mockSessionMetadata, instance, {
        version: mockRedisGeneralInfo.version,
      });

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RedisInstanceAdded,
        {
          databaseId: instance.id,
          connectionType: instance.connectionType,
          provider: instance.provider,
          useTLS: 'enabled',
          verifyTLSCertificate: 'enabled',
          useTLSAuthClients: 'enabled',
          useSNI: 'enabled',
          useSSH: 'disabled',
          version: mockRedisGeneralInfo.version,
          numberOfKeys: undefined,
          numberOfKeysRange: undefined,
          totalMemory: undefined,
          numberedDatabases: undefined,
          numberOfModules: 2,
          timeout: mockDatabaseWithTlsAuth.timeout / 1_000, // milliseconds to seconds
          databaseIndex: 2,
          forceStandalone: 'false',
          useDecompression: mockDatabaseWithTlsAuth.compressor,
          keyNameFormat: Encoding.UNICODE,
          ...DEFAULT_REDIS_MODULES_SUMMARY,
          RediSearch: {
            loaded: true,
            version: 20000,
          },
          customModules: [{ name: 'rediSQL', version: 1 }],
          serverName: null,
        },
      );
    });

    it('should emit event with keyNameFormat', () => {
      service.sendInstanceAddedEvent(
        mockSessionMetadata,
        {
          ...mockDatabaseWithTlsAuth,
          keyNameFormat: Encoding.HEX,
        },
        mockRedisGeneralInfo,
      );

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RedisInstanceAdded,
        expect.objectContaining({
          keyNameFormat: Encoding.HEX,
        }),
      );
    });
  });

  describe('sendInstanceEditedEvent', () => {
    it('should emit event for manual update by user with disabled tls', () => {
      const prev = mockDatabaseWithTlsAuth;
      const cur = {
        ...mockDatabaseWithTlsAuth,
        provider: HostingProvider.REDIS_SOFTWARE,
        tls: undefined,
        verifyServerCert: false,
        caCert: null,
        clientCert: null,
      };
      service.sendInstanceEditedEvent(mockSessionMetadata, prev, cur);

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RedisInstanceEditedByUser,
        {
          databaseId: cur.id,
          connectionType: cur.connectionType,
          provider: HostingProvider.REDIS_SOFTWARE,
          useTLS: 'disabled',
          verifyTLSCertificate: 'disabled',
          useTLSAuthClients: 'disabled',
          useSNI: 'enabled',
          useSSH: 'disabled',
          timeout: mockDatabaseWithTlsAuth.timeout / 1_000, // milliseconds to seconds
          useDecompression: mockDatabaseWithTlsAuth.compressor,
          forceStandalone: 'false',
          keyNameFormat: Encoding.UNICODE,
          previousValues: {
            connectionType: prev.connectionType,
            provider: prev.provider,
            useTLS: 'enabled',
            verifyTLSCertificate: 'enabled',
            useTLSAuthClients: 'enabled',
            useSNI: 'enabled',
            useSSH: 'disabled',
            forceStandalone: 'false',
            keyNameFormat: Encoding.UNICODE,
          },
        },
      );
    });
    it('should emit event for manual update by user with enabled tls', () => {
      const prev = {
        ...mockDatabase,
        tls: undefined,
      };
      const cur = {
        ...mockDatabaseWithTlsAuth,
        provider: HostingProvider.REDIS_SOFTWARE,
      };
      service.sendInstanceEditedEvent(mockSessionMetadata, prev, cur);

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RedisInstanceEditedByUser,
        {
          databaseId: cur.id,
          connectionType: cur.connectionType,
          provider: HostingProvider.REDIS_SOFTWARE,
          useTLS: 'enabled',
          verifyTLSCertificate: 'enabled',
          useTLSAuthClients: 'enabled',
          useSNI: 'enabled',
          useSSH: 'disabled',
          timeout: mockDatabaseWithTlsAuth.timeout / 1_000, // milliseconds to seconds
          useDecompression: mockDatabaseWithTlsAuth.compressor,
          forceStandalone: 'false',
          keyNameFormat: Encoding.UNICODE,
          previousValues: {
            connectionType: prev.connectionType,
            provider: prev.provider,
            useTLS: 'disabled',
            useSNI: 'disabled',
            useSSH: 'disabled',
            verifyTLSCertificate: 'disabled',
            useTLSAuthClients: 'disabled',
            forceStandalone: 'false',
            keyNameFormat: Encoding.UNICODE,
          },
        },
      );
    });

    it('should emit event with forceStandalone included', () => {
      const prev = {
        ...mockDatabase,
      };
      const cur = {
        ...mockDatabase,
        forceStandalone: true,
      };
      service.sendInstanceEditedEvent(mockSessionMetadata, prev, cur);

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RedisInstanceEditedByUser,
        {
          databaseId: cur.id,
          connectionType: cur.connectionType,
          provider: undefined,
          useTLS: 'disabled',
          verifyTLSCertificate: 'disabled',
          useTLSAuthClients: 'disabled',
          useSNI: 'disabled',
          useSSH: 'disabled',
          timeout: mockDatabaseWithTlsAuth.timeout / 1_000, // milliseconds to seconds
          useDecompression: mockDatabaseWithTlsAuth.compressor,
          forceStandalone: 'true',
          keyNameFormat: Encoding.UNICODE,
          previousValues: {
            connectionType: prev.connectionType,
            provider: prev.provider,
            useTLS: 'disabled',
            useSNI: 'disabled',
            useSSH: 'disabled',
            verifyTLSCertificate: 'disabled',
            useTLSAuthClients: 'disabled',
            forceStandalone: 'false',
            keyNameFormat: Encoding.UNICODE,
          },
        },
      );
    });

    it('should emit event with forceStandalone not included', () => {
      const prev = {
        ...mockDatabase,
      };
      const cur = {
        ...mockDatabase,
        forceStandalone: undefined,
      };
      service.sendInstanceEditedEvent(mockSessionMetadata, prev, cur);

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RedisInstanceEditedByUser,
        {
          databaseId: cur.id,
          connectionType: cur.connectionType,
          provider: undefined,
          useTLS: 'disabled',
          verifyTLSCertificate: 'disabled',
          useTLSAuthClients: 'disabled',
          useSNI: 'disabled',
          useSSH: 'disabled',
          timeout: mockDatabaseWithTlsAuth.timeout / 1_000, // milliseconds to seconds
          useDecompression: mockDatabaseWithTlsAuth.compressor,
          forceStandalone: 'false',
          keyNameFormat: Encoding.UNICODE,
          previousValues: {
            connectionType: prev.connectionType,
            provider: prev.provider,
            useTLS: 'disabled',
            useSNI: 'disabled',
            useSSH: 'disabled',
            verifyTLSCertificate: 'disabled',
            useTLSAuthClients: 'disabled',
            forceStandalone: 'false',
            keyNameFormat: Encoding.UNICODE,
          },
        },
      );
    });

    it('should emit event with forceStandalone true for curr and prev', () => {
      const prev = {
        ...mockDatabase,
        forceStandalone: true,
      };
      const cur = {
        ...mockDatabase,
        forceStandalone: true,
      };
      service.sendInstanceEditedEvent(mockSessionMetadata, prev, cur);

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RedisInstanceEditedByUser,
        {
          databaseId: cur.id,
          connectionType: cur.connectionType,
          provider: undefined,
          useTLS: 'disabled',
          verifyTLSCertificate: 'disabled',
          useTLSAuthClients: 'disabled',
          useSNI: 'disabled',
          useSSH: 'disabled',
          timeout: mockDatabaseWithTlsAuth.timeout / 1_000, // milliseconds to seconds
          useDecompression: mockDatabaseWithTlsAuth.compressor,
          forceStandalone: 'true',
          keyNameFormat: Encoding.UNICODE,
          previousValues: {
            connectionType: prev.connectionType,
            provider: prev.provider,
            useTLS: 'disabled',
            useSNI: 'disabled',
            useSSH: 'disabled',
            verifyTLSCertificate: 'disabled',
            useTLSAuthClients: 'disabled',
            forceStandalone: 'true',
            keyNameFormat: Encoding.UNICODE,
          },
        },
      );
    });

    it('should emit event when keyNameFormat is changed', () => {
      const prev = mockDatabaseWithTlsAuth;
      const cur = {
        ...mockDatabaseWithTlsAuth,
        provider: HostingProvider.REDIS_SOFTWARE,
        tls: undefined,
        verifyServerCert: false,
        caCert: null,
        clientCert: null,
        keyNameFormat: Encoding.HEX,
      };
      service.sendInstanceEditedEvent(mockSessionMetadata, prev, cur);

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RedisInstanceEditedByUser,
        {
          databaseId: cur.id,
          connectionType: cur.connectionType,
          provider: HostingProvider.REDIS_SOFTWARE,
          useTLS: 'disabled',
          verifyTLSCertificate: 'disabled',
          useTLSAuthClients: 'disabled',
          useSNI: 'enabled',
          useSSH: 'disabled',
          timeout: mockDatabaseWithTlsAuth.timeout / 1_000, // milliseconds to seconds
          useDecompression: mockDatabaseWithTlsAuth.compressor,
          forceStandalone: 'false',
          keyNameFormat: Encoding.HEX,
          previousValues: {
            connectionType: prev.connectionType,
            provider: prev.provider,
            useTLS: 'enabled',
            verifyTLSCertificate: 'enabled',
            useTLSAuthClients: 'enabled',
            useSNI: 'enabled',
            useSSH: 'disabled',
            forceStandalone: 'false',
            keyNameFormat: Encoding.UNICODE,
          },
        },
      );
    });

    it('should not emit event if instance updated not by user', () => {
      const prev = mockDatabaseWithTlsAuth;
      const cur = {
        ...mockDatabase,
        provider: HostingProvider.REDIS_SOFTWARE,
        tls: undefined,
      };
      service.sendInstanceEditedEvent(mockSessionMetadata, prev, cur, false);

      expect(sendEventSpy).not.toHaveBeenCalled();
    });
  });

  describe('sendInstanceAddFailedEvent', () => {
    it('should emit AddFailed event', () => {
      service.sendInstanceAddFailedEvent(mockSessionMetadata, httpException);

      expect(sendFailedEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RedisInstanceAddFailed,
        httpException,
      );
    });
  });

  describe('sendInstanceDeletedEvent', () => {
    it('should emit Deleted event', () => {
      service.sendInstanceDeletedEvent(mockSessionMetadata, mockDatabase);

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RedisInstanceDeleted,
        {
          databaseId: mockDatabase.id,
          provider: mockDatabase.provider,
        },
      );
    });
  });

  describe('sendConnectionFailedEvent', () => {
    it('should emit ConnectionFailed event', () => {
      service.sendConnectionFailedEvent(
        mockSessionMetadata,
        mockDatabase,
        httpException,
      );

      expect(sendFailedEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RedisInstanceConnectionFailed,
        httpException,
        {
          databaseId: mockDatabase.id,
        },
      );
    });
  });

  describe('sendDatabaseConnectedClientListEvent', () => {
    it('should emit event', () => {
      service.sendDatabaseConnectedClientListEvent(mockSessionMetadata, {
        databaseId: mockDatabase.id,
        version: mockDatabase.version,
        resp: '2',
      });

      expect(sendEventSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.DatabaseConnectedClientList,
        {
          databaseId: mockDatabase.id,
          version: mockDatabase.version,
          resp: '2',
        },
      );
    });
  });
});
