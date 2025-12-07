import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { TagRepository } from './repository/tag.repository';
import { CreateTagDto, UpdateTagDto } from './dto';
import { Tag } from './models/tag';
import { classToClass } from 'src/utils';

@Injectable()
export class TagService {
  private logger = new Logger('RdiService');

  constructor(private readonly tagRepository: TagRepository) {}

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const model = classToClass(Tag, createTagDto);
    try {
      const tag = await this.tagRepository.create(model);
      this.logger.debug('Successfully created tag', tag);
      return tag;
    } catch (error) {
      if (error.code === '2067') {
        // Unique violation error code for SQLite (SQLITE_CONSTRAINT_UNIQUE)
        throw new ConflictException(
          `Tag with key ${createTagDto.key} and value ${createTagDto.value} already exists`,
        );
      }
      throw error;
    }
  }

  async list(): Promise<Tag[]> {
    return this.tagRepository.list();
  }

  async get(id: string): Promise<Tag> {
    const tag = await this.tagRepository.get(id);

    if (!tag) {
      throw new NotFoundException(`Tag with id ${id} not found`);
    }

    return tag;
  }

  async getByKeyValuePair(key: string, value: string): Promise<Tag> {
    const tag = await this.tagRepository.getByKeyValuePair(key, value);

    if (!tag) {
      throw new NotFoundException(
        `Tag with key ${key} and value ${value} not found`,
      );
    }

    return tag;
  }

  async getOrCreateByKeyValuePairs(
    keyValuePairs: CreateTagDto[],
  ): Promise<Tag[]> {
    return this.tagRepository.getOrCreateByKeyValuePairs(keyValuePairs);
  }

  async update(id: string, updateTagDto: UpdateTagDto): Promise<Tag> {
    await this.tagRepository.update(id, updateTagDto);

    this.logger.debug('Successfully updated tag', { id, updateTagDto });

    return this.get(id);
  }

  async delete(id: string): Promise<void> {
    await this.tagRepository.delete(id);

    this.logger.debug('Successfully deleted tag', { id });
  }

  async cleanupUnusedTags(): Promise<void> {
    await this.tagRepository.cleanupUnusedTags();
  }
}
