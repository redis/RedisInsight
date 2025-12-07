import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppAnalyticsEvents, TelemetryEvents } from 'src/constants';
import { mockSessionMetadata } from 'src/__mocks__';
import { TelemetryBaseService } from './telemetry.base.service';

class Service extends TelemetryBaseService {
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }
}
const httpException = new InternalServerErrorException('Message');

describe('TelemetryBaseService', () => {
  let service: Service;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: EventEmitter2,
          useFactory: () => ({
            emit: jest.fn(),
          }),
        },
      ],
    }).compile();

    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    service = new Service(eventEmitter);
  });

  describe('sendEvent', () => {
    it('should emit event', () => {
      service['sendEvent'](
        mockSessionMetadata,
        TelemetryEvents.RedisInstanceAdded,
        { data: 'Some data', command: 'lowercase' },
      );

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        AppAnalyticsEvents.Track,
        mockSessionMetadata,
        {
          event: TelemetryEvents.RedisInstanceAdded,
          eventData: { data: 'Some data', command: 'LOWERCASE' },
        },
      );
    });
    it('should emit event with empty event data', () => {
      service['sendEvent'](
        mockSessionMetadata,
        TelemetryEvents.RedisInstanceAdded,
      );

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        AppAnalyticsEvents.Track,
        mockSessionMetadata,
        {
          event: TelemetryEvents.RedisInstanceAdded,
          eventData: {},
        },
      );
    });
    it('should emit event for undefined event data', () => {
      service['sendEvent'](
        mockSessionMetadata,
        TelemetryEvents.RedisInstanceAdded,
        undefined,
      );

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        AppAnalyticsEvents.Track,
        mockSessionMetadata,
        {
          event: TelemetryEvents.RedisInstanceAdded,
          eventData: {},
        },
      );
    });
    it('should not throw on error', () => {
      eventEmitter.emit = jest.fn().mockImplementation(() => {
        throw new Error();
      });

      expect(() =>
        service['sendEvent'](
          mockSessionMetadata,
          TelemetryEvents.RedisInstanceAdded,
        ),
      ).not.toThrow();
    });
  });

  describe('sendFailedEvent', () => {
    it('should emit event for custom exception', () => {
      service['sendFailedEvent'](
        mockSessionMetadata,
        TelemetryEvents.RedisInstanceAddFailed,
        httpException,
      );

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        AppAnalyticsEvents.Track,
        mockSessionMetadata,
        {
          event: TelemetryEvents.RedisInstanceAddFailed,
          eventData: {
            error: 'Internal Server Error',
          },
        },
      );
    });
    it('should emit event for default exception', () => {
      service['sendFailedEvent'](
        mockSessionMetadata,
        TelemetryEvents.RedisInstanceAddFailed,
        new BadRequestException(),
      );

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        AppAnalyticsEvents.Track,
        mockSessionMetadata,
        {
          event: TelemetryEvents.RedisInstanceAddFailed,
          eventData: {
            error: 'Bad Request',
          },
        },
      );
    });
    it('should emit event with additional event data', () => {
      service['sendFailedEvent'](
        mockSessionMetadata,
        TelemetryEvents.RedisInstanceAddFailed,
        httpException,
        { data: 'Some data', command: 'lowercase' },
      );

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        AppAnalyticsEvents.Track,
        mockSessionMetadata,
        {
          event: TelemetryEvents.RedisInstanceAddFailed,
          eventData: {
            error: 'Internal Server Error',
            data: 'Some data',
            command: 'LOWERCASE',
          },
        },
      );
    });
    it('should not throw on error', () => {
      eventEmitter.emit = jest.fn().mockImplementation(() => {
        throw new Error();
      });

      expect(() =>
        service['sendFailedEvent'](
          mockSessionMetadata,
          TelemetryEvents.RedisInstanceAdded,
          httpException,
        ),
      ).not.toThrow();
    });
  });
});
