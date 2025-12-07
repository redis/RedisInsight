import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { plainToInstance } from 'class-transformer';
import { SessionMetadata } from 'src/common/models';
import {
  RecommendationEvents,
  RecommendationServerEvents,
} from 'src/modules/database-recommendation/constants';
import { DatabaseRecommendationsResponse } from 'src/modules/database-recommendation/dto/database-recommendations.response';
import { DatabaseRecommendation } from 'src/modules/database-recommendation/models';
import { DatabaseRecommendationRepository } from '../repositories/database-recommendation.repository';

@Injectable()
export class DatabaseRecommendationEmitter {
  private logger: Logger = new Logger('DatabaseRecommendationEmitter');

  constructor(
    private readonly databaseRecommendationRepository: DatabaseRecommendationRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent(RecommendationEvents.NewRecommendation)
  async newRecommendation({
    sessionMetadata,
    recommendations,
  }: {
    sessionMetadata: SessionMetadata;
    recommendations: DatabaseRecommendation[];
  }) {
    try {
      if (!recommendations?.length) {
        return;
      }

      this.logger.debug(
        `${recommendations.length} new recommendation(s) to emit`,
      );

      const totalUnread =
        await this.databaseRecommendationRepository.getTotalUnread(
          sessionMetadata,
          recommendations[0].databaseId,
        );

      this.eventEmitter.emit(
        RecommendationServerEvents.Recommendation,
        sessionMetadata,
        plainToInstance(DatabaseRecommendationsResponse, {
          totalUnread,
          recommendations,
        }),
      );
    } catch (e) {
      this.logger.error('Unable to prepare dto for recommendations', e);
      // ignore error
    }
  }
}
