import { IntersectionType } from '@nestjs/swagger';
import { KeyWithExpireDto } from 'src/modules/browser/keys/dto';
import { CreateRejsonRlDto } from './create.rejson-rl.dto';

export class CreateRejsonRlWithExpireDto extends IntersectionType(
  CreateRejsonRlDto,
  KeyWithExpireDto,
) {}
