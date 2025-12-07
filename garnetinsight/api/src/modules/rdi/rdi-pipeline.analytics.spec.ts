import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InternalServerErrorException } from '@nestjs/common';
import { TelemetryEvents } from 'src/constants';
import { RdiPipelineAnalytics } from 'src/modules/rdi/rdi-pipeline.analytics';
import { mockSessionMetadata } from 'src/__mocks__';

describe('RdiPipelineAnalytics', () => {
  let service: RdiPipelineAnalytics;
  let sendEventMethod;
  let sendFailedEventMethod;
  const httpException = new InternalServerErrorException();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventEmitter2, RdiPipelineAnalytics],
    }).compile();

    service = await module.get(RdiPipelineAnalytics);
    sendEventMethod = jest.spyOn<RdiPipelineAnalytics, any>(
      service,
      'sendEvent',
    );
    sendFailedEventMethod = jest.spyOn<RdiPipelineAnalytics, any>(
      service,
      'sendFailedEvent',
    );
  });

  describe('sendRdiInstanceDeleted', () => {
    it('should emit event when rdi pipeline deployed successfully', () => {
      service.sendRdiPipelineDeployed(mockSessionMetadata, 'id');

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RdiPipelineDeploymentSucceeded,
        {
          id: 'id',
        },
      );
    });

    it('should emit event when rdi pipeline is not deployed successfully', () => {
      service.sendRdiPipelineDeployFailed(
        mockSessionMetadata,
        httpException,
        'id',
      );

      expect(sendFailedEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.RdiPipelineDeploymentFailed,
        httpException,
        { id: 'id' },
      );
    });
  });
});
