import { Test, TestingModule } from '@nestjs/testing';
import { CommandsService } from 'src/modules/commands/commands.service';
import {
  mockCommandsJsonProvider,
  mockMainCommands,
  mockRedijsonCommands,
  mockRedisearchCommands,
  mockRedisgraphCommands,
  mockRedistimeseriesCommands,
  MockType,
} from 'src/__mocks__';
import { CommandsJsonProvider } from 'src/modules/commands/commands-json.provider';

describe('CommandsService', () => {
  let service: CommandsService;

  const mainCommandsProvider: MockType<CommandsJsonProvider> =
    mockCommandsJsonProvider();
  const redisearchCommandsProvider: MockType<CommandsJsonProvider> =
    mockCommandsJsonProvider();
  const redijsonCommandsProvider: MockType<CommandsJsonProvider> =
    mockCommandsJsonProvider();
  const redistimeseriesCommandsProvider: MockType<CommandsJsonProvider> =
    mockCommandsJsonProvider();
  const redisgraphCommandsProvider: MockType<CommandsJsonProvider> =
    mockCommandsJsonProvider();

  beforeEach(async () => {
    jest.clearAllMocks();

    const commandsProviders = [
      mainCommandsProvider,
      redisearchCommandsProvider,
      redijsonCommandsProvider,
      redistimeseriesCommandsProvider,
      redisgraphCommandsProvider,
    ];

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CommandsService,
          // @ts-ignore
          useFactory: () => new CommandsService(commandsProviders),
        },
      ],
    }).compile();

    service = module.get(CommandsService);

    mainCommandsProvider.getCommands.mockResolvedValue({
      main: mockMainCommands,
    });
    redisearchCommandsProvider.getCommands.mockResolvedValue({
      search: mockRedisearchCommands,
    });
    redijsonCommandsProvider.getCommands.mockResolvedValue({
      json: mockRedijsonCommands,
    });
    redistimeseriesCommandsProvider.getCommands.mockResolvedValue({
      timeseries: mockRedistimeseriesCommands,
    });
    redisgraphCommandsProvider.getCommands.mockResolvedValue({
      graph: mockRedisgraphCommands,
    });
  });

  describe('onModuleInit', () => {
    it('should trigger updateLatestJson function', async () => {
      await service.onModuleInit();

      expect(mainCommandsProvider.updateLatestJson).toHaveBeenCalled();
      expect(redisearchCommandsProvider.updateLatestJson).toHaveBeenCalled();
      expect(redijsonCommandsProvider.updateLatestJson).toHaveBeenCalled();
      expect(
        redistimeseriesCommandsProvider.updateLatestJson,
      ).toHaveBeenCalled();
      expect(redisgraphCommandsProvider.updateLatestJson).toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    it('Should return merged commands into one', async () => {
      expect(await service.getAll()).toEqual({
        ...mockRedisearchCommands,
        ...mockRedijsonCommands,
        ...mockRedistimeseriesCommands,
        ...mockRedisgraphCommands,
        ...mockMainCommands,
      });
    });
  });

  describe('getCommandsGroups', () => {
    it('Should return commands groups', async () => {
      expect(await service.getCommandsGroups()).toEqual({
        search: { ...mockRedisearchCommands },
        json: { ...mockRedijsonCommands },
        timeseries: { ...mockRedistimeseriesCommands },
        graph: { ...mockRedisgraphCommands },
        main: { ...mockMainCommands },
      });
    });
  });
});
