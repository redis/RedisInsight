import {
  CloudJobStatus,
  CloudJobStep,
} from 'src/modules/cloud/job/models/cloud-job-info';
import { CloudJobName } from 'src/modules/cloud/job/constants';
import { CloudJobRunMode } from 'src/modules/cloud/job/models';
import { CloudJob } from 'src/modules/cloud/job/jobs';
import { mockSessionMetadata } from 'src/__mocks__/common';

export const mockCreateDatabaseCloudJobDataDto = {
  name: CloudJobName.CreateFreeDatabase,
  runMode: CloudJobRunMode.Async,
  data: { planId: 123 },
};

export const mockCloudJobInfo = {
  id: 'job-id',
  name: CloudJobName.CreateFreeDatabase,
  status: CloudJobStatus.Running,
  step: CloudJobStep.Database,
};

export abstract class MockCloudJob extends CloudJob {
  constructor() {
    super({
      abortController: new AbortController(),
      sessionMetadata: mockSessionMetadata,
    });
  }
}

MockCloudJob['getWriteStream'] = jest.fn();
MockCloudJob['addProfilerClient'] = jest.fn();
MockCloudJob['removeProfilerClient'] = jest.fn();
MockCloudJob['setAlias'] = jest.fn();
MockCloudJob['destroy'] = jest.fn();
MockCloudJob['getState'] = jest.fn().mockReturnValue(mockCloudJobInfo);

export const mockCloudJobProvider = jest.fn(() => ({
  addJob: jest.fn().mockResolvedValue(mockCloudJobInfo),
  get: jest.fn().mockResolvedValue(MockCloudJob),
  findUserJobs: jest.fn().mockResolvedValue([MockCloudJob]),
}));
