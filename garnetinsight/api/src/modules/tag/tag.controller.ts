import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { TagService } from './tag.service';
import { CreateTagDto, UpdateTagDto } from './dto';
import { Tag } from './models/tag';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('TAGS')
@Controller('tags')
@UsePipes(new ValidationPipe({ transform: true }))
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  @ApiEndpoint({
    description: 'Get tags list',
    responses: [{ status: 200, isArray: true, type: Tag }],
  })
  async list(): Promise<Tag[]> {
    return this.tagService.list();
  }

  @Get(':id')
  @ApiEndpoint({
    description: 'Get tag by id',
    responses: [{ status: 200, type: Tag }],
  })
  async get(@Param('id') id: string): Promise<Tag> {
    return this.tagService.get(id);
  }

  @Post()
  @ApiEndpoint({
    description: 'Create tag',
    statusCode: 201,
    responses: [{ status: 201, type: Tag }],
  })
  async create(@Body() createTagDto: CreateTagDto): Promise<Tag> {
    return this.tagService.create(createTagDto);
  }

  @Patch(':id')
  @ApiEndpoint({
    description: 'Update tag',
    responses: [{ status: 200, type: Tag }],
  })
  async update(
    @Param('id') id: string,
    @Body() updateTagDto: UpdateTagDto,
  ): Promise<Tag> {
    return this.tagService.update(id, updateTagDto);
  }

  @Delete(':id')
  @ApiEndpoint({
    description: 'Delete tag',
    responses: [{ status: 200 }],
  })
  async delete(@Param('id') id: string): Promise<void> {
    return this.tagService.delete(id);
  }
}
