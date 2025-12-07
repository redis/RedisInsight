import { ICloudCapiTask } from 'src/modules/cloud/task/models';

export const mockCloudTaskInit: ICloudCapiTask = {
  taskId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  commandType: 'createSubscription',
  status: 'initialized',
  timestamp: '2023-07-01T00:00:00.000Z',
};

export const mockCloudTaskCapiProvider = jest.fn(() => ({
  getTask: jest.fn().mockResolvedValue(mockCloudTaskInit),
}));
