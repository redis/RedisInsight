import { Module } from '@nestjs/common';
import { PluginController } from 'src/modules/plugin/plugin.controller';
import { PluginService } from 'src/modules/plugin/plugin.service';

@Module({
  controllers: [PluginController],
  providers: [PluginService],
  exports: [PluginService],
})
export class PluginModule {}
