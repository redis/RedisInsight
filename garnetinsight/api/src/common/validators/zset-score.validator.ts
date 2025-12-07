import { isNumber } from 'lodash';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'RedisStringValidator', async: true })
export class ZSetScoreValidator implements ValidatorConstraintInterface {
  async validate(value: any) {
    return value === 'inf' || value === '-inf' || isNumber(value);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property || 'field'} must be a string or a number`;
  }
}
