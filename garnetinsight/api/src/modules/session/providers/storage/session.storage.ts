import { Session } from 'src/common/models';

export abstract class SessionStorage {
  abstract getSession(id: string): Promise<Session>;
  abstract createSession(session: Session, force?: boolean): Promise<Session>;
  abstract updateSessionData(id: string, data: object): Promise<Session>;
  abstract deleteSession(id: string): Promise<void>;
}
