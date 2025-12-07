import { Injectable } from '@nestjs/common';
import { IKeyInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/key-info.strategy.interface';
import { RedisDataType } from 'src/modules/browser/keys/dto';
import {
  DefaultInfoStrategy,
  GraphInfoStrategy,
  HashInfoStrategy,
  JsonInfoStrategy,
  ListInfoStrategy,
  SetInfoStrategy,
  StreamInfoStrategy,
  StringInfoStrategy,
  TsInfoStrategy,
  ZSetInfoStrategy,
} from 'src/modules/database-analysis/scanner/key-info/strategies';

@Injectable()
export class KeyInfoProvider {
  private strategies: Map<string, IKeyInfoStrategy> = new Map();

  constructor() {
    this.strategies.set('default', new DefaultInfoStrategy());
    this.strategies.set(RedisDataType.Graph, new GraphInfoStrategy());
    this.strategies.set(RedisDataType.Hash, new HashInfoStrategy());
    this.strategies.set(RedisDataType.JSON, new JsonInfoStrategy());
    this.strategies.set(RedisDataType.List, new ListInfoStrategy());
    this.strategies.set(RedisDataType.Set, new SetInfoStrategy());
    this.strategies.set(RedisDataType.Stream, new StreamInfoStrategy());
    this.strategies.set(RedisDataType.String, new StringInfoStrategy());
    this.strategies.set(RedisDataType.TS, new TsInfoStrategy());
    this.strategies.set(RedisDataType.ZSet, new ZSetInfoStrategy());
  }

  getStrategy(type: string): IKeyInfoStrategy {
    const strategy = this.strategies.get(type);

    if (!strategy) {
      return this.strategies.get('default');
    }

    return strategy;
  }
}
