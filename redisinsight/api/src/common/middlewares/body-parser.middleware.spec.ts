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

  it('delegates non-payload errors to next()', () => {
    const res = mockResponse();
    const next = jest.fn();
    const err = new Error('other');

    bodyParserErrorHandler(err as any, {} as Request, res, next);

    expect(next).toHaveBeenCalledWith(err);
    expect(res.json).not.toHaveBeenCalled();
  });
});
