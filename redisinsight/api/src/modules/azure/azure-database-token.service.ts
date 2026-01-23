import { Injectable, Logger } from '@nestjs/common';
import { DatabaseRepository } from 'src/modules/database/repositories/database.repository';
import { AzureAuthService } from './auth/azure-auth.service';
import {
  AzureProviderDetails,
  isAzureEntraIdAuth,
} from 'src/modules/database/models/provider-details';
import { SessionMetadata } from 'src/common/models';

export interface AzureDatabaseRefreshResult {
  databaseId: string;
  databaseName: string;
  success: boolean;
  error?: string;
}

export interface AzureDatabasesRefreshSummary {
  totalFound: number;
  refreshed: number;
  failed: number;
  results: AzureDatabaseRefreshResult[];
}

@Injectable()
export class AzureDatabaseTokenService {
  private readonly logger = new Logger(AzureDatabaseTokenService.name);

  constructor(
    private readonly databaseRepository: DatabaseRepository,
    private readonly azureAuthService: AzureAuthService,
  ) {}

  /**
   * Refresh tokens for all databases associated with the given Azure account.
   * Called after successful Azure login to ensure all databases have valid tokens.
   */
  async refreshDatabasesForAccount(
    sessionMetadata: SessionMetadata,
    azureAccountId: string,
  ): Promise<AzureDatabasesRefreshSummary> {
    this.logger.log(
      `Refreshing tokens for databases with Azure account ${azureAccountId}`,
    );

    const summary: AzureDatabasesRefreshSummary = {
      totalFound: 0,
      refreshed: 0,
      failed: 0,
      results: [],
    };

    try {
      // Get all databases
      const allDatabases = await this.databaseRepository.list(sessionMetadata);

      // Filter to find Azure Entra ID databases for this account
      const azureDatabases = allDatabases.filter((db) => {
        const providerDetails = db.providerDetails as
          | AzureProviderDetails
          | undefined;
        return (
          isAzureEntraIdAuth(providerDetails) &&
          providerDetails.azureAccountId === azureAccountId
        );
      });

      summary.totalFound = azureDatabases.length;

      if (azureDatabases.length === 0) {
        this.logger.log('No Azure databases found for this account');
        return summary;
      }

      this.logger.log(
        `Found ${azureDatabases.length} Azure databases to refresh`,
      );

      // Refresh each database
      for (const database of azureDatabases) {
        const result = await this.refreshDatabaseToken(
          sessionMetadata,
          database.id,
          database.name,
          database.providerDetails as AzureProviderDetails,
        );
        summary.results.push(result);
        if (result.success) {
          summary.refreshed += 1;
        } else {
          summary.failed += 1;
        }
      }

      this.logger.log(
        `Token refresh complete: ${summary.refreshed} succeeded, ${summary.failed} failed`,
      );

      return summary;
    } catch (error: any) {
      this.logger.error(
        'Error refreshing Azure database tokens',
        error?.message,
      );
      return summary;
    }
  }

  private async refreshDatabaseToken(
    _sessionMetadata: SessionMetadata,
    databaseId: string,
    databaseName: string,
    providerDetails: AzureProviderDetails,
  ): Promise<AzureDatabaseRefreshResult> {
    try {
      const tokenResult = await this.azureAuthService.getRedisTokenByAccountId(
        providerDetails.azureAccountId,
      );

      if (!tokenResult) {
        return {
          databaseId,
          databaseName,
          success: false,
          error: 'Failed to acquire token',
        };
      }

      // Note: We don't persist the token to the database.
      // The credential resolver fetches fresh tokens on-demand at connection time.
      // This refresh just ensures the MSAL cache has a valid token.

      this.logger.debug(`Refreshed token for database ${databaseName}`);

      return {
        databaseId,
        databaseName,
        success: true,
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to refresh token for database ${databaseName}`,
        error?.message,
      );
      return {
        databaseId,
        databaseName,
        success: false,
        error: error?.message || 'Unknown error',
      };
    }
  }
}
