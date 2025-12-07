import axios from 'axios';
import {
  CloudRequestUtm,
  ICloudApiCredentials,
} from 'src/modules/cloud/common/models';
import config, { Config } from 'src/utils/config';
import { CloudApiUnauthorizedException } from 'src/modules/cloud/common/exceptions';
import { CloudSessionService } from 'src/modules/cloud/session/cloud-session.service';
import { Injectable } from '@nestjs/common';

const serverConfig = config.get('server') as Config['server'];
const cloudConfig = config.get('cloud');

@Injectable()
export class CloudApiProvider {
  protected api = axios.create({
    baseURL: cloudConfig.apiUrl,
  });

  constructor(private readonly cloudSessionService: CloudSessionService) {}

  async callWithAuthRetry(
    sessionId: string,
    fn: () => Promise<any>,
    retries = 1,
  ) {
    try {
      return await fn();
    } catch (e) {
      if (retries > 0 && e instanceof CloudApiUnauthorizedException) {
        await this.cloudSessionService
          .invalidateApiSession(sessionId)
          .catch(() => {});
        return this.callWithAuthRetry(sessionId, fn, retries - 1);
      }

      throw e;
    }
  }

  /**
   * Generates utm query parameters object
   * @param utm
   */
  static generateUtmBody(utm: CloudRequestUtm): Record<string, string> {
    return {
      utm_source: utm?.source,
      utm_medium: utm?.medium,
      utm_campaign: utm?.campaign,
      utm_amp: utm?.amp,
      utm_package: utm?.package,
    };
  }

  /**
   * Prepare header for authorized requests
   * @param credentials
   */
  static getHeaders(credentials: ICloudApiCredentials): { headers: {} } {
    const headers = {
      'User-Agent': `Garnetinsight/${serverConfig.version}`,
      'x-garnetinsight-token': cloudConfig.apiToken,
    };

    if (credentials?.accessToken) {
      headers['authorization'] = `Bearer ${credentials.accessToken}`;
    }

    if (credentials?.apiSessionId) {
      headers['cookie'] = `JSESSIONID=${credentials.apiSessionId}`;
    }

    if (credentials?.csrf) {
      headers['x-csrf-token'] = credentials.csrf;
    }

    return {
      headers,
    };
  }
}
