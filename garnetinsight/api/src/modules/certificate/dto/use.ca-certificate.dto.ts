import { PickType } from '@nestjs/swagger';
import { CaCertificate } from 'src/modules/certificate/models/ca-certificate';

export class UseCaCertificateDto extends PickType(CaCertificate, [
  'id',
] as const) {}
