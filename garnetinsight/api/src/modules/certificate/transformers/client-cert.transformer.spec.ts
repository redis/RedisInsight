import { TypeHelpOptions } from 'class-transformer';
import { UseClientCertificateDto } from 'src/modules/certificate/dto/use.client-certificate.dto';
import { CreateClientCertificateDto } from 'src/modules/certificate/dto/create.client-certificate.dto';
import { clientCertTransformer } from './client-cert.transformer';

describe('caCertTransformer', () => {
  [
    {
      input: {
        object: { clientCert: { id: 'some-id-uuid' } },
      } as unknown as TypeHelpOptions,
      output: UseClientCertificateDto,
    },
    {
      input: {
        object: { clientCert: { id: null } },
      } as unknown as TypeHelpOptions,
      output: CreateClientCertificateDto,
    },
    {
      input: {
        object: { clientCert: { some: 'field' } },
      } as unknown as TypeHelpOptions,
      output: CreateClientCertificateDto,
    },
    {
      input: { object: { clientCert: null } } as unknown as TypeHelpOptions,
      output: CreateClientCertificateDto,
    },
    {
      input: { object: null } as unknown as TypeHelpOptions,
      output: CreateClientCertificateDto,
    },
    {
      input: null,
      output: CreateClientCertificateDto,
    },
  ].forEach((tc) => {
    it(`Should return ${tc.output} when input is: ${tc.input}`, () => {
      expect(clientCertTransformer(tc.input)).toEqual(tc.output);
    });
  });
});
