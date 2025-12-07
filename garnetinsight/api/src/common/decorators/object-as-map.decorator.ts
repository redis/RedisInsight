import { forEach } from 'lodash';
import { applyDecorators } from '@nestjs/common';
import { instanceToPlain, plainToInstance, Transform } from 'class-transformer';
import { ClassConstructor } from 'class-transformer/types/interfaces';

export function ObjectAsMap<T>(targetClass: ClassConstructor<T>) {
  return applyDecorators(
    Transform(
      ({ value: object }): Map<string, T> => {
        const result = new Map();

        try {
          forEach(object, (value, key) => {
            result.set(key, plainToInstance(targetClass, value));
          });

          return result;
        } catch (e) {
          return result;
        }
      },
      { toClassOnly: true },
    ),
    Transform(
      ({ value: map }): object => {
        try {
          const result = {};

          forEach(Array.from(map), ([key, value]) => {
            result[key] = instanceToPlain(value);
          });

          return result;
        } catch (e) {
          return undefined;
        }
      },
      { toPlainOnly: true },
    ),
  );
}
