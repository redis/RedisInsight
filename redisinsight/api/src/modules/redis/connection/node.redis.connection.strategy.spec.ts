import { Test } from '@nestjs/testing';
import * as redis from 'redis';
import * as fs from 'fs/promises';
import {
  mockCaCertificateCertificatePlain,
  mockCaCertificatePath,
  mockClientCertificateCertificatePlain,
  mockClientCertificateKeyPlain,
  mockClientCertificatePath,
  mockClientKeyPath,
  mockClientMetadata,
  mockDatabase,
  mockDatabaseWithTlsAuth,
  mockDatabaseWithTlsAuthCertPaths,
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

jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
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
    const mockReadFile = fs.readFile as jest.Mock;

    beforeEach(() => {
      mockReadFile.mockReset();
    });

    it('should use certificate content when no path is specified', async () => {
      const result = await service['getTLSConfig'](mockDatabaseWithTlsAuth);

      expect(mockReadFile).not.toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          ca: [mockCaCertificateCertificatePlain],
          cert: mockClientCertificateCertificatePlain,
          key: mockClientCertificateKeyPlain,
        }),
      );
    });

    it('should read CA certificate from file path when certificatePath is specified', async () => {
      const mockCertFromFile = '-----BEGIN CERTIFICATE-----\nFROM_FILE';
      mockReadFile.mockResolvedValue(mockCertFromFile);

      const result = await service['getTLSConfig'](
        mockDatabaseWithTlsCertPaths,
      );

      expect(mockReadFile).toHaveBeenCalledWith(mockCaCertificatePath, 'utf8');
      expect(result).toEqual(
        expect.objectContaining({
          ca: [mockCertFromFile],
        }),
      );
    });

    it('should read client certificate and key from file paths when paths are specified', async () => {
      const mockCertFromFile = '-----BEGIN CERTIFICATE-----\nCA_FROM_FILE';
      const mockClientCertFromFile =
        '-----BEGIN CERTIFICATE-----\nCLIENT_FROM_FILE';
      const mockKeyFromFile = '-----BEGIN PRIVATE KEY-----\nKEY_FROM_FILE';

      mockReadFile
        .mockResolvedValueOnce(mockCertFromFile)
        .mockResolvedValueOnce(mockClientCertFromFile)
        .mockResolvedValueOnce(mockKeyFromFile);

      const result = await service['getTLSConfig'](
        mockDatabaseWithTlsAuthCertPaths,
      );

      expect(mockReadFile).toHaveBeenCalledTimes(3);
      expect(mockReadFile).toHaveBeenCalledWith(mockCaCertificatePath, 'utf8');
      expect(mockReadFile).toHaveBeenCalledWith(
        mockClientCertificatePath,
        'utf8',
      );
      expect(mockReadFile).toHaveBeenCalledWith(mockClientKeyPath, 'utf8');
      expect(result).toEqual(
        expect.objectContaining({
          ca: [mockCertFromFile],
          cert: mockClientCertFromFile,
          key: mockKeyFromFile,
        }),
      );
    });

    it('should throw error when certificate file cannot be read', async () => {
      const fileError = new Error('ENOENT: no such file or directory');
      mockReadFile.mockRejectedValue(fileError);

      await expect(
        service['getTLSConfig'](mockDatabaseWithTlsCertPaths),
      ).rejects.toThrow(fileError);
    });

    it('should include basic TLS config options', async () => {
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
