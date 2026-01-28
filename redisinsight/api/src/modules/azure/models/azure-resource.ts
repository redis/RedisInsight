import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AzureAccessKeysStatus,
  AzureAuthType,
  AzureRedisType,
} from '../constants';

export class AzureSubscription {
  @ApiProperty({
    description: 'Azure subscription ID',
    type: String,
  })
  subscriptionId: string;

  @ApiProperty({
    description: 'Subscription display name',
    type: String,
  })
  displayName: string;

  @ApiProperty({
    description: 'Subscription state',
    type: String,
  })
  state: string;
}

class AzureRedisSku {
  @ApiProperty({
    description: 'SKU name',
    type: String,
  })
  name: string;

  @ApiPropertyOptional({
    description: 'SKU family',
    type: String,
  })
  family?: string;

  @ApiPropertyOptional({
    description: 'SKU capacity',
    type: Number,
  })
  capacity?: number;
}

export class AzureRedisDatabase {
  @ApiProperty({
    description: 'Azure resource ID',
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'Database name',
    type: String,
  })
  name: string;

  @ApiProperty({
    description: 'Azure subscription ID',
    type: String,
  })
  subscriptionId: string;

  @ApiProperty({
    description: 'Azure resource group',
    type: String,
  })
  resourceGroup: string;

  @ApiProperty({
    description: 'Azure region location',
    type: String,
  })
  location: string;

  @ApiProperty({
    description: 'Redis type (standard or enterprise)',
    enum: AzureRedisType,
  })
  type: AzureRedisType;

  @ApiProperty({
    description: 'Redis host',
    type: String,
  })
  host: string;

  @ApiProperty({
    description: 'Redis port',
    type: Number,
  })
  port: number;

  @ApiPropertyOptional({
    description: 'Redis SSL port',
    type: Number,
  })
  sslPort?: number;

  @ApiProperty({
    description: 'Provisioning state',
    type: String,
  })
  provisioningState: string;

  @ApiPropertyOptional({
    description: 'SKU information',
    type: AzureRedisSku,
  })
  sku?: AzureRedisSku;

  @ApiPropertyOptional({
    description: 'Access keys authentication status',
    enum: AzureAccessKeysStatus,
  })
  accessKeysAuthentication?: AzureAccessKeysStatus;
}

export class AzureConnectionDetails {
  @ApiProperty({
    description: 'Redis host',
    type: String,
  })
  host: string;

  @ApiProperty({
    description: 'Redis port',
    type: Number,
  })
  port: number;

  @ApiPropertyOptional({
    description: 'Redis password',
    type: String,
  })
  password?: string;

  @ApiPropertyOptional({
    description: 'Redis username',
    type: String,
  })
  username?: string;

  @ApiProperty({
    description: 'Whether TLS is enabled',
    type: Boolean,
  })
  tls: boolean;

  @ApiProperty({
    description: 'Authentication type',
    enum: AzureAuthType,
  })
  authType: AzureAuthType;

  @ApiPropertyOptional({
    description: 'Azure account ID',
    type: String,
  })
  azureAccountId?: string;

  @ApiProperty({
    description: 'Azure subscription ID',
    type: String,
  })
  subscriptionId: string;

  @ApiProperty({
    description: 'Azure resource group',
    type: String,
  })
  resourceGroup: string;

  @ApiProperty({
    description: 'Azure resource ID',
    type: String,
  })
  resourceId: string;
}
