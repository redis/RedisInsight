import {
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RequestSessionMetadata } from 'src/common/decorators';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { CloudCapiKey } from 'src/modules/cloud/capi-key/model';
import { CloudCapiKeyService } from 'src/modules/cloud/capi-key/cloud-capi-key.service';

@ApiTags('Cloud CAPI keys')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('cloud/me/capi-keys')
@UsePipes(new ValidationPipe({ transform: true }))
export class CloudCapiKeyController {
  constructor(private readonly service: CloudCapiKeyService) {}

  @Get('')
  @ApiEndpoint({
    description: "Return list of user's existing capi keys",
    statusCode: 200,
    responses: [{ type: CloudCapiKey, isArray: true }],
  })
  async list(
    @RequestSessionMetadata() sessionMetadata,
  ): Promise<CloudCapiKey[]> {
    return this.service.list(sessionMetadata);
  }

  @Delete(':id')
  @ApiEndpoint({
    description: "Removes user's capi keys by id",
    statusCode: 200,
  })
  async delete(
    @RequestSessionMetadata() sessionMetadata,
    @Param('id') id: string,
  ): Promise<void> {
    return this.service.delete(sessionMetadata, id);
  }

  @Delete('')
  @ApiEndpoint({
    description: "Removes all user's capi keys",
    statusCode: 200,
  })
  async deleteAll(@RequestSessionMetadata() sessionMetadata): Promise<void> {
    return this.service.deleteAll(sessionMetadata);
  }
}
