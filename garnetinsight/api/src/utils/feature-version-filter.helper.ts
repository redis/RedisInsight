import { FeatureConfigFilterCondition } from 'src/modules/feature/model/features-config';
import * as semverCompare from 'node-version-compare';

export const filterVersion = (
  cond: FeatureConfigFilterCondition,
  value: string,
  filterValue: string,
) => {
  const compareRes = semverCompare(value, filterValue);
  switch (cond) {
    case FeatureConfigFilterCondition.Eq:
      return compareRes === 0;
    case FeatureConfigFilterCondition.Neq:
      return compareRes !== 0;
    case FeatureConfigFilterCondition.Gt:
      return compareRes > 0;
    case FeatureConfigFilterCondition.Gte:
      return compareRes >= 0;
    case FeatureConfigFilterCondition.Lt:
      return compareRes < 0;
    case FeatureConfigFilterCondition.Lte:
      return compareRes <= 0;
    default:
      return false;
  }
};
