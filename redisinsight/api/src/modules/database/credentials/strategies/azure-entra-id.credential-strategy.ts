import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Database } from 'src/modules/database/models/database';
import {
  AzureProviderDetails,
  CloudProvider,
} from 'src/modules/database/models/provider-details';
import { AzureAuthType } from 'src/modules/azure/constants';
import { AzureAuthService } from 'src/modules/azure/auth/azure-auth.service';
import { ICredentialStrategy } from '../credential-strategy.provider';
import { AzureEntraIdTokenExpiredException } from 'src/modules/azure/exceptions';

@Injectable()
export class AzureEntraIdCredentialStrategy implements ICredentialStrategy {
  private readonly logger = new Logger(AzureEntraIdCredentialStrategy.name);

  constructor(private readonly azureAuthService: AzureAuthService) {}

  static isAzureProviderDetails(
    details: AzureProviderDetails | null | undefined,
  ): details is AzureProviderDetails {
    if (!details) return false;
    return (
      'provider' in details &&
      details.provider === CloudProvider.Azure &&
      'authType' in details
    );
  }

  static isAzureEntraIdAuth(
    details: AzureProviderDetails | null | undefined,
  ): boolean {
    return (
      AzureEntraIdCredentialStrategy.isAzureProviderDetails(details) &&
      details.authType === AzureAuthType.EntraId
    );
  }

  canHandle(database: Database): boolean {
    return AzureEntraIdCredentialStrategy.isAzureEntraIdAuth(
      database.providerDetails,
    );
  }

  async resolve(database: Database): Promise<Database> {
    const { providerDetails } = database;

    if (!providerDetails?.azureAccountId) {
      this.logger.warn(
        `Database ${database.id} has Entra ID auth but no azureAccountId`,
      );
      throw new BadRequestException(
        'Azure account not found. Please remove this database and re-add it through Azure autodiscovery.',
      );
    }

    const tokenResult = await this.azureAuthService.getRedisTokenByAccountId(
      providerDetails.azureAccountId,
    );

    if (!tokenResult) {
      this.logger.warn(
        `Failed to acquire token for database ${database.id} - re-authentication needed`,
      );
      throw new AzureEntraIdTokenExpiredException();
    }

    // Use plainToInstance to ensure the result is a proper Database class instance
    return plainToInstance(
      Database,
      {
        ...database,
        username: tokenResult.account.localAccountId,
        password: tokenResult.token,
        providerDetails: {
          ...providerDetails,
          tokenExpiresOn: tokenResult.expiresOn.getTime(),
        },
      },
      { groups: ['security'] },
    );
  }
}
