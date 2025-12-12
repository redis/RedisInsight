import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { isNumber, isArray, isString } from 'lodash';
import { RedisString } from 'src/common/constants';

/**
 * Validates that vector is either:
 * - An array of numbers (VALUES format)
 * - A string or Buffer (FP32 format)
 */
@ValidatorConstraint({ name: 'VectorValueValidator', async: false })
export class VectorValueValidator implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    // Check if it's an array of numbers (VALUES format)
    if (isArray(value)) {
      return value.every(isNumber);
    }

    // Check if it's a string or Buffer (FP32 format)
    if (isString(value) || Buffer.isBuffer(value)) {
      return true;
    }

    return false;
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be either an array of numbers (VALUES format) or a string/Buffer (FP32 format)`;
  }
}
