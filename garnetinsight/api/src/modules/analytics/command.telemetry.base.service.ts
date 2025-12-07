import { EventEmitter2 } from '@nestjs/event-emitter';
import { CommandType } from 'src/constants';
import { TelemetryBaseService } from 'src/modules/analytics/telemetry.base.service';
import { CommandsService } from 'src/modules/commands/commands.service';
import { forEach } from 'lodash';

export abstract class CommandTelemetryBaseService extends TelemetryBaseService {
  protected constructor(
    protected eventEmitter: EventEmitter2,
    protected readonly commandsService: CommandsService,
  ) {
    super(eventEmitter);
  }

  protected async getCommandAdditionalInfo(command: string): Promise<object> {
    try {
      const result = {
        commandType: CommandType.Module,
        moduleName: 'custom',
        capability: 'n/a',
      };

      if (!command) {
        return {};
      }

      const modules = await this.commandsService.getCommandsGroups();

      const commandToFind = command.toUpperCase();
      forEach(modules, (module, moduleName) => {
        if (module[commandToFind]) {
          result.commandType =
            moduleName === 'main' ? CommandType.Core : CommandType.Module;
          result.moduleName = moduleName === 'main' ? 'n/a' : moduleName;
          result.capability = module[commandToFind]?.group
            ? module[commandToFind]?.group
            : 'n/a';
        }
      });

      return result;
    } catch (e) {
      return {};
    }
  }
}
