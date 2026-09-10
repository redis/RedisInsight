import { AxiosError } from 'axios';
import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';

import {
  parseErrorMessage,
  wrapAgentMemoryError,
} from 'src/modules/agent-memory/exceptions/agent-memory.error.handler';

const axiosErrorWith = (status: number, data: unknown): AxiosError<any> =>
  ({
    message: 'Request failed',
    response: { status, data },
  }) as AxiosError<any>;

describe('agent memory error handler', () => {
  describe('parseErrorMessage', () => {
    it('should return plain string bodies as-is', () => {
      expect(parseErrorMessage(axiosErrorWith(403, 'blocked'))).toEqual(
        'blocked',
      );
    });

    it('should read FastAPI-style string detail', () => {
      expect(
        parseErrorMessage(axiosErrorWith(400, { detail: 'bad filter' })),
      ).toEqual('bad filter');
    });

    it('should read nested detail message', () => {
      expect(
        parseErrorMessage(
          axiosErrorWith(422, { detail: { message: 'invalid group' } }),
        ),
      ).toEqual('invalid group');
    });

    it('should read problem-details style title', () => {
      expect(
        parseErrorMessage(axiosErrorWith(401, { title: 'Unauthorized' })),
      ).toEqual('Unauthorized');
    });

    it('should fall back to the axios error message', () => {
      expect(parseErrorMessage(axiosErrorWith(500, {}))).toEqual(
        'Request failed',
      );
    });
  });

  describe('wrapAgentMemoryError', () => {
    it.each([
      [400, BadRequestException],
      [401, UnauthorizedException],
      [403, ForbiddenException],
      [404, NotFoundException],
      [422, UnprocessableEntityException],
      [500, InternalServerErrorException],
    ])('should map status %d', (status, exceptionType) => {
      const wrapped = wrapAgentMemoryError(
        axiosErrorWith(status, { detail: 'oops' }),
      );

      expect(wrapped).toBeInstanceOf(exceptionType);
    });

    it('should map missing response to internal server error', () => {
      const wrapped = wrapAgentMemoryError({
        message: 'connect ECONNREFUSED',
      } as AxiosError<any>);

      expect(wrapped).toBeInstanceOf(InternalServerErrorException);
    });

    it('should pass through existing HttpExceptions', () => {
      const original = new NotFoundException('missing');

      expect(wrapAgentMemoryError(original as unknown as AxiosError)).toBe(
        original,
      );
    });
  });
});
