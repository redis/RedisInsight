import { nock, serverConfig } from '../../helpers/test';
import {
  mockCloudApiAccount,
  mockCloudApiCapiKey,
  mockCloudApiCsrfToken,
  mockCloudApiUser,
} from 'src/__mocks__';

export const initSMCapiNockScope = () => {
  return nock(serverConfig.get('cloud').capiUrl);
};

export const initSMApiNockScope = () => {
  return nock(serverConfig.get('cloud').apiUrl);
};

export const initApiLoginNockScope = (
  apiNockScope = initSMApiNockScope(),
  persist = true,
) => {
  return apiNockScope
    .persist(persist)
    .post('/login')
    .query(true)
    .reply(200, {}, { 'set-cookie': 'JSESSIONID=jsessionid' })
    .get('/csrf')
    .reply(200, { csrfToken: mockCloudApiCsrfToken });
};

export const initApiUserProfileNockScope = (
  apiNockScope = initSMApiNockScope(),
  persist = true,
) => {
  return initApiLoginNockScope(apiNockScope, persist)
    .get('/users/me')
    .reply(200, mockCloudApiUser)
    .get('/accounts')
    .reply(200, { accounts: [mockCloudApiAccount] });
};

export const initApiCapiKeysEnsureNockScope = (
  apiNockScope = initSMApiNockScope(),
) => {
  return initApiUserProfileNockScope(apiNockScope, true)
    .get('/accounts/cloud-api/cloudApiKeys')
    .reply(200, { cloudApiKeys: [] })
    .post('/accounts/cloud-api/cloudApiKeys')
    .reply(200, { cloudApiKey: mockCloudApiCapiKey });
};
