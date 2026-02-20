import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { ApiRedisParams } from 'src/decorators/api-redis-params.decorator';
import { ClientMetadataParam } from 'src/common/decorators';
import { ClientMetadata } from 'src/common/models';
import { QueryLibraryService } from './query-library.service';
import { QueryLibraryItem } from './models/query-library';
import {
  CreateQueryLibraryItemDto,
  UpdateQueryLibraryItemDto,
  SeedQueryLibraryDto,
  QueryLibraryFilterDto,
} from './dto';

@ApiTags('Query Library')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('query-library')
export class QueryLibraryController {
  constructor(private readonly service: QueryLibraryService) {}

  @ApiEndpoint({
    description: 'Create a query library item',
    statusCode: 201,
    responses: [
      {
        status: 201,
        type: QueryLibraryItem,
      },
    ],
  })
  @Post()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiRedisParams()
  async create(
    @ClientMetadataParam() clientMetadata: ClientMetadata,
    @Body() dto: CreateQueryLibraryItemDto,
  ): Promise<QueryLibraryItem> {
    return this.service.create(
      clientMetadata.sessionMetadata,
      clientMetadata.databaseId,
      dto,
    );
  }

  @ApiEndpoint({
    description: 'List query library items',
    statusCode: 200,
    responses: [
      {
        status: 200,
        type: QueryLibraryItem,
        isArray: true,
      },
    ],
  })
  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiRedisParams()
  async list(
    @ClientMetadataParam() clientMetadata: ClientMetadata,
    @Query() filter: QueryLibraryFilterDto,
  ): Promise<QueryLibraryItem[]> {
    return this.service.getList(
      clientMetadata.sessionMetadata,
      clientMetadata.databaseId,
      filter,
    );
  }

  @ApiEndpoint({
    description: 'Get a query library item by id',
    statusCode: 200,
    responses: [
      {
        status: 200,
        type: QueryLibraryItem,
      },
    ],
  })
  @Get('/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiRedisParams()
  async getOne(
    @ClientMetadataParam() clientMetadata: ClientMetadata,
    @Param('id') id: string,
  ): Promise<QueryLibraryItem> {
    return this.service.getOne(
      clientMetadata.sessionMetadata,
      clientMetadata.databaseId,
      id,
    );
  }

  @ApiEndpoint({
    description: 'Update a query library item',
    statusCode: 200,
    responses: [
      {
        status: 200,
        type: QueryLibraryItem,
      },
    ],
  })
  @Patch('/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiRedisParams()
  async update(
    @ClientMetadataParam() clientMetadata: ClientMetadata,
    @Param('id') id: string,
    @Body() dto: UpdateQueryLibraryItemDto,
  ): Promise<QueryLibraryItem> {
    return this.service.update(
      clientMetadata.sessionMetadata,
      clientMetadata.databaseId,
      id,
      dto,
    );
  }

  @ApiEndpoint({
    description: 'Delete a query library item',
    statusCode: 200,
  })
  @Delete('/:id')
  @ApiRedisParams()
  async delete(
    @ClientMetadataParam() clientMetadata: ClientMetadata,
    @Param('id') id: string,
  ): Promise<void> {
    return this.service.delete(
      clientMetadata.sessionMetadata,
      clientMetadata.databaseId,
      id,
    );
  }

  @ApiEndpoint({
    description: 'Seed sample queries into the query library',
    statusCode: 201,
    responses: [
      {
        status: 201,
        type: QueryLibraryItem,
        isArray: true,
      },
    ],
  })
  @Post('/seed')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiRedisParams()
  async seed(
    @ClientMetadataParam() clientMetadata: ClientMetadata,
    @Body() dto: SeedQueryLibraryDto,
  ): Promise<QueryLibraryItem[]> {
    return this.service.seed(
      clientMetadata.sessionMetadata,
      clientMetadata.databaseId,
      dto,
    );
  }
}
