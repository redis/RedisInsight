import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiRedisParams } from 'src/decorators/api-redis-params.decorator';
import { BrowserClientMetadata } from 'src/modules/browser/decorators/browser-client-metadata.decorator';
import { ApiQueryRedisStringEncoding } from 'src/common/decorators';
import {
  CreateRedisearchIndexDto,
  IndexInfoDto,
  IndexInfoRequestBodyDto,
  ListRedisearchIndexesResponse,
  SearchRedisearchDto,
} from 'src/modules/browser/redisearch/dto';
import { GetKeysWithDetailsResponse } from 'src/modules/browser/keys/dto';
import { RedisearchService } from 'src/modules/browser/redisearch/redisearch.service';
import { ClientMetadata } from 'src/common/models';
import { BrowserSerializeInterceptor } from 'src/common/interceptors';
import { BrowserBaseController } from 'src/modules/browser/browser.base.controller';
import { IndexDeleteRequestBodyDto } from './dto/index.delete.dto';

@ApiTags('Browser: RediSearch')
@UseInterceptors(BrowserSerializeInterceptor)
@Controller('redisearch')
@UsePipes(new ValidationPipe({ transform: true }))
export class RedisearchController extends BrowserBaseController {
  constructor(private service: RedisearchService) {
    super();
  }

  @Get('')
  @ApiOperation({ description: 'Get list of available indexes' })
  @ApiOkResponse({ type: ListRedisearchIndexesResponse })
  @ApiRedisParams()
  @ApiQueryRedisStringEncoding()
  async list(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
  ): Promise<ListRedisearchIndexesResponse> {
    return this.service.list(clientMetadata);
  }

  @Post('')
  @ApiOperation({ description: 'Create redisearch index' })
  @ApiRedisParams()
  @HttpCode(201)
  @ApiBody({ type: CreateRedisearchIndexDto })
  async createIndex(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: CreateRedisearchIndexDto,
  ): Promise<void> {
    return await this.service.createIndex(clientMetadata, dto);
  }

  @Post('search')
  @HttpCode(200)
  @ApiOperation({ description: 'Search for keys in index' })
  @ApiOkResponse({ type: GetKeysWithDetailsResponse })
  @ApiRedisParams()
  @ApiQueryRedisStringEncoding()
  async search(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: SearchRedisearchDto,
  ): Promise<GetKeysWithDetailsResponse> {
    return await this.service.search(clientMetadata, dto);
  }

  @Post('info')
  @HttpCode(200)
  @ApiOperation({ description: 'Get index info' })
  @ApiOkResponse({ type: IndexInfoDto })
  async info(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: IndexInfoRequestBodyDto,
  ): Promise<IndexInfoDto> {
    return await this.service.getInfo(clientMetadata, dto);
  }

  @Delete('')
  @HttpCode(204)
  @ApiOperation({ description: 'Delete index' })
  async delete(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: IndexDeleteRequestBodyDto,
  ): Promise<void> {
    return await this.service.deleteIndex(clientMetadata, dto);
  }
}
