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
  DeleteVectorSetElementsDto,
  DeleteVectorSetElementsResponse,
  DownloadVectorSetEmbeddingDto,
  GetVectorSetElementAttributeDto,
  GetVectorSetElementsDto,
  GetVectorSetElementsResponse,
  SetVectorSetElementAttributeDto,
  SetVectorSetElementAttributeResponse,
  VectorSetElementDto,
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
        type: VectorSetElementDto,
      },
    ],
  })
  @ApiQueryRedisStringEncoding()
  async getElementDetails(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: GetVectorSetElementAttributeDto,
  ): Promise<VectorSetElementDto> {
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
  @ApiQueryRedisStringEncoding()
  async downloadEmbedding(
    @Res() res: Response,
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: DownloadVectorSetEmbeddingDto,
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

    stream.on('error', () => res.status(404).send()).pipe(res);
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
}
