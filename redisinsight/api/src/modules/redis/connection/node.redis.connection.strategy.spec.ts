import { Test } from '@nestjs/testing';
import * as redis from 'redis';
import {
  mockClientMetadata,
  mockDatabase,
  mockDatabaseWithTlsAuth,
  mockSshTunnelProvider,
} from 'src/__mocks__';
import { SshTunnelProvider } from 'src/modules/ssh/ssh-tunnel.provider';
import { NodeRedisConnectionStrategy } from 'src/modules/redis/connection/node.redis.connection.strategy';
import { StandaloneNodeRedisClient } from 'src/modules/redis/client/node-redis/standalone.node-redis.client';
import { RedisConnectionFamily } from 'src/modules/database/entities/database.entity';
import { Database } from 'src/modules/database/models/database';
import serverConfig from 'src/utils/config';

jest.mock('redis', () => ({
  ...jest.requireActual('redis'),
  createClient: jest.fn(),
}));

describe('NodeRedisConnectionStrategy', () => {
  let service: NodeRedisConnectionStrategy;
  let createClientSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        NodeRedisConnectionStrategy,
        {
          provide: SshTunnelProvider,
          useFactory: mockSshTunnelProvider,
        },
      ],
    }).compile();

    service = module.get(NodeRedisConnectionStrategy);

    createClientSpy = jest.spyOn(redis, 'createClient');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createStandaloneClient', () => {
    const mockCreateClient = () => {
      const mockClient = {
        on: jest.fn().mockReturnThis(),
        connect: jest.fn().mockResolvedValue(undefined),
      };
      createClientSpy.mockReturnValue(mockClient);
    };

    it('should default to family: 0 (dual-stack IPv4/IPv6) when not set', async () => {
      mockCreateClient();

      const result = await service.createStandaloneClient(
        mockClientMetadata,
        mockDatabase,
        {},
      );

      expect(result).toBeInstanceOf(StandaloneNodeRedisClient);
      expect(createClientSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          socket: expect.objectContaining({
            family: 0,
          }),
        }),
      );
    });

    it('should map connection family IPv4 to socket family: 4', async () => {
      mockCreateClient();

      await service.createStandaloneClient(
        mockClientMetadata,
        { ...mockDatabase, connectionFamily: RedisConnectionFamily.IPv4 },
        {},
      );

      expect(createClientSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          socket: expect.objectContaining({ family: 4 }),
        }),
      );
    });

    it('should map connection family IPv6 to socket family: 6', async () => {
      mockCreateClient();

      await service.createStandaloneClient(
        mockClientMetadata,
        { ...mockDatabase, connectionFamily: RedisConnectionFamily.IPv6 },
        {},
      );

      expect(createClientSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          socket: expect.objectContaining({ family: 6 }),
        }),
      );
    });
  });

  describe('getTLSConfig', () => {
    it('should reject unauthorized when verifyServerCert is true', async () => {
      const config = await service['getTLSConfig']({
        ...mockDatabaseWithTlsAuth,
        verifyServerCert: true,
      });

      expect(config.rejectUnauthorized).toEqual(true);
    });

    it.each([false, undefined, null])(
      'should not reject unauthorized when verifyServerCert is %s',
      async (verifyServerCert) => {
        const config = await service['getTLSConfig']({
          ...mockDatabaseWithTlsAuth,
          verifyServerCert,
        } as Database);

        expect(config.rejectUnauthorized).toEqual(false);
      },
    );

    describe('hostname verification', () => {
      const REDIS_CLIENTS_CONFIG = serverConfig.get('redis_clients');
      const mismatchedCert = { subject: { CN: 'other.example.com' } } as any;
      let initialSkip: boolean;

      beforeEach(() => {
        initialSkip = REDIS_CLIENTS_CONFIG.skipTlsHostnameVerification;
      });

      afterEach(() => {
        REDIS_CLIENTS_CONFIG.skipTlsHostnameVerification = initialSkip;
      });

      it('should use the default hostname check when the certificate is verified', async () => {
        REDIS_CLIENTS_CONFIG.skipTlsHostnameVerification = false;

        const config = await service['getTLSConfig']({
          ...mockDatabaseWithTlsAuth,
          verifyServerCert: true,
        });

        expect(config.checkServerIdentity).toBeUndefined();
      });

      it('should accept any hostname when the opt-out is set', async () => {
        REDIS_CLIENTS_CONFIG.skipTlsHostnameVerification = true;

        const config = await service['getTLSConfig']({
          ...mockDatabaseWithTlsAuth,
          verifyServerCert: true,
        });

        expect(config.rejectUnauthorized).toEqual(true);
        expect(config.checkServerIdentity).toBeDefined();
        expect(
          config.checkServerIdentity?.('redis.example.com', mismatchedCert),
        ).toBeUndefined();
      });

      it.each([false, undefined, null])(
        'should accept any hostname when verifyServerCert is %s',
        async (verifyServerCert) => {
          REDIS_CLIENTS_CONFIG.skipTlsHostnameVerification = false;

          const config = await service['getTLSConfig']({
            ...mockDatabaseWithTlsAuth,
            verifyServerCert,
          } as Database);

          expect(config.checkServerIdentity).toBeDefined();
          expect(
            config.checkServerIdentity?.('redis.example.com', mismatchedCert),
          ).toBeUndefined();
        },
      );

      describe('through an SSH tunnel', () => {
        const certFor = (name: string) =>
          ({
            subject: { CN: name },
            subjectaltname: `DNS:${name}`,
          }) as any;
        const sshDatabase = {
          ...mockDatabaseWithTlsAuth,
          host: 'redis.example.com',
          ssh: true,
          tlsServername: undefined,
          verifyServerCert: true,
        } as Database;

        beforeEach(() => {
          REDIS_CLIENTS_CONFIG.skipTlsHostnameVerification = false;
        });

        it('should check the certificate against the database host, not the tunnel address', async () => {
          const config = await service['getTLSConfig'](sshDatabase);

          expect(
            config.checkServerIdentity?.(
              '127.0.0.1',
              certFor('redis.example.com'),
            ),
          ).toBeUndefined();
          expect(
            config.checkServerIdentity?.(
              '127.0.0.1',
              certFor('other.example.com'),
            ),
          ).toMatchObject({ code: 'ERR_TLS_CERT_ALTNAME_INVALID' });
        });

        it('should prefer the TLS server name over the database host', async () => {
          const config = await service['getTLSConfig']({
            ...sshDatabase,
            tlsServername: 'cert.example.com',
          });

          expect(
            config.checkServerIdentity?.(
              '127.0.0.1',
              certFor('cert.example.com'),
            ),
          ).toBeUndefined();
          expect(
            config.checkServerIdentity?.(
              '127.0.0.1',
              certFor('redis.example.com'),
            ),
          ).toMatchObject({ code: 'ERR_TLS_CERT_ALTNAME_INVALID' });
        });

        it('should accept any hostname when the opt-out is set', async () => {
          REDIS_CLIENTS_CONFIG.skipTlsHostnameVerification = true;

          const config = await service['getTLSConfig'](sshDatabase);

          expect(
            config.checkServerIdentity?.(
              '127.0.0.1',
              certFor('other.example.com'),
            ),
          ).toBeUndefined();
        });
      });
    });
  });
});
