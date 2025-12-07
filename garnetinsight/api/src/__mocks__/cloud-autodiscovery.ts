import { ActionStatus } from 'src/common/models';
import {
  ImportCloudDatabaseDto,
  ImportCloudDatabaseResponse,
} from 'src/modules/cloud/autodiscovery/dto';
import {
  mockCloudDatabase,
  mockCloudDatabaseFixed,
  mockGetCloudSubscriptionDatabaseDto,
} from 'src/__mocks__/cloud-database';
import { CloudSubscriptionType } from 'src/modules/cloud/subscription/models';
import { mockCloudAccountInfo } from 'src/__mocks__/cloud-user';
import {
  mockCloudSubscription,
  mockCloudSubscriptionFixed,
} from 'src/__mocks__/cloud-subscription';

export const mockImportCloudDatabaseDto = Object.assign(
  new ImportCloudDatabaseDto(),
  {
    ...mockGetCloudSubscriptionDatabaseDto,
  },
);

export const mockImportCloudDatabaseDtoFixed = Object.assign(
  new ImportCloudDatabaseDto(),
  {
    ...mockGetCloudSubscriptionDatabaseDto,
    subscriptionType: CloudSubscriptionType.Fixed,
    free: true,
  },
);

export const mockImportCloudDatabaseResponse = Object.assign(
  new ImportCloudDatabaseResponse(),
  {
    ...mockImportCloudDatabaseDto,
    status: ActionStatus.Success,
    message: 'Added',
    databaseDetails: mockCloudDatabase,
  },
);

export const mockImportCloudDatabaseResponseFixed = Object.assign(
  new ImportCloudDatabaseResponse(),
  {
    ...mockImportCloudDatabaseDtoFixed,
    status: ActionStatus.Success,
    message: 'Added',
    databaseDetails: mockCloudDatabaseFixed,
  },
);

export const mockCloudAutodiscoveryService = jest.fn(() => ({
  getAccount: jest.fn().mockResolvedValue(mockCloudAccountInfo),
  discoverSubscriptions: jest
    .fn()
    .mockResolvedValue([mockCloudSubscription, mockCloudSubscriptionFixed]),
  discoverDatabases: jest
    .fn()
    .mockResolvedValue([mockCloudDatabase, mockCloudDatabaseFixed]),
  addRedisCloudDatabases: jest
    .fn()
    .mockResolvedValue([
      mockImportCloudDatabaseResponse,
      mockImportCloudDatabaseResponseFixed,
    ]),
}));

export const mockCloudAutodiscoveryAnalytics = jest.fn(() => ({
  sendGetRedisCloudSubsSucceedEvent: jest.fn(),
  sendGetRedisCloudSubsFailedEvent: jest.fn(),
  sendGetRedisCloudDbsSucceedEvent: jest.fn(),
  sendGetRedisCloudDbsFailedEvent: jest.fn(),
}));
