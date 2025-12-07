import { get } from 'lodash';
import { TypeHelpOptions } from 'class-transformer';
import { CreateBasicSshOptionsDto } from 'src/modules/ssh/dto/create.basic-ssh-options.dto';
import { CreateCertSshOptionsDto } from 'src/modules/ssh/dto/create.cert-ssh-options.dto';

export const sshOptionsTransformer = (data: TypeHelpOptions) => {
  if (get(data?.object, 'sshOptions.privateKey')) {
    return CreateCertSshOptionsDto;
  }
  return CreateBasicSshOptionsDto;
};
