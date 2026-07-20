import { registerDecorator, ValidationOptions } from 'class-validator';
import { ArrayIndexValidator } from 'src/common/validators';

export function IsArrayIndex(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'isArrayIndex',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: ArrayIndexValidator,
    });
  };
}
