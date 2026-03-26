import {
  Body,
  Controller,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiRedisInstanceOperation } from 'src/decorators/api-redis-instance-operation.decorator';
import { BrowserClientMetadata } from 'src/modules/browser/decorators/browser-client-metadata.decorator';
import { ApiQueryRedisStringEncoding } from 'src/common/decorators';
import { ClientMetadata } from 'src/common/models';
import {
  GetVectorSetElementsDto,
  GetVectorSetElementsResponse,
} from 'src/modules/browser/vector-set/dto';
import { VectorSetService } from 'src/modules/browser/vector-set/vector-set.service';
import { BrowserSerializeInterceptor } from 'src/common/interceptors';
import { BrowserBaseController } from 'src/modules/browser/browser.base.controller';

@ApiTags('Browser: VectorSet')
@UseInterceptors(BrowserSerializeInterceptor)
@Controller('vectorSet')
@UsePipes(new ValidationPipe({ transform: true }))
export class VectorSetController extends BrowserBaseController {
  constructor(private vectorSetService: VectorSetService) {
    super();
  }

  // The key name can be very large, so it is better to send it in the request body
  @Post('/get-elements')
  @ApiRedisInstanceOperation({
    description: 'Get elements of the VectorSet stored at key',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Ok',
        type: GetVectorSetElementsResponse,
      },
    ],
  })
  @ApiQueryRedisStringEncoding()
  async getElements(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: GetVectorSetElementsDto,
  ): Promise<GetVectorSetElementsResponse> {
    return await this.vectorSetService.getElements(clientMetadata, dto);
  }
}
