import { instanceToPlain } from 'class-transformer';
import { RedisStringToASCIITransformer } from './redis-string-to-ascii.transformer';

class ScalarDto {
  @RedisStringToASCIITransformer()
  value: unknown;
}

class ArrayDto {
  @RedisStringToASCIITransformer({ each: true })
  values: unknown[];
}

const toPlain = <T extends object>(Cls: new () => T, payload: Partial<T>) =>
  instanceToPlain(Object.assign(new Cls(), payload));

describe('RedisStringToASCIITransformer', () => {
  describe('scalar', () => {
    it('converts Buffer values to an ASCII-safe string', () => {
      expect(toPlain(ScalarDto, { value: Buffer.from('hello') })).toEqual({
        value: 'hello',
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

    it('preserves null/undefined slots alongside converted entries', () => {
      const input = [Buffer.from('a'), null, undefined, 'b'];

      expect(toPlain(ArrayDto, { values: input })).toEqual({
        values: ['a', null, undefined, 'b'],
      });
    });
  });
});
