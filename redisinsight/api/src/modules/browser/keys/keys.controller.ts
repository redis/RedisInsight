import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Patch,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { KeysService } from 'src/modules/browser/keys/keys.service';
import { ApiRedisParams } from 'src/decorators/api-redis-params.decorator';
import { BrowserClientMetadata } from 'src/modules/browser/decorators/browser-client-metadata.decorator';
import { ApiQueryRedisStringEncoding } from 'src/common/decorators';
import { ClientMetadata } from 'src/common/models';
import {
  DeleteKeysDto,
  DeleteKeysResponse,
  GetArrayKeyInfoResponse,
  GetKeyInfoDto,
  GetKeysDto,
  GetKeysWithDetailsResponse,
  GetKeyInfoResponse,
  RenameKeyDto,
  RenameKeyResponse,
  UpdateKeyTtlDto,
  KeyTtlResponse,
  GetKeysInfoDto,
} from 'src/modules/browser/keys/dto';
import { BrowserSerializeInterceptor } from 'src/common/interceptors';

@ApiTags('Browser: Keys')
@UseInterceptors(BrowserSerializeInterceptor)
@Controller('keys')
@UsePipes(new ValidationPipe({ transform: true }))
export class KeysController {
  constructor(private keysService: KeysService) {}

  @Post('')
  @HttpCode(200)
  @ApiOperation({ description: 'Get keys by cursor position' })
  @ApiRedisParams()
  @ApiOkResponse({
    description: 'Keys list',
    type: GetKeysWithDetailsResponse,
    isArray: true,
  })
  @ApiQueryRedisStringEncoding()
  async getKeys(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: GetKeysDto,
  ): Promise<GetKeysWithDetailsResponse[]> {
    return this.keysService.getKeys(clientMetadata, dto);
  }

  @Post('get-metadata')
  @HttpCode(200)
  @ApiOperation({ description: 'Get info for multiple keys' })
  @ApiBody({ type: GetKeysInfoDto })
  @ApiRedisParams()
  @ApiOkResponse({
    description: 'Info for multiple keys',
    type: GetKeyInfoResponse,
    isArray: true,
  })
  @ApiQueryRedisStringEncoding()
  async getKeysInfo(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: GetKeysInfoDto,
  ): Promise<GetKeyInfoResponse[]> {
    return this.keysService.getKeysInfo(clientMetadata, dto);
  }

  // The key name can be very large, so it is better to send it in the request body
  @Post('/get-info')
  @HttpCode(200)
  @ApiOperation({ description: 'Get key info' })
  @ApiRedisParams()
  @ApiBody({ type: GetKeyInfoDto })
  @ApiExtraModels(GetKeyInfoResponse, GetArrayKeyInfoResponse)
  @ApiOkResponse({
    description: 'Keys info',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(GetKeyInfoResponse) },
        { $ref: getSchemaPath(GetArrayKeyInfoResponse) },
      ],
    },
  })
  @ApiQueryRedisStringEncoding()
  async getKeyInfo(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: GetKeyInfoDto,
  ): Promise<GetKeyInfoResponse | GetArrayKeyInfoResponse> {
    return await this.keysService.getKeyInfo(
      clientMetadata,
      dto.keyName,
      dto.includeSize,
    );
  }

  @Delete('')
  @ApiOperation({ description: 'Delete key' })
  @ApiRedisParams()
  @ApiBody({ type: DeleteKeysDto })
  @ApiOkResponse({
    description: 'Number of affected keys.',
    type: DeleteKeysResponse,
  })
  @ApiQueryRedisStringEncoding()
  async deleteKey(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: DeleteKeysDto,
  ): Promise<DeleteKeysResponse> {
    return await this.keysService.deleteKeys(clientMetadata, dto.keyNames);
  }

  @Patch('/name')
  @ApiOperation({ description: 'Rename key' })
  @ApiRedisParams()
  @ApiBody({ type: RenameKeyDto })
  @ApiOkResponse({
    description: 'New key name.',
    type: RenameKeyResponse,
  })
  @ApiQueryRedisStringEncoding()
  async renameKey(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: RenameKeyDto,
  ): Promise<RenameKeyResponse> {
    return await this.keysService.renameKey(clientMetadata, dto);
  }

  @Patch('/ttl')
  @ApiOperation({ description: 'Update the remaining time to live of a key' })
  @ApiRedisParams()
  @ApiBody({ type: UpdateKeyTtlDto })
  @ApiOkResponse({
    description: 'The remaining time to live of a key.',
    type: KeyTtlResponse,
  })
  @ApiQueryRedisStringEncoding()
  async updateTtl(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: UpdateKeyTtlDto,
  ): Promise<KeyTtlResponse> {
    return await this.keysService.updateTtl(clientMetadata, dto);
  }
}
