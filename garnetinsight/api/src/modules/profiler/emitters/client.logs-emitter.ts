import { Socket } from 'socket.io';
import { ILogsEmitter } from 'src/modules/profiler/interfaces/logs-emitter.interface';
import { ProfilerServerEvents } from 'src/modules/profiler/constants';

export class ClientLogsEmitter implements ILogsEmitter {
  private readonly client: Socket;

  public readonly id: string;

  constructor(client: Socket) {
    this.id = client.id;
    this.client = client;
  }

  public async emit(items: any[]) {
    return this.client.emit(ProfilerServerEvents.Data, items);
  }

  public addProfilerClient() {}

  public removeProfilerClient() {}

  public flushLogs() {}
}
