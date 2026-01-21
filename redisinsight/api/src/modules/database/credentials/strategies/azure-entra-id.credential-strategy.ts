import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Database } from 'src/modules/database/models/database';
import { isAzureEntraIdAuth } from 'src/modules/database/models/provider-details';
import { AzureAuthService } from 'src/modules/azure/auth/azure-auth.service';
import { CredentialStrategy } from '../credential-strategy.interface';

@Injectable()
export class AzureEntraIdCredentialStrategy implements CredentialStrategy {
  private readonly logger = new Logger(AzureEntraIdCredentialStrategy.name);

  constructor(private readonly azureAuthService: AzureAuthService) {}

  canHandle(database: Database): boolean {
    return isAzureEntraIdAuth(database.providerDetails);
  }

  async resolve(database: Database): Promise<Database> {
    const { providerDetails } = database;

    if (!providerDetails?.azureAccountId) {
      this.logger.warn(
        `Database ${database.id} has Entra ID auth but no azureAccountId`,
      );
      throw new UnauthorizedException(
        'Azure account ID not found - please re-authenticate',
      );
    }

    this.logger.debug(
      `Resolving Azure Entra ID credentials for database ${database.id}`,
    );

    const tokenResult = await this.azureAuthService.getRedisTokenByAccountId(
      providerDetails.azureAccountId,
    );

    if (!tokenResult) {
      this.logger.warn(
        `Failed to acquire token for database ${database.id} - re-authentication needed`,
      );
      throw new UnauthorizedException(
        'Failed to acquire Azure token - please re-authenticate',
      );
    }

    this.logger.debug(
      `Token acquired for database ${database.id}, expires at ${tokenResult.expiresOn.toISOString()}`,
    );

    return {
      ...database,
      username: tokenResult.username,
      password: tokenResult.token,
    };
  }
}
