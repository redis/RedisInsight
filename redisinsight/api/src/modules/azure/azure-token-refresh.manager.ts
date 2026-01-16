import { Injectable, Logger } from '@nestjs/common';
import { DatabaseRepository } from 'src/modules/database/repositories/database.repository';
import { AzureAuthService } from './auth/azure-auth.service';
import {
  AzureProviderDetails,
  isAzureEntraIdAuth,
} from 'src/modules/database/models/provider-details';
import { getJwtExpiration } from './auth/utils/jwt.utils';
import { TOKEN_REFRESH_BUFFER_SECONDS } from './constants';
import {
  DEFAULT_SESSION_ID,
  DEFAULT_USER_ID,
  DEFAULT_ACCOUNT_ID,
} from 'src/common/constants';

interface RefreshTimer {
  timer: NodeJS.Timeout;
  clientIds: Set<string>;
}

/**
 * Manages automatic token refresh for Azure Entra ID authenticated Redis clients.
 * Integrates with RedisClientStorage to track active connections and refresh tokens
 * before they expire.
 *
 * Tracks by databaseId to avoid duplicate refreshes when multiple clients
 * (Browser, Common, etc.) are connected to the same database.
 */
@Injectable()
export class AzureTokenRefreshManager {
  private readonly logger = new Logger(AzureTokenRefreshManager.name);

  /**
   * Map of databaseId -> refresh timer info
   * Multiple clients can share the same refresh timer for a database
   */
  private refreshTimers: Map<string, RefreshTimer> = new Map();

  constructor(
    private readonly databaseRepository: DatabaseRepository,
    private readonly azureAuthService: AzureAuthService,
  ) {}

  /**
   * Called when a Redis client is stored in the client storage.
   * Checks if the database uses Azure Entra ID auth and schedules token refresh.
   */
  async onClientStored(clientId: string, databaseId: string): Promise<void> {
    try {
      // Check if we already have a refresh timer for this database
      const existingTimer = this.refreshTimers.get(databaseId);
      if (existingTimer) {
        // Just add this client to the set, don't schedule a new refresh
        existingTimer.clientIds.add(clientId);
        this.logger.warn(
          `Client ${clientId} added to existing refresh timer for database ${databaseId}`,
        );
        return;
      }

      const sessionMetadata = {
        sessionId: DEFAULT_SESSION_ID,
        userId: DEFAULT_USER_ID,
        accountId: DEFAULT_ACCOUNT_ID,
      };

      const database = await this.databaseRepository.get(
        sessionMetadata,
        databaseId,
      );

      const providerDetails = database.providerDetails as
        | AzureProviderDetails
        | undefined;

      // Only manage tokens for Azure Entra ID databases
      if (!isAzureEntraIdAuth(providerDetails)) {
        return;
      }

      this.logger.warn(
        `Azure Entra ID client stored: ${clientId} (database: ${database.name})`,
      );

      // Schedule token refresh based on current token expiration
      await this.scheduleTokenRefresh(
        clientId,
        databaseId,
        database.password,
        providerDetails,
      );
    } catch (error: any) {
      this.logger.warn(
        `Failed to setup token refresh for client ${clientId}: ${error?.message}`,
      );
    }
  }

  /**
   * Called when a Redis client is removed from the client storage.
   * Only cancels the refresh timer when all clients for a database are removed.
   */
  onClientRemoved(clientId: string, databaseId: string): void {
    const existing = this.refreshTimers.get(databaseId);
    if (!existing) {
      return;
    }

    existing.clientIds.delete(clientId);

    // Only cancel timer if no clients remain for this database
    if (existing.clientIds.size === 0) {
      clearTimeout(existing.timer);
      this.refreshTimers.delete(databaseId);
      this.logger.warn(
        `Cancelled token refresh timer for database ${databaseId} (no active clients)`,
      );
    }
  }

  /**
   * Get the number of active refresh timers (for monitoring/debugging)
   */
  getActiveTimersCount(): number {
    return this.refreshTimers.size;
  }

