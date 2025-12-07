import { get } from 'lodash';
import { TypeHelpOptions } from 'class-transformer';
import { UseClientCertificateDto } from 'src/modules/certificate/dto/use.client-certificate.dto';
import { CreateClientCertificateDto } from 'src/modules/certificate/dto/create.client-certificate.dto';

export const clientCertTransformer = (data: TypeHelpOptions) => {
  if (get(data?.object, 'clientCert.id')) {
    return UseClientCertificateDto;
  }
  return CreateClientCertificateDto;
};
