import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppType, PackageType } from 'src/modules/server/models/server';

export class GetServerInfoResponse {
  @ApiProperty({
    description: 'Server identifier.',
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'Time of the first server launch.',
    type: String,
    format: 'date-time',
    example: '2021-01-06T12:44:39.000Z',
  })
  createDateTime: string;

  @ApiProperty({
    description: 'Version of the application.',
    type: String,
    example: '2.0.0',
  })
  appVersion: string;

  @ApiPropertyOptional({
    description: 'SHA of the commit the application was built from.',
    type: String,
    example: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
  })
  buildCommitSha?: string;

  @ApiProperty({
    description: 'The operating system platform.',
    type: String,
    example: 'linux',
  })
  osPlatform: string;

  @ApiProperty({
    description: 'The operating system CPU architecture.',
    type: String,
    example: 'x64',
  })
  osArch: string;

  @ApiProperty({
    description: 'Application build type.',
    type: String,
    example: 'ELECTRON',
  })
  buildType: string;

  @ApiProperty({
    description: 'Application package type.',
    enum: PackageType,
    enumName: 'PackageType',
    example: 'app-image',
  })
  packageType: PackageType;

  @ApiProperty({
    description: 'Application type.',
    enum: AppType,
    enumName: 'AppType',
    example: 'DOCKER',
  })
  appType: AppType;

  @ApiPropertyOptional({
    description: 'Fixed Redis database id.',
    type: String,
  })
  fixedDatabaseId?: string;

  @ApiProperty({
    description: 'List of available encryption strategies',
    type: [String],
    example: ['PLAIN', 'KEYTAR'],
  })
  encryptionStrategies: string[];

  @ApiProperty({
    description: 'Server session id.',
    type: Number,
  })
  sessionId: number;
}
