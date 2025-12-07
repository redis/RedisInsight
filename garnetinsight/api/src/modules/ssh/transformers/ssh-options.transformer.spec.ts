import { TypeHelpOptions } from 'class-transformer';
import { CreateCertSshOptionsDto } from 'src/modules/ssh/dto/create.cert-ssh-options.dto';
import { CreateBasicSshOptionsDto } from 'src/modules/ssh/dto/create.basic-ssh-options.dto';
import { sshOptionsTransformer } from './ssh-options.transformer';

describe('caCertTransformer', () => {
  [
    {
      input: { object: { sshOptions: {} } } as unknown as TypeHelpOptions,
      output: CreateBasicSshOptionsDto,
    },
    {
      input: {
        object: { sshOptions: { privateKey: 'asd' } },
      } as unknown as TypeHelpOptions,
      output: CreateCertSshOptionsDto,
    },
    {
      input: {
        object: { sshOptions: { privateKey: null } },
      } as unknown as TypeHelpOptions,
      output: CreateBasicSshOptionsDto,
    },
    {
      input: { object: null } as unknown as TypeHelpOptions,
      output: CreateBasicSshOptionsDto,
    },
    {
      input: null,
      output: CreateBasicSshOptionsDto,
    },
  ].forEach((tc) => {
    it(`Should return ${tc.output} when input is: ${tc.input}`, () => {
      expect(sshOptionsTransformer(tc.input)).toEqual(tc.output);
    });
  });
});
