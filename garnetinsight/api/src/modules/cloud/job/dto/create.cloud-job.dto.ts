import {
  ApiExtraModels,
  ApiProperty,
  ApiPropertyOptional,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { cloudJobDataTransformer } from 'src/modules/cloud/job/transformers/cloud-job-data.transformer';
import { CloudJobName } from 'src/modules/cloud/job/constants';
import { CloudJobRunMode } from 'src/modules/cloud/job/models';
import { CreateDatabaseCloudJobDataDto } from 'src/modules/cloud/job/dto/create-database.cloud-job.data.dto';
import { CreateSubscriptionAndDatabaseCloudJobDataDto } from 'src/modules/cloud/job/dto/create-subscription-and-database.cloud-job.data.dto';
import { ImportDatabaseCloudJobDataDto } from 'src/modules/cloud/job/dto/import-database.cloud-job.data.dto';

@ApiExtraModels(
  CreateDatabaseCloudJobDataDto,
  CreateSubscriptionAndDatabaseCloudJobDataDto,
  ImportDatabaseCloudJobDataDto,
)
export class CreateCloudJobDto {
  @ApiProperty({
    description: 'Job name to create',
    enum: CloudJobName,
  })
  @IsEnum(CloudJobName)
  @IsNotEmpty()
  name: CloudJobName;

  @ApiProperty({
    description: 'Mod in which to run the job.',
    enum: CloudJobRunMode,
  })
  @IsOptional()
  @Expose()
  @IsEnum(CloudJobRunMode)
  @IsNotEmpty()
  runMode: CloudJobRunMode;

  @ApiPropertyOptional({
    description: 'Any data for create a job.',
    oneOf: [
      { $ref: getSchemaPath(CreateDatabaseCloudJobDataDto) },
      { $ref: getSchemaPath(CreateSubscriptionAndDatabaseCloudJobDataDto) },
      { $ref: getSchemaPath(ImportDatabaseCloudJobDataDto) },
    ],
  })
  @Expose()
  @IsOptional()
  @IsNotEmptyObject()
  @Type(cloudJobDataTransformer)
  @ValidateNested()
  data?:
    | CreateDatabaseCloudJobDataDto
    | CreateSubscriptionAndDatabaseCloudJobDataDto
    | ImportDatabaseCloudJobDataDto;
}
