import { registerDecorator, ValidationOptions } from 'class-validator';
import { ZSetScoreValidator } from 'src/common/validators';

export function isZSetScore(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'isZSetScore',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: ZSetScoreValidator,
    });
  };
}
