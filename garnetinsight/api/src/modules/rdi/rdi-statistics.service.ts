import { Injectable, Logger } from '@nestjs/common';
import { RdiClientMetadata, RdiStatisticsResult } from 'src/modules/rdi/models';
import { RdiClientProvider } from 'src/modules/rdi/providers/rdi.client.provider';

@Injectable()
export class RdiStatisticsService {
  private logger: Logger = new Logger('RdiStatisticsService');

  constructor(private readonly rdiClientProvider: RdiClientProvider) {}

  async getStatistics(
    rdiClientMetadata: RdiClientMetadata,
    sections?: string,
  ): Promise<RdiStatisticsResult> {
    this.logger.debug('Getting RDI statistics', rdiClientMetadata);

    const client = await this.rdiClientProvider.getOrCreate(rdiClientMetadata);

    return await client.getStatistics(sections);
  }
}
