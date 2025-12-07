import { ProfilerClient } from 'src/modules/profiler/models/profiler.client';
import {
  mockLogEmitter,
  mockMonitorDataItem,
  mockMonitorDataItemEmitted,
  mockSocket,
} from 'src/__mocks__';
import { ProfilerServerEvents } from 'src/modules/profiler/constants';
import { WsException } from '@nestjs/websockets';
import ERROR_MESSAGES from 'src/constants/error-messages';

describe('ProfilerClient', () => {
  let profilerClient: ProfilerClient;

  beforeEach(() => {
    profilerClient = new ProfilerClient(mockSocket.id, mockSocket);
  });

  it('initialization', () => {
    expect(profilerClient.id).toEqual(mockSocket.id);
    expect(profilerClient['client']).toEqual(mockSocket);
    expect(profilerClient['items']).toEqual([]);
    expect(profilerClient['logsEmitters']).toEqual(new Map());
    expect(profilerClient['debounce']).toBeInstanceOf(Function);
  });

  it('handleOnData', async () => {
    profilerClient.addLogsEmitter(mockLogEmitter);
    profilerClient.handleOnData(mockMonitorDataItem);
    profilerClient.handleOnData(mockMonitorDataItem);
    expect(profilerClient['items'].length).toEqual(2);
    expect(mockLogEmitter.emit).not.toHaveBeenCalled();
    await new Promise((res) => setTimeout(res, 100));
    expect(mockLogEmitter.emit).toHaveBeenCalledWith([
      mockMonitorDataItemEmitted,
      mockMonitorDataItemEmitted,
    ]);
    expect(profilerClient['items'].length).toEqual(0);
  });

  it('handleOnDisconnect', () => {
    profilerClient.handleOnDisconnect();
    expect(mockSocket.emit).toHaveBeenCalledWith(
      ProfilerServerEvents.Exception,
      new WsException(ERROR_MESSAGES.NO_CONNECTION_TO_REDIS_DB),
    );
  });

  it('addLogsEmitter', () => {
    profilerClient.addLogsEmitter(mockLogEmitter);
    expect(mockLogEmitter.addProfilerClient).toHaveBeenCalledWith(
      profilerClient.id,
    );
    expect(profilerClient['logsEmitters'].size).toEqual(1);
    profilerClient.addLogsEmitter(mockLogEmitter);
    expect(mockLogEmitter.addProfilerClient).toHaveBeenCalledWith(
      profilerClient.id,
    );
    expect(profilerClient['logsEmitters'].size).toEqual(1);
  });

  it('flushLogs + destroy', () => {
    profilerClient.addLogsEmitter(mockLogEmitter);
    profilerClient.flushLogs();
    expect(mockLogEmitter.flushLogs).toHaveBeenCalled();
    profilerClient.destroy();
    expect(mockLogEmitter.removeProfilerClient).toHaveBeenCalledWith(
      profilerClient.id,
    );
  });
});
