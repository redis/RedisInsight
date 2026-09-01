import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { RequestRdiClientMetadata } from 'src/modules/rdi/decorators';
import { PipelineDraft, RdiClientMetadata } from 'src/modules/rdi/models';
import { PipelineDraftService } from 'src/modules/rdi/pipeline-draft.service';
import {
  CreatePipelineDraftDto,
  UpdatePipelineDraftDto,
} from 'src/modules/rdi/dto';

@ApiTags('RDI')
@UsePipes(new ValidationPipe({ transform: true }))
@UseInterceptors(ClassSerializerInterceptor)
@Controller('rdi/:id/pipeline-drafts')
export class PipelineDraftController {
  constructor(private readonly service: PipelineDraftService) {}

  @Post()
  @ApiEndpoint({
    description: 'Create a pipeline draft',
    statusCode: 201,
    responses: [{ status: 201, type: PipelineDraft }],
  })
  async create(
    @RequestRdiClientMetadata() rdiClientMetadata: RdiClientMetadata,
    @Body() dto: CreatePipelineDraftDto,
  ): Promise<PipelineDraft> {
    return this.service.create(
      rdiClientMetadata.sessionMetadata,
      rdiClientMetadata.id,
      dto,
    );
  }

  @Get()
  @ApiEndpoint({
    description: 'List pipeline drafts for an RDI instance',
    responses: [{ status: 200, type: PipelineDraft, isArray: true }],
  })
  async list(
    @RequestRdiClientMetadata() rdiClientMetadata: RdiClientMetadata,
  ): Promise<PipelineDraft[]> {
    return this.service.list(
      rdiClientMetadata.sessionMetadata,
      rdiClientMetadata.id,
    );
  }

  @Get('/:draftId')
  @ApiEndpoint({
    description: 'Get a pipeline draft by id',
    responses: [{ status: 200, type: PipelineDraft }],
  })
  async get(
    @RequestRdiClientMetadata() rdiClientMetadata: RdiClientMetadata,
    @Param('draftId') draftId: string,
  ): Promise<PipelineDraft> {
    return this.service.get(
      rdiClientMetadata.sessionMetadata,
      rdiClientMetadata.id,
      draftId,
    );
  }

  @Patch('/:draftId')
  @ApiEndpoint({
    description: 'Update a pipeline draft',
    responses: [{ status: 200, type: PipelineDraft }],
  })
  async update(
    @RequestRdiClientMetadata() rdiClientMetadata: RdiClientMetadata,
    @Param('draftId') draftId: string,
    @Body() dto: UpdatePipelineDraftDto,
  ): Promise<PipelineDraft> {
    return this.service.update(
      rdiClientMetadata.sessionMetadata,
      rdiClientMetadata.id,
      draftId,
      dto,
    );
  }

  @Delete('/:draftId')
  @ApiEndpoint({
    description: 'Delete a pipeline draft',
    responses: [{ status: 200 }],
  })
  async delete(
    @RequestRdiClientMetadata() rdiClientMetadata: RdiClientMetadata,
    @Param('draftId') draftId: string,
  ): Promise<void> {
    return this.service.delete(
      rdiClientMetadata.sessionMetadata,
      rdiClientMetadata.id,
      draftId,
    );
  }
}
