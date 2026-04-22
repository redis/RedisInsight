import * as os from 'os';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { RedisClientStorage } from 'src/modules/redis/redis.client.storage';
import apiConfig from 'src/utils/config';

const REDIS_CLIENTS_CONFIG = apiConfig.get('redis_clients');

/**
 * Watches the host's network interfaces and, when they change, disconnects
 * every cached Redis client so the next command opens a fresh TCP socket
 * bound to the currently-active interface.
 *
 * Why this exists:
 * When the user hands off between Ethernet and Wi-Fi, the kernel tears down
 * the old interface but any existing TCP sockets routed through it end up
 * half-open. Writing to them appears to succeed (packets are queued on the
 * now-dead interface) and the command hangs until TCP retransmit / keepalive
 * eventually times out — which, at OS defaults, can take minutes. Dropping
 * the cached clients as soon as the interface set changes makes the very
 * next request reconnect cleanly.
 *
 * Implementation notes:
 * - We compute a stable signature from `os.networkInterfaces()` (excluding
 *   internal interfaces and link-local addresses which flap under macOS).
 * - We poll rather than subscribe to platform-specific APIs — this keeps the
 *   logic cross-platform (macOS / Linux / Windows) without native deps.
 * - Can be disabled via RI_CLIENTS_NETWORK_WATCHER=false, or tuned via
 *   RI_CLIENTS_NETWORK_WATCHER_INTERVAL (ms).
 */
@Injectable()
export class NetworkChangeMonitor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('NetworkChangeMonitor');

  private readonly enabled: boolean;

  private readonly intervalMs: number;

  private lastSignature: string = '';

  private timer?: NodeJS.Timeout;

  constructor(private readonly redisClientStorage: RedisClientStorage) {
    this.enabled = REDIS_CLIENTS_CONFIG.networkWatcher !== false;
    this.intervalMs = REDIS_CLIENTS_CONFIG.networkWatcherInterval;
  }

  onModuleInit(): void {
    if (!this.enabled) {
      this.logger.debug('Network change monitor disabled via config');
      return;
    }

    this.lastSignature = NetworkChangeMonitor.computeSignature();
    this.timer = setInterval(() => this.check(), this.intervalMs);
    // allow the process to exit even if this is the only timer running
    this.timer.unref?.();
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  private async check(): Promise<void> {
    const nextSignature = NetworkChangeMonitor.computeSignature();

    if (nextSignature === this.lastSignature) {
      return;
    }

    const previous = this.lastSignature;

    this.logger.log(
      `Network interfaces changed; disconnecting cached Redis clients. ` +
        `before=${previous || '(none)'} after=${nextSignature || '(none)'}`,
    );

    try {
      await this.redisClientStorage.removeAll();
      // Only commit the new signature once the cache was successfully
      // dropped — if removeAll fails, leave lastSignature untouched so the
      // next tick retries instead of silently leaving stale clients in place.
      this.lastSignature = nextSignature;
    } catch (e) {
      this.logger.warn(
        'Failed to drop cached clients on network change, will retry',
        e,
      );
    }
  }

  /**
   * Produce a stable string describing the current "routable" interface set.
   * Excludes internal / loopback interfaces and IPv6 link-local addresses,
   * both of which can flap in normal operation and would trigger false
   * positives.
   *
   * Example output for a laptop on Wi-Fi with an active Ethernet dongle:
   *   "en0|IPv4|192.168.1.10,en0|IPv6|2001:db8::42,en7|IPv4|10.0.0.5"
   *
   * Same laptop after unplugging Ethernet:
   *   "en0|IPv4|192.168.1.10,en0|IPv6|2001:db8::42"
   *
   * The two strings are not equal, so `check()` calls `removeAll()` and
   * every cached Redis client is dropped.
   */
  private static computeSignature(): string {
    const interfaces = os.networkInterfaces();
    const lines: string[] = [];

    for (const name of Object.keys(interfaces).sort()) {
      const addresses = interfaces[name] || [];
      for (const addr of addresses) {
        if (addr.internal) {
          continue;
        }
        // IPv6 link-local (fe80::/10) changes regularly on macOS and is
        // not relevant for routing to Redis.
        if (
          addr.family === 'IPv6' &&
          addr.address?.toLowerCase()?.startsWith('fe80')
        ) {
          continue;
        }

        lines.push(`${name}|${addr.family}|${addr.address}`);
      }
    }

    return lines.join(',');
  }
}
