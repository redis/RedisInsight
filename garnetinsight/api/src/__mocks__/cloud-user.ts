import {
  CloudAccountInfo,
  CloudUser,
  CloudUserAccount,
  ICloudApiAccount,
  ICloudApiUser,
  ICloudCapiAccount,
} from 'src/modules/cloud/user/models';
import config, { Config } from 'src/utils/config';
import { instanceToPlain } from 'class-transformer';
import {
  mockCloudApiCapiAccessKey,
  mockCloudCapiAuthDto,
  mockCloudCapiKey,
} from 'src/__mocks__/cloud-capi-key';
import {
  mockCloudApiAuthDto,
  mockCloudSession,
} from 'src/__mocks__/cloud-session';

const serverConfig = config.get('server') as Config['server'];
const cloudConfig = config.get('cloud');

// ======================================= CAPI =======================================
export const mockCloudCapiAccount: ICloudCapiAccount = {
  id: 40131,
  name: 'Redis Labs',
  createdTimestamp: '2018-12-23T15:15:31Z',
  updatedTimestamp: '2020-06-03T13:16:59Z',
  key: {
    name: 'QA-HashedIn-Test-API-Key-2',
    accountId: 40131,
    accountName: 'Redis Labs',
    allowedSourceIps: ['0.0.0.0/0'],
    createdTimestamp: '2020-04-06T09:22:38Z',
    owner: {
      name: 'Cloud Account',
      email: 'cloud.account@redislabs.com',
    },
    httpSourceIp: '198.141.36.229',
  },
};

export const mockCloudAccountInfo = Object.assign(new CloudAccountInfo(), {
  accountId: mockCloudCapiAccount.id,
  accountName: mockCloudCapiAccount.name,
  ownerEmail: mockCloudCapiAccount.key.owner.email,
  ownerName: mockCloudCapiAccount.key.owner.name,
});

export const mockCloudUserCapiProvider = jest.fn(() => ({
  getCurrentAccount: jest.fn().mockResolvedValue(mockCloudCapiAccount),
}));

export const mockCloudUserCapiService = jest.fn(() => ({
  getCurrentAccount: jest.fn().mockResolvedValue(mockCloudAccountInfo),
}));

// ======================================= API =======================================
export const mockCloudCapiHeaders = {
  headers: {
    'x-api-key': mockCloudCapiAuthDto.capiKey,
    'x-api-secret-key': mockCloudCapiAuthDto.capiSecret,
    'User-Agent': `Garnetinsight/${serverConfig.version}`,
  },
};

export const mockCloudUserAccount = Object.assign(new CloudUserAccount(), {
  id: mockCloudCapiAccount.id,
  name: mockCloudCapiAccount.name,
  capiKey: mockCloudCapiAuthDto.capiKey,
  capiSecret: mockCloudCapiAuthDto.capiSecret,
});

//
// export const mockCloudUserAccount2 = Object.assign(new CloudUserAccount(), {
//   id: mockCloudCapiAccount2.id,
//   name: mockCloudCapiAccount2.name,
// });

export const mockDefaultCloudApiHeaders = {
  'User-Agent': `Garnetinsight/${serverConfig.version}`,
  'x-garnetinsight-token': cloudConfig.apiToken,
};

export const mockCloudApiHeaders = {
  headers: {
    ...mockDefaultCloudApiHeaders,
    authorization: `Bearer ${mockCloudApiAuthDto.accessToken}`,
    'x-csrf-token': mockCloudApiAuthDto.csrf,
    cookie: `JSESSIONID=${mockCloudApiAuthDto.apiSessionId}`,
  },
};

export const mockCloudApiUser: ICloudApiUser = {
  id: '66999',
  current_account_id: `${mockCloudCapiAccount.id}`,
  name: 'User 1',
  email: 'user1@mail.com',
  user_id: 10001, // is it okta id?
  role: 'owner',
};

export const mockCloudUser = Object.assign(new CloudUser(), {
  id: +mockCloudApiUser.id,
  name: mockCloudApiUser.name,
  currentAccountId: +mockCloudApiUser.current_account_id,
  accounts: [mockCloudUserAccount],
  capiKey: mockCloudCapiKey,
});

export const mockCloudUserSafe = instanceToPlain(mockCloudUser); // omits all data in the "security" group

export const mockCloudApiAccount: ICloudApiAccount = {
  id: mockCloudCapiAccount.id,
  name: mockCloudCapiAccount.name,
  api_access_key: mockCloudApiCapiAccessKey.accessKey,
};

export const mockCloudUserApiProvider = jest.fn(() => ({
  getCurrentAccount: jest.fn().mockResolvedValue(mockCloudCapiAccount),
}));

export const mockCloudUserRepository = jest.fn(() => ({
  get: jest.fn().mockResolvedValue(mockCloudUser),
  update: jest.fn().mockResolvedValue(mockCloudUser),
}));

export const mockCloudUserApiService = jest.fn(() => ({
  getCapiKeys: jest.fn().mockResolvedValue(mockCloudCapiAuthDto),
  getUserSession: jest.fn().mockResolvedValue(mockCloudSession),
  invalidateApiSession: jest.fn().mockResolvedValue(undefined),
  me: jest.fn().mockResolvedValue(mockCloudUser),
  getCloudUser: jest.fn().mockResolvedValue(mockCloudUser),
  setCurrentAccount: jest.fn(),
  updateUser: jest.fn(),
}));
