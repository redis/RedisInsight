import { Module } from '@nestjs/common';
import { DatabaseAnalysisController } from 'src/modules/database-analysis/database-analysis.controller';
import { DatabaseAnalysisService } from 'src/modules/database-analysis/database-analysis.service';
import { DatabaseAnalyzer } from 'src/modules/database-analysis/providers/database-analyzer';
import { DatabaseAnalysisProvider } from 'src/modules/database-analysis/providers/database-analysis.provider';
import { KeysScanner } from 'src/modules/database-analysis/scanner/keys-scanner';
import { KeyInfoProvider } from 'src/modules/database-analysis/scanner/key-info/key-info.provider';
import { RecommendationModule } from 'src/modules/recommendation/recommendation.module';

@Module({
  imports: [RecommendationModule],
  controllers: [DatabaseAnalysisController],
  providers: [
    DatabaseAnalysisService,
    DatabaseAnalyzer,
    DatabaseAnalysisProvider,
    KeysScanner,
    KeyInfoProvider,
  ],
})
export class DatabaseAnalysisModule {}
