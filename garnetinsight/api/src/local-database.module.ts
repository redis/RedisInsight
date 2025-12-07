import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { ormModuleOptions } from '../config/ormconfig';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot(ormModuleOptions),
    TypeOrmModule.forFeature(
      ormModuleOptions.entities as EntityClassOrSchema[],
    ),
  ],
  exports: [TypeOrmModule],
})
export class LocalDatabaseModule {}
