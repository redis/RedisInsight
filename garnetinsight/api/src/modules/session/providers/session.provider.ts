import { SessionStorage } from 'src/modules/session/providers/storage/session.storage';
import { Session } from 'src/common/models';
import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class SessionProvider {
  constructor(protected readonly sessionStorage: SessionStorage) {}

  abstract getSession(id: string): Promise<Session>;
  abstract createSession(session: Session): Promise<Session>;
  abstract updateSessionData(id: string, data: object): Promise<Session>;
  abstract deleteSession(id: string): Promise<void>;
}
