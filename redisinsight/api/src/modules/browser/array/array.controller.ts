import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Patch,
  Post,
  Put,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClientMetadata } from 'src/common/models';
import { BrowserSerializeInterceptor } from 'src/common/interceptors';
import { ApiQueryRedisStringEncoding } from 'src/common/decorators';
import { ApiRedisParams } from 'src/decorators/api-redis-params.decorator';
import { ApiRedisInstanceOperation } from 'src/decorators/api-redis-instance-operation.decorator';
import { BrowserBaseController } from 'src/modules/browser/browser.base.controller';
import { BrowserClientMetadata } from 'src/modules/browser/decorators/browser-client-metadata.decorator';
import { KeyDto } from 'src/modules/browser/keys/dto';
import { ArrayService } from './array.service';
import {
  AddArrayElementsDto,
  ArrayInfoResponse,
  CreateArrayWithExpireDto,
  DeleteArrayElementsDto,
  DeleteArrayElementsResponse,
  DeleteArrayRangesDto,
  GetArrayElementDto,
  GetArrayElementResponse,
  GetArrayElementsDto,
  GetArrayElementsResponse,
  SearchArrayElementsDto,
  SetArrayElementDto,
  SetArrayElementResponse,
} from './dto';

@ApiTags('Browser: Array')
@UseInterceptors(BrowserSerializeInterceptor)
@Controller('array')
@UsePipes(new ValidationPipe({ transform: true }))
export class ArrayController extends BrowserBaseController {
  constructor(private arrayService: ArrayService) {
    super();
  }

  @Post('')
  @ApiOperation({ description: 'Set key to hold Array data type' })
  @ApiRedisParams()
  @ApiBody({ type: CreateArrayWithExpireDto })
  @ApiQueryRedisStringEncoding()
  async createArray(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: CreateArrayWithExpireDto,
  ): Promise<void> {
    return await this.arrayService.createArray(clientMetadata, dto);
  }

  @Put('')
  @ApiRedisInstanceOperation({
    description: 'Add or update elements in the Array stored at key',
    statusCode: 200,
  })
  @ApiQueryRedisStringEncoding()
  async addElements(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: AddArrayElementsDto,
  ): Promise<void> {
    return await this.arrayService.addElements(clientMetadata, dto);
  }

  @Post('/get-elements')
  @HttpCode(200)
  @ApiOperation({
    description: 'Get populated elements of the Array stored at key',
  })
  @ApiRedisParams()
  @ApiOkResponse({
    description: 'Populated elements of the Array stored at key.',
    type: GetArrayElementsResponse,
  })
  @ApiQueryRedisStringEncoding()
  async getElements(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: GetArrayElementsDto,
  ): Promise<GetArrayElementsResponse> {
    return await this.arrayService.getElements(clientMetadata, dto);
  }

  @Post('/get-element')
  @HttpCode(200)
  @ApiRedisInstanceOperation({
    description: 'Get specified Array element by index',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Specified element of the Array stored at key.',
        type: GetArrayElementResponse,
      },
    ],
  })
  @ApiQueryRedisStringEncoding()
  async getElement(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: GetArrayElementDto,
  ): Promise<GetArrayElementResponse> {
    return await this.arrayService.getElement(clientMetadata, dto);
  }

  @Post('/search')
  @HttpCode(200)
  @ApiRedisInstanceOperation({
    description: 'Search Array elements by textual predicate',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Matching Array elements.',
        type: GetArrayElementsResponse,
      },
    ],
  })
  @ApiQueryRedisStringEncoding()
  async searchElements(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: SearchArrayElementsDto,
  ): Promise<GetArrayElementsResponse> {
    return await this.arrayService.searchElements(clientMetadata, dto);
  }

  @Post('/info')
  @HttpCode(200)
  @ApiRedisInstanceOperation({
    description: 'Get Array metadata',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Array metadata.',
        type: ArrayInfoResponse,
      },
    ],
  })
  @ApiQueryRedisStringEncoding()
  async getInfo(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: KeyDto,
  ): Promise<ArrayInfoResponse> {
    return await this.arrayService.getInfo(clientMetadata, dto.keyName);
  }

  @Patch('')
  @ApiOperation({ description: 'Update Array element by index.' })
  @ApiRedisParams()
  @ApiBody({ type: SetArrayElementDto })
  @ApiQueryRedisStringEncoding()
  async updateElement(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: SetArrayElementDto,
  ): Promise<SetArrayElementResponse> {
    return await this.arrayService.setElement(clientMetadata, dto);
  }

  @Delete('/elements')
  @ApiRedisInstanceOperation({
    description: 'Remove the specified elements from the Array stored at key.',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Removed elements count.',
        type: DeleteArrayElementsResponse,
      },
    ],
  })
  @ApiQueryRedisStringEncoding()
  async deleteElements(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: DeleteArrayElementsDto,
  ): Promise<DeleteArrayElementsResponse> {
    return await this.arrayService.deleteElements(clientMetadata, dto);
  }

  @Delete('/ranges')
  @ApiRedisInstanceOperation({
    description: 'Remove the specified ranges from the Array stored at key.',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Removed elements count.',
        type: DeleteArrayElementsResponse,
      },
    ],
  })
  @ApiQueryRedisStringEncoding()
  async deleteRanges(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: DeleteArrayRangesDto,
  ): Promise<DeleteArrayElementsResponse> {
    return await this.arrayService.deleteRanges(clientMetadata, dto);
  }
}
