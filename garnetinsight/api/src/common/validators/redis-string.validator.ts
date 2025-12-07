import { isString } from 'lodash';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'RedisStringValidator', async: true })
export class RedisStringValidator implements ValidatorConstraintInterface {
  async validate(value: any) {
    return isString(value) || value instanceof Buffer;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property || 'field'} must be a string or a Buffer`;
  }
}
