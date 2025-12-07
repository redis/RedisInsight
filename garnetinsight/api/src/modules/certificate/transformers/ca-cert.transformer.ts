import { get } from 'lodash';
import { TypeHelpOptions } from 'class-transformer';
import { UseCaCertificateDto } from 'src/modules/certificate/dto/use.ca-certificate.dto';
import { CreateCaCertificateDto } from 'src/modules/certificate/dto/create.ca-certificate.dto';

export const caCertTransformer = (data: TypeHelpOptions) => {
  if (get(data?.object, 'caCert.id')) {
    return UseCaCertificateDto;
  }
  return CreateCaCertificateDto;
};
