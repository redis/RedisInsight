import {
  Body,
  Controller,
  Delete,
  Post,
  Put,
  Res,
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
  AddElementsToVectorSetDto,
  CreateVectorSetDto,
  DeleteVectorSetElementsDto,
  DeleteVectorSetElementsResponse,
  GetVectorSetElementsDto,
  GetVectorSetElementsResponse,
  SimilaritySearchDto,
  SearchVectorSetPreviewResponse,
  SearchVectorSetResponse,
  SetVectorSetElementAttributeDto,
  SetVectorSetElementAttributeResponse,
  VectorSetElementDetailsDto,
  VectorSetElementKeyDto,
} from 'src/modules/browser/vector-set/dto';
import { VectorSetService } from 'src/modules/browser/vector-set/vector-set.service';
import { BrowserSerializeInterceptor } from 'src/common/interceptors';
import { BrowserBaseController } from 'src/modules/browser/browser.base.controller';
import { Response } from 'express';

@ApiTags('Browser: VectorSet')
@UseInterceptors(BrowserSerializeInterceptor)
@Controller('vector-set')
@UsePipes(new ValidationPipe({ transform: true }))
export class VectorSetController extends BrowserBaseController {
  constructor(private vectorSetService: VectorSetService) {
    super();
  }

  @Post('')
  @ApiRedisInstanceOperation({
    description: 'Set key to hold VectorSet data type',
    statusCode: 201,
  })
  @ApiQueryRedisStringEncoding()
  async createVectorSet(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: CreateVectorSetDto,
  ): Promise<void> {
    return await this.vectorSetService.createVectorSet(clientMetadata, dto);
  }

  @Put('')
  @ApiRedisInstanceOperation({
    description: 'Add elements to the VectorSet stored at key',
    statusCode: 200,
  })
  @ApiQueryRedisStringEncoding()
  async addElements(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: AddElementsToVectorSetDto,
  ): Promise<void> {
    return await this.vectorSetService.addElements(clientMetadata, dto);
  }

  // The key name can be very large, so it is better to send it in the request body
  @Post('/get-elements')
  @ApiRedisInstanceOperation({
    description: 'Get elements of the VectorSet stored at key',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Ok',
        type: GetVectorSetElementsResponse,
      },
    ],
  })
  @ApiQueryRedisStringEncoding()
  async getElements(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: GetVectorSetElementsDto,
  ): Promise<GetVectorSetElementsResponse> {
    return await this.vectorSetService.getElements(clientMetadata, dto);
  }

  @Post('/get-details')
  @ApiRedisInstanceOperation({
    description:
      'Get the full details (embedding and attributes) of an element in the VectorSet stored at key',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Ok',
        type: VectorSetElementDetailsDto,
      },
    ],
  })
  @ApiQueryRedisStringEncoding()
  async getElementDetails(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: VectorSetElementKeyDto,
  ): Promise<VectorSetElementDetailsDto> {
    return await this.vectorSetService.getElementDetails(clientMetadata, dto);
  }

  @Put('/attributes')
  @ApiRedisInstanceOperation({
    description: 'Set attributes on an element of the VectorSet stored at key',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Ok',
        type: SetVectorSetElementAttributeResponse,
      },
    ],
  })
  @ApiQueryRedisStringEncoding()
  async setElementAttribute(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: SetVectorSetElementAttributeDto,
  ): Promise<SetVectorSetElementAttributeResponse> {
    return await this.vectorSetService.setElementAttribute(clientMetadata, dto);
  }

  @Post('/download-embedding')
  @ApiRedisInstanceOperation({
    description:
      'Download the full vector embedding of an element in the VectorSet stored at key',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Ok',
      },
    ],
  })
  @ApiQueryRedisStringEncoding()
  async downloadEmbedding(
    @Res() res: Response,
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: VectorSetElementKeyDto,
  ): Promise<void> {
    const { stream } = await this.vectorSetService.downloadEmbedding(
      clientMetadata,
      dto,
    );

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      'attachment;filename="vector_embedding"',
    );
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

    stream
      .on('error', () => {
        if (!res.headersSent) {
          res.status(404).send();
        } else {
          res.destroy();
        }
      })
      .pipe(res);
  }

  @Delete('/elements')
  @ApiRedisInstanceOperation({
    description:
      'Remove the specified elements from the VectorSet stored at key',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Ok',
        type: DeleteVectorSetElementsResponse,
      },
    ],
  })
  @ApiQueryRedisStringEncoding()
  async deleteElements(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: DeleteVectorSetElementsDto,
  ): Promise<DeleteVectorSetElementsResponse> {
    return await this.vectorSetService.deleteElements(clientMetadata, dto);
  }

  @Post('/similarity-search')
  @ApiRedisInstanceOperation({
    description:
      'Run a vector similarity search (VSIM) against the VectorSet stored at key. ' +
      'WITHSCORES and WITHATTRIBS are always applied so each match carries a similarity score and the element attributes (when present).',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Ok',
        type: SearchVectorSetResponse,
      },
    ],
  })
  @ApiQueryRedisStringEncoding()
  async similaritySearch(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: SimilaritySearchDto,
  ): Promise<SearchVectorSetResponse> {
    return await this.vectorSetService.similaritySearch(clientMetadata, dto);
  }

  @Post('/similarity-search/preview')
  @ApiRedisInstanceOperation({
    description:
      'Build a human-readable preview of the VSIM command that the similarity-search endpoint would execute for the supplied DTO. ' +
      'Reuses the same internal command builder as the search endpoint so the preview cannot drift from what is actually executed. ' +
      'Requires exactly one of `elementName` / `vectorValues` / `vectorFp32` — under- or over-specified payloads are rejected with `400`.',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Ok',
        type: SearchVectorSetPreviewResponse,
      },
    ],
  })
  @ApiQueryRedisStringEncoding()
  async getSimilaritySearchPreview(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: SimilaritySearchDto,
  ): Promise<SearchVectorSetPreviewResponse> {
    return await this.vectorSetService.getSimilaritySearchPreview(
      clientMetadata,
      dto,
    );
  }
}
