import { Module } from '@nestjs/common';
import { SshTunnelProvider } from 'src/modules/ssh/ssh-tunnel.provider';

@Module({
  providers: [SshTunnelProvider],
  exports: [SshTunnelProvider],
})
export class SshModule {}
