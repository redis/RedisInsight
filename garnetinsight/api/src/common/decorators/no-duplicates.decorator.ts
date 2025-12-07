import { registerDecorator, ValidationOptions } from 'class-validator';
import { NoDuplicates } from 'src/common/validators';

export function NoDuplicatesByKey(
  key: string,
  validationOptions?: ValidationOptions,
) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'NoDuplicatesByKey',
      target: object.constructor,
      propertyName,
      constraints: [key],
      options: validationOptions,
      validator: NoDuplicates,
    });
  };
}
