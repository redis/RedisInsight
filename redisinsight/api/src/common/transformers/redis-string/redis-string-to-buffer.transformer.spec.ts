import { instanceToPlain } from 'class-transformer';
import { RedisStringToBufferTransformer } from './redis-string-to-buffer.transformer';

class ScalarDto {
  @RedisStringToBufferTransformer()
  value: unknown;
}

class ArrayDto {
  @RedisStringToBufferTransformer({ each: true })
  values: unknown[];
}

const toPlain = <T extends object>(Cls: new () => T, payload: Partial<T>) =>
  instanceToPlain(Object.assign(new Cls(), payload));

describe('RedisStringToBufferTransformer', () => {
  describe('scalar', () => {
    it('returns Buffer values unchanged', () => {
      const buf = Buffer.from('hello');

      expect(toPlain(ScalarDto, { value: buf })).toEqual({ value: buf });
    });

    it('converts strings via Buffer.from', () => {
      expect(toPlain(ScalarDto, { value: 'hello' })).toEqual({
        value: Buffer.from('hello'),
      });
    });

    it('passes null through without throwing', () => {
      expect(toPlain(ScalarDto, { value: null })).toEqual({ value: null });
    });

    it('passes undefined through without throwing', () => {
      // Undefined is dropped during plain serialization; the assertion is that
      // the call itself does not throw (pre-fix it raised TypeError).
      expect(() => toPlain(ScalarDto, { value: undefined })).not.toThrow();
    });
  });

  describe('each: true', () => {
    it('returns an empty array unchanged', () => {
      expect(toPlain(ArrayDto, { values: [] })).toEqual({ values: [] });
    });

    it('converts each entry independently and preserves null/undefined slots', () => {
      const buf = Buffer.from('keep');
      const input = [buf, 'text', null, undefined];

      expect(toPlain(ArrayDto, { values: input })).toEqual({
        values: [buf, Buffer.from('text'), null, undefined],
      });
    });

    it('does not throw on an array of only null/undefined entries', () => {
      expect(() =>
        toPlain(ArrayDto, { values: [null, undefined, null] }),
      ).not.toThrow();
    });
  });
});
