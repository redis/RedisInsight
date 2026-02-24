import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { get } from 'lodash';
import config, { Config } from 'src/utils/config';
import { SettingsService } from 'src/modules/settings/settings.service';
import { SessionMetadata } from 'src/common/models';

const SENTRY_CONFIG = config.get('sentry') as Config['sentry'];
const SERVER_CONFIG = config.get('server') as Config['server'];

/**
 * List of sensitive field names to scrub from error reports
 */
const SENSITIVE_FIELDS = [
  'password',
  'pass',
  'secret',
  'token',
  'apiKey',
  'api_key',
  'privateKey',
  'private_key',
  'certificate',
  'cert',
  'clientCert',
  'clientKey',
  'caCert',
  'sshPassphrase',
  'sshPrivateKey',
  'sentinelPassword',
];

@Injectable()
export class SentryService implements OnModuleInit {
  private readonly logger = new Logger('SentryService');

  private initialized = false;

  constructor(private readonly settingsService: SettingsService) {}

  async onModuleInit() {
    await this.initialize();
  }

  /**
   * Initialize Sentry SDK
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (!SENTRY_CONFIG.enabled || !SENTRY_CONFIG.dsn) {
      this.logger.log('Sentry is disabled or DSN not configured');
      return;
    }

    try {
      Sentry.init({
        dsn: SENTRY_CONFIG.dsn,
        environment: SENTRY_CONFIG.environment,
        release: SERVER_CONFIG.appVersion,
        sampleRate: SENTRY_CONFIG.sampleRate,
        tracesSampleRate: SENTRY_CONFIG.tracesSampleRate,
        beforeSend: (event) => this.beforeSend(event),
        integrations: [Sentry.localVariablesIntegration()],
      });

      this.initialized = true;
      this.logger.log(
        `Sentry initialized for environment: ${SENTRY_CONFIG.environment}`,
      );
    } catch (error) {
      this.logger.error('Failed to initialize Sentry', error);
    }
  }

  /**
   * Check if analytics/error reporting is allowed by user
   */
  async isAnalyticsGranted(sessionMetadata: SessionMetadata): Promise<boolean> {
    try {
      const settings =
        await this.settingsService.getAppSettings(sessionMetadata);
      return !!get(settings, 'agreements.analytics', false);
    } catch {
      return false;
    }
  }

  /**
   * Scrub sensitive data from event before sending to Sentry
   */
  private scrubSensitiveData(obj: unknown): unknown {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.scrubSensitiveData(item));
    }

    const scrubbed: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = SENSITIVE_FIELDS.some(
        (field) =>
          lowerKey.includes(field.toLowerCase()) ||
          lowerKey === field.toLowerCase(),
      );

      if (isSensitive) {
        scrubbed[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        scrubbed[key] = this.scrubSensitiveData(value);
      } else {
        scrubbed[key] = value;
      }
    }

    return scrubbed;
  }

  /**
   * beforeSend hook to filter and scrub events
   */
  private beforeSend(event: Sentry.ErrorEvent): Sentry.ErrorEvent | null {
    // Scrub sensitive data from the event
    if (event.extra) {
      event.extra = this.scrubSensitiveData(event.extra) as Record<
        string,
        unknown
      >;
    }

    if (event.contexts) {
      event.contexts = this.scrubSensitiveData(
        event.contexts,
      ) as typeof event.contexts;
    }

    if (event.request?.data) {
      event.request.data = this.scrubSensitiveData(event.request.data);
    }

    return event;
  }

  /**
   * Capture an exception and send to Sentry
   */
  async captureException(
    exception: Error,
    context?: Record<string, unknown>,
  ): Promise<string | undefined> {
    if (!this.initialized || !SENTRY_CONFIG.enabled) {
      return undefined;
    }

    const eventId = Sentry.captureException(exception, {
      extra: context
        ? (this.scrubSensitiveData(context) as Record<string, unknown>)
        : undefined,
    });

    return eventId;
  }

  /**
   * Set user context for Sentry
   */
  setUser(anonymousId: string): void {
    if (!this.initialized) {
      return;
    }

    Sentry.setUser({ id: anonymousId });
  }
}
