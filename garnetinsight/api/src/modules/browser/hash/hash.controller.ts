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
import { ApiRedisParams } from 'src/decorators/api-redis-params.decorator';
import { BrowserClientMetadata } from 'src/modules/browser/decorators/browser-client-metadata.decorator';
import { ApiQueryRedisStringEncoding } from 'src/common/decorators';
import { ClientMetadata } from 'src/common/models';
import { BrowserSerializeInterceptor } from 'src/common/interceptors';
import {
  AddFieldsToHashDto,
  CreateHashWithExpireDto,
  DeleteFieldsFromHashDto,
  DeleteFieldsFromHashResponse,
  GetHashFieldsDto,
  GetHashFieldsResponse,
  UpdateHashFieldsTtlDto,
} from 'src/modules/browser/hash/dto';
import { HashService } from 'src/modules/browser/hash/hash.service';
import { BrowserBaseController } from 'src/modules/browser/browser.base.controller';

@ApiTags('Browser: Hash')
@UseInterceptors(BrowserSerializeInterceptor)
@Controller('hash')
@UsePipes(new ValidationPipe({ transform: true }))
export class HashController extends BrowserBaseController {
  constructor(private hashService: HashService) {
    super();
  }

  @Post('')
  @ApiOperation({ description: 'Set key to hold Hash data type' })
  @ApiRedisParams()
  @ApiBody({ type: CreateHashWithExpireDto })
  @ApiQueryRedisStringEncoding()
  async createHash(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: CreateHashWithExpireDto,
  ): Promise<void> {
    return await this.hashService.createHash(clientMetadata, dto);
  }

  // The key name can be very large, so it is better to send it in the request body
  @Post('/get-fields')
  @HttpCode(200)
  @ApiOperation({
    description:
      'Get specified fields of the hash stored at key by cursor position',
  })
  @ApiRedisParams()
  @ApiOkResponse({
    description: 'Specified fields of the hash stored at key.',
    type: GetHashFieldsResponse,
  })
  @ApiQueryRedisStringEncoding()
  async getMembers(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: GetHashFieldsDto,
  ): Promise<GetHashFieldsResponse> {
    return await this.hashService.getFields(clientMetadata, dto);
  }

  @Put('')
  @ApiOperation({
    description: 'Add the specified fields to the Hash stored at key',
  })
  @ApiRedisParams()
  @ApiBody({ type: AddFieldsToHashDto })
  @ApiQueryRedisStringEncoding()
  async addMember(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: AddFieldsToHashDto,
  ): Promise<void> {
    return await this.hashService.addFields(clientMetadata, dto);
  }

  @Patch('/ttl')
  @ApiOperation({
    description: 'Update hash fields ttl',
  })
  @ApiRedisParams()
  @ApiBody({ type: UpdateHashFieldsTtlDto })
  @ApiQueryRedisStringEncoding()
  async updateTtl(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: UpdateHashFieldsTtlDto,
  ): Promise<void> {
    return await this.hashService.updateTtl(clientMetadata, dto);
  }

  @Delete('/fields')
  @ApiOperation({
    description: 'Remove the specified fields from the Hash stored at key',
  })
  @ApiRedisParams()
  @ApiBody({ type: DeleteFieldsFromHashDto })
  @ApiQueryRedisStringEncoding()
  async deleteFields(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: DeleteFieldsFromHashDto,
  ): Promise<DeleteFieldsFromHashResponse> {
    return await this.hashService.deleteFields(clientMetadata, dto);
  }
}
