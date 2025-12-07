import { HttpException, Injectable, Logger } from '@nestjs/common';
import { isNull, flatten, concat } from 'lodash';
import { RecommendationService } from 'src/modules/recommendation/recommendation.service';
import { catchAclError } from 'src/utils';
import { ONE_NODE_RECOMMENDATIONS } from 'src/constants';
import { DatabaseAnalyzer } from 'src/modules/database-analysis/providers/database-analyzer';
import { plainToInstance } from 'class-transformer';
import {
  DatabaseAnalysis,
  ShortDatabaseAnalysis,
} from 'src/modules/database-analysis/models';
import { DatabaseAnalysisProvider } from 'src/modules/database-analysis/providers/database-analysis.provider';
import {
  CreateDatabaseAnalysisDto,
  RecommendationVoteDto,
} from 'src/modules/database-analysis/dto';
import { KeysScanner } from 'src/modules/database-analysis/scanner/keys-scanner';
import { DatabaseRecommendationService } from 'src/modules/database-recommendation/database-recommendation.service';
import { ClientMetadata } from 'src/common/models';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { RedisClient } from 'src/modules/redis/client';

@Injectable()
export class DatabaseAnalysisService {
  private logger = new Logger('DatabaseAnalysisService');

  constructor(
    private readonly databaseClientFactory: DatabaseClientFactory,
    private readonly recommendationService: RecommendationService,
    private readonly analyzer: DatabaseAnalyzer,
    private readonly databaseAnalysisProvider: DatabaseAnalysisProvider,
    private readonly scanner: KeysScanner,
    private databaseRecommendationService: DatabaseRecommendationService,
  ) {}

  /**
   * Get cluster details and details for all nodes
   * @param clientMetadata
   * @param dto
   */
  public async create(
    clientMetadata: ClientMetadata,
    dto: CreateDatabaseAnalysisDto,
  ): Promise<DatabaseAnalysis> {
    let client: RedisClient;

    try {
      client = await this.databaseClientFactory.createClient(clientMetadata);

      const scanResults = await this.scanner.scan(client, {
        filter: dto.filter,
      });

      const progress = {
        total: 0,
        scanned: 0,
        processed: 0,
      };

      scanResults.forEach((nodeResult) => {
        progress.scanned += nodeResult.progress.scanned;
        progress.processed += nodeResult.progress.processed;
        progress.total += nodeResult.progress.total;
      });

      let recommendationToExclude = [];

      const recommendations = await scanResults.reduce(
        async (previousPromise, nodeResult, idx) => {
          const jobsArray = await previousPromise;
          const nodeRecommendations =
            await this.recommendationService.getRecommendations({
              client: nodeResult.client,
              keys: nodeResult.keys,
              indexes: nodeResult.indexes,
              libraries: nodeResult.libraries,
              total: progress.total,
              globalClient: client,
              exclude: recommendationToExclude,
            });
          if (idx === 0) {
            recommendationToExclude = concat(
              recommendationToExclude,
              ONE_NODE_RECOMMENDATIONS,
            );
          }
          const foundedRecommendations = nodeRecommendations.filter(
            (recommendation) => !isNull(recommendation),
          );
          const foundedRecommendationNames = foundedRecommendations.map(
            ({ name }) => name,
          );
          recommendationToExclude = concat(
            recommendationToExclude,
            foundedRecommendationNames,
          );
          recommendationToExclude.push(...foundedRecommendationNames);
          jobsArray.push(foundedRecommendations);
          return flatten(jobsArray);
        },
        Promise.resolve([]),
      );
      const analysis = plainToInstance(
        DatabaseAnalysis,
        await this.analyzer.analyze(
          {
            databaseId: clientMetadata.databaseId,
            db: await client?.getCurrentDbIndex(),
            ...dto,
            progress,
            recommendations,
          },
          [].concat(...scanResults.map((nodeResult) => nodeResult.keys)),
        ),
      );

      client.disconnect();
      this.databaseRecommendationService.sync(clientMetadata, recommendations);
      return this.databaseAnalysisProvider.create(analysis);
    } catch (e) {
      client?.disconnect();
      this.logger.error('Unable to analyze database', e, clientMetadata);

      if (e instanceof HttpException) {
        throw e;
      }

      throw catchAclError(e);
    }
  }

  /**
   * Get analysis with all fields by id
   * @param id
   */
  async get(id: string): Promise<DatabaseAnalysis> {
    return this.databaseAnalysisProvider.get(id);
  }

  /**
   * Get analysis list for particular database with id and createdAt fields only
   * @param databaseId
   */
  async list(databaseId: string): Promise<ShortDatabaseAnalysis[]> {
    return this.databaseAnalysisProvider.list(databaseId);
  }

  /**
   * Set user vote for recommendation
   * @param id
   * @param recommendation
   */
  async vote(
    id: string,
    recommendation: RecommendationVoteDto,
  ): Promise<DatabaseAnalysis> {
    return this.databaseAnalysisProvider.recommendationVote(id, recommendation);
  }
}
