import { GraphKeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/graph.key-info.strategy';
import { HashKeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/hash.key-info.strategy';
import { ListKeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/list.key-info.strategy';
import { RejsonRlKeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/rejson-rl.key-info.strategy';
import { SetKeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/set.key-info.strategy';
import { StreamKeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/stream.key-info.strategy';
import { StringKeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/string.key-info.strategy';
import { TsKeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/ts.key-info.strategy';
import { UnsupportedKeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/unsupported.key-info.strategy';
import { VectorSetKeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/vector-set.key-info.strategy';
import { ZSetKeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/z-set.key-info.strategy';
import { KeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/key-info.strategy';
import { RedisDataType } from 'src/modules/browser/keys/dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class KeyInfoProvider {
  constructor(
    private readonly graphKeyInfoStrategy: GraphKeyInfoStrategy,
    private readonly hashKeyInfoStrategy: HashKeyInfoStrategy,
    private readonly listKeyInfoStrategy: ListKeyInfoStrategy,
    private readonly rejsonRlKeyInfoStrategy: RejsonRlKeyInfoStrategy,
    private readonly setKeyInfoStrategy: SetKeyInfoStrategy,
    private readonly streamKeyInfoStrategy: StreamKeyInfoStrategy,
    private readonly stringKeyInfoStrategy: StringKeyInfoStrategy,
    private readonly tsKeyInfoStrategy: TsKeyInfoStrategy,
    private readonly unsupportedKeyInfoStrategy: UnsupportedKeyInfoStrategy,
    private readonly vectorSetKeyInfoStrategy: VectorSetKeyInfoStrategy,
    private readonly zSetKeyInfoStrategy: ZSetKeyInfoStrategy,
  ) {}

  getStrategy(type?: string): KeyInfoStrategy {
    switch (type) {
      case RedisDataType.Graph:
        return this.graphKeyInfoStrategy;
      case RedisDataType.Hash:
        return this.hashKeyInfoStrategy;
      case RedisDataType.List:
        return this.listKeyInfoStrategy;
      case RedisDataType.JSON:
        return this.rejsonRlKeyInfoStrategy;
      case RedisDataType.Set:
        return this.setKeyInfoStrategy;
      case RedisDataType.Stream:
        return this.streamKeyInfoStrategy;
      case RedisDataType.String:
        return this.stringKeyInfoStrategy;
      case RedisDataType.TS:
        return this.tsKeyInfoStrategy;
      case RedisDataType.VectorSet:
        return this.vectorSetKeyInfoStrategy;
      case RedisDataType.ZSet:
        return this.zSetKeyInfoStrategy;
      default:
        return this.unsupportedKeyInfoStrategy;
    }
  }
}
