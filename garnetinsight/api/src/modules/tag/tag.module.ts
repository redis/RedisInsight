import { Module } from '@nestjs/common';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';
import { TagRepository } from './repository/tag.repository';
import { LocalTagRepository } from './repository/local.tag.repository';

@Module({
  controllers: [TagController],
  providers: [
    TagService,
    {
      provide: TagRepository,
      useClass: LocalTagRepository,
    },
  ],
  exports: [TagService, TagRepository],
})
export class TagModule {}
