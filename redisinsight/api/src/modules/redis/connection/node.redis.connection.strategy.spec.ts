import { Test } from '@nestjs/testing';
import * as redis from 'redis';
import * as tlsUtil from 'src/modules/redis/utils/tls.util';
import {
  mockCaCertificateCertificatePlain,
  mockClientCertificateCertificatePlain,
  mockClientCertificateKeyPlain,
  mockClientMetadata,
  mockDatabase,
  mockDatabaseWithTlsAuth,
  mockDatabaseWithTlsCertPaths,
  mockSshTunnelProvider,
} from 'src/__mocks__';
import { SshTunnelProvider } from 'src/modules/ssh/ssh-tunnel.provider';
import { NodeRedisConnectionStrategy } from 'src/modules/redis/connection/node.redis.connection.strategy';
import { StandaloneNodeRedisClient } from 'src/modules/redis/client/node-redis/standalone.node-redis.client';

jest.mock('redis', () => ({
  ...jest.requireActual('redis'),
  createClient: jest.fn(),
}));

jest.mock('src/modules/redis/utils/tls.util', () => ({
  getCertificateContent: jest.fn(),
  getKeyContent: jest.fn(),
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
    it('should include family: 0 in socket options for dual-stack IPv4/IPv6 support', async () => {
      const mockClient = {
        on: jest.fn().mockReturnThis(),
        connect: jest.fn().mockResolvedValue(undefined),
      };
      createClientSpy.mockReturnValue(mockClient);

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
  });

  describe('getTLSConfig', () => {
    const mockGetCertificateContent =
      tlsUtil.getCertificateContent as jest.Mock;
    const mockGetKeyContent = tlsUtil.getKeyContent as jest.Mock;

    beforeEach(() => {
      mockGetCertificateContent.mockReset();
      mockGetKeyContent.mockReset();
    });

    it('should use getCertificateContent and getKeyContent utilities', async () => {
      mockGetCertificateContent
        .mockResolvedValueOnce(mockCaCertificateCertificatePlain)
        .mockResolvedValueOnce(mockClientCertificateCertificatePlain);
      mockGetKeyContent.mockResolvedValue(mockClientCertificateKeyPlain);

      const result = await service['getTLSConfig'](mockDatabaseWithTlsAuth);

      expect(mockGetCertificateContent).toHaveBeenCalledTimes(2);
      expect(mockGetCertificateContent).toHaveBeenCalledWith(
        mockDatabaseWithTlsAuth.caCert,
      );
      expect(mockGetCertificateContent).toHaveBeenCalledWith(
        mockDatabaseWithTlsAuth.clientCert,
      );
      expect(mockGetKeyContent).toHaveBeenCalledWith(
        mockDatabaseWithTlsAuth.clientCert,
      );
      expect(result).toEqual(
        expect.objectContaining({
          ca: [mockCaCertificateCertificatePlain],
          cert: mockClientCertificateCertificatePlain,
          key: mockClientCertificateKeyPlain,
        }),
      );
    });

    it('should handle CA certificate only (no client cert)', async () => {
      mockGetCertificateContent.mockResolvedValue(
        mockCaCertificateCertificatePlain,
      );

      const result = await service['getTLSConfig'](
        mockDatabaseWithTlsCertPaths,
      );

      expect(mockGetCertificateContent).toHaveBeenCalledTimes(1);
      expect(mockGetKeyContent).not.toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          ca: [mockCaCertificateCertificatePlain],
        }),
      );
    });

    it('should throw error when getCertificateContent fails', async () => {
      const fileError = new Error('ENOENT: no such file or directory');
      mockGetCertificateContent.mockRejectedValue(fileError);

      await expect(
        service['getTLSConfig'](mockDatabaseWithTlsCertPaths),
      ).rejects.toThrow(fileError);
    });

    it('should include basic TLS config options', async () => {
      mockGetCertificateContent
        .mockResolvedValueOnce(mockCaCertificateCertificatePlain)
        .mockResolvedValueOnce(mockClientCertificateCertificatePlain);
      mockGetKeyContent.mockResolvedValue(mockClientCertificateKeyPlain);

      const result = await service['getTLSConfig'](mockDatabaseWithTlsAuth);

      expect(result).toEqual(
        expect.objectContaining({
          rejectUnauthorized: mockDatabaseWithTlsAuth.verifyServerCert,
          servername: mockDatabaseWithTlsAuth.tlsServername,
        }),
      );
      expect(result.checkServerIdentity).toBeDefined();
    });
  });
});
