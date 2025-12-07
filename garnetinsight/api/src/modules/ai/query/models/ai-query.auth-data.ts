import { Expose } from 'class-transformer';

export class AiQueryAuthData {
  @Expose()
  sessionId: string;

  @Expose()
  csrf: string;

  @Expose()
  accountId: string;
}
