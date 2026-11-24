import { HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import bodyParserErrorHandler from './body-parser.middleware';

const mockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res as unknown as Response & {
    status: jest.Mock;
    json: jest.Mock;
  };
};

describe('bodyParserErrorHandler', () => {
  it('stamps a generic errorCode on the 413 entity.too.large response', () => {
    const res = mockResponse();
    const next = jest.fn();

    bodyParserErrorHandler(
      { type: 'entity.too.large', name: 'PayloadTooLargeError' } as any,
      {} as Request,
      res,
      next,
    );

    expect(res.status).toHaveBeenCalledWith(HttpStatus.PAYLOAD_TOO_LARGE);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
        errorCode: 12_000 + HttpStatus.PAYLOAD_TOO_LARGE,
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  describe('CORS headers on the 413 response', () => {
    const originalBuildType = process.env.RI_BUILD_TYPE;
    const tooLarge = { type: 'entity.too.large', name: 'Error' } as any;

    afterEach(() => {
      process.env.RI_BUILD_TYPE = originalBuildType;
    });

    it('should not send CORS headers in the Docker build when no origin is configured', () => {
      process.env.RI_BUILD_TYPE = 'DOCKER_ON_PREMISE';
      const res = mockResponse();

      bodyParserErrorHandler(tooLarge, {} as Request, res, jest.fn());

      expect(res.set).not.toHaveBeenCalled();
    });

    it('should allow any origin in the other builds when no origin is configured', () => {
      process.env.RI_BUILD_TYPE = 'ELECTRON';
      const res = mockResponse();

      bodyParserErrorHandler(tooLarge, {} as Request, res, jest.fn());

      expect(res.set).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
      expect(res.set).not.toHaveBeenCalledWith(
        'Access-Control-Allow-Origin',
        undefined,
      );
    });
  });

  it('delegates non-payload errors to next()', () => {
    const res = mockResponse();
    const next = jest.fn();
    const err = new Error('other');

    bodyParserErrorHandler(err as any, {} as Request, res, next);

    expect(next).toHaveBeenCalledWith(err);
    expect(res.json).not.toHaveBeenCalled();
  });
});
