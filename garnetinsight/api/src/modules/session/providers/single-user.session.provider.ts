import { SessionProvider } from 'src/modules/session/providers/session.provider';
import { Session } from 'src/common/models';
import { DEFAULT_SESSION_ID } from 'src/common/constants';
import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class SingleUserSessionProvider extends SessionProvider {
  async getSession(): Promise<Session> {
    return this.sessionStorage.getSession(DEFAULT_SESSION_ID);
  }

  async createSession(session: Session): Promise<Session> {
    return this.sessionStorage.createSession(
      plainToInstance(Session, {
        ...session,
        id: DEFAULT_SESSION_ID,
      }),
    );
  }

  async updateSessionData(id: string, data: object) {
    return this.sessionStorage.updateSessionData(DEFAULT_SESSION_ID, data);
  }

  async deleteSession(): Promise<void> {
    return this.sessionStorage.deleteSession(DEFAULT_SESSION_ID);
  }
}
