import { ICloudApiCredentials } from 'src/modules/cloud/common/models';
import { CloudAuthIdpType } from 'src/modules/cloud/auth/models';
import { ICloudApiCsrfToken } from 'src/modules/cloud/user/models';
import { CloudSessionData } from 'src/modules/cloud/session/models/cloud-session';
import { CloudSessionEntity } from 'src/modules/cloud/session/entities/cloud.session.entity';
import { EncryptionStrategy } from 'src/modules/encryption/models';

export const mockCloudApiCsrfToken: ICloudApiCsrfToken = {
  csrf_token: 'csrf_p6vA6A5tF36Jf6twH2cBOqtt7n',
};

export const mockCloudApiAuthDto: ICloudApiCredentials = {
  accessToken: 'at_p6vA6A5tF36Jf6twH2cBOqtt7n',
  refreshToken: 'rt_p6vA6A5tF36Jf6twH2cBOqtt7n',
  idToken: 'id_token_p6vA6A5tF36Jf6twH2cBOqtt7n',
  idpType: CloudAuthIdpType.Google,
  csrf: mockCloudApiCsrfToken.csrf_token,
  apiSessionId: 'asid_p6v-A6A5tF36J-f6twH2cB!@#$_^&*()Oqtt7n',
};

export const mockCloudSessionData = Object.assign(new CloudSessionData(), {
  id: '1',
  data: { idpType: CloudAuthIdpType.Google },
});

export const mockCloudSessionEntity = Object.assign(new CloudSessionEntity(), {
  ...mockCloudSessionData,
  data: 'encryptedCloudSessionData',
  encryption: EncryptionStrategy.KEYTAR,
});

export const mockCloudSession = {
  ...mockCloudApiAuthDto,
  user: {
    id: 'cloud_id_1',
    name: 'user name',
    currentAccountId: 'cloud_account_id_1',
    accounts: [
      {
        id: 'cloud_account_id_1',
        name: 'cloud account 1',
        active: false,
      },
      {
        id: 'cloud_account_id_2',
        name: 'cloud account 2',
        active: false,
      },
    ],
  },
};

export const mockCloudSessionRepository = jest.fn(() => ({
  get: jest.fn().mockResolvedValue(null),
  save: jest.fn(),
}));

export const mockCloudSessionService = jest.fn(() => ({
  getSession: jest.fn().mockResolvedValue(mockCloudSession),
  updateSessionData: jest.fn().mockResolvedValue(mockCloudSession),
  deleteSessionData: jest.fn(),
  invalidateApiSession: jest.fn().mockResolvedValue(undefined),
}));
