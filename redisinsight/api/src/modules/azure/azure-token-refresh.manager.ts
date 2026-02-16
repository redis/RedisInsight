import {
  Injectable,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common';
import { AzureAuthService } from './auth/azure-auth.service';
import { RedisClientStorage } from 'src/modules/redis/redis.client.storage';
import {
  AzureRedisTokenEvents,
  TOKEN_REFRESH_BUFFER_MS,
  // TOKEN_REFRESH_RETRY_DELAY_MS,
} from './constants';
import { OnEvent } from '@nestjs/event-emitter';
import { AzureTokenResult } from 'src/modules/azure/auth/models';

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
@Injectable()
export class AzureTokenRefreshManager implements OnModuleDestroy {
  private readonly logger = new Logger(AzureTokenRefreshManager.name);

  private readonly timers: Map<
    string,
    { timeout: NodeJS.Timeout; expiresOn: Date }
  > = new Map();

  constructor(
    private readonly azureAuthService: AzureAuthService,
    private readonly redisClientStorage: RedisClientStorage,
  ) {}

  onModuleDestroy(): void {
    this.clearAllTimers();
  }

  @OnEvent(AzureRedisTokenEvents.Acquire)
  async processAcquiredToken(
    azureAccountId: string,
    token: AzureTokenResult,
  ): Promise<void> {
    try {
      const timer = this.timers.get(azureAccountId);

      // Verify if we already have timer for particular token and cover race condition
      if (timer?.expiresOn === token.expiresOn) {
        return;
      }

      if (timer?.timeout) {
        clearTimeout(timer?.timeout);
      }

      // todo: investigate and cover edge cases
      const now = Date.now();
      const expiresAt = token.expiresOn.getTime();
      const refreshAt = expiresAt - TOKEN_REFRESH_BUFFER_MS;
      const delay = refreshAt - now;

      this.logger.debug(
        `Scheduling token refresh for account ${azureAccountId} in ${Math.round(delay / 1000)}s (expires: ${token.expiresOn.toISOString()})`,
      );

      const timeout = setTimeout(() => {
        this.refreshToken(azureAccountId).catch((error) => {
          this.logger.error(
            `Token refresh failed for account ${azureAccountId}: ${error.message}`,
          );
        });
      }, delay);

      this.timers.set(azureAccountId, {
        timeout,
        expiresOn: token.expiresOn,
      });

      await this.reAuthenticateClients(azureAccountId, token);
    } catch (e) {
      this.logger.error('Unable to schedule refresh token', e);
    }
  }

  private async refreshToken(azureAccountId: string): Promise<void> {
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

      this.clearTimer(azureAccountId);
      return;
    }

    await this.azureAuthService.getRedisTokenByAccountId(azureAccountId);
  }

  private async reAuthenticateClients(
    azureAccountId: string,
    token: AzureTokenResult,
  ): Promise<void> {
    const clients = this.redisClientStorage
      .getClientsByDatabaseField(
        'providerDetails.azureAccountId',
        azureAccountId,
      )
      // filter to authenticate only needed clients
      .filter(
        (client) =>
          client.database.providerDetails.tokenExpiresOn !== token.expiresOn,
      );

    this.logger.debug(
      `Re-authenticating ${clients.length} client(s) for account ${azureAccountId}`,
    );

    await Promise.all(
      clients.map(async (client) => {
        try {
          await client.call([
            'AUTH',
            token.account.localAccountId,
            token.token,
          ]);
        } catch (error) {
          this.logger.warn(
            `Failed to re-authenticate client ${client.id}: ${error.message}`,
          );
        }
      }),
    );
  }

  // todo: do we need this? remove? in case we want to retry token acquire it should be part of another service,
  //  if there is error with AUTH command - it should be covered on client side (client already has retry mechanism)
  // private scheduleRetry(azureAccountId: string): void {
  //   this.logger.debug(
  //     `Scheduling token refresh retry for account ${azureAccountId} in ${TOKEN_REFRESH_RETRY_DELAY_MS / 1000}s`,
  //   );
  //
  //   const timer = setTimeout(() => {
  //     this.refreshTokenAndReauth(azureAccountId).catch((error) => {
  //       this.logger.error(
  //         `Token refresh retry failed for account ${azureAccountId}: ${error.message}`,
  //       );
  //     });
  //   }, TOKEN_REFRESH_RETRY_DELAY_MS);
  //
  //   this.timers.set(azureAccountId, timer);
  // }

  clearTimer(azureAccountId: string): void {
    const existingTimer = this.timers.get(azureAccountId);
    if (existingTimer) {
      clearTimeout(existingTimer.timeout);
      this.timers.delete(azureAccountId);
    }
  }

  clearAllTimers(): void {
    this.timers.forEach((timer) => clearTimeout(timer.timeout));
    this.timers.clear();
  }
}
