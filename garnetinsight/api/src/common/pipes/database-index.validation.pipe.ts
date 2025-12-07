import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';

export class DbIndexValidationPipe extends ValidationPipe {
  async transform(db, metadata: ArgumentMetadata) {
    return super.transform({ db }, metadata);
  }
}
