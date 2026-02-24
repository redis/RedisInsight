import { Global, Module } from '@nestjs/common';
import { SentryService } from './sentry.service';
import { SettingsModule } from 'src/modules/settings/settings.module';

@Global()
@Module({
  imports: [SettingsModule],
  providers: [SentryService],
  exports: [SentryService],
})
export class SentryModule {}
