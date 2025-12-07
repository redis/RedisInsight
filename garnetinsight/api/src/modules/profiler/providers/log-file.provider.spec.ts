import { Test, TestingModule } from '@nestjs/testing';
import { LogFileProvider } from 'src/modules/profiler/providers/log-file.provider';
import {
  mockLogFile,
  mockProfilerAnalyticsEvents,
  mockProfilerAnalyticsService,
  mockDatabase,
} from 'src/__mocks__';
import { ProfilerAnalyticsService } from 'src/modules/profiler/profiler-analytics.service';
import { NotFoundException } from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { ReadStream } from 'fs';

describe('LogFileProvider', () => {
  let service: LogFileProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogFileProvider,
        {
          provide: ProfilerAnalyticsService,
          useFactory: () => mockProfilerAnalyticsService,
        },
      ],
    }).compile();

    service = await module.get(LogFileProvider);
  });

  it('getOrCreate', async () => {
    const logFile1 = await service.getOrCreate(
      mockLogFile.instanceId,
      mockLogFile.id,
    );
    expect(service['profilerLogFiles'].size).toEqual(1);
    expect(logFile1['analyticsEvents']).toEqual(mockProfilerAnalyticsEvents);

    const logFile2 = await service.getOrCreate(
      mockDatabase.id,
      mockDatabase.id,
    );
    expect(service['profilerLogFiles'].size).toEqual(2);

    const logFile22 = await service.getOrCreate(
      mockDatabase.id,
      mockDatabase.id,
    );
    expect(service['profilerLogFiles'].size).toEqual(2);
    expect(logFile2).toEqual(logFile22);
  });

  it('get', async () => {
    const logFile1 = await service.getOrCreate(
      mockLogFile.instanceId,
      mockLogFile.id,
    );
    expect(service['profilerLogFiles'].size).toEqual(1);

    const logFile2 = await service.get(mockLogFile.id);
    expect(logFile2).toEqual(logFile1);
  });

  it('should throw 404 error', async () => {
    try {
      await service.get('notExisting');
      fail();
    } catch (e) {
      expect(e).toBeInstanceOf(NotFoundException);
      expect(e.message).toEqual(ERROR_MESSAGES.PROFILER_LOG_FILE_NOT_FOUND);
    }
  });

  it('getDownloadData', async () => {
    const logFile1 = await service.getOrCreate(
      mockLogFile.instanceId,
      mockLogFile.id,
    );
    const { stream, filename } = await service.getDownloadData(logFile1.id);
    expect(stream).toBeInstanceOf(ReadStream);
    expect(filename).toMatch(
      `${logFile1['alias']}-${logFile1['startTime'].getTime()}-`,
    );
  });

  it('onModuleDestroy', async () => {
    service['profilerLogFiles'].set(mockLogFile.id, mockLogFile);

    expect(mockLogFile.destroy).not.toHaveBeenCalled();

    service.onModuleDestroy();
    expect(mockLogFile.destroy).toHaveBeenCalled();
  });
});
