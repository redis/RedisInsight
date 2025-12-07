import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CommandType } from 'src/constants';
import { CommandTelemetryBaseService } from 'src/modules/analytics/command.telemetry.base.service';
import { CommandsService } from 'src/modules/commands/commands.service';
import { MockType } from 'src/__mocks__';

class Service extends CommandTelemetryBaseService {
  constructor(
    protected eventEmitter: EventEmitter2,
    protected readonly commandsService: CommandsService,
  ) {
    super(eventEmitter, commandsService);
  }
}

const mockCommandsService = {
  getCommandsGroups: jest.fn(),
};

describe('CommandTelemetryBaseService', () => {
  let service;
  let eventEmitter: EventEmitter2;
  let commandsService: MockType<CommandsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: EventEmitter2,
          useFactory: () => ({
            emit: jest.fn(),
          }),
        },
        {
          provide: CommandsService,
          useFactory: () => mockCommandsService,
        },
      ],
    }).compile();

    eventEmitter = await module.get<EventEmitter2>(EventEmitter2);
    commandsService = await module.get(CommandsService);
    service = new Service(
      eventEmitter,
      commandsService as unknown as CommandsService,
    );
    commandsService.getCommandsGroups.mockResolvedValue({
      main: {
        SET: {
          summary: 'Set the string value of a key',
          since: '1.0.0',
          group: 'string',
          complexity: 'O(1)',
          acl_categories: ['@write', '@string', '@slow'],
        },
      },
      redisbloom: {
        'BF.RESERVE': {
          summary: 'Creates a new Bloom Filter',
          complexity: 'O(1)',
          since: '1.0.0',
          group: 'bf',
        },
      },
      custommodule: {
        'CUSTOM.COMMAND': {
          summary: 'Creates a new Bloom Filter',
          complexity: 'O(1)',
          since: '1.0.0',
        },
      },
    });
  });

  describe('getCommandAdditionalInfo', () => {
    it('should get command additional info (core module)', async () => {
      expect(await service.getCommandAdditionalInfo('set')).toEqual({
        commandType: CommandType.Core,
        moduleName: 'n/a',
        capability: 'string',
      });
    });
    it('should get command additional info (known module)', async () => {
      expect(await service.getCommandAdditionalInfo('BF.RESErve')).toEqual({
        commandType: CommandType.Module,
        moduleName: 'redisbloom',
        capability: 'bf',
      });
    });
    it('should get command additional info (known module w\\o cap.)', async () => {
      expect(await service.getCommandAdditionalInfo('CUSTOM.COMMAND')).toEqual({
        commandType: CommandType.Module,
        moduleName: 'custommodule',
        capability: 'n/a',
      });
    });
    it('should get command additional info (custom module)', async () => {
      expect(await service.getCommandAdditionalInfo('some.cmd')).toEqual({
        commandType: CommandType.Module,
        moduleName: 'custom',
        capability: 'n/a',
      });
    });
    it('should return empty object if no command provided', async () => {
      expect(await service.getCommandAdditionalInfo('')).toEqual({});
    });
    it('should return empty object in case of an error', async () => {
      commandsService.getCommandsGroups.mockRejectedValueOnce(new Error());
      expect(await service.getCommandAdditionalInfo('set')).toEqual({});
    });
  });
});
