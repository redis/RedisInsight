import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export const ARRAY_MAX_INDEX = '18446744073709551614';
export const ARRAY_MIN_INDEX = '0';

const DECIMAL_INDEX_REGEXP = /^(0|[1-9]\d*)$/;

const isLteMaxArrayIndex = (value: string): boolean => {
  if (value.length !== ARRAY_MAX_INDEX.length) {
    return value.length < ARRAY_MAX_INDEX.length;
  }

  return value <= ARRAY_MAX_INDEX;
};

export const isArrayIndex = (value: unknown): value is string =>
  typeof value === 'string' &&
  DECIMAL_INDEX_REGEXP.test(value) &&
  isLteMaxArrayIndex(value);

export const isArrayBound = (value: unknown): value is string =>
  value === '-' || value === '+' || isArrayIndex(value);

@ValidatorConstraint({ name: 'isArrayIndex', async: false })
export class IsArrayIndexConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return isArrayIndex(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a decimal array index between ${ARRAY_MIN_INDEX} and ${ARRAY_MAX_INDEX}.`;
  }
}

@ValidatorConstraint({ name: 'isArrayBound', async: false })
export class IsArrayBoundConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return isArrayBound(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be "-", "+", or a decimal array index between ${ARRAY_MIN_INDEX} and ${ARRAY_MAX_INDEX}.`;
  }
}
