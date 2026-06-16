import {
  Body,
  Controller,
  HttpCode,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiRedisParams } from 'src/decorators/api-redis-params.decorator';
import { ApiQueryRedisStringEncoding } from 'src/common/decorators';
import { ClientMetadata } from 'src/common/models';
import { BrowserSerializeInterceptor } from 'src/common/interceptors';
import { BrowserClientMetadata } from 'src/modules/browser/decorators/browser-client-metadata.decorator';
import { BrowserBaseController } from 'src/modules/browser/browser.base.controller';
import { KeyDto } from 'src/modules/browser/keys/dto';
import { ArrayService } from 'src/modules/browser/array/array.service';
import {
  CreateArrayWithExpireDto,
  GetArrayCountResponse,
  GetArrayElementDto,
  GetArrayElementResponse,
  GetArrayLengthResponse,
  GetArrayMultiElementsDto,
  GetArrayMultiElementsResponse,
  GetArrayNextIndexResponse,
  GetArrayRangeDto,
  GetArrayRangeResponse,
  GetArrayScanDto,
  GetArrayScanResponse,
} from 'src/modules/browser/array/dto';

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
    return this.arrayService.createArray(clientMetadata, dto);
  }

  // The key name can be very large, so it is better to send it in the request body
  @Post('/get-range')
  @HttpCode(200)
  @ApiOperation({
    description:
      'Read a range of elements from the array stored at key (ARGETRANGE). ' +
      'Empty slots are returned as null. The range is inclusive and ' +
      'requires start ≤ end; a reversed range is rejected with 400.',
  })
  @ApiRedisParams()
  @ApiOkResponse({ type: GetArrayRangeResponse })
  @ApiQueryRedisStringEncoding()
  async getRange(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: GetArrayRangeDto,
  ): Promise<GetArrayRangeResponse> {
    return this.arrayService.getRange(clientMetadata, dto);
  }

  @Post('/scan')
  @HttpCode(200)
  @ApiOperation({
    description:
      'Scan a range of populated elements from the array stored at key (ARSCAN). ' +
      'Empty slots are skipped. The range is inclusive and requires ' +
      'start ≤ end; a reversed range is rejected with 400.',
  })
  @ApiRedisParams()
  @ApiOkResponse({ type: GetArrayScanResponse })
  @ApiQueryRedisStringEncoding()
  async scan(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: GetArrayScanDto,
  ): Promise<GetArrayScanResponse> {
    return this.arrayService.scan(clientMetadata, dto);
  }

  @Post('/get-length')
  @HttpCode(200)
  @ApiOperation({
    description:
      'Get the logical length of the array (highest set index + 1, includes gaps) — ARLEN.',
  })
  @ApiRedisParams()
  @ApiOkResponse({ type: GetArrayLengthResponse })
  @ApiQueryRedisStringEncoding()
  async getLength(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: KeyDto,
  ): Promise<GetArrayLengthResponse> {
    return this.arrayService.getLength(clientMetadata, dto);
  }

  @Post('/get-count')
  @HttpCode(200)
  @ApiOperation({
    description: 'Get the count of populated (non-empty) elements — ARCOUNT.',
  })
  @ApiRedisParams()
  @ApiOkResponse({ type: GetArrayCountResponse })
  @ApiQueryRedisStringEncoding()
  async getCount(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: KeyDto,
  ): Promise<GetArrayCountResponse> {
    return this.arrayService.getCount(clientMetadata, dto);
  }

  @Post('/get-next-index')
  @HttpCode(200)
  @ApiOperation({
    description:
      'Get the next index that ARINSERT would use (read-only) — ARNEXT.',
  })
  @ApiRedisParams()
  @ApiOkResponse({ type: GetArrayNextIndexResponse })
  @ApiQueryRedisStringEncoding()
  async getNextIndex(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: KeyDto,
  ): Promise<GetArrayNextIndexResponse> {
    return this.arrayService.getNextIndex(clientMetadata, dto);
  }

  @Post('/get-element')
  @HttpCode(200)
  @ApiOperation({
    description:
      'Get the value at a single index, or null for an empty slot / out of range — ARGET.',
  })
  @ApiRedisParams()
  @ApiOkResponse({ type: GetArrayElementResponse })
  @ApiQueryRedisStringEncoding()
  async getElement(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: GetArrayElementDto,
  ): Promise<GetArrayElementResponse> {
    return this.arrayService.getElement(clientMetadata, dto);
  }

  @Post('/get-elements')
  @HttpCode(200)
  @ApiOperation({
    description:
      'Get values at multiple indexes in one round-trip — ARMGET. ' +
      'Returns an array of bulk|null, one per requested index, in request order.',
  })
  @ApiRedisParams()
  @ApiOkResponse({ type: GetArrayMultiElementsResponse })
  @ApiQueryRedisStringEncoding()
  async getMultiElements(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: GetArrayMultiElementsDto,
  ): Promise<GetArrayMultiElementsResponse> {
    return this.arrayService.getMultiElements(clientMetadata, dto);
  }
}
