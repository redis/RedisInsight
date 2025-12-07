import { Module } from '@nestjs/common';
import { CloudTaskCapiService } from 'src/modules/cloud/task/cloud-task.capi.service';
import { CloudTaskCapiProvider } from 'src/modules/cloud/task/providers/cloud-task.capi.provider';

@Module({
  providers: [CloudTaskCapiProvider, CloudTaskCapiService],
  exports: [CloudTaskCapiService],
})
export class CloudTaskModule {}
