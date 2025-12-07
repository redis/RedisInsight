import { TypeHelpOptions } from 'class-transformer';
import { CloudJobName } from 'src/modules/cloud/job/constants';
import { CreateDatabaseCloudJobDataDto } from 'src/modules/cloud/job/dto/create-database.cloud-job.data.dto';
import { cloudJobDataTransformer } from 'src/modules/cloud/job/transformers/cloud-job-data.transformer';
import { CreateSubscriptionAndDatabaseCloudJobDataDto } from 'src/modules/cloud/job/dto/create-subscription-and-database.cloud-job.data.dto';
import { ImportDatabaseCloudJobDataDto } from 'src/modules/cloud/job/dto/import-database.cloud-job.data.dto';

describe('cloudJobDataTransformer', () => {
  [
    {
      input: {
        object: { name: CloudJobName.CreateFreeDatabase },
      } as unknown as TypeHelpOptions,
      output: CreateDatabaseCloudJobDataDto,
    },
    {
      input: {
        object: { name: CloudJobName.CreateFreeSubscription },
      } as unknown as TypeHelpOptions,
      output: CreateSubscriptionAndDatabaseCloudJobDataDto,
    },
    {
      input: {
        object: { name: CloudJobName.CreateFreeSubscriptionAndDatabase },
      } as unknown as TypeHelpOptions,
      output: CreateSubscriptionAndDatabaseCloudJobDataDto,
    },
    {
      input: {
        object: { name: CloudJobName.ImportFreeDatabase },
      } as unknown as TypeHelpOptions,
      output: ImportDatabaseCloudJobDataDto,
    },
    {
      input: {
        object: { name: CloudJobName.WaitForActiveDatabase },
      } as unknown as TypeHelpOptions,
      output: undefined,
    },
    {
      input: {
        object: { name: CloudJobName.WaitForActiveSubscription },
      } as unknown as TypeHelpOptions,
      output: undefined,
    },
    {
      input: {
        object: { name: CloudJobName.WaitForTask },
      } as unknown as TypeHelpOptions,
      output: undefined,
    },
    {
      input: {
        object: { name: CloudJobName.Unknown },
      } as unknown as TypeHelpOptions,
      output: undefined,
    },
    {
      input: null,
      output: undefined,
    },
  ].forEach((tc) => {
    it(`Should return ${tc.output} when input is: ${tc.input}`, () => {
      expect(cloudJobDataTransformer(tc.input)).toEqual(tc.output);
    });
  });
});
