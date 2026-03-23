import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Database } from 'src/modules/database/models/database';
import {
  AzureProviderDetails,
  isAzureProviderDetails,
} from 'src/modules/database/models/provider-details';
import { AzureAuthType } from 'src/modules/azure/constants';
import { AzureAutodiscoveryService } from 'src/modules/azure/autodiscovery/azure-autodiscovery.service';
import { ICredentialStrategy } from '../credential-strategy.provider';

@Injectable()
export class AzureAccessKeyCredentialStrategy implements ICredentialStrategy {
  private readonly logger = new Logger(AzureAccessKeyCredentialStrategy.name);

  // Use forwardRef to avoid circular dependency
  // AzureModule imports DatabaseModule, and CredentialsModule needs AzureAutodiscoveryService
  constructor(
    @Inject(forwardRef(() => AzureAutodiscoveryService))
    private readonly autodiscoveryService: AzureAutodiscoveryService,
  ) {}

  static isAzureAccessKeyAuth(
    details: AzureProviderDetails | null | undefined,
  ): boolean {
    return (
      isAzureProviderDetails(details) &&
      details.authType === AzureAuthType.AccessKey
    );
  }

  canHandle(database: Database): boolean {
    return AzureAccessKeyCredentialStrategy.isAzureAccessKeyAuth(
      database.providerDetails,
    );
  }

  async resolve(database: Database): Promise<Database> {
    const { providerDetails } = database;

    // Validate required fields for Access Key auth
    if (!providerDetails?.azureAccountId) {
      this.logger.warn(
        `Database ${database.id} has Access Key auth but no azureAccountId`,
      );
      throw new BadRequestException(
        'Azure account not found. Please remove this database and re-add it through Azure autodiscovery.',
      );
    }

    if (
      !providerDetails?.subscriptionId ||
      !providerDetails?.resourceGroup ||
      !providerDetails?.resourceName ||
      !providerDetails?.resourceType
    ) {
      this.logger.warn(
        `Database ${database.id} is missing Azure resource information`,
      );
      throw new BadRequestException(
        'Missing Azure resource information. Please remove this database and re-add it through Azure autodiscovery.',
      );
    }

    try {
      const accessKey = await this.autodiscoveryService.getAccessKey(
        providerDetails.azureAccountId,
        providerDetails.subscriptionId,
        providerDetails.resourceGroup,
        providerDetails.resourceName,
        providerDetails.resourceType,
        providerDetails.clusterName,
      );

      // Use plainToInstance to ensure the result is a proper Database class instance
      // For Access Key auth, use 'default' as username (standard Redis default user)
      return plainToInstance(
        Database,
        {
          ...database,
          username: 'default',
          password: accessKey,
        },
        { groups: ['security'] },
      );
    } catch (error) {
      if (error?.response?.status === 403) {
        this.logger.warn(
          `Insufficient permissions to retrieve Access Key for database ${database.id}`,
        );
        throw new ForbiddenException(
          'Insufficient permissions to retrieve Access Key. ' +
            'Please use Entra ID authentication or request "Redis Cache Contributor" role.',
        );
      }
      throw error;
    }
  }
}
