xdescribe('dummy', () => {
  it('dummy', () => {});
});

// import { ServiceUnavailableException } from '@nestjs/common';
// import { Test, TestingModule } from '@nestjs/testing';
// import { v4 as uuidv4 } from 'uuid';
// import { mockClientMonitorObserver, mockMonitorObserver } from 'src/__mocks__/monitor';
// import ERROR_MESSAGES from 'src/constants/error-messages';
// import { RedisService } from 'src/modules/redis/redis.service';
// import { mockRedisClientInstance } from 'src/modules/redis/redis-consumer.abstract.service.spec';
// import { InstancesBusinessService } from 'src/modules/shared/services/instances-business/instances-business.service';
// import { ProfilerService } from './monitor.service';
// import { RedisMonitorClient } from './helpers/monitor-observer';
//
// jest.mock('./helpers/monitor-observer');
//
// describe('MonitorService', () => {
//   let service;
//   let redisService;
//   let instancesBusinessService;
//
//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         ProfilerService,
//         {
//           provide: RedisService,
//           useFactory: () => ({
//             getClientInstance: jest.fn(),
//             isClientConnected: jest.fn(),
//           }),
//         },
//         {
//           provide: InstancesBusinessService,
//           useFactory: () => ({
//             connectToInstance: jest.fn(),
//           }),
//         },
//       ],
//     }).compile();
//
//     service = module.get<ProfilerService>(ProfilerService);
//     redisService = await module.get<RedisService>(RedisService);
//     instancesBusinessService = await module.get<InstancesBusinessService>(InstancesBusinessService);
//   });
//
//   describe('addListenerForInstance', () => {
//     let getRedisClientForInstance;
//     beforeEach(() => {
//       getRedisClientForInstance = jest.spyOn(service, 'getRedisClientForInstance');
//       service.monitorObservers = {};
//     });
//
//     it('should use exist redis client and create new monitor observer', async () => {
//       const { instanceId } = mockRedisClientInstance;
//       redisService.getClientInstance.mockReturnValue(mockRedisClientInstance);
//       redisService.isClientConnected.mockReturnValue(true);
//
//       await service.addListenerForInstance(instanceId, mockClientMonitorObserver);
//
//       expect(getRedisClientForInstance).toHaveBeenCalledWith(instanceId);
//       expect(RedisMonitorClient).toHaveBeenCalled();
//       expect(service.monitorObservers[instanceId]).toBeDefined();
//     });
//     it('should use exist monitor observer for instance', async () => {
//       const { instanceId } = mockRedisClientInstance;
//       service.monitorObservers = { [instanceId]: { ...mockMonitorObserver, status: 'ready' } };
//
//       await service.addListenerForInstance(instanceId, mockClientMonitorObserver);
//       await service.addListenerForInstance(instanceId, mockClientMonitorObserver);
//
//       expect(getRedisClientForInstance).not.toHaveBeenCalled();
//       expect(Object.keys(service.monitorObservers).length).toEqual(1);
//     });
//     it('should recreate exist monitor observer', async () => {
//       const { instanceId } = mockRedisClientInstance;
//       service.monitorObservers = { [instanceId]: { ...mockMonitorObserver, status: 'end' } };
//       redisService.getClientInstance.mockReturnValue(mockRedisClientInstance);
//       redisService.isClientConnected.mockReturnValue(true);
//
//       await service.addListenerForInstance(instanceId, mockClientMonitorObserver);
//
//       expect(RedisMonitorClient).toHaveBeenCalled();
//       expect(getRedisClientForInstance).toHaveBeenCalled();
//       expect(Object.keys(service.monitorObservers).length).toEqual(1);
//     });
//     it('should recreate redis client', async () => {
//       const { instanceId } = mockRedisClientInstance;
//       redisService.getClientInstance.mockReturnValue(mockRedisClientInstance);
//       redisService.isClientConnected.mockReturnValue(false);
//       instancesBusinessService.connectToInstance.mockResolvedValue(mockRedisClientInstance);
//
//       await service.addListenerForInstance(instanceId, mockClientMonitorObserver);
//
//       expect(instancesBusinessService.connectToInstance).toHaveBeenCalled();
//     });
//     it('should throw timeout exception on create redis client', async () => {
//       const { instanceId } = mockRedisClientInstance;
//       redisService.getClientInstance.mockReturnValue(null);
//       instancesBusinessService.connectToInstance = jest.fn()
//         .mockReturnValue(new Promise(() => {}));
//
//       try {
//         await service.addListenerForInstance(instanceId, mockClientMonitorObserver);
//       } catch (error) {
//         expect(error).toEqual(new ServiceUnavailableException(ERROR_MESSAGES.NO_CONNECTION_TO_REDIS_DB));
//       }
//     });
//   });
//   describe('removeListenerFromInstance', () => {
//     beforeEach(() => {
//       service.monitorObservers = {};
//     });
//
//     it('should unsubscribe listeners from monitor observer', async () => {
//       const { instanceId } = mockRedisClientInstance;
//       const listenerId = uuidv4();
//       const monitorObserver = { ...mockMonitorObserver, status: 'ready', unsubscribe: jest.fn() };
//       service.monitorObservers = { [instanceId]: monitorObserver };
//
//       service.removeListenerFromInstance(instanceId, listenerId);
//
//       expect(monitorObserver.unsubscribe).toHaveBeenCalledWith(listenerId);
//     });
//     it('should be ignored if monitor observer does not exist for instance', () => {
//       const { instanceId } = mockRedisClientInstance;
//       const listenerId = uuidv4();
//       const monitorObserver = { ...mockMonitorObserver, status: 'ready', unsubscribe: jest.fn() };
//       service.monitorObservers = { [instanceId]: monitorObserver };
//
//       service.removeListenerFromInstance(uuidv4(), listenerId);
//
//       expect(monitorObserver.unsubscribe).not.toHaveBeenCalled();
//     });
//   });
//
//   describe('handleInstanceDeletedEvent', () => {
//     beforeEach(() => {
//       service.monitorObservers = {};
//     });
//
//     it('should clear exist monitor observer fro instance', () => {
//       const { instanceId } = mockRedisClientInstance;
//       const monitorObserver = { ...mockMonitorObserver, status: 'ready', clear: jest.fn() };
//       service.monitorObservers = { [instanceId]: monitorObserver };
//
//       service.handleInstanceDeletedEvent(instanceId);
//
//       expect(monitorObserver.clear).toHaveBeenCalled();
//       expect(service.monitorObservers[instanceId]).not.toBeDefined();
//     });
//     it('should be ignored if monitor observer does not exist for instance', () => {
//       const { instanceId } = mockRedisClientInstance;
//       const monitorObserver = { ...mockMonitorObserver, status: 'ready', clear: jest.fn() };
//       service.monitorObservers = { [instanceId]: monitorObserver };
//
//       service.handleInstanceDeletedEvent(uuidv4());
//
//       expect(monitorObserver.clear).not.toHaveBeenCalled();
//       expect(service.monitorObservers[instanceId]).toBeDefined();
//     });
//   });
// });
