import {
  mockLogFile,
  mockMonitorDataItem,
  mockProfilerClient,
  mockWriteStream,
} from 'src/__mocks__';
import { FileLogsEmitter } from 'src/modules/profiler/emitters/file.logs-emitter';

describe('FileLogsEmitter', () => {
  let emitter: FileLogsEmitter;

  beforeEach(() => {
    emitter = new FileLogsEmitter(mockLogFile);
  });

  it('initialization', () => {
    expect(emitter.id).toEqual(mockLogFile.id);
    expect(emitter['logFile']).toEqual(mockLogFile);
  });

  it('emit', async () => {
    const items = [mockMonitorDataItem, mockMonitorDataItem];

    emitter['logFile']['getWriteStream'] = jest.fn().mockReturnValue(undefined);
    await emitter.emit(items);
    expect(mockWriteStream.write).not.toHaveBeenCalled();

    emitter['logFile']['getWriteStream'] = jest
      .fn()
      .mockReturnValue(mockWriteStream);
    await emitter.emit(items);
    expect(emitter['logFile'].getWriteStream).toHaveBeenCalled();
    expect(mockWriteStream.write).toHaveBeenCalled();
  });

  it('emit', async () => {
    const items = [mockMonitorDataItem, mockMonitorDataItem];
    await emitter.emit(items);
    expect(emitter['logFile'].getWriteStream).toHaveBeenCalled();
    expect(mockWriteStream.write).toHaveBeenCalled();
  });

  it('addProfilerClient', () => {
    emitter.addProfilerClient(mockProfilerClient.id);
    expect(emitter['logFile'].addProfilerClient).toHaveBeenCalledWith(
      mockProfilerClient.id,
    );
  });

  it('removeProfilerClient', () => {
    emitter.removeProfilerClient(mockProfilerClient.id);
    expect(emitter['logFile'].removeProfilerClient).toHaveBeenCalledWith(
      mockProfilerClient.id,
    );
  });

  it('flushLogs', () => {
    emitter.flushLogs();
    expect(emitter['logFile'].destroy).toHaveBeenCalled();
  });
});
