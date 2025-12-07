import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'NoDuplicates', async: true })
export class NoDuplicates implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (!Array.isArray(value)) {
      return false;
    }

    const [key] = args.constraints;
    if (typeof key !== 'string') {
      return false;
    }

    const seen = new Set();
    for (const item of value) {
      if (typeof item !== 'object' || item === null || !(key in item)) {
        return false;
      }
      const keyValue = item[key];
      if (seen.has(keyValue)) {
        return false;
      }
      seen.add(keyValue);
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    const [key] = args.constraints;
    return `Array must not contain duplicate objects based on the key "${key}".`;
  }
}
