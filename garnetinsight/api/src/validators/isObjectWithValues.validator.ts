import {
  isObject,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsObjectWithValues(
  valueValidators: ((value: unknown) => boolean)[],
  validationOptions?: ValidationOptions,
) {
  return (object: unknown, propertyName: string) => {
    registerDecorator({
      name: 'IsObjectWithValues',
      target: (object as any).constructor,
      propertyName,
      options: validationOptions,

      validator: {
        validate(data: unknown) {
          if (!isObject(data)) return false;

          for (const value of Object.values(data)) {
            const isInvalidValue = valueValidators.some(
              (validator) => !validator(value),
            );
            if (isInvalidValue) {
              return false;
            }
          }

          return true;
        },
        defaultMessage(validationArguments?: ValidationArguments): string {
          return `${validationArguments.property} should be a valid object with proper values`;
        },
      },
    });
  };
}
