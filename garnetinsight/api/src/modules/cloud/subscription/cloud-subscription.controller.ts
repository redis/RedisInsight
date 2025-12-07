import {
  Query,
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RequestSessionMetadata } from 'src/common/decorators';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { CloudSubscriptionApiService } from './cloud-subscription.api.service';
import { CloudRequestUtm } from '../common/models';
import { CloudSubscriptionPlanResponse } from './dto';

@ApiTags('Cloud Subscription')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('cloud/me/subscription')
@UsePipes(new ValidationPipe({ transform: true }))
export class CloudSubscriptionController {
  constructor(private readonly service: CloudSubscriptionApiService) {}

  @Get('/plans')
  @ApiEndpoint({
    description: 'Get list of plans with cloud regions',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'List of plans with cloud regions',
        type: CloudSubscriptionPlanResponse,
        isArray: true,
      },
    ],
  })
  async getPlans(
    @RequestSessionMetadata() sessionMetadata,
    @Query() utm: CloudRequestUtm,
  ): Promise<CloudSubscriptionPlanResponse[]> {
    return this.service.getSubscriptionPlans(sessionMetadata, utm);
  }
}
