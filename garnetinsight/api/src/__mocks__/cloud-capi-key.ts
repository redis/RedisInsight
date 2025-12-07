import { CloudCapiAuthDto } from 'src/modules/cloud/common/dto';
import {
  CloudCapiKey,
  ICloudApiCapiAccessKey,
  ICloudApiCapiKey,
} from 'src/modules/cloud/capi-key/model';
import { CloudCapiKeyEntity } from 'src/modules/cloud/capi-key/entity/cloud-capi-key.entity';
import { EncryptionStrategy } from 'src/modules/encryption/models';
import { mockServer } from 'src/__mocks__/server';

export const mockCloudCapiAuthDto: CloudCapiAuthDto = {
  capiKey: 'capi_key',
  capiSecret: 'capi_secret_key',
};

export const mockCloudApiCapiAccessKey: ICloudApiCapiAccessKey = {
  accessKey: mockCloudCapiAuthDto.capiKey,
};

export const mockCloudApiCapiKey: ICloudApiCapiKey = {
  id: 3001,
  name: 'capi-key-name',
  user_account: 40131,
  secret_key: mockCloudCapiAuthDto.capiSecret,
};

export const mockCloudCapiKey = Object.assign(new CloudCapiKey(), {
  id: '56070e1e-cc50-41c2-b695-585405736af4',
  name: `Garnetinsight-${mockServer.id.slice(0, 13)}-1577836800000`,
  userId: '84cece4b-b074-49be-88e0-44c5f3f59123',
  cloudUserId: 10001,
  cloudAccountId: 20001,
  capiKey: mockCloudCapiAuthDto.capiKey,
  capiSecret: mockCloudCapiAuthDto.capiSecret,
  valid: true,
  createdAt: new Date('2020-01-01T00:00:00.000Z'),
  lastUsed: new Date(),
});

export const mockCapiKeyEncrypted = 'cloudCapiKey.capiKey_ENCRYPTED';
export const mockCapiSecretEncrypted = 'cloudCapiKey.capiSecret_ENCRYPTED';

export const mockCloudCapiKeyEntity = Object.assign(new CloudCapiKeyEntity(), {
  ...mockCloudCapiKey,
  capiKey: mockCapiKeyEncrypted,
  capiSecret: mockCapiSecretEncrypted,
  encryption: EncryptionStrategy.KEYTAR,
});

export const mockCloudCapiKeyRepository = jest.fn(() => ({
  get: jest.fn().mockResolvedValue(mockCloudCapiKey),
  update: jest.fn().mockResolvedValue(mockCloudCapiKey),
  getByUserAccount: jest.fn().mockResolvedValue(mockCloudCapiKey),
  create: jest.fn().mockResolvedValue({
    ...mockCloudCapiKey,
    capiSecret: undefined,
  }),
  list: jest.fn().mockResolvedValue([mockCloudCapiKey]),
  delete: jest.fn(),
  deleteAll: jest.fn(),
}));

export const mockCloudCapiKeyApiProvider = jest.fn(() => ({
  enableCapi: jest.fn().mockResolvedValue(mockCloudApiCapiAccessKey.accessKey),
  createCapiKey: jest.fn().mockResolvedValue(mockCloudApiCapiKey),
}));

export const mockCloudCapiKeyService = jest.fn(() => ({
  getCapiCredentials: jest.fn().mockResolvedValue(mockCloudCapiAuthDto),
  handleCapiKeyUnauthorizedError: jest.fn().mockImplementation((e) => e),
}));

export const mockCloudCapiKeyAnalytics = jest.fn(() => ({
  sendCloudAccountKeyGenerated: jest.fn(),
  sendCloudAccountKeyGenerationFailed: jest.fn(),
  sendCloudAccountSecretGenerated: jest.fn(),
  sendCloudAccountSecretGenerationFailed: jest.fn(),
}));
