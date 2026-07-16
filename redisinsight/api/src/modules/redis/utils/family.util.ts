import { RedisConnectionFamily } from 'src/modules/database/entities/database.entity';

// Numeric `family` option accepted by ioredis / node-redis:
// 0 = auto (dual-stack), 4 = IPv4, 6 = IPv6.
const FAMILY_MAP: Record<RedisConnectionFamily, 0 | 4 | 6> = {
  [RedisConnectionFamily.Auto]: 0,
  [RedisConnectionFamily.IPv4]: 4,
  [RedisConnectionFamily.IPv6]: 6,
};

// Falls back to auto (dual-stack) for missing or unknown values.
export const getIpFamily = (family?: RedisConnectionFamily): 0 | 4 | 6 =>
  (family && FAMILY_MAP[family]) ?? 0;
