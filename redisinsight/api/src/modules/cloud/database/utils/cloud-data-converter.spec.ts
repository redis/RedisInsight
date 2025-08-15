import { AdditionalRedisModuleName } from 'src/constants';
import { convertRedisCloudModuleName } from 'src/modules/cloud/database/utils/cloud-data-converter';

describe('convertRedisCloudModuleName', () => {
  it('should return exist module name', () => {
    const input = 'RedisJSON';

    const output = convertRedisCloudModuleName(input);

    expect(output).toEqual(AdditionalRedisModuleName.RedisJSON);
  });
  it('should return non-exist module name', () => {
    const input = 'RedisNewModule';

    const output = convertRedisCloudModuleName(input);

    expect(output).toEqual(input);
  });
});
