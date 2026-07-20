import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AzureAuthService } from './auth/azure-auth.service';
import { RedisClientStorage } from 'src/modules/redis/redis.client.storage';
import {
  AzureRedisTokenEvents,
  MIN_REFRESH_DELAY_MS,
  TOKEN_REFRESH_BUFFER_MS,
} from './constants';
import { AzureTokenResult } from './auth/models';

/**
 * Manages automatic token refresh for Azure Entra ID authenticated Redis clients.
 *
 * Refresh cycles are tracked per (account, tenant): one user can be signed into
 * multiple tenants, each with its own token, and a client must only ever be
 * re-authenticated with the token for its own tenant.
 */
interface ScheduledTimer {
  timeout: NodeJS.Timeout;
  expiresOn: Date;
}

const refreshKey = (accountId: string, tenantId?: string): string =>
  `${accountId}::${tenantId ?? ''}`;

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
    tenantId,
    tokenResult,
  }: {
    accountId: string;
    tenantId?: string;
    tokenResult: AzureTokenResult;
  }): Promise<void> {
    try {
      this.scheduleRefresh(accountId, tenantId, tokenResult.expiresOn);
      await this.reAuthenticateClients(accountId, tenantId, tokenResult);
    } catch (error) {
      this.logger.error(
        `Failed to handle token acquired event for account ${accountId} ` +
          `(tenant=${tenantId || 'home'}): ${error.message}`,
      );
    }
  }

  scheduleRefresh(
    azureAccountId: string,
    tenantId: string | undefined,
    expiresOn: Date,
  ): void {
    const key = refreshKey(azureAccountId, tenantId);
    const existing = this.timers.get(key);

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
    const calculatedDelay = refreshAt - now;

    // Enforce minimum delay to prevent rapid refresh loops when token is near/past expiry.
    // This can happen when MSAL returns a cached token with a short remaining lifetime.
    const delay = Math.max(calculatedDelay, MIN_REFRESH_DELAY_MS);

    if (calculatedDelay < MIN_REFRESH_DELAY_MS) {
      this.logger.warn(
        `Token for ${key} expires soon (${Math.round(calculatedDelay / 1000)}s), ` +
          `using minimum delay of ${MIN_REFRESH_DELAY_MS / 1000}s`,
      );
    }

    this.logger.debug(
      `Scheduling token refresh for ${key} in ${Math.round(delay / 1000)}s (expires: ${expiresOn.toISOString()})`,
    );

    const timeout = setTimeout(() => {
      this.refreshToken(azureAccountId, tenantId).catch((error) => {
        this.logger.error(`Token refresh failed for ${key}: ${error.message}`);
      });
    }, delay);

    this.timers.set(key, { timeout, expiresOn });
  }

  clearTimer(azureAccountId: string, tenantId?: string): void {
    const key = refreshKey(azureAccountId, tenantId);
    const existing = this.timers.get(key);
    if (existing) {
      clearTimeout(existing.timeout);
      this.timers.delete(key);
    }
  }

  clearAllTimers(): void {
    this.timers.forEach(({ timeout }) => clearTimeout(timeout));
    this.timers.clear();
  }

  /** Active clients for a given account and tenant. */
  private getClientsForTenant(azureAccountId: string, tenantId?: string) {
    return this.redisClientStorage
      .getClientsByDatabaseField(
        'providerDetails.azureAccountId',
        azureAccountId,
      )
      .filter(
        (client) => client.database.providerDetails?.tenantId === tenantId,
      );
  }

  private async refreshToken(
    azureAccountId: string,
    tenantId?: string,
  ): Promise<void> {
    const key = refreshKey(azureAccountId, tenantId);
    this.logger.debug(`Refreshing token for ${key}`);

    // Clear the stale timer entry - the timer has fired, so the entry is no longer valid.
    // This ensures that when getRedisTokenByAccountId emits the Acquired event,
    // scheduleRefresh won't skip due to matching expiresOn (e.g., MSAL cached token).
    this.clearTimer(azureAccountId, tenantId);

    // Stop the refresh cycle if no clients are using this account+tenant
    const clients = this.getClientsForTenant(azureAccountId, tenantId);

    if (clients.length === 0) {
      this.logger.debug(`No active clients for ${key}, stopping refresh cycle`);
      return;
    }

    await this.azureAuthService.getRedisTokenByAccountId(
      azureAccountId,
      tenantId,
    );
  }

  private async reAuthenticateClients(
    azureAccountId: string,
    tenantId: string | undefined,
    tokenResult: AzureTokenResult,
  ): Promise<void> {
    const clients = this.getClientsForTenant(azureAccountId, tenantId);

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
        `All clients for ${refreshKey(azureAccountId, tenantId)} already have current token`,
      );
      return;
    }

    this.logger.debug(
      `Re-authenticating ${clientsToReauth.length} of ${clients.length} client(s) for ${refreshKey(azureAccountId, tenantId)}`,
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
