/**
 * Provider-specific metadata stored in the providerDetails JSON column.
 * This is used to store additional information about databases added through
 * cloud provider autodiscovery.
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AzureAuthType, AzureRedisType } from 'src/modules/azure/constants';

export enum CloudProvider {
  Azure = 'azure',
}

/**
 * Type guard to check if details are Azure provider details
 */
export function isAzureProviderDetails(
  details: AzureProviderDetails | null | undefined,
): details is AzureProviderDetails {
  if (!details) return false;
  return (
    'provider' in details &&
    details.provider === CloudProvider.Azure &&
    'authType' in details
  );
}

export class AzureProviderDetails {
  @ApiProperty({
    description: 'Cloud provider',
    enum: CloudProvider,
    enumName: 'CloudProvider',
    example: CloudProvider.Azure,
  })
  @Expose()
  @IsEnum(CloudProvider)
  provider: CloudProvider.Azure;

  @ApiProperty({
    description: 'Authentication type',
    enum: AzureAuthType,
    enumName: 'AzureAuthType',
    example: AzureAuthType.EntraId,
  })
  @Expose()
  @IsEnum(AzureAuthType)
  authType: AzureAuthType;

  @ApiPropertyOptional({
    description: 'MSAL account ID for token refresh (homeAccountId)',
    type: String,
  })
  @Expose()
  @IsOptional()
  @IsString()
  azureAccountId?: string;

  @ApiPropertyOptional({
    description: 'Token expiration time for filtering during re-authentication',
    type: Date,
  })
  @Expose()
  @IsOptional()
  tokenExpiresOn?: Date;

  @ApiPropertyOptional({
    description: 'Azure subscription ID',
    type: String,
  })
  @Expose()
  @IsOptional()
  @IsString()
  subscriptionId?: string;

  @ApiPropertyOptional({
    description: 'Azure resource group',
    type: String,
  })
  @Expose()
  @IsOptional()
  @IsString()
  resourceGroup?: string;

  @ApiPropertyOptional({
    description: 'Azure resource name (cache name)',
    type: String,
  })
  @Expose()
  @IsOptional()
  @IsString()
  resourceName?: string;

  @ApiPropertyOptional({
    description: 'Azure Redis type (standard/enterprise)',
    enum: AzureRedisType,

    enumName: 'AzureRedisType',
  })
  @Expose()
  @IsOptional()
  @IsEnum(AzureRedisType)
  resourceType?: AzureRedisType;

  @ApiPropertyOptional({
    description: 'Enterprise cluster name (for enterprise databases)',
    type: String,
  })
  @Expose()
  @IsOptional()
  @IsString()
  clusterName?: string;
}
