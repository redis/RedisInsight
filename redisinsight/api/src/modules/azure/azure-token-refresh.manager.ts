import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AzureAuthService } from './auth/azure-auth.service';
import { RedisClientStorage } from 'src/modules/redis/redis.client.storage';
import {
  AzureRedisTokenEvents,
  TOKEN_REFRESH_BUFFER_MS,
  TOKEN_REFRESH_RETRY_DELAY_MS,
} from './constants';
import { AzureTokenResult } from './auth/models';

/**
 * Manages automatic token refresh for Azure Entra ID authenticated Redis clients.
 *
 * When a token is acquired via getRedisTokenByAccountId, this manager schedules
 * a timer to refresh the token before it expires. When the timer fires:
 * 1. Acquire a fresh token
 * 2. Find all Redis clients using that Azure account
 * 3. Re-authenticate each client with the new token
 * 4. Schedule the next refresh
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
  handleTokenAcquired({
    accountId,
    tokenResult,
  }: {
    accountId: string;
    tokenResult: AzureTokenResult;
  }): void {
    this.scheduleRefresh(accountId, tokenResult.expiresOn);
  }

  scheduleRefresh(azureAccountId: string, expiresOn: Date): void {
    const existing = this.timers.get(azureAccountId);

    // Skip if already scheduled for the same expiry time (race condition protection)
    if (existing?.expiresOn?.getTime() === expiresOn.getTime()) {
      return;
    }

    this.clearTimer(azureAccountId);

    const now = Date.now();
    const expiresAt = expiresOn.getTime();
    const refreshAt = expiresAt - TOKEN_REFRESH_BUFFER_MS;
    const delay = refreshAt - now;

    this.logger.debug(
      `Scheduling token refresh for account ${azureAccountId} in ${Math.round(delay / 1000)}s (expires: ${expiresOn.toISOString()})`,
    );

    const timeout = setTimeout(() => {
      this.refreshTokenAndReauth(azureAccountId).catch((error) => {
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

  private async refreshTokenAndReauth(azureAccountId: string): Promise<void> {
    this.logger.debug(`Refreshing token for account ${azureAccountId}`);

    this.timers.delete(azureAccountId);

    // Check for active clients FIRST to avoid scheduling unnecessary refreshes
    // This prevents refresh loops when all clients have disconnected
    const clients = this.redisClientStorage.getClientsByDatabaseField(
      'providerDetails.azureAccountId',
      azureAccountId,
    );

    if (clients.length === 0) {
      this.logger.debug(
        `No active clients for account ${azureAccountId}, stopping refresh cycle`,
      );
      return;
    }

    const tokenResult =
      await this.azureAuthService.getRedisTokenByAccountId(azureAccountId);

    if (!tokenResult) {
      this.logger.warn(
        `Failed to get fresh token for account ${azureAccountId}, scheduling retry`,
      );
      // Schedule a retry to handle transient auth failures
      // This prevents permanent loss of token renewal for active clients
      this.scheduleRetry(azureAccountId);
      return;
    }

    this.logger.debug(
      `Re-authenticating ${clients.length} client(s) for account ${azureAccountId}`,
    );

    await Promise.all(
      clients.map(async (client) => {
        try {
          await client.call([
            'AUTH',
            tokenResult.account.localAccountId,
            tokenResult.token,
          ]);
        } catch (error) {
          this.logger.warn(
            `Failed to re-authenticate client ${client.id}: ${error.message}`,
          );
        }
      }),
    );
  }

  private scheduleRetry(azureAccountId: string): void {
    this.logger.debug(
      `Scheduling token refresh retry for account ${azureAccountId} in ${TOKEN_REFRESH_RETRY_DELAY_MS / 1000}s`,
    );

    const timeout = setTimeout(() => {
      this.refreshTokenAndReauth(azureAccountId).catch((error) => {
        this.logger.error(
          `Token refresh retry failed for account ${azureAccountId}: ${error.message}`,
        );
      });
    }, TOKEN_REFRESH_RETRY_DELAY_MS);

    // Use a past date for retry timers since they don't represent token expiry
    this.timers.set(azureAccountId, { timeout, expiresOn: new Date(0) });
  }
}
