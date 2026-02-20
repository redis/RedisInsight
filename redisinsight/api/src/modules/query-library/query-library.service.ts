import { Injectable, Logger } from '@nestjs/common';
import { SessionMetadata } from 'src/common/models';
import { QueryLibraryItem } from 'src/modules/query-library/models/query-library';
import { QueryLibraryType } from 'src/modules/query-library/models/query-library-type.enum';
import { QueryLibraryRepository } from 'src/modules/query-library/repositories/query-library.repository';
import {
  CreateQueryLibraryItemDto,
  UpdateQueryLibraryItemDto,
  SeedQueryLibraryDto,
  QueryLibraryFilterDto,
} from 'src/modules/query-library/dto';

@Injectable()
export class QueryLibraryService {
  private logger = new Logger('QueryLibraryService');

  constructor(
    private readonly queryLibraryRepository: QueryLibraryRepository,
  ) {}

  async create(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    dto: CreateQueryLibraryItemDto,
  ): Promise<QueryLibraryItem> {
    this.logger.debug('Creating query library item', sessionMetadata);
    return this.queryLibraryRepository.create(sessionMetadata, databaseId, {
      ...dto,
      type: QueryLibraryType.Saved,
    });
  }

  async getList(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    filter: QueryLibraryFilterDto,
  ): Promise<QueryLibraryItem[]> {
    this.logger.debug('Listing query library items', sessionMetadata);
    return this.queryLibraryRepository.getList(
      sessionMetadata,
      databaseId,
      filter,
    );
  }

  async getOne(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    id: string,
  ): Promise<QueryLibraryItem> {
    this.logger.debug(`Getting query library item ${id}`, sessionMetadata);
    return this.queryLibraryRepository.getOne(sessionMetadata, databaseId, id);
  }

  async update(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    id: string,
    dto: UpdateQueryLibraryItemDto,
  ): Promise<QueryLibraryItem> {
    this.logger.debug(`Updating query library item ${id}`, sessionMetadata);
    return this.queryLibraryRepository.update(
      sessionMetadata,
      databaseId,
      id,
      dto,
    );
  }

  async delete(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    id: string,
  ): Promise<void> {
    this.logger.debug(`Deleting query library item ${id}`, sessionMetadata);
    return this.queryLibraryRepository.delete(sessionMetadata, databaseId, id);
  }

  async deleteByIndex(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    indexName: string,
  ): Promise<void> {
    this.logger.debug(
      `Deleting query library items for index: ${indexName}`,
      sessionMetadata,
    );
    return this.queryLibraryRepository.deleteByIndex(
      sessionMetadata,
      databaseId,
      indexName,
    );
  }

  async seed(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    dto: SeedQueryLibraryDto,
  ): Promise<QueryLibraryItem[]> {
    this.logger.debug('Seeding query library', sessionMetadata);

    if (!dto.items.length) {
      return [];
    }

    const indexName = dto.items[0].indexName;

    const existingCount = await this.queryLibraryRepository.countByIndex(
      sessionMetadata,
      databaseId,
      indexName,
      QueryLibraryType.Sample,
    );

    if (existingCount > 0) {
      this.logger.debug(
        `Sample queries already exist for index: ${indexName}, skipping seed`,
        sessionMetadata,
      );
      return this.queryLibraryRepository.getList(sessionMetadata, databaseId, {
        indexName,
      });
    }

    const itemsWithType = dto.items.map((item) => ({
      ...item,
      type: QueryLibraryType.Sample,
    }));

    return this.queryLibraryRepository.createBulk(
      sessionMetadata,
      databaseId,
      itemsWithType,
    );
  }
}
