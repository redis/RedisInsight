import { Injectable, Logger } from '@nestjs/common';
import { SessionMetadata } from 'src/common/models';
import { PipelineDraft } from 'src/modules/rdi/models';
import { PipelineDraftRepository } from 'src/modules/rdi/repository/pipeline-draft.repository';
import {
  CreatePipelineDraftDto,
  UpdatePipelineDraftDto,
} from 'src/modules/rdi/dto';

@Injectable()
export class PipelineDraftService {
  private logger = new Logger('PipelineDraftService');

  constructor(private readonly repository: PipelineDraftRepository) {}

  async create(
    sessionMetadata: SessionMetadata,
    rdiInstanceId: string,
    dto: CreatePipelineDraftDto,
  ): Promise<PipelineDraft> {
    this.logger.debug('Creating pipeline draft', sessionMetadata);
    return this.repository.create(sessionMetadata, rdiInstanceId, dto);
  }

  async list(
    sessionMetadata: SessionMetadata,
    rdiInstanceId: string,
  ): Promise<PipelineDraft[]> {
    this.logger.debug('Listing pipeline drafts', sessionMetadata);
    return this.repository.list(sessionMetadata, rdiInstanceId);
  }

  async get(
    sessionMetadata: SessionMetadata,
    rdiInstanceId: string,
    id: string,
  ): Promise<PipelineDraft> {
    this.logger.debug(`Getting pipeline draft ${id}`, sessionMetadata);
    return this.repository.get(sessionMetadata, rdiInstanceId, id);
  }

  async update(
    sessionMetadata: SessionMetadata,
    rdiInstanceId: string,
    id: string,
    dto: UpdatePipelineDraftDto,
  ): Promise<PipelineDraft> {
    this.logger.debug(`Updating pipeline draft ${id}`, sessionMetadata);
    return this.repository.update(sessionMetadata, rdiInstanceId, id, dto);
  }

  async delete(
    sessionMetadata: SessionMetadata,
    rdiInstanceId: string,
    id: string,
  ): Promise<void> {
    this.logger.debug(`Deleting pipeline draft ${id}`, sessionMetadata);
    return this.repository.delete(sessionMetadata, rdiInstanceId, id);
  }
}
