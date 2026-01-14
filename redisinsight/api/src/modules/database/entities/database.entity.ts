import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { CaCertificateEntity } from 'src/modules/certificate/entities/ca-certificate.entity';
import { ClientCertificateEntity } from 'src/modules/certificate/entities/client-certificate.entity';
import { DataAsJsonString } from 'src/common/decorators';
import { Expose, Transform, Type } from 'class-transformer';
import { SentinelMaster } from 'src/modules/redis-sentinel/models/sentinel-master';
import { SshOptionsEntity } from 'src/modules/ssh/entities/ssh-options.entity';
import { CloudDatabaseDetailsEntity } from 'src/modules/cloud/database/entities/cloud-database-details.entity';
import { DatabaseSettingsEntity } from 'src/modules/database-settings/entities/database-setting.entity';
import { TagEntity } from 'src/modules/tag/entities/tag.entity';

export enum HostingProvider {
  REDIS_SOFTWARE = 'REDIS_SOFTWARE',
  REDIS_CLOUD = 'REDIS_CLOUD',
  REDIS_STACK = 'REDIS_STACK',
  OTHER_REDIS_MANAGED = 'OTHER_REDIS_MANAGED',
  AZURE_CACHE = 'AZURE_CACHE',
  AZURE_CACHE_REDIS_ENTERPRISE = 'AZURE_CACHE_REDIS_ENTERPRISE',
  REDIS_COMMUNITY_EDITION = 'REDIS_COMMUNITY_EDITION',
  AWS_ELASTICACHE = 'AWS_ELASTICACHE',
  AWS_MEMORYDB = 'AWS_MEMORYDB',
  VALKEY = 'VALKEY',
  MEMORYSTORE = 'MEMORYSTORE',
  DRAGONFLY = 'DRAGONFLY',
  KEYDB = 'KEYDB',
  GARNET = 'GARNET',
  KVROCKS = 'KVROCKS',
  REDICT = 'REDICT',
  UPSTASH = 'UPSTASH',
  UNKNOWN_LOCALHOST = 'UNKNOWN_LOCALHOST',
  UNKNOWN = 'UNKNOWN',
}

export enum ConnectionType {
  STANDALONE = 'STANDALONE',
  CLUSTER = 'CLUSTER',
  SENTINEL = 'SENTINEL',
  NOT_CONNECTED = 'NOT CONNECTED',
}

export enum Compressor {
  NONE = 'NONE',
  GZIP = 'GZIP',
  ZSTD = 'ZSTD',
  LZ4 = 'LZ4',
  SNAPPY = 'SNAPPY',
  Brotli = 'Brotli',
  PHPGZCompress = 'PHPGZCompress',
}

export enum Encoding {
  UNICODE = 'Unicode',
  HEX = 'HEX',
}

@Entity('database_instance')
export class DatabaseEntity {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column({ nullable: false })
  host: string;

  @Expose()
  @Column({ nullable: false })
  port: number;

  @Expose()
  @Column({ nullable: false })
  name: string;

  @Expose()
  @Column({ nullable: true })
  db: number;

  @Expose()
  @Column({ nullable: true })
  username: string;

  @Expose()
  @Column({ nullable: true })
  password: string;

  @Expose()
  @Column({ nullable: true })
  timeout: number;

  @Expose()
  @Column({ nullable: true })
  @Transform(({ obj }) => obj?.sentinelMaster?.name, { toClassOnly: true })
  sentinelMasterName: string;

  @Expose()
  @Column({ nullable: true })
  @Transform(({ obj }) => obj?.sentinelMaster?.username, { toClassOnly: true })
  sentinelMasterUsername: string;

  @Expose()
  @Column({ nullable: true })
  @Transform(({ obj }) => obj?.sentinelMaster?.password, { toClassOnly: true })
  sentinelMasterPassword: string;

