import { plainToInstance } from 'class-transformer';
import { CloudTask, ICloudCapiTask } from 'src/modules/cloud/task/models';

export const parseCloudTaskCapiResponse = (task: ICloudCapiTask): CloudTask =>
  plainToInstance(CloudTask, task);
