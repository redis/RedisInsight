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
} from '@nestjs/common'
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiRedisParams } from 'src/decorators/api-redis-params.decorator'
import { BrowserClientMetadata } from 'src/modules/browser/decorators/browser-client-metadata.decorator'
import { ApiQueryRedisStringEncoding } from 'src/common/decorators'
import { ClientMetadata } from 'src/common/models'
import { BrowserSerializeInterceptor } from 'src/common/interceptors'
import {
  AddElementsToVectorSetDto,
  CreateVectorSetWithExpireDto,
  DeleteVectorSetElementsDto,
  DeleteVectorSetElementsResponse,
  GetVectorSetElementsDto,
  GetVectorSetElementsResponse,
  SearchVectorSetDto,
  SearchVectorSetResponse,
  GetVectorSetElementDetailsDto,
  UpdateVectorSetElementAttributesDto,
} from 'src/modules/browser/vector-set/dto'
import { VectorSetService } from 'src/modules/browser/vector-set/vector-set.service'
import { BrowserBaseController } from 'src/modules/browser/browser.base.controller'

@ApiTags('Browser: Vector Set')
@UseInterceptors(BrowserSerializeInterceptor)
@Controller('vector-set')
@UsePipes(new ValidationPipe({ transform: true }))
export class VectorSetController extends BrowserBaseController {
  constructor(private vectorSetService: VectorSetService) {
    super()
  }

  @Post('')
  @ApiOperation({ description: 'Create a vector set with elements' })
  @ApiRedisParams()
  @ApiBody({ type: CreateVectorSetWithExpireDto })
  @ApiQueryRedisStringEncoding()
  async createVectorSet(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: CreateVectorSetWithExpireDto,
  ): Promise<void> {
    return this.vectorSetService.createVectorSet(clientMetadata, dto)
  }

  @Put('')
  @ApiOperation({ description: 'Add elements to an existing vector set' })
  @ApiRedisParams()
  @ApiBody({ type: AddElementsToVectorSetDto })
  @ApiQueryRedisStringEncoding()
  async addElements(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: AddElementsToVectorSetDto,
  ): Promise<void> {
    return this.vectorSetService.addElements(clientMetadata, dto)
  }

  @Post('/get-elements')
  @HttpCode(200)
  @ApiOperation({
    description: 'Get elements from a vector set stored at key',
  })
  @ApiRedisParams()
  @ApiOkResponse({
    description: 'Vector set elements',
    type: GetVectorSetElementsResponse,
  })
  @ApiQueryRedisStringEncoding()
  async getElements(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: GetVectorSetElementsDto,
  ): Promise<GetVectorSetElementsResponse> {
    return this.vectorSetService.getElements(clientMetadata, dto)
  }

  @Post('/search')
  @HttpCode(200)
  @ApiOperation({
    description: 'Search vector set using similarity search (VSIM)',
  })
  @ApiRedisParams()
  @ApiBody({ type: SearchVectorSetDto })
  @ApiOkResponse({
    description: 'Search results ordered by similarity',
    type: SearchVectorSetResponse,
  })
  @ApiQueryRedisStringEncoding()
  async search(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: SearchVectorSetDto,
  ): Promise<SearchVectorSetResponse> {
    return this.vectorSetService.search(clientMetadata, dto)
  }

  @Post('/element/vector')
  @HttpCode(200)
  @ApiOperation({
    description: 'Get the vector of an element (VEMB)',
  })
  @ApiRedisParams()
  @ApiBody({ type: GetVectorSetElementDetailsDto })
  @ApiOkResponse({
    description: 'Element vector',
  })
  @ApiQueryRedisStringEncoding()
  async getElementVector(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: GetVectorSetElementDetailsDto,
  ): Promise<{ vector: number[] }> {
    return this.vectorSetService.getElementVector(clientMetadata, dto)
  }

  @Post('/element/attributes')
  @HttpCode(200)
  @ApiOperation({
    description: 'Get the attributes of an element (VGETATTR)',
  })
  @ApiRedisParams()
  @ApiBody({ type: GetVectorSetElementDetailsDto })
  @ApiOkResponse({
    description: 'Element attributes',
  })
  @ApiQueryRedisStringEncoding()
  async getElementAttributes(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: GetVectorSetElementDetailsDto,
  ): Promise<{ attributes: Record<string, any> | null }> {
    return this.vectorSetService.getElementAttributes(clientMetadata, dto)
  }

  @Patch('/attributes')
  @ApiOperation({
    description: 'Update element attributes (VSETATTR)',
  })
  @ApiRedisParams()
  @ApiBody({ type: UpdateVectorSetElementAttributesDto })
  @ApiQueryRedisStringEncoding()
  async updateElementAttributes(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: UpdateVectorSetElementAttributesDto,
  ): Promise<void> {
    return this.vectorSetService.updateElementAttributes(clientMetadata, dto)
  }

  @Delete('/elements')
  @ApiOperation({
    description: 'Remove elements from a vector set stored at key',
  })
  @ApiRedisParams()
  @ApiBody({ type: DeleteVectorSetElementsDto })
  @ApiOkResponse({
    description: 'Number of elements removed',
    type: DeleteVectorSetElementsResponse,
  })
  @ApiQueryRedisStringEncoding()
  async deleteElements(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: DeleteVectorSetElementsDto,
  ): Promise<DeleteVectorSetElementsResponse> {
    return this.vectorSetService.deleteElements(clientMetadata, dto)
  }
}
