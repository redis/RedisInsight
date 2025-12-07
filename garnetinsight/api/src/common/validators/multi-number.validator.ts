import { isNumber, isArray } from 'lodash';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'MultiNumberValidator', async: true })
export class MultiNumberValidator implements ValidatorConstraintInterface {
  async validate(value: any) {
    if (!isArray(value)) {
      return false;
    }

    return value.every((numbersArray) => {
      if (!isArray(numbersArray)) {
        return false;
      }

      return numbersArray.every(isNumber);
    });
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property || 'field'} must be a multidimensional array of numbers`;
  }
}
