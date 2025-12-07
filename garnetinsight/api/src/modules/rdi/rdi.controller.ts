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
import { Rdi, RdiClientMetadata } from 'src/modules/rdi/models';
import { ApiTags } from '@nestjs/swagger';
import { RdiService } from 'src/modules/rdi/rdi.service';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { CreateRdiDto, UpdateRdiDto } from 'src/modules/rdi/dto';
import { RequestRdiClientMetadata } from 'src/modules/rdi/decorators';
import { RequestSessionMetadata } from 'src/common/decorators';
import { SessionMetadata } from 'src/common/models';

@ApiTags('RDI')
@UsePipes(new ValidationPipe({ transform: true }))
@UseInterceptors(ClassSerializerInterceptor)
@Controller('rdi')
export class RdiController {
  constructor(private readonly rdiService: RdiService) {}

  @Get()
  @ApiEndpoint({
    description: 'Get RDI list',
    responses: [{ status: 200, isArray: true, type: Rdi }],
  })
  async list(): Promise<Rdi[]> {
    return this.rdiService.list();
  }

  @Get('/:id')
  @ApiEndpoint({
    description: 'Get RDI by id',
    responses: [{ status: 200, type: Rdi }],
  })
  async get(@Param('id') id: string): Promise<Rdi> {
    return this.rdiService.get(id);
  }

  @Post()
  @ApiEndpoint({
    description: 'Create RDI',
    statusCode: 201,
    responses: [{ status: 201, type: Rdi }],
  })
  async create(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
    @Body() dto: CreateRdiDto,
  ): Promise<Rdi> {
    return this.rdiService.create(sessionMetadata, dto);
  }

  @Patch('/:id')
  @ApiEndpoint({
    description: 'Update RDI',
    responses: [{ status: 200, type: Rdi }],
  })
  async update(
    @RequestRdiClientMetadata() rdiClientMetadata: RdiClientMetadata,
    @Body() dto: UpdateRdiDto,
  ): Promise<Rdi> {
    return this.rdiService.update(rdiClientMetadata, dto);
  }

  @Delete()
  @ApiEndpoint({
    description: 'Delete RDI',
    responses: [{ status: 200 }],
  })
  async delete(
    @Body() body: { ids: string[] },
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
  ): Promise<void> {
    return this.rdiService.delete(sessionMetadata, body.ids);
  }

  @Get(':id/connect')
  @ApiEndpoint({
    description: 'Connect to RDI',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Successfully connected to rdi instance',
      },
    ],
  })
  async connect(
    @RequestRdiClientMetadata() rdiClientMetadata: RdiClientMetadata,
  ): Promise<void> {
    return this.rdiService.connect(rdiClientMetadata);
  }
}
