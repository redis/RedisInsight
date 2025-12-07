import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'GitHubLink', async: false })
export class GitHubLink implements ValidatorConstraintInterface {
  validate(value: any) {
    // Regular expression to match any GitHub URL
    const githubUrlRegex =
      /^https:\/\/github\.com(?:\/[^\s/]+(?:\/[^\s/]+)*)?\/?$/;
    return typeof value === 'string' && githubUrlRegex.test(value);
  }

  defaultMessage() {
    return 'Enter a full GitHub link';
  }
}
