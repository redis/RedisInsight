import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import {
  mockUtm,
  mockSessionMetadata,
  mockCreateDatabaseCloudJobDataDto,
  mockCloudJobProvider,
  mockCloudJobInfo,
  MockType,
} from 'src/__mocks__';
import { CloudApiUnauthorizedException } from 'src/modules/cloud/common/exceptions';
import { CloudJobNotFoundException } from 'src/modules/cloud/job/exceptions';
import { CloudJobProvider } from 'src/modules/cloud/job/cloud-job.provider';
import { CloudJobService } from './cloud-job.service';

describe('CloudJobService', () => {
  let service: CloudJobService;
  let cloudJobProvider: MockType<CloudJobProvider>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudJobService,
        {
          provide: CloudJobProvider,
          useFactory: mockCloudJobProvider,
        },
      ],
    }).compile();

    service = module.get(CloudJobService);
    cloudJobProvider = module.get(CloudJobProvider);
  });

  describe('create', () => {
    it('successfully create cloud job', async () => {
      expect(
        await service.create(
          mockSessionMetadata,
          mockCreateDatabaseCloudJobDataDto,
          mockUtm,
        ),
      ).toEqual(mockCloudJobInfo);
    });
    it('should throw CloudApiUnauthorizedException exception', async () => {
      cloudJobProvider.addJob.mockRejectedValueOnce(
        new CloudApiUnauthorizedException(),
      );
      await expect(
        service.create(
          mockSessionMetadata,
          mockCreateDatabaseCloudJobDataDto,
          mockUtm,
        ),
      ).rejects.toThrow(CloudApiUnauthorizedException);
    });
  });

  describe('getUserJobsInfo', () => {
    it('successfully create cloud job', async () => {
      expect(await service.getUserJobsInfo(mockSessionMetadata)).toEqual([
        mockCloudJobInfo,
      ]);
    });
    it('should throw CloudApiUnauthorizedException exception', async () => {
      cloudJobProvider.findUserJobs.mockRejectedValueOnce(
        new CloudApiUnauthorizedException(),
      );
      await expect(
        service.getUserJobsInfo(mockSessionMetadata),
      ).rejects.toThrow(CloudApiUnauthorizedException);
    });
  });
  describe('get', () => {
    it('should throw CloudJobNotFoundException exception', async () => {
      cloudJobProvider.get = jest.fn().mockReturnValue(null);
      await expect(service.get(mockSessionMetadata, 'id')).rejects.toThrow(
        CloudJobNotFoundException,
      );
    });
    it('should throw CloudApiUnauthorizedException exception', async () => {
      cloudJobProvider.get.mockRejectedValueOnce(
        new CloudApiUnauthorizedException(),
      );
      await expect(service.get(mockSessionMetadata, 'id')).rejects.toThrow(
        CloudApiUnauthorizedException,
      );
    });
    it('should throw ForbiddenException exception', async () => {
      await expect(service.get(mockSessionMetadata, 'id')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
