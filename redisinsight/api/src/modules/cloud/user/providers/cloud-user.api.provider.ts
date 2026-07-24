import { get } from 'lodash';
import { Injectable } from '@nestjs/common';
import { ICloudApiAccount, ICloudApiUser } from 'src/modules/cloud/user/models';
import {
  CloudApiMfaRequiredException,
  wrapCloudApiError,
} from 'src/modules/cloud/common/exceptions';
import {
  CloudRequestUtm,
  ICloudApiCredentials,
} from 'src/modules/cloud/common/models';
import { CloudApiProvider } from 'src/modules/cloud/common/providers/cloud.api.provider';
import { CloudApiMfaType } from 'src/modules/cloud/common/constants';

@Injectable()
export class CloudUserApiProvider extends CloudApiProvider {
  /**
   * Login user to api using accessToken from oauth flow
   * returns JSESSIONID
   * @param credentials
   * @private
   */
  async getCsrfToken(credentials: ICloudApiCredentials): Promise<string> {
    try {
      const { data } = await this.api.get(
        'csrf',
        CloudApiProvider.getHeaders(credentials),
      );

      return data?.csrfToken?.csrf_token;
    } catch (e) {
      throw wrapCloudApiError(e);
    }
  }

  /**
   * Login user to api using accessToken from oauth flow
   * returns JSESSIONID
   * When the login was challenged for MFA, re-call with mfaCode to complete it
   * @param credentials
   * @param utm
   * @param mfaCode
   * @private
   */
  async getApiSessionId(
    credentials: ICloudApiCredentials,
    utm?: CloudRequestUtm,
    mfaCode?: string,
  ): Promise<string> {
    try {
      const { headers } = await this.api.post(
        'login',
        {
          ...CloudApiProvider.generateUtmBody(utm),
          auth_mode: credentials?.idpType,
          ...(mfaCode
            ? { mfa_code: mfaCode, mfa_type: CloudApiMfaType.Totp }
            : {}),
        },
        CloudApiProvider.getHeaders(credentials),
      );

      return CloudUserApiProvider.getJsessionId(headers);
    } catch (e) {
      const error = wrapCloudApiError(e);

      if (error instanceof CloudApiMfaRequiredException) {
        error.apiSessionId = CloudUserApiProvider.getJsessionId(
          e?.response?.headers,
        );
      }

      throw error;
    }
  }

  private static getJsessionId(headers: unknown): string | undefined {
    return (get(headers, 'set-cookie', []) as string[])
      .find((header) => header.indexOf('JSESSIONID=') > -1)
      ?.match(/JSESSIONID=([^;]+)/)?.[1];
  }

  /**
   * Get current user profile
   * @param credentials
   */
  async getCurrentUser(
    credentials: ICloudApiCredentials,
  ): Promise<ICloudApiUser> {
    try {
      const { data } = await this.api.get(
        '/users/me',
        CloudApiProvider.getHeaders(credentials),
      );

      return data;
    } catch (e) {
      throw wrapCloudApiError(e);
    }
  }

  /**
   * Fetch list of user accounts
   * @param credentials
   */
  async getAccounts(
    credentials: ICloudApiCredentials,
  ): Promise<ICloudApiAccount[]> {
    try {
      const { data } = await this.api.get(
        '/accounts',
        CloudApiProvider.getHeaders(credentials),
      );

      return data?.accounts;
    } catch (e) {
      throw wrapCloudApiError(e);
    }
  }

  /**
   * Select current account to work with
   * @param credentials
   * @param accountId
   */
  async setCurrentAccount(
    credentials: ICloudApiCredentials,
    accountId: number,
  ): Promise<void> {
    try {
      await this.api.post(
        `/accounts/setcurrent/${accountId}`,
        {},
        CloudApiProvider.getHeaders(credentials),
      );
    } catch (e) {
      throw wrapCloudApiError(e);
    }
  }
}