  @Expose()
  @Transform(
    ({ obj }) => {
      if (obj?.sentinelMasterName) {
        return {
          name: obj?.sentinelMasterName,
          username: obj?.sentinelMasterUsername,
          password: obj?.sentinelMasterPassword,
        };
      }

      return undefined;
    },
    { toPlainOnly: true },
  )
  @Transform(() => undefined, { toClassOnly: true })
  sentinelMaster: SentinelMaster;

  @Expose()
  @Column({ nullable: true })
  tls: boolean;

  @Expose()
  @Column({ nullable: true })
  tlsServername?: string;

  @Expose()
  @Column({ nullable: true })
  verifyServerCert: boolean;

  @Expose()
  @ManyToOne(
    () => CaCertificateEntity,
    (caCertificate) => caCertificate.databases,
    {
      eager: true,
      onDelete: 'SET NULL',
    },
  )
  caCert: CaCertificateEntity;

  @Expose()
  @ManyToOne(
    () => ClientCertificateEntity,
    (clientCertificate) => clientCertificate.databases,
    {
      eager: true,
      onDelete: 'SET NULL',
    },
  )
  clientCert: ClientCertificateEntity;

  @Expose()
  @Column({
    nullable: false,
    default: ConnectionType.STANDALONE,
  })
  connectionType: ConnectionType;

  @Expose()
  @Column({ nullable: true })
  nameFromProvider: string;

  @Expose()
  @Column({ nullable: true, default: '[]' })
  @DataAsJsonString()
  nodes: string;

  @Expose()
  @Column({ type: 'datetime', nullable: true })
  lastConnection: Date;

  @CreateDateColumn({
    nullable: true,
  })
  @Expose()
  createdAt: Date;

  @Expose()
  @Column({
    nullable: true,
    default: HostingProvider.UNKNOWN,
  })
  provider: string;

  @Expose()
  @Column({ nullable: false, default: '[]' })
  @DataAsJsonString()
  modules: string;

  @Column({ nullable: true })
  encryption: string;

  @Expose()
  @Column({ nullable: true })
  new: boolean;

  @Expose()
  @Column({ nullable: true })
  ssh: boolean;

  @Expose()
  @OneToOne(() => SshOptionsEntity, (sshOptions) => sshOptions.database, {
    eager: true,
    onDelete: 'CASCADE',
    cascade: true,
  })
  @Type(() => SshOptionsEntity)
  sshOptions: SshOptionsEntity;

  @Expose()
  @OneToOne(
    () => CloudDatabaseDetailsEntity,
    (cloudDetails) => cloudDetails.database,
    {
      eager: true,
      onDelete: 'CASCADE',
      cascade: true,
    },
  )
  @Type(() => CloudDatabaseDetailsEntity)
  cloudDetails: CloudDatabaseDetailsEntity;

  @Expose()
  @Column({ nullable: true, type: 'text' })
  @DataAsJsonString()
  providerDetails: string;

  @Expose()
  @OneToOne(() => DatabaseSettingsEntity, (dbSettings) => dbSettings.database, {
    eager: true,
    onDelete: 'CASCADE',
    cascade: true,
  })
  @Type(() => DatabaseSettingsEntity)
  dbSettings: DatabaseSettingsEntity;

  @Expose()
  @Column({
    nullable: false,
    default: Compressor.NONE,
  })
  compressor: Compressor;

  @Expose()
  @Column({ nullable: true })
  version: string;

  @Expose()
  @Column({ nullable: true })
  forceStandalone: boolean;

  @Expose()
  @ManyToMany(() => TagEntity, (tag) => tag.databases, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'database_tag',
    joinColumn: {
      name: 'databaseId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tagId',
      referencedColumnName: 'id',
    },
  })
  @Type(() => TagEntity)
  tags: TagEntity[];

  @Expose()
  @Column({ nullable: true })
  isPreSetup: boolean;

  @Expose()
  @Column({ nullable: true, default: Encoding.UNICODE })
  keyNameFormat: string;
}
