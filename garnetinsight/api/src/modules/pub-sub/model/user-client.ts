import { Socket } from 'socket.io';

export class UserClient {
  private readonly socket: Socket;

  private readonly id: string;

  private readonly databaseId: string;

  constructor(id: string, socket: Socket, databaseId: string) {
    this.id = id;
    this.socket = socket;
    this.databaseId = databaseId;
  }

  getId() {
    return this.id;
  }

  getDatabaseId() {
    return this.databaseId;
  }

  getSocket() {
    return this.socket;
  }
}
