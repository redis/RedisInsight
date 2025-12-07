import {
  Body,
  Controller,
  Delete,
  Patch,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiRedisInstanceOperation } from 'src/decorators/api-redis-instance-operation.decorator';
import {
  ConsumerGroupDto,
  CreateConsumerGroupsDto,
  DeleteConsumerGroupsDto,
  DeleteConsumerGroupsResponse,
  UpdateConsumerGroupDto,
} from 'src/modules/browser/stream/dto';
import { ConsumerGroupService } from 'src/modules/browser/stream/services/consumer-group.service';
import { KeyDto } from 'src/modules/browser/keys/dto';
import { BrowserClientMetadata } from 'src/modules/browser/decorators/browser-client-metadata.decorator';
import { ApiQueryRedisStringEncoding } from 'src/common/decorators';
import { ClientMetadata } from 'src/common/models';
import { BrowserSerializeInterceptor } from 'src/common/interceptors';
import { BrowserBaseController } from 'src/modules/browser/browser.base.controller';

@ApiTags('Browser: Streams')
@UseInterceptors(BrowserSerializeInterceptor)
@Controller('streams/consumer-groups')
@UsePipes(new ValidationPipe({ transform: true }))
export class ConsumerGroupController extends BrowserBaseController {
  constructor(private service: ConsumerGroupService) {
    super();
  }

  @Post('/get')
  @ApiRedisInstanceOperation({
    description: 'Get consumer groups list',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Returns stream consumer groups.',
        type: ConsumerGroupDto,
        isArray: true,
      },
    ],
  })
  @ApiQueryRedisStringEncoding()
  async getGroups(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: KeyDto,
  ): Promise<ConsumerGroupDto[]> {
    return this.service.getGroups(clientMetadata, dto);
  }

  @Post('')
  @ApiRedisInstanceOperation({
    description: 'Create stream consumer group',
    statusCode: 201,
  })
  async createGroups(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: CreateConsumerGroupsDto,
  ): Promise<void> {
    return this.service.createGroups(clientMetadata, dto);
  }

  @Patch('')
  @ApiRedisInstanceOperation({
    description: 'Modify last delivered ID of the Consumer Group',
    statusCode: 200,
  })
  async updateGroup(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: UpdateConsumerGroupDto,
  ): Promise<void> {
    return this.service.updateGroup(clientMetadata, dto);
  }

  @Delete('')
  @ApiRedisInstanceOperation({
    description: 'Delete Consumer Group',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Returns number of affected consumer groups.',
        type: DeleteConsumerGroupsResponse,
      },
    ],
  })
  async deleteGroup(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: DeleteConsumerGroupsDto,
  ): Promise<DeleteConsumerGroupsResponse> {
    return this.service.deleteGroup(clientMetadata, dto);
  }
}
