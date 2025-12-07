import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Query,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { RequestRdiClientMetadata } from 'src/modules/rdi/decorators';
import { RdiClientMetadata, RdiStatisticsResult } from 'src/modules/rdi/models';
import { RdiStatisticsService } from 'src/modules/rdi/rdi-statistics.service';

@ApiTags('RDI')
@UsePipes(new ValidationPipe({ transform: true }))
@UseInterceptors(ClassSerializerInterceptor)
@Controller('rdi/:id/statistics')
export class RdiStatisticsController {
  constructor(private readonly rdiStatisticsService: RdiStatisticsService) {}

  @Get('/')
  @ApiEndpoint({
    description: 'Get statistics',
    responses: [{ status: 200, type: RdiStatisticsResult }],
  })
  @ApiQuery({ name: 'sections', required: false, type: String })
  async getStatistics(
    @RequestRdiClientMetadata() rdiClientMetadata: RdiClientMetadata,
    @Query('sections') sections?: string,
  ): Promise<RdiStatisticsResult> {
    return this.rdiStatisticsService.getStatistics(rdiClientMetadata, sections);
  }
}
