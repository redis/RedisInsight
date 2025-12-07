import { isMap } from 'lodash';
import * as AGREEMENTS_SPEC from 'src/constants/agreements-spec.json';

// Delete all keys from the validated Map that are not included in the settings specification.
export const pickDefinedAgreements = ({ value }) => {
  if (isMap(value)) {
    for (const k of value?.keys()) {
      if (!AGREEMENTS_SPEC.agreements[k]) {
        value.delete(k);
      }
    }
  }
  return value;
};
