import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'serialized-json', async: false })
export class SerializedJsonValidator implements ValidatorConstraintInterface {
  validate(data: any): boolean {
    try {
      JSON.parse(data);
    } catch {
      return false;
    }
    return true;
  }

  defaultMessage(data): string {
    return `${data.property} should be a correct serialized json string`;
  }
}
