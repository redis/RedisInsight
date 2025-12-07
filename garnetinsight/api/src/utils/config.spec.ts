import { Config } from 'src/utils/config';
import { merge } from 'lodash';
import defaultConfig from '../../config/default';
import devConfig from '../../config/development';
import testConfig from '../../config/test';
import stageConfig from '../../config/staging';
import prodConfig from '../../config/production';
import stackConfig from '../../config/stack';

describe('Config util', () => {
  const OLD_ENV = process.env;

  describe('get', () => {
    beforeEach(() => {
      // Clears the cache
      jest.resetModules();
      // Make a copy
      process.env = { ...OLD_ENV };
    });

    afterAll(() => {
      // Restore old environment
      process.env = OLD_ENV;
    });

    it('should return dev server config', () => {
      process.env.NODE_ENV = 'development';
      // eslint-disable-next-line global-require
      const { get } = require('./config');

      const result = get('server') as Config['server'];

      expect(result).toEqual({
        ...defaultConfig.server,
        ...devConfig.server,
      });
    });

    it('should return test server config', () => {
      process.env.NODE_ENV = 'test';
      // eslint-disable-next-line global-require
      const { get } = require('./config');

      const result = get('server') as Config['server'];

      expect(result).toEqual({
        ...defaultConfig.server,
        ...testConfig.server,
      });
    });

    it('should return stack server config', () => {
      process.env.RI_BUILD_TYPE = 'REDIS_STACK';
      process.env.NODE_ENV = 'staging';
      // eslint-disable-next-line global-require
      const { get } = require('./config');

      const result = get('server') as Config['server'];

      expect(result).toEqual({
        ...defaultConfig.server,
        ...stageConfig.server,
        ...stackConfig.server,
        buildType: 'REDIS_STACK',
      });
    });

    it('should return stage server config', () => {
      process.env.NODE_ENV = 'staging';
      // eslint-disable-next-line global-require
      const { get } = require('./config');

      const result = get('server') as Config['server'];

      expect(result).toEqual({
        ...defaultConfig.server,
        ...stageConfig.server,
      });
    });

    it('should return prod server config', () => {
      process.env.NODE_ENV = 'production';
      // eslint-disable-next-line global-require
      const { get } = require('./config');

      const result = get('server') as Config['server'];

      expect(result).toEqual({
        ...defaultConfig.server,
        ...prodConfig.server,
      });
    });

    it('should return entire prod server config', () => {
      process.env.NODE_ENV = 'production';
      // eslint-disable-next-line global-require
      const { get } = require('./config');

      const result = get() as Config['server'];

      expect(result).toEqual(merge({ ...defaultConfig }, { ...prodConfig }));
    });
  });
});
