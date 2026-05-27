import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Logger,
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
  AddElementsToArrayDto,
  CreateArrayDto,
  DeleteArrayElementsDto,
  DeleteArrayElementsResponse,
  GetArrayElementsDto,
  GetArrayElementsResponse,
} from 'src/modules/browser/array/dto';
import { ArrayService } from 'src/modules/browser/array/array.service';
import { BrowserSerializeInterceptor } from 'src/common/interceptors';
import { BrowserBaseController } from 'src/modules/browser/browser.base.controller';

@ApiTags('Browser: Array')
@UseInterceptors(BrowserSerializeInterceptor)
@Controller('array')
@UsePipes(new ValidationPipe({ transform: true }))
export class ArrayController extends BrowserBaseController {
  private readonly logger = new Logger(ArrayController.name);

  constructor(private arrayService: ArrayService) {
    super();
  }

  @Post('')
  @ApiRedisInstanceOperation({
    description: 'Create a key to hold an Array data type',
    statusCode: 201,
  })
  @ApiQueryRedisStringEncoding()
  async createArray(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: CreateArrayDto,
  ): Promise<void> {
    return await this.arrayService.createArray(clientMetadata, dto);
  }

  @Put('')
  @ApiRedisInstanceOperation({
    description: 'Set elements at specified indices in the Array stored at key',
    statusCode: 200,
  })
  @ApiQueryRedisStringEncoding()
  async addElements(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: AddElementsToArrayDto,
  ): Promise<void> {
    return await this.arrayService.addElements(clientMetadata, dto);
  }

  // The key name can be very large, so it is better to send it in the request body
  @Post('/get-elements')
  @HttpCode(200)
  @ApiRedisInstanceOperation({
    description:
      'Get elements of the Array stored at key using ARSCAN cursor-based pagination. ' +
      'Only non-empty slots are returned. Pass the returned `nextCursor` as `cursor` to fetch the next page.',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Ok',
        type: GetArrayElementsResponse,
      },
    ],
  })
  @ApiQueryRedisStringEncoding()
  async getElements(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: GetArrayElementsDto,
  ): Promise<GetArrayElementsResponse> {
    return await this.arrayService.getElements(clientMetadata, dto);
  }

  @Delete('/elements')
  @ApiRedisInstanceOperation({
    description:
      'Delete elements at the specified indices from the Array stored at key',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Ok',
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
}
