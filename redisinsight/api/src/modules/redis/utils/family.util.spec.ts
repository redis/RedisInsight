import { RedisConnectionFamily } from 'src/modules/database/entities/database.entity';
import { getIpFamily } from './family.util';

describe('getIpFamily', () => {
  it.each([
    [RedisConnectionFamily.Auto, 0],
    [RedisConnectionFamily.IPv4, 4],
    [RedisConnectionFamily.IPv6, 6],
  ])('should map %s to numeric family %s', (family, expected) => {
    expect(getIpFamily(family)).toEqual(expected);
  });

  it('should fall back to auto (0) when family is undefined', () => {
    expect(getIpFamily(undefined)).toEqual(0);
  });

  it('should fall back to auto (0) for an unknown value', () => {
    expect(getIpFamily('unknown' as RedisConnectionFamily)).toEqual(0);
  });
});
