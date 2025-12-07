import { OmitType } from '@nestjs/swagger';
import { CaCertificate } from 'src/modules/certificate/models/ca-certificate';
import { Expose } from 'class-transformer';

export class CreateCaCertificateDto extends OmitType(CaCertificate, [
  'id',
] as const) {
  @Expose()
  certificate: string;
}
