import { mockSocket } from 'src/__mocks__';
import { UserSession } from 'src/modules/pub-sub/model/user-session';
import { UserClient } from 'src/modules/pub-sub/model/user-client';
import { RedisClientSubscriber } from 'src/modules/pub-sub/model/redis-client-subscriber';
import { SimpleSubscription } from 'src/modules/pub-sub/model/simple.subscription';
import { SubscriptionType } from 'src/modules/pub-sub/constants';
import { PatternSubscription } from 'src/modules/pub-sub/model/pattern.subscription';
import { RedisClient } from 'src/modules/redis/client';

const getRedisClientFn = jest.fn();

const nodeClient = Object.create(RedisClient.prototype);
nodeClient.subscribe = jest.fn();
nodeClient.pSubscribe = jest.fn();
nodeClient.unsubscribe = jest.fn();
nodeClient.pUnsubscribe = jest.fn();
nodeClient.disconnect = jest.fn();
nodeClient.quit = jest.fn();

const mockUserClient = new UserClient('socketId', mockSocket, 'databaseId');

const mockRedisClientSubscriber = new RedisClientSubscriber(
  'databaseId',
  getRedisClientFn,
);

const mockSubscriptionDto = {
  channel: 'channel-a',
  type: SubscriptionType.Subscribe,
};

const mockPSubscriptionDto = {
  channel: 'channel-a',
  type: SubscriptionType.PSubscribe,
};

const mockSubscription = new SimpleSubscription(
  mockUserClient,
  mockSubscriptionDto,
);
const mockPSubscription = new PatternSubscription(
  mockUserClient,
  mockPSubscriptionDto,
);

const mockMessage = {
  channel: 'channel-a',
  message: 'message-a',
  time: 1234567890,
};

describe('UserSession', () => {
  let userSession: UserSession;

  beforeEach(() => {
    jest.resetAllMocks();
    userSession = new UserSession(mockUserClient, mockRedisClientSubscriber);
    getRedisClientFn.mockResolvedValue(nodeClient);
    nodeClient.subscribe.mockResolvedValue('OK');
    nodeClient.pSubscribe.mockResolvedValue('OK');
    nodeClient.quit = jest.fn().mockResolvedValue(undefined);
  });

  describe('subscribe', () => {
    it('should subscribe to a channel', async () => {
      expect(userSession['subscriptions'].size).toEqual(0);
      await userSession.subscribe(mockSubscription);
      expect(userSession['subscriptions'].size).toEqual(1);
      await userSession.subscribe(mockSubscription);
      expect(userSession['subscriptions'].size).toEqual(1);
      expect(
        userSession['subscriptions'].get(mockSubscription.getId()),
      ).toEqual(mockSubscription);
      await userSession.subscribe(mockPSubscription);
      expect(userSession['subscriptions'].size).toEqual(2);
      await userSession.subscribe(mockPSubscription);
      expect(userSession['subscriptions'].size).toEqual(2);
      expect(
        userSession['subscriptions'].get(mockPSubscription.getId()),
      ).toEqual(mockPSubscription);
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe from a channel', async () => {
      expect(userSession['subscriptions'].size).toEqual(0);
      await userSession.subscribe(mockSubscription);
      expect(userSession['subscriptions'].size).toEqual(1);
      await userSession.subscribe(mockPSubscription);
      expect(userSession['subscriptions'].size).toEqual(2);
      await userSession.unsubscribe(mockSubscription);
      expect(userSession['subscriptions'].size).toEqual(1);
      await userSession.unsubscribe(mockSubscription);
      expect(userSession['subscriptions'].size).toEqual(1);
      await userSession.unsubscribe(mockPSubscription);
      expect(userSession['subscriptions'].size).toEqual(0);
      await userSession.unsubscribe(mockPSubscription);
      expect(userSession['subscriptions'].size).toEqual(0);
    });
  });

  describe('handleMessage', () => {
    let handleSimpleSpy;
    let handlePatternSpy;

    beforeEach(async () => {
      handleSimpleSpy = jest.spyOn(mockSubscription, 'pushMessage');
      handlePatternSpy = jest.spyOn(mockPSubscription, 'pushMessage');
      await userSession.subscribe(mockSubscription);
      await userSession.subscribe(mockPSubscription);
    });
    it('should handle message by particular subscription', async () => {
      userSession.handleMessage('id', mockMessage);
      expect(handleSimpleSpy).toHaveBeenCalledTimes(0);
      expect(handlePatternSpy).toHaveBeenCalledTimes(0);
      userSession.handleMessage(mockSubscription.getId(), mockMessage);
      expect(handleSimpleSpy).toHaveBeenCalledTimes(1);
      expect(handlePatternSpy).toHaveBeenCalledTimes(0);
      userSession.handleMessage(mockPSubscription.getId(), mockMessage);
      userSession.handleMessage(mockPSubscription.getId(), mockMessage);
      expect(handleSimpleSpy).toHaveBeenCalledTimes(1);
      expect(handlePatternSpy).toHaveBeenCalledTimes(2);
      // wait until debounce process
      await new Promise((res) => setTimeout(res, 200));
    });
  });

  describe('handleDisconnect', () => {
    beforeEach(async () => {
      await userSession.subscribe(mockSubscription);
      await userSession.subscribe(mockPSubscription);
    });
    it('should handle message by particular subscription', async () => {
      userSession.handleDisconnect();
      expect(userSession['subscriptions'].size).toEqual(0);
      expect(nodeClient.quit).toHaveBeenCalled();
    });
  });
});
