import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { RdiAnalytics } from 'src/modules/rdi/rdi.analytics';
import { mockSessionMetadata } from 'src/__mocks__';

describe('RdiAnalytics', () => {
  let service: RdiAnalytics;
  let sendEventMethod;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventEmitter2, RdiAnalytics],
    }).compile();

    service = await module.get(RdiAnalytics);
    sendEventMethod = jest.spyOn<RdiAnalytics, any>(service, 'sendEvent');
  });

  describe('sendRdiInstanceDeleted', () => {
    it('should emit event when rdi instance is deleted successfully', () => {
      service.sendRdiInstanceDeleted(mockSessionMetadata, 1);

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RdiInstanceDeleted,
        {
          numberOfInstances: 1,
        },
      );
    });

    it('should emit event when rdi instance is not deleted successfully', () => {
      service.sendRdiInstanceDeleted(mockSessionMetadata, 2, 'error');

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RdiInstanceDeleted,
        {
          numberOfInstances: 2,
          error: 'error',
        },
      );
    });
  });
});
