import { Injectable } from '@nestjs/common';
import {
  CloudJob,
  CreateFreeSubscriptionAndDatabaseCloudJob,
  ImportFreeDatabaseCloudJob,
} from 'src/modules/cloud/job/jobs';
import { CloudJobName } from 'src/modules/cloud/job/constants';
import { CreateFreeDatabaseCloudJob } from 'src/modules/cloud/job/jobs/create-free-database.cloud-job';
import { CloudDatabaseCapiService } from 'src/modules/cloud/database/cloud-database.capi.service';
import { CloudSubscriptionCapiService } from 'src/modules/cloud/subscription/cloud-subscription.capi.service';
import { CloudTaskCapiService } from 'src/modules/cloud/task/cloud-task.capi.service';
import { CloudCapiAuthDto } from 'src/modules/cloud/common/dto';
import { CloudJobUnsupportedException } from 'src/modules/cloud/job/exceptions';
import { SessionMetadata } from 'src/common/models';
import { DatabaseService } from 'src/modules/database/database.service';
import { CloudDatabaseAnalytics } from 'src/modules/cloud/database/cloud-database.analytics';
import { CloudRequestUtm } from 'src/modules/cloud/common/models';
import { CloudCapiKeyService } from 'src/modules/cloud/capi-key/cloud-capi-key.service';
import { CloudSubscriptionApiService } from 'src/modules/cloud/subscription/cloud-subscription.api.service';
import { BulkImportService } from 'src/modules/bulk-actions/bulk-import.service';
import { DatabaseInfoService } from 'src/modules/database/database-info.service';
import { FeatureService } from 'src/modules/feature/feature.service';

@Injectable()
export class CloudJobFactory {
  constructor(
    private readonly cloudDatabaseCapiService: CloudDatabaseCapiService,
    private readonly cloudSubscriptionCapiService: CloudSubscriptionCapiService,
    private readonly cloudTaskCapiService: CloudTaskCapiService,
    private readonly cloudDatabaseAnalytics: CloudDatabaseAnalytics,
    private readonly databaseService: DatabaseService,
    private readonly databaseInfoService: DatabaseInfoService,
    private readonly bulkImportService: BulkImportService,
    private readonly cloudCapiKeyService: CloudCapiKeyService,
    private readonly cloudSubscriptionApiService: CloudSubscriptionApiService,
    private readonly featureService: FeatureService,
  ) {}

  async create(
    name: CloudJobName,
    data: any,
    options: {
      sessionMetadata: SessionMetadata;
      utm?: CloudRequestUtm;
      capiCredentials?: CloudCapiAuthDto;
      stateCallbacks?: ((self: CloudJob) => any)[];
    },
  ): Promise<CloudJob> {
    switch (name) {
      case CloudJobName.CreateFreeSubscriptionAndDatabase:
        return new CreateFreeSubscriptionAndDatabaseCloudJob(
          {
            abortController: new AbortController(),
            ...options,
          },
          data,
          {
            cloudDatabaseCapiService: this.cloudDatabaseCapiService,
            cloudSubscriptionCapiService: this.cloudSubscriptionCapiService,
            cloudTaskCapiService: this.cloudTaskCapiService,
            cloudDatabaseAnalytics: this.cloudDatabaseAnalytics,
            databaseService: this.databaseService,
            databaseInfoService: this.databaseInfoService,
            bulkImportService: this.bulkImportService,
            cloudCapiKeyService: this.cloudCapiKeyService,
            cloudSubscriptionApiService: this.cloudSubscriptionApiService,
            featureService: this.featureService,
          },
        );
      case CloudJobName.CreateFreeDatabase:
        return new CreateFreeDatabaseCloudJob(
          {
            abortController: new AbortController(),
            ...options,
          },
          data,
          {
            cloudDatabaseCapiService: this.cloudDatabaseCapiService,
            cloudSubscriptionCapiService: this.cloudSubscriptionCapiService,
            cloudTaskCapiService: this.cloudTaskCapiService,
            cloudDatabaseAnalytics: this.cloudDatabaseAnalytics,
            databaseService: this.databaseService,
            databaseInfoService: this.databaseInfoService,
            bulkImportService: this.bulkImportService,
            cloudCapiKeyService: this.cloudCapiKeyService,
            featureService: this.featureService,
          },
        );
      case CloudJobName.ImportFreeDatabase:
        return new ImportFreeDatabaseCloudJob(
          {
            abortController: new AbortController(),
            ...options,
          },
          data,
          {
            cloudDatabaseCapiService: this.cloudDatabaseCapiService,
            cloudSubscriptionCapiService: this.cloudSubscriptionCapiService,
            cloudTaskCapiService: this.cloudTaskCapiService,
            cloudDatabaseAnalytics: this.cloudDatabaseAnalytics,
            databaseService: this.databaseService,
            cloudCapiKeyService: this.cloudCapiKeyService,
            featureService: this.featureService,
          },
        );
      default:
        throw new CloudJobUnsupportedException();
    }
  }
}
