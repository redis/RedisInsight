import {
  MethodNotAllowedException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { MockType, mockRdiClientMetadata, mockRdiId } from 'src/__mocks__';
import { RdiProxyController } from 'src/modules/rdi/rdi-proxy.controller';
import { RdiProxyService } from 'src/modules/rdi/rdi-proxy.service';

const mockRdiProxyService = jest.fn(() => ({
  proxy: jest.fn(),
}));

describe('RdiProxyController', () => {
  let controller: RdiProxyController;
  let service: MockType<RdiProxyService>;
  let res: Response & { status: jest.Mock; set: jest.Mock; send: jest.Mock };

  const mockRequest = (overrides: Partial<Request> = {}): Request =>
    ({
      method: 'GET',
      url: `/api/rdi/${mockRdiId}/proxy/api/v1/pipelines`,
      headers: { 'content-type': 'application/json' },
      body: undefined,
      ...overrides,
    }) as Request;

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

    service.proxy.mockResolvedValue({
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: Buffer.from('{"ok":true}'),
    });

    res = {
      status: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    } as unknown as typeof res;
  });

  describe('proxy', () => {
    it('Should pass the upstream path, query, body and headers to the service', async () => {
      const body = { name: 'p1' };

      await controller.proxy(
        mockRdiClientMetadata,
        mockRequest({
          method: 'POST',
          url: `/api/rdi/${mockRdiId}/proxy/api/v1/pipelines?dryRun=true`,
          body,
        }),
        res,
      );

      expect(service.proxy).toHaveBeenCalledWith(mockRdiClientMetadata, {
        method: 'POST',
        path: 'api/v1/pipelines',
        query: 'dryRun=true',
        body,
        headers: { 'content-type': 'application/json' },
      });
    });

    it('Should write the upstream status, headers and body back to the response', async () => {
      await controller.proxy(mockRdiClientMetadata, mockRequest(), res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.set).toHaveBeenCalledWith({
        'content-type': 'application/json',
      });
      expect(res.send).toHaveBeenCalledWith(Buffer.from('{"ok":true}'));
    });

    it('Should keep an encoded delimiter in the path encoded', async () => {
      await controller.proxy(
        mockRdiClientMetadata,
        mockRequest({
          url: `/api/rdi/${mockRdiId}/proxy/api/v1/pipelines/foo%2Fbar%3Fx`,
        }),
        res,
      );

      expect(service.proxy).toHaveBeenCalledWith(
        mockRdiClientMetadata,
        expect.objectContaining({ path: 'api/v1/pipelines/foo%2Fbar%3Fx' }),
      );
    });

    it('Should keep every query delimiter when the query itself contains one', async () => {
      await controller.proxy(
        mockRdiClientMetadata,
        mockRequest({
          url: `/api/rdi/${mockRdiId}/proxy/api/v1/x?a=1&b=on?off`,
        }),
        res,
      );

      expect(service.proxy).toHaveBeenCalledWith(
        mockRdiClientMetadata,
        expect.objectContaining({ query: 'a=1&b=on?off' }),
      );
    });

    it('Should forward an absent body as undefined', async () => {
      await controller.proxy(mockRdiClientMetadata, mockRequest(), res);

      expect(service.proxy).toHaveBeenCalledWith(
        mockRdiClientMetadata,
        expect.objectContaining({ body: undefined }),
      );
    });

    it.each([
      'application/json',
      'application/json; charset=utf-8',
      'application/merge-patch+json',
      'application/problem+json',
    ])('Should accept the %s content type', async (contentType) => {
      await controller.proxy(
        mockRdiClientMetadata,
        mockRequest({
          method: 'POST',
          headers: { 'content-type': contentType },
        }),
        res,
      );

      expect(service.proxy).toHaveBeenCalled();
    });

    it.each([
      'text/plain',
      'multipart/form-data; boundary=x',
      'application/octet-stream',
      'application/x-www-form-urlencoded',
      'application/xml',
    ])(
      'Should refuse the %s content type instead of forwarding an empty body',
      async (contentType) => {
        await expect(
          controller.proxy(
            mockRdiClientMetadata,
            mockRequest({
              method: 'POST',
              headers: { 'content-type': contentType },
            }),
            res,
          ),
        ).rejects.toThrow(UnsupportedMediaTypeException);

        expect(service.proxy).not.toHaveBeenCalled();
      },
    );

    it.each(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])(
      'Should proxy the %s method',
      async (method) => {
        await controller.proxy(
          mockRdiClientMetadata,
          mockRequest({ method }),
          res,
        );

        expect(service.proxy).toHaveBeenCalled();
      },
    );

    it.each(['OPTIONS', 'HEAD', 'TRACE', 'CONNECT'])(
      'Should reject the %s method',
      async (method) => {
        await expect(
          controller.proxy(mockRdiClientMetadata, mockRequest({ method }), res),
        ).rejects.toThrow(MethodNotAllowedException);

        expect(service.proxy).not.toHaveBeenCalled();
      },
    );
  });
});
