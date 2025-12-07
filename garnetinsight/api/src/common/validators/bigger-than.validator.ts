import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'BiggerThan', async: true })
export class BiggerThan implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return (
      typeof value === 'number' &&
      typeof relatedValue === 'number' &&
      value > relatedValue
    );
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be bigger than ${args.constraints.join(', ')}`;
  }
}
