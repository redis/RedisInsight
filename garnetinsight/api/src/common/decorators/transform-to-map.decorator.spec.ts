import { Expose, instanceToPlain, plainToInstance } from 'class-transformer';
import { TransformToMap } from './transform-to-map.decorator';

class DummyClass {
  @Expose()
  value: string;

  @Expose({ groups: ['security'] })
  secret?: string;
}

class TestDto {
  @TransformToMap(DummyClass)
  @Expose()
  data: Record<string, DummyClass>;
}

describe('TransformToMap decorator', () => {
  it('should transform each map value into an instance of DummyClass (without security group fields)', () => {
    const input = {
      data: {
        key1: { value: 'test1', secret: 'secret1' },
        key2: { value: 'test2', secret: 'secret2' },
      },
    };

    const instance = plainToInstance(TestDto, input);

    expect(instance).toBeInstanceOf(TestDto);
    expect(instance.data.key1).toBeInstanceOf(DummyClass);
    expect(instance.data.key2).toBeInstanceOf(DummyClass);
    expect(instance.data.key1.value).toEqual('test1');
    expect(instance.data.key1.secret).toEqual(undefined);
    expect(instance.data.key2.value).toEqual('test2');
    expect(instance.data.key2.secret).toEqual(undefined);
  });

  it('should transform each map value into an instance of DummyClass (with security group fields)', () => {
    const input = {
      data: {
        key1: { value: 'test1', secret: 'secret1' },
        key2: { value: 'test2', secret: 'secret2' },
      },
    };

    const instance = plainToInstance(TestDto, input, { groups: ['security'] });

    expect(instance).toBeInstanceOf(TestDto);
    expect(instance.data.key1).toBeInstanceOf(DummyClass);
    expect(instance.data.key2).toBeInstanceOf(DummyClass);
    expect(instance.data.key1.value).toEqual('test1');
    expect(instance.data.key1.secret).toEqual('secret1');
    expect(instance.data.key2.value).toEqual('test2');
    expect(instance.data.key2.secret).toEqual('secret2');
  });

  it('should handle empty objects gracefully', () => {
    const input = { data: {} };
    const instance = plainToInstance(TestDto, input);

    expect(instance).toBeInstanceOf(TestDto);
    expect(instance.data).toEqual({});
  });

  it('should handle undefined values gracefully', () => {
    const input = { data: undefined };
    const instance = plainToInstance(TestDto, input);

    expect(instance).toBeInstanceOf(TestDto);
    expect(instance.data).toEqual(undefined);
  });

  it('should convert a class instance to a plain object (without security group fields)', () => {
    const instance = Object.assign(new TestDto(), {
      data: {
        key1: Object.assign(new DummyClass(), {
          value: 'test1',
          secret: 'secret1',
        }),
        key2: Object.assign(new DummyClass(), {
          value: 'test2',
          secret: 'secret2',
        }),
      },
    });

    const plain = instanceToPlain(instance);

    expect(Object.getPrototypeOf(plain)).toBe(Object.prototype);
    expect(Object.getPrototypeOf(plain.data.key1)).toBe(Object.prototype);
    expect(Object.getPrototypeOf(plain.data.key2)).toBe(Object.prototype);
    expect(plain).toEqual({
      data: {
        key1: { value: 'test1' },
        key2: { value: 'test2' },
      },
    });
  });

  it('should convert a class instance to a plain object (with security group fields)', () => {
    const instance = Object.assign(new TestDto(), {
      data: {
        key1: Object.assign(new DummyClass(), {
          value: 'test1',
          secret: 'secret1',
        }),
        key2: Object.assign(new DummyClass(), {
          value: 'test2',
          secret: 'secret2',
        }),
      },
    });

    const plain = instanceToPlain(instance, { groups: ['security'] });

    expect(Object.getPrototypeOf(plain)).toBe(Object.prototype);
    expect(Object.getPrototypeOf(plain.data.key1)).toBe(Object.prototype);
    expect(Object.getPrototypeOf(plain.data.key2)).toBe(Object.prototype);
    expect(plain).toEqual({
      data: {
        key1: { value: 'test1', secret: 'secret1' },
        key2: { value: 'test2', secret: 'secret2' },
      },
    });
  });

  it('should handle an empty Map gracefully on reverse conversion', () => {
    const instance = Object.assign(new TestDto(), {
      data: {},
    });

    const plain = instanceToPlain(instance);

    expect(Object.getPrototypeOf(plain)).toBe(Object.prototype);
    expect(plain.data).toEqual({});
  });

  it('should handle undefined values gracefully on reverse conversion', () => {
    const instance = Object.assign(new TestDto(), {
      data: undefined,
    });

    const plain = instanceToPlain(instance);

    expect(Object.getPrototypeOf(plain)).toBe(Object.prototype);
    expect(plain.data).toEqual(undefined);
  });
});
