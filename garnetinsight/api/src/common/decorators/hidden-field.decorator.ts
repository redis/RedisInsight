import { Transform } from 'class-transformer';

export function HiddenField(field: any): PropertyDecorator {
  return Transform(({ value }) => (value ? field : undefined), {
    toPlainOnly: true,
  });
}
