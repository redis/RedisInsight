import { Socket } from 'socket.io';
import { debounce } from 'lodash';
import { WsException } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { ProfilerServerEvents } from 'src/modules/profiler/constants';
import { ILogsEmitter } from 'src/modules/profiler/interfaces/logs-emitter.interface';
import { IMonitorData } from 'src/modules/profiler/interfaces/monitor-data.interface';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class ProfilerClient {
  private logger = new Logger('ProfilerClient');

  public readonly id: string;

  private readonly client: Socket;

  private logsEmitters: Map<string, ILogsEmitter> = new Map();

  private filters: any[];

  private readonly debounce: any;

  private items: any[];

  constructor(id: string, client: Socket) {
    this.id = id;
    this.client = client;
    this.items = [];
    this.debounce = debounce(
      () => {
        if (this.items.length) {
          this.logsEmitters.forEach((emitter) => {
            emitter.emit(this.items);
          });
          this.items = [];
        }
      },
      10,
      {
        maxWait: 50,
      },
    );
  }

  public handleOnData(payload: IMonitorData) {
    const { time, args, source, database } = payload;

    // If there's [ in the time, strip it out.
    //
    // There is a case of a timestamp coming with '[' on Alibaba
    // Redis's monitor.
    const newTime = time.split('[')[0];

    this.items.push({
      time: newTime,
      args,
      source,
      database,
    });

    this.debounce();
  }

  public handleOnDisconnect() {
    this.client.emit(
      ProfilerServerEvents.Exception,
      new WsException(ERROR_MESSAGES.NO_CONNECTION_TO_REDIS_DB),
    );
  }

  public addLogsEmitter(emitter: ILogsEmitter) {
    this.logsEmitters.set(emitter.id, emitter);
    emitter.addProfilerClient(this.id);
    this.logCurrentState();
  }

  async flushLogs() {
    this.logsEmitters.forEach((emitter) => emitter.flushLogs());
  }

  public destroy() {
    this.logsEmitters.forEach((emitter) =>
      emitter.removeProfilerClient(this.id),
    );
  }

  /**
   * Logs useful information about current state for debug purposes
   * @private
   */
  private logCurrentState() {
    this.logger.debug(`Emitters: ${this.logsEmitters.size}`);
  }
}
