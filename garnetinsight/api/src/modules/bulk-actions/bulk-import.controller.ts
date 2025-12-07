import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  Post,
  Req,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import * as Busboy from 'busboy';
import { Readable } from 'stream';
import { Request } from 'express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { BulkImportService } from 'src/modules/bulk-actions/bulk-import.service';
import { ClientMetadataParam } from 'src/common/decorators';
import { ClientMetadata } from 'src/common/models';
import { IBulkActionOverview } from 'src/modules/bulk-actions/interfaces/bulk-action-overview.interface';
import {
  UploadImportFileByPathDto,
  ImportVectorCollectionDto,
} from 'src/modules/bulk-actions/dto/upload-import-file-by-path.dto';

@UsePipes(new ValidationPipe({ transform: true }))
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Bulk Actions')
@Controller('/bulk-actions/import')
export class BulkImportController {
  constructor(private readonly service: BulkImportService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @HttpCode(200)
  @ApiEndpoint({
    description: 'Import data from file',
    responses: [
      {
        type: Object,
      },
    ],
  })
  async import(
    @Req() req: Request,
    @ClientMetadataParam() clientMetadata: ClientMetadata,
  ): Promise<IBulkActionOverview> {
    return new Promise((res, rej) => {
      const busboy = Busboy({ headers: req.headers });

      busboy.on('file', (_fieldName: string, fileStream: Readable) => {
        this.service.import(clientMetadata, fileStream).then(res).catch(rej);
      });

      req.pipe(busboy);
    });
  }

  @Post('/tutorial-data')
  @HttpCode(200)
  @ApiEndpoint({
    description: 'Import data from tutorial by path',
    responses: [
      {
        type: Object,
      },
    ],
  })
  async uploadFromTutorial(
    @Body() dto: UploadImportFileByPathDto,
    @ClientMetadataParam() clientMetadata: ClientMetadata,
  ): Promise<IBulkActionOverview> {
    return this.service.uploadFromTutorial(clientMetadata, dto);
  }

  @Post('/default-data')
  @HttpCode(200)
  @ApiEndpoint({
    description: 'Import default data',
    responses: [
      {
        type: Object,
      },
    ],
  })
  async importDefaultData(
    @ClientMetadataParam() clientMetadata: ClientMetadata,
  ): Promise<IBulkActionOverview> {
    return this.service.importDefaultData(clientMetadata);
  }

  @Post('/vector-collection')
  @HttpCode(200)
  @ApiEndpoint({
    description: 'Import vector collection data',
    responses: [
      {
        type: Object,
      },
    ],
  })
  async importVectorCollection(
    @Body() dto: ImportVectorCollectionDto,
    @ClientMetadataParam() clientMetadata: ClientMetadata,
  ): Promise<IBulkActionOverview> {
    return this.service.importVectorCollection(clientMetadata, dto);
  }
}
