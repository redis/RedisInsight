import { BadGatewayException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  MockType,
  generateMockRdiClient,
  mockRdiClientMetadata,
  mockRdiClientProvider,
} from 'src/__mocks__';
import { RdiClientProvider } from 'src/modules/rdi/providers/rdi.client.provider';
import { RdiProxyService } from 'src/modules/rdi/rdi-proxy.service';
import { RdiProxyRequest } from 'src/modules/rdi/models';

describe('RdiProxyService', () => {
  let service: RdiProxyService;
  let rdiClientProvider: MockType<RdiClientProvider>;
  let client: ReturnType<typeof generateMockRdiClient>;

  const request: RdiProxyRequest = {
    method: 'GET',
    path: 'api/v1/pipelines',
    headers: { 'content-type': 'application/json' },
  };

  const upstreamResponse = (overrides: Record<string, unknown> = {}) => ({
    status: 200,
    headers: { 'content-type': 'application/json' },
    body: Buffer.from('{"ok":true}'),
    ...overrides,
  });

  beforeEach(async () => {
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

    client = generateMockRdiClient(mockRdiClientMetadata);
    client.proxyRequest = jest.fn().mockResolvedValue(upstreamResponse());
    client.setLastUsed = jest.fn();
    rdiClientProvider.getOrCreate.mockResolvedValue(client);
  });

  describe('proxy', () => {
    it('Should forward the request through the client for the given instance', async () => {
      const result = await service.proxy(mockRdiClientMetadata, request);

      expect(rdiClientProvider.getOrCreate).toHaveBeenCalledWith(
        mockRdiClientMetadata,
      );
      expect(client.setLastUsed).toHaveBeenCalled();
      expect(result.status).toEqual(200);
      expect(result.body).toEqual(Buffer.from('{"ok":true}'));
    });

    it('Should forward only allowlisted request headers', async () => {
      await service.proxy(mockRdiClientMetadata, {
        ...request,
        headers: {
          'content-type': 'application/json',
          Accept: 'application/json',
          authorization: 'Bearer redisinsight-token',
          cookie: 'session=abc',
          'x-csrf-token': 'csrf',
          'x-window-id': 'window',
          host: 'localhost:5540',
          'content-length': '11',
          'content-encoding': 'gzip',
        },
      });

      expect(client.proxyRequest).toHaveBeenCalledWith({
        ...request,
        headers: {
          'content-type': 'application/json',
          Accept: 'application/json',
        },
      });
    });

    it('Should return only allowlisted response headers', async () => {
      client.proxyRequest = jest.fn().mockResolvedValue(
        upstreamResponse({
          headers: {
            'content-type': 'application/json',
            'set-cookie': 'rdi=1',
            'strict-transport-security': 'max-age=31536000',
            'clear-site-data': '"*"',
            'content-security-policy-report-only': "default-src 'none'",
            'report-to': 'https://attacker.example/report',
            nel: '{"report_to":"x"}',
            'access-control-allow-origin': 'https://attacker.example',
          },
        }),
      );

      const result = await service.proxy(mockRdiClientMetadata, request);

      expect(result.headers).toEqual({
        'content-type': 'application/json',
        'content-security-policy': 'sandbox',
        'x-content-type-options': 'nosniff',
      });
    });

    it('Should force a sandboxed csp over whatever the instance returned', async () => {
      client.proxyRequest = jest.fn().mockResolvedValue(
        upstreamResponse({
          headers: {
            'content-type': 'text/html',
            'content-security-policy': "default-src 'unsafe-inline'",
            'x-content-type-options': 'none',
          },
        }),
      );

      const result = await service.proxy(mockRdiClientMetadata, request);

      expect(result.headers['content-security-policy']).toEqual('sandbox');
      expect(result.headers['x-content-type-options']).toEqual('nosniff');
    });

    it('Should reject an upstream redirect instead of forwarding it', async () => {
      client.proxyRequest = jest.fn().mockResolvedValue(
        upstreamResponse({
          status: 302,
          headers: { location: 'https://attacker.example/' },
        }),
      );

      await expect(
        service.proxy(mockRdiClientMetadata, request),
      ).rejects.toThrow(BadGatewayException);
    });

    it.each([301, 302, 303, 307, 308])(
      'Should reject upstream redirect status %i',
      async (status) => {
        client.proxyRequest = jest.fn().mockResolvedValue(
          upstreamResponse({
            status,
            headers: { location: 'https://attacker.example/' },
          }),
        );

        await expect(
          service.proxy(mockRdiClientMetadata, request),
        ).rejects.toThrow(BadGatewayException);
      },
    );

    it.each([300, 304])(
      'Should pass non-redirect 3xx status %i through without its location',
      async (status) => {
        client.proxyRequest = jest.fn().mockResolvedValue(
          upstreamResponse({
            status,
            headers: {
              'content-type': 'application/json',
              location: 'https://attacker.example/',
            },
          }),
        );

        const result = await service.proxy(mockRdiClientMetadata, request);

        expect(result.status).toEqual(status);
        expect(result.headers).not.toHaveProperty('location');
      },
    );

    it.each([200, 201, 400, 404, 422, 500])(
      'Should pass status %i through untouched',
      async (status) => {
        client.proxyRequest = jest
          .fn()
          .mockResolvedValue(upstreamResponse({ status }));

        const result = await service.proxy(mockRdiClientMetadata, request);

        expect(result.status).toEqual(status);
      },
    );
  });
});
