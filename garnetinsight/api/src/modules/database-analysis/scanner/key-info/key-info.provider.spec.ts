import { KeyInfoProvider } from 'src/modules/database-analysis/scanner/key-info/key-info.provider';
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
} from 'src/modules/database-analysis/scanner/key-info/strategies';

describe('KeysScanner', () => {
  const service = new KeyInfoProvider();
  describe('getStrategy', () => {
    [
      [RedisDataType.Graph, new GraphInfoStrategy()],
      [RedisDataType.Hash, new HashInfoStrategy()],
      [RedisDataType.JSON, new JsonInfoStrategy()],
      [RedisDataType.List, new ListInfoStrategy()],
      [RedisDataType.Set, new SetInfoStrategy()],
      [RedisDataType.Stream, new StreamInfoStrategy()],
      [RedisDataType.String, new StringInfoStrategy()],
      [RedisDataType.TS, new TsInfoStrategy()],
      [RedisDataType.ZSet, new GraphInfoStrategy()],
      ['default', new DefaultInfoStrategy()],
      ['unknown', new DefaultInfoStrategy()],
      [null, new DefaultInfoStrategy()],
    ].forEach((tc) => {
      it(`should return ${tc[1].constructor.name} for type: ${tc[0]}`, () => {
        expect(service.getStrategy(tc[0] as string)).toEqual(tc[1]);
      });
    });
  });
});
