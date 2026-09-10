import { Test, TestingModule } from '@nestjs/testing';
import { mockRdiClientMetadata } from 'src/__mocks__';
import { RdiProxyController } from './rdi-proxy.controller';
import { RdiProxyService } from './rdi-proxy.service';

const mockRdiProxyService = () => ({
  proxy: jest.fn(),
});

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.set = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe('RdiProxyController', () => {
  let controller: RdiProxyController;
  let service: ReturnType<typeof mockRdiProxyService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RdiProxyController],
      providers: [
        {
          provide: RdiProxyService,
          useFactory: mockRdiProxyService,
        },
      ],
    }).compile();

    controller = module.get(RdiProxyController);
    service = module.get(RdiProxyService);
  });

  describe('proxy', () => {
    it('should forward the request path, method, query and body, and reply with the upstream response', async () => {
      service.proxy.mockResolvedValueOnce({
        status: 201,
        headers: { 'content-type': 'application/json' },
        data: { id: '1' },
      });
      const res = mockResponse();
      const req: any = {
        method: 'POST',
        url: `/rdi/${mockRdiClientMetadata.id}/proxy/api/v1/pipelines?dryRun=true`,
        body: { name: 'my-pipeline' },
        headers: { 'content-type': 'application/json' },
      };

      await controller.proxy(mockRdiClientMetadata, req, res);

      expect(service.proxy).toHaveBeenCalledWith(mockRdiClientMetadata, {
        method: 'POST',
        path: 'api/v1/pipelines',
        query: 'dryRun=true',
        body: { name: 'my-pipeline' },
        headers: { 'content-type': 'application/json' },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.set).toHaveBeenCalledWith({
        'content-type': 'application/json',
      });
      expect(res.send).toHaveBeenCalledWith({ id: '1' });
    });

    it('should preserve percent-encoded delimiters in the upstream path', async () => {
      service.proxy.mockResolvedValueOnce({
        status: 200,
        headers: {},
        data: null,
      });
      const res = mockResponse();
      const req: any = {
        method: 'GET',
        url: `/rdi/${mockRdiClientMetadata.id}/proxy/pipelines/foo%3Fbar`,
        headers: {},
      };

      await controller.proxy(mockRdiClientMetadata, req, res);

      expect(service.proxy).toHaveBeenCalledWith(
        mockRdiClientMetadata,
        expect.objectContaining({
          path: 'pipelines/foo%3Fbar',
        }),
      );
    });

    it('should return an empty path when the proxy marker is not found in the url', async () => {
      service.proxy.mockResolvedValueOnce({
        status: 200,
        headers: {},
        data: null,
      });
      const res = mockResponse();
      const req: any = {
        method: 'GET',
        url: '/some/unrelated/path',
        headers: {},
      };

      await controller.proxy(mockRdiClientMetadata, req, res);

      expect(service.proxy).toHaveBeenCalledWith(
        mockRdiClientMetadata,
        expect.objectContaining({ path: '' }),
      );
    });

    it('should reject a TRACE request without forwarding it to rdi', async () => {
      const res = mockResponse();
      const req: any = {
        method: 'TRACE',
        url: `/rdi/${mockRdiClientMetadata.id}/proxy/api/v1/pipelines`,
        headers: {},
      };

      await expect(
        controller.proxy(mockRdiClientMetadata, req, res),
      ).rejects.toThrow('Method TRACE is not supported by this proxy');
      expect(service.proxy).not.toHaveBeenCalled();
    });

    it('should reject a CONNECT request without forwarding it to rdi', async () => {
      const res = mockResponse();
      const req: any = {
        method: 'CONNECT',
        url: `/rdi/${mockRdiClientMetadata.id}/proxy/api/v1/pipelines`,
        headers: {},
      };

      await expect(
        controller.proxy(mockRdiClientMetadata, req, res),
      ).rejects.toThrow('Method CONNECT is not supported by this proxy');
      expect(service.proxy).not.toHaveBeenCalled();
    });
  });
});
