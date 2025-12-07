import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import {
  mockFreeCloudSubscriptionPlan1,
  mockCloudSubscriptionCapiService,
  mockSessionMetadata,
} from 'src/__mocks__';
import { InternalServerErrorException } from '@nestjs/common';
import { CloudDatabaseAnalytics } from 'src/modules/cloud/database/cloud-database.analytics';
import { CloudSubscriptionCapiService } from 'src/modules/cloud/subscription/cloud-subscription.capi.service';

describe('CloudDatabaseAnalytics', () => {
  let service: CloudDatabaseAnalytics;
  let sendEventMethod;
  let sendFailedEventMethod;
  const httpException = new InternalServerErrorException();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventEmitter2,
        CloudDatabaseAnalytics,
        CloudSubscriptionCapiService,
        {
          provide: CloudSubscriptionCapiService,
          useFactory: mockCloudSubscriptionCapiService,
        },
      ],
    }).compile();

    service = await module.get(CloudDatabaseAnalytics);
    sendEventMethod = jest.spyOn<CloudDatabaseAnalytics, any>(
      service,
      'sendEvent',
    );
    sendFailedEventMethod = jest.spyOn<CloudDatabaseAnalytics, any>(
      service,
      'sendFailedEvent',
    );
  });

  describe('sendCloudSignInSucceeded', () => {
    it('should emit event with eventData', () => {
      service.sendCloudFreeDatabaseCreated(mockSessionMetadata, {
        data: 'custom',
      });

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.CloudFreeDatabaseCreated,
        {
          data: 'custom',
        },
      );
    });

    it('should emit event with eventData = {}', () => {
      service.sendCloudFreeDatabaseCreated(mockSessionMetadata);

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.CloudFreeDatabaseCreated,
        {},
      );
    });
  });

  describe('sendCloudFreeDatabaseFailed', () => {
    it('should emit error event with selected plan', async () => {
      service.sendCloudFreeDatabaseFailed(mockSessionMetadata, httpException, {
        region: mockFreeCloudSubscriptionPlan1.region,
        provider: mockFreeCloudSubscriptionPlan1.provider,
      });

      expect(sendFailedEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.CloudFreeDatabaseFailed,
        httpException,
        {
          region: mockFreeCloudSubscriptionPlan1.region,
          provider: mockFreeCloudSubscriptionPlan1.provider,
        },
      );
    });
  });

  it('should emit error event with selected plan', async () => {
    service.sendCloudFreeDatabaseFailed(
      mockSessionMetadata,
      httpException,
      undefined,
    );

    expect(sendFailedEventMethod).toHaveBeenCalledWith(
      mockSessionMetadata,
      TelemetryEvents.CloudFreeDatabaseFailed,
      httpException,
      {},
    );
  });

  it('should emit error event when free subscription is not exist', async () => {
    service.sendCloudFreeDatabaseFailed(
      mockSessionMetadata,
      httpException,
      undefined,
    );

    expect(sendFailedEventMethod).toHaveBeenCalledWith(
      mockSessionMetadata,
      TelemetryEvents.CloudFreeDatabaseFailed,
      httpException,
      {
        region: undefined,
        provider: undefined,
      },
    );
  });
});
