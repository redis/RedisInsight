import { registerDecorator, ValidationOptions } from 'class-validator';
import { MultiNumberValidator } from 'src/common/validators';

export function IsMultiNumber(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'IsMultiNumber',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: MultiNumberValidator,
    });
  };
}
