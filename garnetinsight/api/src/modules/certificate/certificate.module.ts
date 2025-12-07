import { Module, Type } from '@nestjs/common';
import { CaCertificateController } from 'src/modules/certificate/ca-certificate.controller';
import { CaCertificateService } from 'src/modules/certificate/ca-certificate.service';
import { ClientCertificateService } from 'src/modules/certificate/client-certificate.service';
import { CaCertificateRepository } from 'src/modules/certificate/repositories/ca-certificate.repository';
import { LocalCaCertificateRepository } from 'src/modules/certificate/repositories/local.ca-certificate.repository';
import { ClientCertificateRepository } from 'src/modules/certificate/repositories/client-certificate.repository';
import { LocalClientCertificateRepository } from 'src/modules/certificate/repositories/local.client-certificate.repository';
import { ClientCertificateController } from 'src/modules/certificate/client-certificate.controller';

@Module({})
export class CertificateModule {
  static register(
    caCertificateRepository: Type<CaCertificateRepository> = LocalCaCertificateRepository,
    clientCertificateRepository: Type<ClientCertificateRepository> = LocalClientCertificateRepository,
  ) {
    return {
      module: CertificateModule,
      controllers: [CaCertificateController, ClientCertificateController],
      providers: [
        CaCertificateService,
        ClientCertificateService,
        {
          provide: CaCertificateRepository,
          useClass: caCertificateRepository,
        },
        {
          provide: ClientCertificateRepository,
          useClass: clientCertificateRepository,
        },
      ],
      exports: [
        CaCertificateService,
        ClientCertificateService,
        CaCertificateRepository,
        ClientCertificateRepository,
      ],
    };
  }
}
