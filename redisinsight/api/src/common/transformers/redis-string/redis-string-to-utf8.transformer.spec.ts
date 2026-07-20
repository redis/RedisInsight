import { instanceToPlain } from 'class-transformer';
import { RedisStringToUTF8Transformer } from './redis-string-to-utf8.transformer';

class ScalarDto {
  @RedisStringToUTF8Transformer()
  value: unknown;
}

class ArrayDto {
  @RedisStringToUTF8Transformer({ each: true })
  values: unknown[];
}

const toPlain = <T extends object>(Cls: new () => T, payload: Partial<T>) =>
  instanceToPlain(Object.assign(new Cls(), payload));

describe('RedisStringToUTF8Transformer', () => {
  describe('scalar', () => {
    it('decodes Buffer values as UTF-8', () => {
      expect(toPlain(ScalarDto, { value: Buffer.from('名字') })).toEqual({
        value: '名字',
      });
    });

    it('returns non-Buffer scalars unchanged', () => {
      expect(toPlain(ScalarDto, { value: 'hello' })).toEqual({
        value: 'hello',
      });
    });

    it('passes null through without throwing', () => {
      expect(toPlain(ScalarDto, { value: null })).toEqual({ value: null });
    });

    it('passes undefined through without throwing', () => {
      expect(() => toPlain(ScalarDto, { value: undefined })).not.toThrow();
    });
  });

  describe('each: true', () => {
    it('returns an empty array unchanged', () => {
      expect(toPlain(ArrayDto, { values: [] })).toEqual({ values: [] });
    });

    it('preserves null/undefined slots alongside decoded entries', () => {
      const input = [Buffer.from('a'), null, undefined, 'b'];

      expect(toPlain(ArrayDto, { values: input })).toEqual({
        values: ['a', null, undefined, 'b'],
      });
    });
  });
});
