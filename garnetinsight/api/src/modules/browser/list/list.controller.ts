import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ApiRedisParams } from 'src/decorators/api-redis-params.decorator';
import { ApiRedisInstanceOperation } from 'src/decorators/api-redis-instance-operation.decorator';
import {
  PushElementToListDto,
  CreateListWithExpireDto,
  GetListElementsDto,
  GetListElementsResponse,
  SetListElementDto,
  SetListElementResponse,
  GetListElementResponse,
  DeleteListElementsDto,
  DeleteListElementsResponse,
  PushListElementsResponse,
} from 'src/modules/browser/list/dto';
import { KeyDto } from 'src/modules/browser/keys/dto';
import { BrowserClientMetadata } from 'src/modules/browser/decorators/browser-client-metadata.decorator';
import { ApiQueryRedisStringEncoding } from 'src/common/decorators';
import { ClientMetadata } from 'src/common/models';
import { BrowserSerializeInterceptor } from 'src/common/interceptors';
import { ListService } from 'src/modules/browser/list/list.service';
import { BrowserBaseController } from 'src/modules/browser/browser.base.controller';

@ApiTags('Browser: List')
@UseInterceptors(BrowserSerializeInterceptor)
@Controller('list')
@UsePipes(new ValidationPipe({ transform: true }))
export class ListController extends BrowserBaseController {
  constructor(private listService: ListService) {
    super();
  }

  @Post('')
  @ApiOperation({ description: 'Set key to hold list data type' })
  @ApiRedisParams()
  @ApiBody({ type: CreateListWithExpireDto })
  @ApiQueryRedisStringEncoding()
  async createList(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: CreateListWithExpireDto,
  ): Promise<void> {
    return await this.listService.createList(clientMetadata, dto);
  }

  @Put('')
  @ApiRedisInstanceOperation({
    description: 'Insert element at the head/tail of the List data type',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Length of the list after the push operation',
        type: PushListElementsResponse,
      },
    ],
  })
  @ApiQueryRedisStringEncoding()
  async pushElement(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: PushElementToListDto,
  ): Promise<PushListElementsResponse> {
    return await this.listService.pushElement(clientMetadata, dto);
  }

  // The key name can be very large, so it is better to send it in the request body
  @Post('/get-elements')
  @HttpCode(200)
  @ApiOperation({
    description: 'Get specified elements of the list stored at key',
  })
  @ApiRedisParams()
  @ApiOkResponse({
    description: 'Specified elements of the list stored at key.',
    type: GetListElementsResponse,
  })
  @ApiQueryRedisStringEncoding()
  async getElements(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: GetListElementsDto,
  ): Promise<GetListElementsResponse> {
    return this.listService.getElements(clientMetadata, dto);
  }

  @Patch('')
  @ApiOperation({
    description: 'Update list element by index.',
  })
  @ApiRedisParams()
  @ApiBody({ type: SetListElementDto })
  @ApiQueryRedisStringEncoding()
  async updateElement(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: SetListElementDto,
  ): Promise<SetListElementResponse> {
    return await this.listService.setElement(clientMetadata, dto);
  }

  @Post('/get-elements/:index')
  @ApiParam({
    name: 'index',
    description:
      'Zero-based index. 0 - first element, 1 - second element and so on. ' +
      'Negative indices can be used to designate elements starting at the tail of the list. ' +
      'Here, -1 means the last element',
    type: Number,
    required: true,
  })
  @ApiRedisInstanceOperation({
    description: 'Get specified List element by index',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Specified elements of the list stored at key.',
        type: GetListElementsResponse,
      },
    ],
  })
  @ApiQueryRedisStringEncoding()
  async getElement(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Param('index') index: number,
    @Body() dto: KeyDto,
  ): Promise<GetListElementResponse> {
    return this.listService.getElement(clientMetadata, index, dto);
  }

  @Delete('/elements')
  @ApiRedisInstanceOperation({
    description:
      'Remove and return the elements from the tail/head of list stored at key.',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Removed elements.',
        type: GetListElementsResponse,
      },
    ],
  })
  @ApiQueryRedisStringEncoding()
  async deleteElement(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: DeleteListElementsDto,
  ): Promise<DeleteListElementsResponse> {
    return this.listService.deleteElements(clientMetadata, dto);
  }
}
