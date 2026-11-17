import { isImportFromFileAllowed } from 'src/common/utils';
import config, { Config } from 'src/utils/config';
import { BuildType } from 'src/modules/server/models/server';

const mockServerConfig = config.get('server') as Config['server'];
const originalBuildType = mockServerConfig.buildType;

describe('isImportFromFileAllowed', () => {
  afterEach(() => {
    mockServerConfig.buildType = originalBuildType;
  });

  it('should allow reading from a path in the desktop build', () => {
    mockServerConfig.buildType = BuildType.Electron;

    expect(isImportFromFileAllowed()).toEqual(true);
  });

  it.each([BuildType.DockerOnPremise, BuildType.RedisStack, BuildType.VSCode])(
    'should not allow reading from a path in the %s build',
    (buildType) => {
      mockServerConfig.buildType = buildType;

      expect(isImportFromFileAllowed()).toEqual(false);
    },
  );
});
