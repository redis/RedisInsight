/**
 * Provider-specific metadata stored in the providerDetails JSON column.
 * This is used to store additional information about databases added through
 * cloud provider autodiscovery.
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum CloudProvider {
  Azure = 'azure',
}

export enum AzureAuthType {
  EntraId = 'entra-id',
  AccessKey = 'access-key',
}

export class AzureProviderDetails {
  @ApiProperty({
    description: 'Cloud provider',
    enum: CloudProvider,
    example: CloudProvider.Azure,
  })
  @Expose()
  @IsEnum(CloudProvider)
  provider: CloudProvider.Azure;

  @ApiProperty({
    description: 'Authentication type',
    enum: AzureAuthType,
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
}

export type ProviderDetails = AzureProviderDetails;
