import { Module } from '@nestjs/common';
import { DatabaseImportController } from 'src/modules/database-import/database-import.controller';
import { DatabaseImportService } from 'src/modules/database-import/database-import.service';
import { DatabaseImportAnalytics } from 'src/modules/database-import/database-import.analytics';
import { CertificateImportService } from 'src/modules/database-import/certificate-import.service';
import { SshImportService } from 'src/modules/database-import/ssh-import.service';

@Module({
  controllers: [DatabaseImportController],
  providers: [
    DatabaseImportService,
    CertificateImportService,
    SshImportService,
    DatabaseImportAnalytics,
  ],
})
export class DatabaseImportModule {}
