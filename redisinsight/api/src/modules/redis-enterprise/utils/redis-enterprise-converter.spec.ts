import { AdditionalRedisModuleName } from 'src/constants';
import { convertRedisSoftwareModuleName } from 'src/modules/redis-enterprise/utils/redis-enterprise-converter';

describe('convertRedisCloudModuleName', () => {
  it('should return exist module name', () => {
    const input = 'ReJSON';

    const output = convertRedisSoftwareModuleName(input);

    expect(output).toEqual(AdditionalRedisModuleName.RedisJSON);
  });
  it('should return non-exist module name', () => {
    const input = 'RedisNewModule';

    const output = convertRedisSoftwareModuleName(input);

    expect(output).toEqual(input);
  });
});
