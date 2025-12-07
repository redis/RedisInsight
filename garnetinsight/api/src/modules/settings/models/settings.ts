import { Expose } from 'class-transformer';

export class Settings {
  @Expose()
  id: string;

  @Expose()
  data: Record<string, number | string | boolean>;
}
