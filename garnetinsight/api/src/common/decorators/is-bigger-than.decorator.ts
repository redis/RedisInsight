import { registerDecorator, ValidationOptions } from 'class-validator';
import { BiggerThan } from 'src/common/validators/bigger-than.validator';

export function IsBiggerThan(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'IsBiggerThan',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: BiggerThan,
    });
  };
}
