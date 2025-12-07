import { get, map } from 'lodash';
import { plainToInstance } from 'class-transformer';
import {
  FeatureConfigFilter,
  FeatureConfigFilterAnd,
  FeatureConfigFilterOr,
} from 'src/modules/feature/model/features-config';

export const featureConfigFilterTransformer = ({ value, options }) =>
  map(value || [], (filter) => {
    let cls: any = FeatureConfigFilter;

    if (get(filter, 'and')) {
      cls = FeatureConfigFilterAnd;
    }

    if (get(filter, 'or')) {
      cls = FeatureConfigFilterOr;
    }

    return plainToInstance(cls, filter, options);
  });
