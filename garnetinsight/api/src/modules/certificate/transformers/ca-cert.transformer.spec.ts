import { TypeHelpOptions } from 'class-transformer';
import { CreateCaCertificateDto } from 'src/modules/certificate/dto/create.ca-certificate.dto';
import { UseCaCertificateDto } from 'src/modules/certificate/dto/use.ca-certificate.dto';
import { caCertTransformer } from './ca-cert.transformer';

describe('caCertTransformer', () => {
  [
    {
      input: {
        object: { caCert: { id: 'some-id-uuid' } },
      } as unknown as TypeHelpOptions,
      output: UseCaCertificateDto,
    },
    {
      input: { object: { caCert: { id: null } } } as unknown as TypeHelpOptions,
      output: CreateCaCertificateDto,
    },
    {
      input: {
        object: { caCert: { some: 'field' } },
      } as unknown as TypeHelpOptions,
      output: CreateCaCertificateDto,
    },
    {
      input: { object: { caCert: null } } as unknown as TypeHelpOptions,
      output: CreateCaCertificateDto,
    },
    {
      input: { object: null } as unknown as TypeHelpOptions,
      output: CreateCaCertificateDto,
    },
    {
      input: null,
      output: CreateCaCertificateDto,
    },
  ].forEach((tc) => {
    it(`Should return ${tc.output} when input is: ${tc.input}`, () => {
      expect(caCertTransformer(tc.input)).toEqual(tc.output);
    });
  });
});