  private async scheduleTokenRefresh(
    clientId: string,
    databaseId: string,
    currentToken: string | undefined,
    providerDetails: AzureProviderDetails,
  ): Promise<void> {
    if (!currentToken) {
      this.logger.warn(
        `No token found for database ${databaseId}, cannot schedule refresh`,
      );
      return;
    }

    const expiration = getJwtExpiration(currentToken);
    if (!expiration) {
      this.logger.warn(
        `Could not decode token expiration for database ${databaseId}`,
      );
      return;
    }

    // Calculate when to refresh (buffer time before expiration)
    const refreshAt =
      expiration.getTime() - TOKEN_REFRESH_BUFFER_SECONDS * 1000;
    const now = Date.now();
    const delayMs = Math.max(0, refreshAt - now);

    // If token is already expired or expiring very soon, refresh immediately
    if (delayMs === 0) {
      this.logger.warn(
        `Token for database ${databaseId} is expiring soon, refreshing immediately`,
      );
      await this.refreshToken(databaseId, providerDetails);
      return;
    }

    const delayMinutes = Math.round(delayMs / 1000 / 60);
    this.logger.warn(
      `Scheduled token refresh for database ${databaseId} in ${delayMinutes} minutes`,
    );

    const timer = setTimeout(async () => {
      await this.refreshToken(databaseId, providerDetails);
    }, delayMs);

    this.refreshTimers.set(databaseId, {
      timer,
      clientIds: new Set([clientId]),
    });
  }

  private async refreshToken(
    databaseId: string,
    providerDetails: AzureProviderDetails,
  ): Promise<void> {
    const { azureAccountId } = providerDetails;
    const existing = this.refreshTimers.get(databaseId);

    if (!azureAccountId) {
      this.logger.warn(
        `Database ${databaseId} missing azureAccountId, cannot refresh token`,
      );
      this.refreshTimers.delete(databaseId);
      return;
    }

    this.logger.warn(`Refreshing token for database ${databaseId}...`);

    try {
      const tokenResult =
        await this.azureAuthService.getRedisTokenByAccountId(azureAccountId);

      if (!tokenResult) {
        this.logger.warn(
          `Failed to refresh token for database ${databaseId} - re-authentication may be needed`,
        );
        this.refreshTimers.delete(databaseId);
        return;
      }

      const sessionMetadata = {
        sessionId: DEFAULT_SESSION_ID,
        userId: DEFAULT_USER_ID,
        accountId: DEFAULT_ACCOUNT_ID,
      };

      // Update database with new token
      await this.databaseRepository.update(sessionMetadata, databaseId, {
        password: tokenResult.token,
      });

      this.logger.warn(
        `Token refreshed for database ${databaseId}, expires at ${tokenResult.expiresOn.toISOString()}`,
      );

      // Schedule next refresh, preserving existing client IDs
      const clientIds = existing?.clientIds || new Set<string>();
      await this.scheduleNextRefresh(
        databaseId,
        tokenResult.token,
        providerDetails,
        clientIds,
      );
    } catch (error: any) {
      this.logger.error(
        `Error refreshing token for database ${databaseId}: ${error?.message}`,
      );
      this.refreshTimers.delete(databaseId);
    }
  }

  private async scheduleNextRefresh(
    databaseId: string,
    token: string,
    providerDetails: AzureProviderDetails,
    clientIds: Set<string>,
  ): Promise<void> {
    const expiration = getJwtExpiration(token);
    if (!expiration) {
      return;
    }

    const refreshAt =
      expiration.getTime() - TOKEN_REFRESH_BUFFER_SECONDS * 1000;
    const now = Date.now();
    const delayMs = Math.max(0, refreshAt - now);

    if (delayMs === 0) {
      await this.refreshToken(databaseId, providerDetails);
      return;
    }

    const delayMinutes = Math.round(delayMs / 1000 / 60);
    this.logger.warn(
      `Scheduled next token refresh for database ${databaseId} in ${delayMinutes} minutes`,
    );

    const timer = setTimeout(async () => {
      await this.refreshToken(databaseId, providerDetails);
    }, delayMs);

    this.refreshTimers.set(databaseId, { timer, clientIds });
  }
}
