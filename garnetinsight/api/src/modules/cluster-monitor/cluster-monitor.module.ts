import { Module } from '@nestjs/common';
import { ClusterMonitorController } from 'src/modules/cluster-monitor/cluster-monitor.controller';
import { ClusterMonitorService } from 'src/modules/cluster-monitor/cluster-monitor.service';

@Module({
  providers: [ClusterMonitorService],
  controllers: [ClusterMonitorController],
})
export class ClusterMonitorModule {}
