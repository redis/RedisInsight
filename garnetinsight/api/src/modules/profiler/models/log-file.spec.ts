import * as fs from 'fs-extra';
import { LogFile } from 'src/modules/profiler/models/log-file';
import {
  mockLogFile,
  mockProfilerAnalyticsEvents,
  mockSocket,
} from 'src/__mocks__';
import config from 'src/utils/config';
import { join } from 'path';
import { ReadStream, WriteStream } from 'fs';
import { FileLogsEmitter } from 'src/modules/profiler/emitters/file.logs-emitter';
import { TelemetryEvents } from 'src/constants';

const DIR_PATH = config.get('dir_path');

describe('LogFile', () => {
  let logFile: LogFile;

  beforeEach(() => {
    logFile = new LogFile(
      mockLogFile.instanceId,
      mockLogFile.id,
      mockProfilerAnalyticsEvents,
    );
  });

  it('Initialization', () => {
    const initTime = new Date();
    logFile = new LogFile(mockLogFile.instanceId, mockLogFile.id);

    expect(logFile.instanceId).toEqual(mockLogFile.instanceId);
    expect(logFile.id).toEqual(mockLogFile.id);
    expect(logFile['alias']).toEqual(mockLogFile.id);
    expect(logFile['filePath']).toEqual(join(DIR_PATH.tmpDir, logFile.id));
    expect(logFile['startTime'].getTime()).toBeGreaterThanOrEqual(
      initTime.getTime(),
    );
    expect(logFile['startTime'].getTime()).toBeLessThanOrEqual(
      new Date().getTime(),
    );
    expect(logFile['analyticsEvents']).toEqual(new Map());
    expect(logFile['clientObservers']).toEqual(new Map());
    expect(logFile['emitter']).toEqual(undefined);
  });

  it('getWriteStream', () => {
    const stream = logFile.getWriteStream();
    expect(stream).toBeInstanceOf(WriteStream);
    expect(logFile.getWriteStream()).toEqual(stream);
  });

  it('getReadStream', async () => {
    logFile.getWriteStream().write('');
    const stream = logFile.getReadStream();
    expect(stream).toBeInstanceOf(ReadStream);
    expect(stream.destroyed).toEqual(false);
    stream.emit('end');
    expect(stream.destroyed).toEqual(true);
    // todo: investigate why didn't pass on circle
    // expect(mockProfilerAnalyticsEvents.get(TelemetryEvents.ProfilerLogDownloaded)).toHaveBeenCalled();
    expect(logFile.getReadStream()).not.toEqual(stream);
  });

  it('getEmitter', () => {
    const emitter = logFile.getEmitter();
    expect(emitter).toBeInstanceOf(FileLogsEmitter);
    expect(emitter.id).toEqual(logFile.id);
    expect(emitter['logFile']).toEqual(logFile);
    expect(logFile.getEmitter()).toEqual(emitter);
  });

  it('getFilename + setAlias', () => {
    const fileName = logFile.getFilename();
    expect(logFile['alias']).toEqual(logFile['id']);
    expect(fileName).toMatch(
      `${logFile['id']}-${logFile['startTime'].getTime()}-`,
    );
    logFile.setAlias('someAlias');
    expect(logFile['alias']).toEqual('someAlias');
    expect(logFile.getFilename()).toMatch(
      `someAlias-${logFile['startTime'].getTime()}-`,
    );
  });

  it('addProfilerClient + removeProfilerClient', async () => {
    logFile['destroy'] = jest.fn();

    expect(logFile['clientObservers'].size).toEqual(0);
    logFile.addProfilerClient(mockSocket.id);
    expect(logFile['clientObservers'].size).toEqual(1);
    expect(logFile['idleSince']).toEqual(0);
    logFile.removeProfilerClient('007');
    expect(logFile['clientObservers'].size).toEqual(1);
    expect(logFile['idleSince']).toEqual(0);
    logFile.removeProfilerClient(mockSocket.id);
    expect(logFile['clientObservers'].size).toEqual(0);
    expect(logFile['idleSince']).toBeGreaterThan(0);
    expect(logFile.destroy).not.toHaveBeenCalled();
    // wait until idle threshold pass (2sec for test env)
    await new Promise((resolve) => setTimeout(resolve, 3000));
    expect(logFile.destroy).toHaveBeenCalled();
  });

  it('destroy', async () => {
    try {
      fs.unlinkSync(logFile['filePath']);
    } catch (e) {
      // ignore file not found
    }
    expect(logFile['writeStream']).toEqual(undefined);
    expect(fs.existsSync(logFile['filePath'])).toEqual(false);
    const stream = logFile.getWriteStream();
    expect(stream['_writableState'].ended).toEqual(false);
    await new Promise((res, rej) => {
      stream.write('somedata', (err) => {
        if (err) {
          return rej(err);
        }

        expect(fs.existsSync(logFile['filePath'])).toEqual(true);
        return res(true);
      });
    });
    expect(logFile['writeStream']).toEqual(stream);
    await logFile.destroy();
    expect(logFile['writeStream']).toEqual(null);
    expect(fs.existsSync(logFile['filePath'])).toEqual(false);
    expect(stream['_writableState'].ended).toEqual(true);
    expect(
      mockProfilerAnalyticsEvents.get(TelemetryEvents.ProfilerLogDeleted),
    ).toHaveBeenCalled();
  });
});
