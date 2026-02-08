import { RedisClientSubscriber } from 'src/modules/pub-sub/model/redis-client-subscriber';
import {
  RedisClientSubscriberEvents,
  RedisClientSubscriberStatus,
} from 'src/modules/pub-sub/constants';
import { RedisClient } from 'src/modules/redis/client';

const getRedisClientFn = jest.fn();

const nodeClient = Object.create(RedisClient.prototype);
nodeClient.subscribe = jest.fn();
nodeClient.pSubscribe = jest.fn();
nodeClient.unsubscribe = jest.fn();
nodeClient.pUnsubscribe = jest.fn();
nodeClient.disconnect = jest.fn();

describe('RedisClient', () => {
  let redisClientSubscriber: RedisClientSubscriber;

  beforeEach(() => {
    jest.resetAllMocks();
    redisClientSubscriber = new RedisClientSubscriber(
      'databaseId',
      getRedisClientFn,
    );
    getRedisClientFn.mockResolvedValue(nodeClient);
    nodeClient.subscribe.mockResolvedValue('OK');
    nodeClient.pSubscribe.mockResolvedValue('OK');
    nodeClient.quit = jest.fn().mockResolvedValue(undefined);
  });

  describe('getClient', () => {
    let connectSpy;

    beforeEach(() => {
      connectSpy = jest.spyOn(redisClientSubscriber as any, 'connect');
    });

    it('should connect and return client by default', async () => {
      expect(await redisClientSubscriber.getClient()).toEqual(nodeClient);
      expect(connectSpy).toHaveBeenCalledTimes(1);
      expect(redisClientSubscriber['status']).toEqual(
        RedisClientSubscriberStatus.Connected,
      );
    });
    it('should wait until first attempt of connection finish with success', async () => {
      redisClientSubscriber.getClient().then().catch();
      expect(redisClientSubscriber['status']).toEqual(
        RedisClientSubscriberStatus.Connecting,
      );
      expect(await redisClientSubscriber.getClient()).toEqual(nodeClient);
      expect(connectSpy).toHaveBeenCalledTimes(1);
      expect(redisClientSubscriber['status']).toEqual(
        RedisClientSubscriberStatus.Connected,
      );
    });
    it('should wait until first attempt of connection finish with error', async () => {
      try {
        getRedisClientFn.mockRejectedValueOnce(new Error('Connection error'));
        redisClientSubscriber
          .getClient()
          .then()
          .catch(() => {});
        expect(redisClientSubscriber['status']).toEqual(
          RedisClientSubscriberStatus.Connecting,
        );
        expect(await redisClientSubscriber.getClient()).toEqual(nodeClient);
        fail();
      } catch {
        expect(connectSpy).toHaveBeenCalledTimes(1);
        expect(redisClientSubscriber['status']).toEqual(
          RedisClientSubscriberStatus.Error,
        );
      }
    });
    it('should return existing connection when status connected', async () => {
      expect(await redisClientSubscriber.getClient()).toEqual(nodeClient);
      expect(connectSpy).toHaveBeenCalledTimes(1);
      expect(redisClientSubscriber['status']).toEqual(
        RedisClientSubscriberStatus.Connected,
      );
      expect(await redisClientSubscriber.getClient()).toEqual(nodeClient);
      expect(connectSpy).toHaveBeenCalledTimes(1);
    });
    it('should return create new connection when status end or error', async () => {
      expect(await redisClientSubscriber.getClient()).toEqual(nodeClient);
      expect(connectSpy).toHaveBeenCalledTimes(1);
      expect(redisClientSubscriber['status']).toEqual(
        RedisClientSubscriberStatus.Connected,
      );
      redisClientSubscriber['status'] = RedisClientSubscriberStatus.Error;
      expect(await redisClientSubscriber.getClient()).toEqual(nodeClient);
      expect(connectSpy).toHaveBeenCalledTimes(2);
      expect(redisClientSubscriber['status']).toEqual(
        RedisClientSubscriberStatus.Connected,
      );
      redisClientSubscriber['status'] = RedisClientSubscriberStatus.End;
      expect(await redisClientSubscriber.getClient()).toEqual(nodeClient);
      expect(connectSpy).toHaveBeenCalledTimes(3);
      expect(redisClientSubscriber['status']).toEqual(
        RedisClientSubscriberStatus.Connected,
      );
    });
  });

  describe('connect', () => {
    it('should connect and emit connected event', async () => {
      expect(
        await new Promise((res) => {
          redisClientSubscriber['connect']();
          redisClientSubscriber.on(RedisClientSubscriberEvents.Connected, res);
        }),
      ).toEqual(nodeClient);
    });
    it('should emit message event (message source)', async () => {
      await redisClientSubscriber['connect']();
      const [id, message] = await new Promise((res: (value: any[]) => void) => {
        redisClientSubscriber.on('message', (i, m) => res([i, m]));
        nodeClient.emit('message', 'channel-a', 'message-a');
      });

      expect(id).toEqual('s:channel-a');
      expect(message.channel).toEqual('channel-a');
      expect(message.message).toEqual('message-a');
    });
    it('should emit message event (pmessage source)', async () => {
      await redisClientSubscriber['connect']();
      const [id, message] = await new Promise((res: (value: any[]) => void) => {
        redisClientSubscriber.on('message', (i, m) => res([i, m]));
        nodeClient.emit('pmessage', '*', 'channel-aa', 'message-aa');
      });
      expect(id).toEqual('p:*');
      expect(message.channel).toEqual('channel-aa');
      expect(message.message).toEqual('message-aa');
    });
    it('should emit end event', async () => {
      await redisClientSubscriber['connect']();
      await new Promise((res) => {
        redisClientSubscriber.on('end', () => {
          res(null);
        });

        nodeClient.emit('end');
      });

      expect(redisClientSubscriber['status']).toEqual(
        RedisClientSubscriberStatus.End,
      );
    });

    afterAll(() => {
      nodeClient.removeAllListeners();
    });
  });

  describe('destroy', () => {
    it('should remove all listeners, disconnect, set client to null and emit end event', async () => {
      const removeAllListenersSpy = jest.spyOn(
        nodeClient,
        'removeAllListeners',
      );

      await redisClientSubscriber['connect']();
      redisClientSubscriber.destroy();

      expect(redisClientSubscriber['client']).toEqual(null);
      expect(redisClientSubscriber['status']).toEqual(
        RedisClientSubscriberStatus.End,
      );
      expect(removeAllListenersSpy).toHaveBeenCalled();
      expect(nodeClient.quit).toHaveBeenCalled();
    });
    it('should not crash if quick promise was rejected', async () => {
      nodeClient.quit = jest
        .fn()
        .mockRejectedValueOnce(new Error('Connection is closed'));

      const removeAllListenersSpy = jest.spyOn(
        nodeClient,
        'removeAllListeners',
      );

      await redisClientSubscriber['connect']();
      redisClientSubscriber.destroy();

      expect(redisClientSubscriber['client']).toEqual(null);
      expect(redisClientSubscriber['status']).toEqual(
        RedisClientSubscriberStatus.End,
      );
      expect(removeAllListenersSpy).toHaveBeenCalled();
      expect(nodeClient.quit).toHaveBeenCalled();
    });
  });
});
