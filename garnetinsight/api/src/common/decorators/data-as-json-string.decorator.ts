import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';

export function DataAsJsonString() {
  return applyDecorators(
    Transform(({ value }) => JSON.stringify(value), { toClassOnly: true }),
    Transform(
      ({ value }) => {
        try {
          return JSON.parse(value);
        } catch (e) {
          return undefined;
        }
      },
      { toPlainOnly: true },
    ),
  );
}
