import { applyDecorators } from '@nestjs/common';
import { Transform, instanceToPlain, plainToInstance } from 'class-transformer';
import { ClassConstructor } from 'class-transformer/types/interfaces';

export function TransformToMap<T>(targetClass: ClassConstructor<T>) {
  return applyDecorators(
    Transform(
      ({ value, options }) => {
        if (!value) {
          return value;
        }

        return Object.fromEntries(
          Object.entries(value).map(([key, val]) => [
            key,
            plainToInstance(targetClass, val, options),
          ]),
        );
      },
      { toClassOnly: true },
    ),

    Transform(
      ({ value, options }) => {
        if (!value) {
          return value;
        }

        return Object.fromEntries(
          Object.entries(value).map(([key, instance]) => [
            key,
            instanceToPlain(instance, options),
          ]),
        );
      },
      { toPlainOnly: true },
    ),
  );
}
