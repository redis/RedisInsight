import axios from 'axios';
import * as fs from 'fs-extra';
import { Test, TestingModule } from '@nestjs/testing';
import { mockMainCommands, mockRedijsonCommands } from 'src/__mocks__';
import { CommandsJsonProvider } from 'src/modules/commands/commands-json.provider';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('fs-extra');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('CommandsJsonProvider', () => {
  let service: CommandsJsonProvider;

  beforeEach(async () => {
    jest.mock('fs-extra', () => mockedFs);

    mockedAxios.get.mockResolvedValue({
      data: JSON.stringify(mockMainCommands),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: 'service',
          useFactory: () => new CommandsJsonProvider('name', 'someurl'),
        },
      ],
    }).compile();

    service = module.get('service');
  });

  describe('updateLatestJson', () => {
    it('should not fail when incorrect data retrieved', async () => {
      mockedAxios.get.mockResolvedValueOnce('json');
      await service.updateLatestJson();

      expect(mockedFs.writeFile).not.toHaveBeenCalled();
    });
  });

  describe('getCommands', () => {
    it('should return default config when file was not found', async () => {
      mockedFs.readFile.mockRejectedValueOnce(new Error('No file'));
      mockedFs.readFile.mockResolvedValueOnce(
        Buffer.from(JSON.stringify(mockMainCommands)),
      );

      expect(await service.getCommands()).toEqual({ name: mockMainCommands });
    });
    it('should return default config when incorrect json received from file', async () => {
      mockedFs.readFile.mockResolvedValueOnce(Buffer.from('incorrect json'));
      mockedFs.readFile.mockResolvedValueOnce(
        Buffer.from(JSON.stringify(mockMainCommands)),
      );

      expect(await service.getCommands()).toEqual({ name: mockMainCommands });
    });
    it('should return latest commands', async () => {
      mockedFs.readFile.mockResolvedValue(
        Buffer.from(JSON.stringify(mockRedijsonCommands)),
      );

      expect(await service.getCommands()).toEqual({
        name: mockRedijsonCommands,
      });
    });
  });

  describe('getDefaultCommands', () => {
    it('should return empty object when file was not found', async () => {
      mockedFs.readFile.mockRejectedValue(new Error('No file'));

      expect(await service.getDefaultCommands()).toEqual({});
    });
    it('should return empty object when incorrect json received from file', async () => {
      mockedFs.readFile.mockResolvedValue(Buffer.from('incorrect json'));

      expect(await service.getDefaultCommands()).toEqual({});
    });
    it('should return default commands', async () => {
      mockedFs.readFile.mockResolvedValue(
        Buffer.from(JSON.stringify(mockRedijsonCommands)),
      );

      expect(await service.getDefaultCommands()).toEqual({
        name: mockRedijsonCommands,
      });
    });
  });
});
