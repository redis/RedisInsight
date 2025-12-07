import { when } from 'jest-when';
import { DatabaseManagementGuard } from 'src/common/guards/database-management.guard';
import { ForbiddenException } from '@nestjs/common';
import config, { Config } from 'src/utils/config';

const mockServerConfig = config.get('server') as Config['server'];

jest.mock(
  'src/utils/config',
  jest.fn(() => jest.requireActual('src/utils/config') as object),
);

describe('DatabaseManagementGuard', () => {
  let guard: DatabaseManagementGuard;
  let configGetSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    configGetSpy = jest.spyOn(config, 'get');

    when(configGetSpy).calledWith('server').mockReturnValue(mockServerConfig);

    guard = new DatabaseManagementGuard();
  });

  it('should return true', () => {
    mockServerConfig.databaseManagement = true;

    expect(guard.canActivate()).toEqual(true);
  });

  it('should throw an error when database management is disabled', () => {
    mockServerConfig.databaseManagement = false;

    expect(guard.canActivate).toThrowError(
      new ForbiddenException('Database connection management is disabled.'),
    );
  });
});
