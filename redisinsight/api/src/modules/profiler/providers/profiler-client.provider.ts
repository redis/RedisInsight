import { Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { ProfilerClient } from 'src/modules/profiler/models/profiler.client';
import { ClientLogsEmitter } from 'src/modules/profiler/emitters/client.logs-emitter';
import { MonitorSettings } from 'src/modules/profiler/models/monitor-settings';
import { LogFileProvider } from 'src/modules/profiler/providers/log-file.provider';
import { SessionMetadata } from 'src/common/models';
import { Database } from 'src/modules/database/models/database';

@Injectable()
export class ProfilerClientProvider {
  private profilerClients: Map<string, ProfilerClient> = new Map();

  constructor(private logFileProvider: LogFileProvider) {}

  async getOrCreateClient(
    sessionMetadata: SessionMetadata,
    instanceId: string,
    socket: Socket,
    settings: MonitorSettings,
    database?: Database,
  ): Promise<ProfilerClient> {
    if (!this.profilerClients.has(socket.id)) {
      const clientObserver = new ProfilerClient(socket.id, socket);
      this.profilerClients.set(socket.id, clientObserver);

      clientObserver.addLogsEmitter(new ClientLogsEmitter(socket));

      if (settings?.logFileId) {
        const profilerLogFile = this.logFileProvider.getOrCreate(
          instanceId,
          settings.logFileId,
          sessionMetadata,
          database,
        );

        if (database?.name) {
          profilerLogFile.setAlias(database.name);
        }

        clientObserver.addLogsEmitter(await profilerLogFile.getEmitter());
      }

      this.profilerClients.set(socket.id, clientObserver);
    }

    return this.profilerClients.get(socket.id);
  }

  async getClient(id: string) {
    return this.profilerClients.get(id);
  }
}
