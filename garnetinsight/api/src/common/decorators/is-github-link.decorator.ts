import { registerDecorator, ValidationOptions } from 'class-validator';
import { GitHubLink } from 'src/common/validators';

export function IsGitHubLink(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'IsGitHubLink',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: validationOptions,
      validator: GitHubLink,
    });
  };
}
