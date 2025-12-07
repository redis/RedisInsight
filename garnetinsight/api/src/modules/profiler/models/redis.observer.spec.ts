import { RedisObserver } from 'src/modules/profiler/models/redis.observer';
import { RedisObserverStatus } from 'src/modules/profiler/constants';
import {
  mockClusterRedisClient,
  mockMonitorDataItemEmitted,
  mockProfilerClient,
  mockRedisNoPermError,
  mockRedisShardObserver,
  mockSocket,
  mockStandaloneRedisClient,
} from 'src/__mocks__';
import { ProfilerClient } from 'src/modules/profiler/models/profiler.client';
import { ReplyError } from 'src/models';
import {
  ForbiddenException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { IShardObserver } from 'src/modules/profiler/interfaces/shard-observer.interface';

const getRedisClientFn = jest.fn();

const NO_PERM_ERROR: ReplyError = {
  ...mockRedisNoPermError,
  command: 'MONITOR',
};

describe('RedisObserver', () => {
  const standaloneClient = mockStandaloneRedisClient;
  const clusterClient = mockClusterRedisClient;
  let redisObserver: RedisObserver;

  const mockClusterNode1 = standaloneClient;
  const mockClusterNode2 = standaloneClient;
  Object.assign(mockClusterNode1.options, {
    ...standaloneClient.options,
    host: 'localhost',
    port: 5000,
  });
  Object.assign(mockClusterNode2.options, {
    ...standaloneClient.options,
    host: 'localhost',
    port: 5001,
  });

  beforeEach(() => {
    jest.resetAllMocks();
    redisObserver = new RedisObserver();
    getRedisClientFn.mockResolvedValue(standaloneClient);
  });

  it('initialization', () => {
    expect(redisObserver['status']).toEqual(RedisObserverStatus.Empty);
  });

  describe('init', () => {
    it('successfully init', async () => {
      await new Promise((resolve) => {
        redisObserver['connect'] = jest.fn();
        redisObserver.init(getRedisClientFn);
        expect(redisObserver['status']).toEqual(
          RedisObserverStatus.Initializing,
        );
        redisObserver.on('connect', () => {
          resolve(true);
        });
      });
      expect(redisObserver['status']).toEqual(RedisObserverStatus.Connected);
      expect(redisObserver['redis']).toEqual(standaloneClient);
    });
    it('init error due to redis connection', (done) => {
      getRedisClientFn.mockRejectedValueOnce(new Error('error'));
      redisObserver.init(getRedisClientFn);
      redisObserver.on('connect_error', () => {
        expect(redisObserver['status']).toEqual(RedisObserverStatus.Error);
        expect(redisObserver['redis']).toEqual(undefined);
        done();
      });
    });
  });

  describe('subscribe', () => {
    beforeEach(() => {
      redisObserver['connect'] = jest.fn();
      redisObserver['shardsObservers'] = [
        standaloneClient as unknown as IShardObserver,
      ];
    });

    it('should subscribe to a standalone', async () => {
      standaloneClient.call.mockResolvedValue('OK');

      await redisObserver.init(getRedisClientFn);
      await redisObserver.subscribe(mockProfilerClient);
      redisObserver['status'] = RedisObserverStatus.Ready;
      await redisObserver.subscribe(mockProfilerClient);

      expect(redisObserver['shardsObservers'].length).toEqual(1);
      expect(redisObserver['profilerClientsListeners'].size).toEqual(1);
      expect(
        redisObserver['profilerClientsListeners'].get(mockProfilerClient.id)
          .length,
      ).toEqual(2);

      standaloneClient.emit(
        'monitor',
        ...Object.values(mockMonitorDataItemEmitted),
      );
      expect(mockProfilerClient['handleOnData']).toHaveBeenCalledWith({
        ...mockMonitorDataItemEmitted,
        shardOptions: standaloneClient.options,
      });
      expect(mockProfilerClient['handleOnData']).toHaveBeenCalledTimes(1);

      standaloneClient.emit('end');
      expect(mockProfilerClient['handleOnDisconnect']).toHaveBeenCalledTimes(1);
    });

    it('should subscribe to a cluster', async () => {
      redisObserver['shardsObservers'] = [
        mockClusterNode1 as unknown as IShardObserver,
        mockClusterNode2 as unknown as IShardObserver,
      ];
      getRedisClientFn.mockResolvedValueOnce(clusterClient);
      await redisObserver.init(getRedisClientFn);
      await redisObserver.subscribe(mockProfilerClient);
      redisObserver['status'] = RedisObserverStatus.Ready;
      await redisObserver.subscribe(mockProfilerClient);
      expect(redisObserver['connect']).toHaveBeenCalledTimes(2);
      expect(redisObserver['shardsObservers'].length).toEqual(2);
      expect(redisObserver['profilerClientsListeners'].size).toEqual(1);
      expect(
        redisObserver['profilerClientsListeners'].get(mockProfilerClient.id)
          .length,
      ).toEqual(4);

      standaloneClient.emit(
        'monitor',
        ...Object.values(mockMonitorDataItemEmitted),
      );
      expect(mockProfilerClient['handleOnData']).toHaveBeenCalledWith({
        ...mockMonitorDataItemEmitted,
        shardOptions: { ...mockClusterNode1.options },
      });
      expect(mockProfilerClient['handleOnData']).toHaveBeenCalledWith({
        ...mockMonitorDataItemEmitted,
        shardOptions: { ...mockClusterNode2.options },
      });
      expect(mockProfilerClient['handleOnData']).toHaveBeenCalledTimes(2);

      standaloneClient.emit('end');
      expect(mockProfilerClient['handleOnDisconnect']).toHaveBeenCalledTimes(2);
    });
  });

  describe('unsubscribe', () => {
    let clearSpy;
    let profilerClient1;
    let profilerClient2;
    let destroySpy1;
    let destroySpy2;

    beforeEach(async () => {
      clearSpy = jest.spyOn(redisObserver, 'clear');
      redisObserver['connect'] = jest.fn();
      redisObserver['shardsObservers'] = [mockRedisShardObserver];
      profilerClient1 = new ProfilerClient('1', mockSocket);
      profilerClient2 = new ProfilerClient('2', mockSocket);
      destroySpy1 = jest.spyOn(profilerClient1, 'destroy');
      destroySpy2 = jest.spyOn(profilerClient2, 'destroy');

      await redisObserver.init(getRedisClientFn);
      await redisObserver.subscribe(profilerClient1);
      await redisObserver.subscribe(profilerClient2);
    });

    it('unsubscribe', async () => {
      expect(redisObserver['profilerClients'].size).toEqual(2);
      expect(redisObserver['profilerClientsListeners'].size).toEqual(2);
      redisObserver.unsubscribe('1');
      expect(mockRedisShardObserver.removeListener).toHaveBeenCalledTimes(4);
      expect(redisObserver['profilerClients'].size).toEqual(1);
      expect(redisObserver['profilerClientsListeners'].size).toEqual(1);
      expect(clearSpy).not.toHaveBeenCalled();

      redisObserver.unsubscribe('2');
      expect(mockRedisShardObserver.removeListener).toHaveBeenCalledTimes(8);
      expect(redisObserver['profilerClients'].size).toEqual(0);
      expect(redisObserver['profilerClientsListeners'].size).toEqual(0);
      expect(clearSpy).toHaveBeenCalled();

      expect(destroySpy1).not.toHaveBeenCalled();
      expect(destroySpy2).not.toHaveBeenCalled();
    });

    it('disconnect', async () => {
      expect(redisObserver['profilerClients'].size).toEqual(2);
      expect(redisObserver['profilerClientsListeners'].size).toEqual(2);
      redisObserver.disconnect('1');
      expect(mockRedisShardObserver.removeListener).toHaveBeenCalledTimes(4);
      expect(redisObserver['profilerClients'].size).toEqual(1);
      expect(redisObserver['profilerClientsListeners'].size).toEqual(1);
      expect(clearSpy).not.toHaveBeenCalled();

      redisObserver.disconnect('2');
      expect(mockRedisShardObserver.removeListener).toHaveBeenCalledTimes(8);
      expect(redisObserver['profilerClients'].size).toEqual(0);
      expect(redisObserver['profilerClientsListeners'].size).toEqual(0);
      expect(clearSpy).toHaveBeenCalled();

      expect(destroySpy1).toHaveBeenCalled();
      expect(destroySpy2).toHaveBeenCalled();
    });
  });

  describe('connect', () => {
    beforeEach(async () => {
      standaloneClient.call.mockResolvedValue('OK');
      standaloneClient.monitor.mockReturnValue(mockRedisShardObserver);
      standaloneClient.nodes = jest.fn().mockReturnValue([standaloneClient]);
    });

    it('connect to standalone', async () => {
      await redisObserver.init(getRedisClientFn);
      const profilerClient = new ProfilerClient('1', mockSocket);
      await redisObserver.subscribe(profilerClient);
      expect(redisObserver['shardsObservers']).toEqual([
        mockRedisShardObserver,
      ]);
      expect(redisObserver['status']).toEqual(RedisObserverStatus.Ready);
    });

    it('connect fail due to NOPERM', (done) => {
      standaloneClient.monitor.mockRejectedValueOnce(NO_PERM_ERROR);
      redisObserver.init(getRedisClientFn);
      redisObserver.on('connect_error', (e) => {
        expect(redisObserver['shardsObservers']).toEqual([]);
        expect(redisObserver['status']).toEqual(RedisObserverStatus.Error);
        expect(e).toBeInstanceOf(ForbiddenException);
        done();
      });
    });

    it('connect fail due an error', (done) => {
      standaloneClient.monitor.mockRejectedValueOnce(new Error('some error'));
      redisObserver.init(getRedisClientFn);
      redisObserver.on('connect_error', (e) => {
        expect(e).toBeInstanceOf(ServiceUnavailableException);
        expect(redisObserver['shardsObservers']).toEqual([]);
        expect(redisObserver['status']).toEqual(RedisObserverStatus.Error);
        done();
      });
    });

    it('connect to cluster', async () => {
      getRedisClientFn.mockResolvedValue(clusterClient);
      clusterClient.nodes = jest
        .fn()
        .mockReturnValue([mockClusterNode1, mockClusterNode2]);
      await redisObserver.init(getRedisClientFn);

      redisObserver['redis'] = clusterClient;
      expect(redisObserver['shardsObservers']).toEqual([
        mockRedisShardObserver,
        mockRedisShardObserver,
      ]);
      expect(redisObserver['status']).toEqual(RedisObserverStatus.Ready);
    });
  });
});
