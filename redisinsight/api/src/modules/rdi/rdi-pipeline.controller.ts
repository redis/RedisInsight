import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  Param,
} from '@nestjs/common';
import {
  RdiPipeline,
  RdiClientMetadata,
  RdiPipelineStatus,
} from 'src/modules/rdi/models';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { RdiPipelineService } from 'src/modules/rdi/rdi-pipeline.service';
import { RequestRdiClientMetadata } from 'src/modules/rdi/decorators';
import {
  RdiDryRunJobDto,
  RdiTemplateResponseDto,
  RdiTestConnectionsResponseDto,
} from 'src/modules/rdi/dto';
import { RdiDryRunJobResponseDto } from 'src/modules/rdi/dto/rdi.dry-run.job.response.dto';

@ApiTags('RDI')
@UsePipes(new ValidationPipe({ transform: true }))
@UseInterceptors(ClassSerializerInterceptor)
@Controller('rdi/:id/pipeline')
export class RdiPipelineController {
  constructor(private readonly rdiPipelineService: RdiPipelineService) {}

  @Get('/schema')
  @ApiEndpoint({
    description: 'Get pipeline schema',
    responses: [{ status: 200, type: Object }],
  })
  async getSchema(
    @RequestRdiClientMetadata() rdiClientMetadata: RdiClientMetadata,
  ): Promise<object> {
    return this.rdiPipelineService.getSchema(rdiClientMetadata);
  }

  @Get('/')
  @ApiEndpoint({
    description: 'Get pipeline',
    responses: [{ status: 200, type: RdiPipeline }],
  })
  async getPipeline(
    @RequestRdiClientMetadata() rdiClientMetadata: RdiClientMetadata,
  ): Promise<RdiPipeline> {
    return this.rdiPipelineService.getPipeline(rdiClientMetadata);
  }

  @Post('/dry-run-job')
  @ApiEndpoint({
    description: 'Dry run job',
    responses: [{ status: 200, type: RdiDryRunJobResponseDto }],
  })
  async dryRunJob(
    @RequestRdiClientMetadata() rdiClientMetadata: RdiClientMetadata,
    @Body() dto: RdiDryRunJobDto,
  ): Promise<RdiDryRunJobResponseDto> {
    return this.rdiPipelineService.dryRunJob(rdiClientMetadata, dto);
  }

  @Post('/deploy')
  @ApiEndpoint({
    description: 'Deploy the pipeline',
    responses: [{ status: 200 }],
  })
  async deploy(
    @RequestRdiClientMetadata() rdiClientMetadata: RdiClientMetadata,
    @Body() dto: RdiPipeline,
  ): Promise<void> {
    return this.rdiPipelineService.deploy(rdiClientMetadata, dto);
  }

  @Post('/stop')
  @ApiEndpoint({
    description: 'Stops running pipeline',
    responses: [{ status: 200 }],
  })
  async stopPipeline(
    @RequestRdiClientMetadata() rdiClientMetadata: RdiClientMetadata,
  ): Promise<void> {
    return this.rdiPipelineService.stopPipeline(rdiClientMetadata);
  }

  @Post('/start')
  @ApiEndpoint({
    description: 'Starts the stopped pipeline',
    responses: [{ status: 200 }],
  })
  async startPipeline(
    @RequestRdiClientMetadata() rdiClientMetadata: RdiClientMetadata,
  ): Promise<void> {
    return this.rdiPipelineService.startPipeline(rdiClientMetadata);
  }

  @Post('/reset')
  @ApiEndpoint({
    description: 'Resets default pipeline',
    responses: [{ status: 200 }],
  })
  async resetPipeline(
    @RequestRdiClientMetadata() rdiClientMetadata: RdiClientMetadata,
  ): Promise<void> {
    return this.rdiPipelineService.resetPipeline(rdiClientMetadata);
  }

  @Post('/test-connections')
  @ApiEndpoint({
    description: 'Test target connections',
    responses: [{ status: 200, type: RdiTestConnectionsResponseDto }],
  })
  async testConnections(
    @RequestRdiClientMetadata() rdiClientMetadata: RdiClientMetadata,
    @Body() config: object,
  ): Promise<RdiTestConnectionsResponseDto> {
    return this.rdiPipelineService.testConnections(rdiClientMetadata, config);
  }

  @Get('/strategies')
  @ApiEndpoint({
    description: 'Get pipeline strategies and db types for template',
    responses: [{ status: 200, type: Object }],
  })
  async getStrategies(
    @RequestRdiClientMetadata() rdiClientMetadata: RdiClientMetadata,
  ): Promise<object> {
    return this.rdiPipelineService.getStrategies(rdiClientMetadata);
  }

  @Get('/job/template/:pipelineType')
  @ApiEndpoint({
    description: 'Get job template for selected pipeline type',
    responses: [{ status: 200, type: RdiTemplateResponseDto }],
  })
  async getJobTemplate(
    @RequestRdiClientMetadata() rdiClientMetadata: RdiClientMetadata,
    @Param('pipelineType') pipelineType: string,
  ): Promise<RdiTemplateResponseDto> {
    return this.rdiPipelineService.getJobTemplate(
      rdiClientMetadata,
      pipelineType,
    );
  }

  @Get('/config/template/:pipelineType/:dbType')
  @ApiEndpoint({
    description: 'Get config template for selected pipeline and db types',
    responses: [{ status: 200, type: RdiTemplateResponseDto }],
  })
  async getConfigTemplate(
    @RequestRdiClientMetadata() rdiClientMetadata: RdiClientMetadata,
    @Param('pipelineType') pipelineType: string,
    @Param('dbType') dbType: string,
  ): Promise<RdiTemplateResponseDto> {
    return this.rdiPipelineService.getConfigTemplate(
      rdiClientMetadata,
      pipelineType,
      dbType,
    );
  }

  @Get('/status')
  @ApiEndpoint({
    description: 'Get pipeline status',
  })
  async getPipelineStatus(
    @RequestRdiClientMetadata() rdiClientMetadata: RdiClientMetadata,
  ): Promise<RdiPipelineStatus> {
    return this.rdiPipelineService.getPipelineStatus(rdiClientMetadata);
  }

  @Get('/job-functions')
  @ApiEndpoint({
    description: 'Get job functions',
    responses: [{ status: 200 }],
  })
  async getJobFunctions(
    @RequestRdiClientMetadata() rdiClientMetadata: RdiClientMetadata,
  ): Promise<object> {
    return this.rdiPipelineService.getJobFunctions(rdiClientMetadata);
  }
}
