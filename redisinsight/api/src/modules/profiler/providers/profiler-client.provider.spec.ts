import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LogFileProvider } from 'src/modules/profiler/providers/log-file.provider';
import {
  mockDatabase,
  mockLogFile,
  mockLogFileProvider,
  mockMonitorSettings,
  mockSessionMetadata,
  mockSocket,
  MockType,
} from 'src/__mocks__';
import { ProfilerClientProvider } from 'src/modules/profiler/providers/profiler-client.provider';

describe('ProfilerClientProvider', () => {
  let service: ProfilerClientProvider;
  let logFileProvider: MockType<LogFileProvider>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilerClientProvider,
        {
          provide: LogFileProvider,
          useFactory: () => mockLogFileProvider,
        },
      ],
    }).compile();

    service = await module.get(ProfilerClientProvider);
    logFileProvider = await module.get(LogFileProvider);

    logFileProvider.getOrCreate.mockReturnValue(mockLogFile);
  });

  it('getOrCreateClient', async () => {
    await service.getOrCreateClient(
      mockSessionMetadata,
      mockLogFile.instanceId,
      mockSocket,
      null,
      mockDatabase,
    );

    expect(service['profilerClients'].size).toEqual(1);
    expect(logFileProvider.getOrCreate).not.toHaveBeenCalled();

    await service.getOrCreateClient(
      mockSessionMetadata,
      mockLogFile.instanceId,
      { ...mockSocket, id: '2' },
      mockMonitorSettings,
      mockDatabase,
    );

    expect(service['profilerClients'].size).toEqual(2);
    expect(logFileProvider.getOrCreate).toHaveBeenCalled();
  });

  it('should refuse an unsafe log file id before registering the client', async () => {
    logFileProvider.getOrCreate.mockClear();

    await expect(
      service.getOrCreateClient(
        mockSessionMetadata,
        mockLogFile.instanceId,
        { ...mockSocket, id: '3' },
        { logFileId: '../../../../tmp/outside' },
        mockDatabase,
      ),
    ).rejects.toThrow(BadRequestException);

    expect(service['profilerClients'].size).toEqual(0);
    expect(logFileProvider.getOrCreate).not.toHaveBeenCalled();
  });

  it('getClient', async () => {
    const profilerClient = await service.getOrCreateClient(
      mockSessionMetadata,
      mockLogFile.instanceId,
      mockSocket,
      null,
      mockDatabase,
    );

    expect(await service.getClient(profilerClient.id)).toEqual(profilerClient);
  });
});
