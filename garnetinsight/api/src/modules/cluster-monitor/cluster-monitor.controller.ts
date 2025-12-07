import { Controller, Get } from '@nestjs/common';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { ClusterMonitorService } from 'src/modules/cluster-monitor/cluster-monitor.service';
import { ApiTags } from '@nestjs/swagger';
import { ClusterDetails } from 'src/modules/cluster-monitor/models';
import { ClientMetadata } from 'src/common/models';
import { ClientMetadataParam } from 'src/common/decorators';

@ApiTags('Cluster Monitor')
@Controller('/cluster-details')
export class ClusterMonitorController {
  constructor(private readonly clusterMonitorService: ClusterMonitorService) {}

  @ApiEndpoint({
    statusCode: 200,
    description: 'Get cluster details',
    responses: [
      {
        status: 200,
        type: ClusterDetails,
      },
    ],
  })
  @Get()
  async getClusterDetails(
    @ClientMetadataParam({
      ignoreDbIndex: true,
    })
    clientMetadata: ClientMetadata,
  ): Promise<ClusterDetails> {
    return this.clusterMonitorService.getClusterDetails(clientMetadata);
  }
}
