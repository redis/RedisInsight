import { PartialType } from '@nestjs/swagger';

import { CreateTagDto } from './create-tag.dto';

export class UpdateTagDto extends PartialType(CreateTagDto) {}
