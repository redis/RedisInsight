import { Test, TestingModule } from '@nestjs/testing';
import { mockSocket } from 'src/__mocks__';
import { UserClient } from 'src/modules/pub-sub/model/user-client';
import { SubscriptionProvider } from 'src/modules/pub-sub/providers/subscription.provider';
import { SubscriptionType } from 'src/modules/pub-sub/constants';
import { SimpleSubscription } from 'src/modules/pub-sub/model/simple.subscription';
import { PatternSubscription } from 'src/modules/pub-sub/model/pattern.subscription';
import { BadRequestException } from '@nestjs/common';

const mockUserClient = new UserClient('socketId', mockSocket, 'databaseId');

const mockSubscriptionDto = {
  channel: 'channel-a',
  type: SubscriptionType.Subscribe,
};

const mockPSubscriptionDto = {
  channel: 'channel-a',
  type: SubscriptionType.PSubscribe,
};

const mockSSubscriptionDto = {
  channel: 'channel-a',
  type: SubscriptionType.SSubscribe,
};

describe('SubscriptionProvider', () => {
  let service: SubscriptionProvider;

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [SubscriptionProvider],
    }).compile();

    service = await module.get(SubscriptionProvider);
  });

  describe('createSubscription', () => {
    it('should create simple subscription', async () => {
      const subscription = service.createSubscription(
        mockUserClient,
        mockSubscriptionDto,
      );
      expect(subscription).toBeInstanceOf(SimpleSubscription);
    });
    it('should create pattern subscription', async () => {
      const subscription = service.createSubscription(
        mockUserClient,
        mockPSubscriptionDto,
      );
      expect(subscription).toBeInstanceOf(PatternSubscription);
    });
    it('should throw error since shard subscription is not supported yet', async () => {
      try {
        service.createSubscription(mockUserClient, mockSSubscriptionDto);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual('Unsupported Subscription type');
      }
    });
  });
});
