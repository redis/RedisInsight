import { Injectable } from '@nestjs/common';
import { Session } from 'src/common/models';
import { SessionProvider } from 'src/modules/session/providers/session.provider';

@Injectable()
export class SessionService {
  constructor(private readonly sessionProvider: SessionProvider) {}

  async getSession(id: string): Promise<Session> {
    return this.sessionProvider.getSession(id);
  }

  async createSession(session: Session): Promise<Session> {
    return this.sessionProvider.createSession(session);
  }

  async updateSessionData(id: string, data: object): Promise<Session> {
    const session = await this.getSession(id);

    if (!session) {
      return null;
    }

    return this.sessionProvider.updateSessionData(
      id,
      data
        ? {
            ...session.data,
            ...data,
          }
        : {},
    );
  }

  async deleteSession(id: string): Promise<void> {
    return this.sessionProvider.deleteSession(id);
  }
}
