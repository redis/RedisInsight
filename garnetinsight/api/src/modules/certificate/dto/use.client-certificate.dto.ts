import { PickType } from '@nestjs/swagger';
import { ClientCertificate } from 'src/modules/certificate/models/client-certificate';

export class UseClientCertificateDto extends PickType(ClientCertificate, [
  'id',
] as const) {}
