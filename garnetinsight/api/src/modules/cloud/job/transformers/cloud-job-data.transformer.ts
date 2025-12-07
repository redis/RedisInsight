import { get } from 'lodash';
import { TypeHelpOptions } from 'class-transformer';
import { CreateDatabaseCloudJobDataDto } from 'src/modules/cloud/job/dto/create-database.cloud-job.data.dto';
import { CloudJobName } from 'src/modules/cloud/job/constants';
import { CreateSubscriptionAndDatabaseCloudJobDataDto } from 'src/modules/cloud/job/dto/create-subscription-and-database.cloud-job.data.dto';
import { ImportDatabaseCloudJobDataDto } from 'src/modules/cloud/job/dto/import-database.cloud-job.data.dto';

export const cloudJobDataTransformer = (data: TypeHelpOptions) => {
  const jobName = get(data?.object, 'name');

  switch (jobName) {
    case CloudJobName.ImportFreeDatabase:
      return ImportDatabaseCloudJobDataDto;
    case CloudJobName.CreateFreeDatabase:
      return CreateDatabaseCloudJobDataDto;
    case CloudJobName.CreateFreeSubscription:
    case CloudJobName.CreateFreeSubscriptionAndDatabase:
      return CreateSubscriptionAndDatabaseCloudJobDataDto;

    default:
      return undefined;
  }
};
