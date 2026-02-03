import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Database } from 'src/modules/database/models/database';
import { isAzureEntraIdAuth } from 'src/modules/database/models/provider-details';
import { AzureAuthService } from 'src/modules/azure/auth/azure-auth.service';
import { ICredentialStrategy } from '../credential-strategy.provider';

@Injectable()
export class AzureEntraIdCredentialStrategy implements ICredentialStrategy {
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

    // Use plainToInstance to ensure the result is a proper Database class instance
    return plainToInstance(
      Database,
      {
        ...database,
        username: tokenResult.account.localAccountId,
        password: tokenResult.token,
      },
      { groups: ['security'] },
    );
  }
}
