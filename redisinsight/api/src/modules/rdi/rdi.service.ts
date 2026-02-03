import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { CreateRdiDto, UpdateRdiDto } from 'src/modules/rdi/dto';
import { Rdi, RdiClientMetadata } from 'src/modules/rdi/models';
import { RdiRepository } from 'src/modules/rdi/repository/rdi.repository';
import { classToClass } from 'src/utils';
import { RdiClientProvider } from 'src/modules/rdi/providers/rdi.client.provider';
import { RdiClientFactory } from 'src/modules/rdi/providers/rdi.client.factory';
import { SessionMetadata } from 'src/common/models';
import {
  RdiPipelineNotFoundException,
  wrapRdiPipelineError,
} from 'src/modules/rdi/exceptions';
import { isUndefined, omitBy } from 'lodash';
import { deepMerge } from 'src/common/utils';
import { RdiAnalytics } from './rdi.analytics';
import { RdiClient } from './client/rdi.client';

@Injectable()
export class RdiService {
  private logger = new Logger('RdiService');

  static connectionFields: string[] = ['username', 'password'];

  constructor(
    private readonly repository: RdiRepository,
    private readonly analytics: RdiAnalytics,
    private readonly rdiClientProvider: RdiClientProvider,
    private readonly rdiClientFactory: RdiClientFactory,
  ) {}

  static isConnectionAffected(dto: UpdateRdiDto) {
    return Object.keys(omitBy(dto, isUndefined)).some((field) =>
      this.connectionFields.includes(field),
    );
  }

  private static async getRdiVersion(client: RdiClient): Promise<string> {
    return client.getVersion();
  }

  async list(): Promise<Rdi[]> {
    return await this.repository.list();
  }

  async get(id: string): Promise<Rdi> {
    const rdi = await this.repository.get(id);

    if (!rdi) {
      throw new RdiPipelineNotFoundException(`RDI with id ${id} was not found`);
    }

    return rdi;
  }

  async update(
    rdiClientMetadata: RdiClientMetadata,
    dto: UpdateRdiDto,
  ): Promise<Rdi> {
    const oldRdiInstance = await this.get(rdiClientMetadata.id);
    const newRdiInstance = await deepMerge(oldRdiInstance, dto);

    try {
      if (RdiService.isConnectionAffected(dto)) {
        await this.rdiClientFactory.createClient(
          rdiClientMetadata,
          newRdiInstance,
        );
        await this.rdiClientProvider.deleteManyByRdiId(rdiClientMetadata.id);
      }

      return await this.repository.update(rdiClientMetadata.id, newRdiInstance);
    } catch (error) {
      this.logger.error(
        `Failed to update rdi instance ${rdiClientMetadata.id}`,
        error,
        rdiClientMetadata,
      );
      throw wrapRdiPipelineError(error);
    }
  }

  async create(
    sessionMetadata: SessionMetadata,
    dto: CreateRdiDto,
  ): Promise<Rdi> {
    const model = classToClass(Rdi, dto);
    model.lastConnection = new Date();

    const rdiClientMetadata = {
      sessionMetadata,
      id: uuidv4(),
    };

    try {
      const client = await this.rdiClientFactory.createClient(
        rdiClientMetadata,
        model,
      );
      model.version = await RdiService.getRdiVersion(client);
    } catch (error) {
      this.logger.error('Failed to create rdi instance', sessionMetadata);

      throw wrapRdiPipelineError(error);
    }

    this.logger.debug('Succeed to create rdi instance', sessionMetadata);
    return await this.repository.create(model);
  }

  async delete(sessionMetadata: SessionMetadata, ids: string[]): Promise<void> {
    try {
      await this.repository.delete(ids);
      await Promise.all(
        ids.map(async (id) => {
          await this.rdiClientProvider.deleteManyByRdiId(id);
        }),
      );

      this.analytics.sendRdiInstanceDeleted(sessionMetadata, ids.length);
    } catch (error) {
      this.logger.error(
        `Failed to delete instance(s): ${ids}`,
        error,
        sessionMetadata,
      );
      this.analytics.sendRdiInstanceDeleted(
        sessionMetadata,
        ids.length,
        error.message,
      );
      throw new InternalServerErrorException();
    }
  }

  /**
   * Connect to rdi instance
   * @param rdiClientMetadata
   */
  async connect(rdiClientMetadata: RdiClientMetadata): Promise<void> {
    try {
      await this.rdiClientProvider.getOrCreate(rdiClientMetadata);
    } catch (error) {
      this.logger.error(
        `Failed to connect to rdi instance ${rdiClientMetadata.id}`,
        error,
        rdiClientMetadata,
      );
      throw wrapRdiPipelineError(error);
    }

    this.logger.debug(
      `Succeed to connect to rdi instance ${rdiClientMetadata.id}`,
      rdiClientMetadata,
    );
  }
}
