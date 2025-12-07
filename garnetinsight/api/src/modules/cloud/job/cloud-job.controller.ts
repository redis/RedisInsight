import {
  Body,
  Query,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RequestSessionMetadata } from 'src/common/decorators';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { CloudJobService } from 'src/modules/cloud/job/cloud-job.service';
import { CreateDatabaseCloudJobDataDto } from 'src/modules/cloud/job/dto/create-database.cloud-job.data.dto';
import { CreateCloudJobDto } from 'src/modules/cloud/job/dto/create.cloud-job.dto';
import { CloudJobInfo } from 'src/modules/cloud/job/models';
import { CloudRequestUtm } from 'src/modules/cloud/common/models';

@ApiExtraModels(CreateDatabaseCloudJobDataDto)
@ApiTags('Cloud Jobs')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('cloud/me/jobs')
@UsePipes(new ValidationPipe({ transform: true }))
export class CloudJobController {
  constructor(private readonly service: CloudJobService) {}

  @Post('/')
  @ApiEndpoint({
    description: 'Create cloud job',
    statusCode: 200,
    responses: [{ type: CloudJobInfo }],
  })
  async createFreeDatabase(
    @RequestSessionMetadata() sessionMetadata,
    @Body() dto: CreateCloudJobDto,
    @Query() utm: CloudRequestUtm,
  ): Promise<CloudJobInfo> {
    return this.service.create(sessionMetadata, dto, utm);
  }

  @Get('/')
  @ApiEndpoint({
    description: 'Get list of user jobs',
    statusCode: 200,
    responses: [{ type: CloudJobInfo, isArray: true }],
  })
  async getUserJobsInfo(
    @RequestSessionMetadata() sessionMetadata,
  ): Promise<CloudJobInfo[]> {
    return this.service.getUserJobsInfo(sessionMetadata);
  }

  @Get('/:id')
  @ApiEndpoint({
    description: 'Get user jobs',
    statusCode: 200,
    responses: [{ type: CloudJobInfo }],
  })
  async getJobInfo(
    @RequestSessionMetadata() sessionMetadata,
    @Param('id') id: string,
  ): Promise<CloudJobInfo> {
    return this.service.getJobInfo(sessionMetadata, id);
  }
}
