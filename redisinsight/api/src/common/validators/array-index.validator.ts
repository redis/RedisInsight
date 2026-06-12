import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ARRAY_INDEX_MAX, parseArrayIndex } from 'src/common/utils';

@ValidatorConstraint({ name: 'ArrayIndexValidator', async: false })
export class ArrayIndexValidator implements ValidatorConstraintInterface {
  validate(value: unknown) {
    // Validators don't transform, so anything accepted reaches Redis verbatim;
    // only the canonical form passes ('007' / ' 42 ' are rejected).
    return typeof value === 'string' && parseArrayIndex(value) === value;
  }

  defaultMessage(args: ValidationArguments) {
    // Stable message — consumers may match on it; changing it is breaking.
    return `${args?.property || 'field'} must be an integer string between 0 and ${ARRAY_INDEX_MAX}`;
  }
}
