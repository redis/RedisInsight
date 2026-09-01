import { Test, TestingModule } from '@nestjs/testing';
import { RdiClientProvider } from 'src/modules/rdi/providers/rdi.client.provider';
import { mockRdiClientMetadata, mockRdiClientProvider } from 'src/__mocks__';
import { RdiProxyService } from './rdi-proxy.service';

describe('RdiProxyService', () => {
  let service: RdiProxyService;
  let rdiClientProvider: ReturnType<typeof mockRdiClientProvider>;
  let client: { proxyRequest: jest.Mock; setLastUsed: jest.Mock };

  beforeEach(async () => {
    client = {
      proxyRequest: jest.fn(),
      setLastUsed: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RdiProxyService,
        {
          provide: RdiClientProvider,
          useFactory: mockRdiClientProvider,
        },
      ],
    }).compile();

    service = module.get(RdiProxyService);
    rdiClientProvider = module.get(RdiClientProvider);
    rdiClientProvider.getOrCreate.mockResolvedValue(client);
  });

  describe('proxy', () => {
    it('should forward the request through the rdi client and mark it as used', async () => {
      client.proxyRequest.mockResolvedValueOnce({
        status: 200,
        headers: { 'content-type': 'application/json' },
        data: { ok: true },
      });

      const result = await service.proxy(mockRdiClientMetadata, {
        method: 'GET',
        path: 'api/v1/pipelines',
        headers: { authorization: 'Bearer client-token' },
      });

      expect(rdiClientProvider.getOrCreate).toHaveBeenCalledWith(
        mockRdiClientMetadata,
      );
      expect(client.proxyRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: 'api/v1/pipelines',
        }),
      );
      expect(client.setLastUsed).toHaveBeenCalled();
      expect(result).toEqual({
        status: 200,
        headers: { 'content-type': 'application/json' },
        data: { ok: true },
      });
    });

    it('should strip hop-by-hop and auth headers from the outgoing request', async () => {
      client.proxyRequest.mockResolvedValueOnce({
        status: 200,
        headers: {},
        data: null,
      });

      await service.proxy(mockRdiClientMetadata, {
        method: 'POST',
        path: 'api/v1/pipelines',
        headers: {
          host: 'redisinsight.local',
          cookie: 'session=abc',
          authorization: 'Bearer caller-token',
          'content-type': 'application/json',
        },
      });

      const forwardedRequest = client.proxyRequest.mock.calls[0][0];
      expect(forwardedRequest.headers).toEqual({
        'content-type': 'application/json',
      });
    });

    it('should strip transport-level headers from the response', async () => {
      client.proxyRequest.mockResolvedValueOnce({
        status: 200,
        headers: {
          connection: 'keep-alive',
          'content-length': '123',
          'set-cookie': 'session=abc',
          'content-type': 'application/json',
        },
        data: null,
      });

      const result = await service.proxy(mockRdiClientMetadata, {
        method: 'GET',
        path: 'api/v1/pipelines',
      });

      expect(result.headers).toEqual({ 'content-type': 'application/json' });
    });
  });
});
