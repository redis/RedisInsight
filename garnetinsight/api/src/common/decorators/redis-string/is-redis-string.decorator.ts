import { registerDecorator, ValidationOptions } from 'class-validator';
import { RedisStringValidator } from 'src/common/validators';

export function IsRedisString(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'IsRedisString',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: RedisStringValidator,
    });
  };
}
