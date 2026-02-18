import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AzureAuthService } from './auth/azure-auth.service';
import { RedisClientStorage } from 'src/modules/redis/redis.client.storage';
import { AzureRedisTokenEvents, TOKEN_REFRESH_BUFFER_MS } from './constants';
import { AzureTokenResult } from './auth/models';

/**
 * Manages automatic token refresh for Azure Entra ID authenticated Redis clients.
 *
 * When a token is acquired, the AzureRedisTokenEvents.Acquired event triggers:
 * 1. Schedule a timer to refresh before expiry
 * 2. Re-authenticate active Redis clients with the new token
 *
 * When the timer fires, it acquires a fresh token which emits the event again,
 * continuing the cycle. The cycle stops when no clients are using the account.
 */
interface ScheduledTimer {
  timeout: NodeJS.Timeout;
  expiresOn: Date;
}

@Injectable()
export class AzureTokenRefreshManager implements OnModuleDestroy {
  private readonly logger = new Logger(AzureTokenRefreshManager.name);

  private readonly timers: Map<string, ScheduledTimer> = new Map();

  constructor(
    private readonly azureAuthService: AzureAuthService,
    private readonly redisClientStorage: RedisClientStorage,
  ) {}

  onModuleDestroy(): void {
    this.clearAllTimers();
  }

  @OnEvent(AzureRedisTokenEvents.Acquired)
  async handleTokenAcquired({
    accountId,
    tokenResult,
  }: {
    accountId: string;
    tokenResult: AzureTokenResult;
  }): Promise<void> {
    this.scheduleRefresh(accountId, tokenResult.expiresOn);
    await this.reAuthenticateClients(accountId, tokenResult);
  }

  scheduleRefresh(azureAccountId: string, expiresOn: Date): void {
    const existing = this.timers.get(azureAccountId);

    // Skip if already scheduled for the same expiry time (race condition protection)
    if (existing?.expiresOn?.getTime() === expiresOn.getTime()) {
      return;
    }

    // Clear existing timeout but don't remove from map to avoid race conditions
    // The map entry will be overwritten by timers.set() below
    if (existing) {
      clearTimeout(existing.timeout);
    }

    const now = Date.now();
    const expiresAt = expiresOn.getTime();
    const refreshAt = expiresAt - TOKEN_REFRESH_BUFFER_MS;
    const delay = refreshAt - now;

    this.logger.debug(
      `Scheduling token refresh for account ${azureAccountId} in ${Math.round(delay / 1000)}s (expires: ${expiresOn.toISOString()})`,
    );

    const timeout = setTimeout(() => {
      this.refreshToken(azureAccountId).catch((error) => {
        this.logger.error(
          `Token refresh failed for account ${azureAccountId}: ${error.message}`,
        );
      });
    }, delay);

    this.timers.set(azureAccountId, { timeout, expiresOn });
  }

  clearTimer(azureAccountId: string): void {
    const existing = this.timers.get(azureAccountId);
    if (existing) {
      clearTimeout(existing.timeout);
      this.timers.delete(azureAccountId);
    }
  }

  clearAllTimers(): void {
    this.timers.forEach(({ timeout }) => clearTimeout(timeout));
    this.timers.clear();
  }

  private async refreshToken(azureAccountId: string): Promise<void> {
    this.logger.debug(`Refreshing token for account ${azureAccountId}`);

    // Stop the refresh cycle if no clients are using this account
    const clients = this.redisClientStorage.getClientsByDatabaseField(
      'providerDetails.azureAccountId',
      azureAccountId,
    );

    if (clients.length === 0) {
      this.logger.debug(
        `No active clients for account ${azureAccountId}, stopping refresh cycle`,
      );
      this.clearTimer(azureAccountId);
      return;
    }

    await this.azureAuthService.getRedisTokenByAccountId(azureAccountId);
  }

  private async reAuthenticateClients(
    azureAccountId: string,
    tokenResult: AzureTokenResult,
  ): Promise<void> {
    const clients = this.redisClientStorage.getClientsByDatabaseField(
      'providerDetails.azureAccountId',
      azureAccountId,
    );

    if (clients.length === 0) {
      return;
    }

    // Filter out clients that already have the current token
    const clientsToReauth = clients.filter(
      (client) =>
        client.database.providerDetails?.tokenExpiresOn?.getTime() !==
        tokenResult.expiresOn.getTime(),
    );

    if (clientsToReauth.length === 0) {
      this.logger.debug(
        `All clients for account ${azureAccountId} already have current token`,
      );
      return;
    }

    this.logger.debug(
      `Re-authenticating ${clientsToReauth.length} of ${clients.length} client(s) for account ${azureAccountId}`,
    );

    await Promise.all(
      clientsToReauth.map(async (client) => {
        try {
          await client.call([
            'AUTH',
            tokenResult.account.localAccountId,
            tokenResult.token,
          ]);
          // Update the client's token expiry after successful re-auth
          // eslint-disable-next-line no-param-reassign
          client.database.providerDetails.tokenExpiresOn =
            tokenResult.expiresOn;
        } catch (error) {
          this.logger.warn(
            `Failed to re-authenticate client ${client.id}: ${error.message}`,
          );
        }
      }),
    );
  }
}
