import { Test, TestingModule } from '@nestjs/testing';
import { KeyInfoProvider } from 'src/modules/browser/keys/key-info/key-info.provider';
import { RedisDataType } from 'src/modules/browser/keys/dto';
import { UnsupportedKeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/unsupported.key-info.strategy';
import { GraphKeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/graph.key-info.strategy';
import { HashKeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/hash.key-info.strategy';
import { ListKeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/list.key-info.strategy';
import { RejsonRlKeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/rejson-rl.key-info.strategy';
import { SetKeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/set.key-info.strategy';
import { StreamKeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/stream.key-info.strategy';
import { StringKeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/string.key-info.strategy';
import { TsKeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/ts.key-info.strategy';
import { ZSetKeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/z-set.key-info.strategy';

describe('KeyInfoProvider', () => {
  let service: KeyInfoProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KeyInfoProvider,
        GraphKeyInfoStrategy,
        HashKeyInfoStrategy,
        ListKeyInfoStrategy,
        RejsonRlKeyInfoStrategy,
        SetKeyInfoStrategy,
        StreamKeyInfoStrategy,
        StringKeyInfoStrategy,
        TsKeyInfoStrategy,
        ZSetKeyInfoStrategy,
        UnsupportedKeyInfoStrategy,
      ],
    }).compile();

    service = module.get(KeyInfoProvider);
  });

  describe('getStrategy', () => {
    const testCases = [
      {
        input: 'unknown' as RedisDataType,
        strategy: UnsupportedKeyInfoStrategy,
      },
      { input: RedisDataType.Graph, strategy: GraphKeyInfoStrategy },
      { input: RedisDataType.Hash, strategy: HashKeyInfoStrategy },
      { input: RedisDataType.List, strategy: ListKeyInfoStrategy },
      { input: RedisDataType.JSON, strategy: RejsonRlKeyInfoStrategy },
      { input: RedisDataType.Set, strategy: SetKeyInfoStrategy },
      { input: RedisDataType.Stream, strategy: StreamKeyInfoStrategy },
      { input: RedisDataType.String, strategy: StringKeyInfoStrategy },
      { input: RedisDataType.TS, strategy: TsKeyInfoStrategy },
      { input: RedisDataType.ZSet, strategy: ZSetKeyInfoStrategy },
    ];

    testCases.forEach((tc) => {
      it(`Should return ${tc.strategy} strategy for ${tc.input} type`, () => {
        expect(service.getStrategy(tc.input)).toBeInstanceOf(tc.strategy);
      });
    });
  });
});
