import { Session } from 'src/common/models';
import { SessionStorage } from 'src/modules/session/providers/storage/session.storage';

export class InMemorySessionStorage extends SessionStorage {
  private sessions: Map<string, Session> = new Map();

  async getSession(id: string): Promise<Session> {
    return this.sessions.get(id) || null;
  }

  async createSession(session: Session): Promise<Session> {
    if (!this.sessions.has(session.id)) {
      this.sessions.set(session.id, session);
    }

    return this.getSession(session.id);
  }

  async updateSessionData(id: string, data: object): Promise<Session> {
    const session = this.sessions.get(id);

    if (!session) {
      return null;
    }

    session.data = data;

    return this.getSession(id);
  }

  async deleteSession(id: string): Promise<void> {
    this.sessions.delete(id);
  }
}
