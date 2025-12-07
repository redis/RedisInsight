import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { CustomTutorialAnalytics } from 'src/modules/custom-tutorial/custom-tutorial.analytics';
import { BadRequestException } from '@nestjs/common';
import { mockSessionMetadata } from 'src/__mocks__';

describe('CustomTutorialAnalytics', () => {
  let service: CustomTutorialAnalytics;
  let sendEventSpy;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [EventEmitter2, CustomTutorialAnalytics],
    }).compile();

    service = await module.get(CustomTutorialAnalytics);
    sendEventSpy = jest.spyOn(service as any, 'sendEvent');
  });

  describe('sendImportSucceeded', () => {
    it('should emit succeed event with manifest "yes"', () => {
      service.sendImportSucceeded(mockSessionMetadata, { manifest: true });

      expect(sendEventSpy).toHaveBeenNthCalledWith(
        1,
        mockSessionMetadata,
        TelemetryEvents.WorkbenchEnablementAreaImportSucceeded,
        {
          manifest: 'yes',
        },
      );
    });
    it('should emit succeed event with manifest "no"', () => {
      service.sendImportSucceeded(mockSessionMetadata, { manifest: false });

      expect(sendEventSpy).toHaveBeenNthCalledWith(
        1,
        mockSessionMetadata,
        TelemetryEvents.WorkbenchEnablementAreaImportSucceeded,
        {
          manifest: 'no',
        },
      );
    });
  });

  describe('sendImportFailed', () => {
    it('should emit 1 event with "Error" cause', () => {
      service.sendImportFailed(mockSessionMetadata, new Error());

      expect(sendEventSpy).toHaveBeenNthCalledWith(
        1,
        mockSessionMetadata,
        TelemetryEvents.WorkbenchEnablementAreaImportFailed,
        {
          error: 'Error',
        },
      );
    });
    it('should emit 1 event with "BadRequestException" cause', () => {
      service.sendImportFailed(mockSessionMetadata, new BadRequestException());

      expect(sendEventSpy).toHaveBeenNthCalledWith(
        1,
        mockSessionMetadata,
        TelemetryEvents.WorkbenchEnablementAreaImportFailed,
        {
          error: 'BadRequestException',
        },
      );
    });
  });
});
