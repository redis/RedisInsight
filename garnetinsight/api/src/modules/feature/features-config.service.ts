import { Injectable, Logger } from '@nestjs/common';
import { SessionMetadata } from 'src/common/models';

@Injectable()
export abstract class FeaturesConfigService {
  protected logger = new Logger(this.constructor.name);

  /**
   * Should initialize all required values
   * Sync config on startup (in background)
   * Set interval to re-sync automatically without waiting for next app start
   */
  abstract init(): Promise<void>;

  /**
   * Get control group and number fields
   */
  abstract getControlInfo(
    sessionMetadata: SessionMetadata,
  ): Promise<{ controlNumber: number; controlGroup: string }>;

  /**
   * Get latest config from remote and save it in the local database
   */
  abstract sync(sessionMetadata: SessionMetadata): Promise<void>;
}
