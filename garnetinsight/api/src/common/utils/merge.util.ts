import { isObjectLike, isUndefined, mergeWith, isArray } from 'lodash';

export const deepMerge = (target: object, source: object) =>
  mergeWith(target, source, (targetValue, sourceValue) => {
    if (isUndefined(sourceValue)) {
      return targetValue;
    }

    if (
      isObjectLike(sourceValue) &&
      !isArray(sourceValue) &&
      !isArray(targetValue)
    ) {
      return deepMerge(targetValue, sourceValue);
    }

    return sourceValue;
  });
