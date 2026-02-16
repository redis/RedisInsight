import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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
  async getStatistics(
    @RequestRdiClientMetadata() rdiClientMetadata: RdiClientMetadata,
  ): Promise<RdiStatisticsResult> {
    return this.rdiStatisticsService.getStatistics(rdiClientMetadata);
  }
}
