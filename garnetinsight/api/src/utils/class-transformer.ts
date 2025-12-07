import {
  ClassTransformOptions,
  instanceToPlain,
  plainToInstance,
} from 'class-transformer';
import { ClassConstructor } from 'class-transformer/types/interfaces';

export function classToClass<T, V>(
  targetClass: ClassConstructor<T>,
  classInstance: V,
  options?: ClassTransformOptions,
): T {
  const defaultOptions: ClassTransformOptions = {
    excludeExtraneousValues: true,
    groups: ['security'],
  };

  const transformOptions = {
    ...defaultOptions,
    ...options,
  };

  return plainToInstance(
    targetClass,
    instanceToPlain(classInstance, transformOptions),
    transformOptions,
  );
}

export const cloneClassInstance = <V>(entity: V): V =>
  classToClass(entity.constructor as ClassConstructor<V>, entity);
