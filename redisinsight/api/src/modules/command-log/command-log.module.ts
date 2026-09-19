import { Module } from '@nestjs/common';
import { CommandLogService } from 'src/modules/command-log/command-log.service';
import { CommandLogGateway } from 'src/modules/command-log/command-log.gateway';

/**
 * Records every command this API sends to Redis and streams it to the UI.
 *
 * The service owns the hook on the Redis client layer, the gateway owns the
 * socket.io channel — importing this module is all that is needed to turn the
 * feature on.
 */
@Module({
  providers: [CommandLogService, CommandLogGateway],
  exports: [CommandLogService],
})
export class CommandLogModule {}
