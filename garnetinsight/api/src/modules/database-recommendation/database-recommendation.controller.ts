import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { ApiRedisParams } from 'src/decorators/api-redis-params.decorator';
import { ApiTags } from '@nestjs/swagger';
import { DatabaseRecommendationService } from 'src/modules/database-recommendation/database-recommendation.service';
import { BrowserClientMetadata } from 'src/modules/browser/decorators/browser-client-metadata.decorator';
import { DatabaseRecommendation } from 'src/modules/database-recommendation/models';
import { ClientMetadata } from 'src/common/models';
import { DatabaseRecommendationsResponse } from 'src/modules/database-recommendation/dto/database-recommendations.response';
import {
  ModifyDatabaseRecommendationDto,
  DeleteDatabaseRecommendationDto,
  DeleteDatabaseRecommendationResponse,
} from './dto';

@ApiTags('Database Recommendations')
@Controller('/recommendations')
export class DatabaseRecommendationController {
  constructor(private service: DatabaseRecommendationService) {}

  @ApiEndpoint({
    statusCode: 200,
    description: 'Get database recommendations',
    responses: [
      {
        status: 200,
        type: DatabaseRecommendationsResponse,
      },
    ],
  })
  @Get('')
  async list(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
  ): Promise<DatabaseRecommendationsResponse> {
    return this.service.list(clientMetadata);
  }

  @Patch('/read')
  @ApiRedisParams()
  @ApiEndpoint({
    statusCode: 200,
    description: 'Mark all database recommendations as read',
    responses: [
      {
        status: 200,
      },
    ],
  })
  async read(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
  ): Promise<void> {
    return this.service.read(clientMetadata);
  }

  @Patch(':id')
  @ApiEndpoint({
    description: 'Update database recommendation by id',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: "Updated database recommendation' response",
        type: DatabaseRecommendation,
      },
    ],
  })
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async modify(
    @Param('id') id: string,
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: ModifyDatabaseRecommendationDto,
  ): Promise<DatabaseRecommendation> {
    return await this.service.update(clientMetadata, id, dto);
  }

  @Delete('')
  @ApiEndpoint({
    statusCode: 200,
    description: 'Delete many recommendations by ids',
    responses: [
      {
        status: 200,
        description: 'Delete many recommendations by ids response',
        type: DeleteDatabaseRecommendationDto,
      },
    ],
  })
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async bulkDeleteDatabaseRecommendation(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: DeleteDatabaseRecommendationDto,
  ): Promise<DeleteDatabaseRecommendationResponse> {
    return await this.service.bulkDelete(clientMetadata, dto.ids);
  }
}
