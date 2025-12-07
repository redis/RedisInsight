import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ServerEntity } from 'src/modules/server/entities/server.entity';
import { CommandExecutionEntity } from 'src/modules/workbench/entities/command-execution.entity';
import { PluginStateEntity } from 'src/modules/workbench/entities/plugin-state.entity';
import { NotificationEntity } from 'src/modules/notification/entities/notification.entity';
import { DatabaseAnalysisEntity } from 'src/modules/database-analysis/entities/database-analysis.entity';
import { DatabaseRecommendationEntity } from 'src/modules/database-recommendation/entities/database-recommendation.entity';
import { DataSource } from 'typeorm';
import { AgreementsEntity } from 'src/modules/settings/entities/agreements.entity';
import { SettingsEntity } from 'src/modules/settings/entities/settings.entity';
import { CaCertificateEntity } from 'src/modules/certificate/entities/ca-certificate.entity';
import { ClientCertificateEntity } from 'src/modules/certificate/entities/client-certificate.entity';
import { DatabaseEntity } from 'src/modules/database/entities/database.entity';
import { SshOptionsEntity } from 'src/modules/ssh/entities/ssh-options.entity';
import { BrowserHistoryEntity } from 'src/modules/browser/browser-history/entities/browser-history.entity';
import { CustomTutorialEntity } from 'src/modules/custom-tutorial/entities/custom-tutorial.entity';
import { FeatureEntity } from 'src/modules/feature/entities/feature.entity';
import { FeaturesConfigEntity } from 'src/modules/feature/entities/features-config.entity';
import { CloudDatabaseDetailsEntity } from 'src/modules/cloud/database/entities/cloud-database-details.entity';
import { CloudCapiKeyEntity } from 'src/modules/cloud/capi-key/entity/cloud-capi-key.entity';
import { RdiEntity } from 'src/modules/rdi/entities/rdi.entity';
import { AiQueryMessageEntity } from 'src/modules/ai/query/entities/ai-query.message.entity';
import { CloudSessionEntity } from 'src/modules/cloud/session/entities/cloud.session.entity';
import { DatabaseSettingsEntity } from 'src/modules/database-settings/entities/database-setting.entity';
import migrations from '../migration';
import * as config from '../src/utils/config';
import { TagEntity } from 'src/modules/tag/entities/tag.entity';

const dbConfig = config.get('db');

const ormConfig = {
  type: 'sqlite',
  database: dbConfig.database,
  synchronize: dbConfig.synchronize,
  migrationsRun: dbConfig.migrationsRun,
  entities: [
    AgreementsEntity,
    CaCertificateEntity,
    ClientCertificateEntity,
    DatabaseEntity,
    ServerEntity,
    SettingsEntity,
    CommandExecutionEntity,
    PluginStateEntity,
    NotificationEntity,
    DatabaseAnalysisEntity,
    DatabaseRecommendationEntity,
    BrowserHistoryEntity,
    SshOptionsEntity,
    CustomTutorialEntity,
    FeatureEntity,
    FeaturesConfigEntity,
    CloudDatabaseDetailsEntity,
    CloudCapiKeyEntity,
    RdiEntity,
    AiQueryMessageEntity,
    CloudSessionEntity,
    DatabaseSettingsEntity,
    TagEntity,
  ],
  migrations,
};

export const ormModuleOptions: TypeOrmModuleOptions =
  ormConfig as TypeOrmModuleOptions;
export default new DataSource({ ...ormConfig, type: 'sqlite' });
