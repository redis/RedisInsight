import { OmitType } from '@nestjs/swagger';
import { ClientCertificate } from 'src/modules/certificate/models/client-certificate';
import { Expose } from 'class-transformer';

export class CreateClientCertificateDto extends OmitType(ClientCertificate, [
  'id',
] as const) {
  @Expose()
  certificate: string;

  @Expose()
  key: string;
}
