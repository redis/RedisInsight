import {
  Body,
  Controller,
  Delete,
  Post,
  Put,
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
  DeleteVectorSetElementsDto,
  DeleteVectorSetElementsResponse,
  GetVectorSetElementAttributeDto,
  GetVectorSetElementAttributeResponse,
  GetVectorSetElementsDto,
  GetVectorSetElementsResponse,
  SetVectorSetElementAttributeDto,
  SetVectorSetElementAttributeResponse,
} from 'src/modules/browser/vector-set/dto';
import { VectorSetService } from 'src/modules/browser/vector-set/vector-set.service';
import { BrowserSerializeInterceptor } from 'src/common/interceptors';
import { BrowserBaseController } from 'src/modules/browser/browser.base.controller';

@ApiTags('Browser: VectorSet')
@UseInterceptors(BrowserSerializeInterceptor)
@Controller('vector-set')
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

  @Post('/get-attributes')
  @ApiRedisInstanceOperation({
    description: 'Get attributes of an element in the VectorSet stored at key',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Ok',
        type: GetVectorSetElementAttributeResponse,
      },
    ],
  })
  @ApiQueryRedisStringEncoding()
  async getElementAttribute(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: GetVectorSetElementAttributeDto,
  ): Promise<GetVectorSetElementAttributeResponse> {
    return await this.vectorSetService.getElementAttribute(clientMetadata, dto);
  }

  @Put('/attributes')
  @ApiRedisInstanceOperation({
    description: 'Set attributes on an element of the VectorSet stored at key',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Ok',
        type: SetVectorSetElementAttributeResponse,
      },
    ],
  })
  @ApiQueryRedisStringEncoding()
  async setElementAttribute(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: SetVectorSetElementAttributeDto,
  ): Promise<SetVectorSetElementAttributeResponse> {
    return await this.vectorSetService.setElementAttribute(clientMetadata, dto);
  }

  @Delete('/elements')
  @ApiRedisInstanceOperation({
    description:
      'Remove the specified elements from the VectorSet stored at key',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Ok',
        type: DeleteVectorSetElementsResponse,
      },
    ],
  })
  @ApiQueryRedisStringEncoding()
  async deleteElements(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: DeleteVectorSetElementsDto,
  ): Promise<DeleteVectorSetElementsResponse> {
    return await this.vectorSetService.deleteElements(clientMetadata, dto);
  }
}
