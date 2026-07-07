import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, Matches } from 'class-validator';
import { AzureOAuthRedirectType, AZURE_TENANT_ID_REGEX } from '../../constants';

/**
 * Valid OAuth prompt parameter values for Azure Entra ID.
 * @see https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow#request-an-authorization-code
 */
export enum AzureOAuthPrompt {
  /**
   * Force the account picker to appear, allowing the user to select a different account.
   */
  SelectAccount = 'select_account',

  /**
   * Force re-authentication, even if the user has a valid session.
   */
  Login = 'login',

  /**
   * Force the consent dialog to appear, even if consent was previously granted.
   */
  Consent = 'consent',
}

export class AzureAuthLoginDto {
  @ApiPropertyOptional({
    description:
      'OAuth prompt parameter to control login behavior. ' +
      '"select_account" shows account picker, "login" forces re-auth, "consent" forces consent dialog.',
    enum: AzureOAuthPrompt,
    enumName: 'AzureOAuthPrompt',
    example: AzureOAuthPrompt.SelectAccount,
  })
  @IsOptional()
  @IsEnum(AzureOAuthPrompt, {
    message: `prompt must be a valid value. Valid values: ${Object.values(AzureOAuthPrompt).join(', ')}.`,
  })
  prompt?: AzureOAuthPrompt;

  @ApiPropertyOptional({
    description:
      'OAuth redirect type. ' +
      '"deeplink" uses redisinsight:// protocol for Electron, "web" uses localhost HTTP callback for browser/Docker.',
    enum: AzureOAuthRedirectType,
    enumName: 'AzureOAuthRedirectType',
    example: AzureOAuthRedirectType.Deeplink,
    default: AzureOAuthRedirectType.Deeplink,
  })
  @IsOptional()
  @IsEnum(AzureOAuthRedirectType, {
    message: `redirectType must be a valid value. Valid values: ${Object.values(AzureOAuthRedirectType).join(', ')}.`,
  })
  redirectType?: AzureOAuthRedirectType;

  @ApiPropertyOptional({
    description:
      'Azure tenant to authenticate against, as a GUID or domain ' +
      '(e.g. contoso.onmicrosoft.com). Use when the Azure resources live in a ' +
      'different tenant than the signed-in user. Defaults to the multi-tenant ' +
      '"common" endpoint (the user\'s home tenant) when omitted.',
    example: 'contoso.onmicrosoft.com',
  })
  @IsOptional()
  @Matches(AZURE_TENANT_ID_REGEX, {
    message: 'tenantId must be a valid GUID or domain.',
  })
  tenantId?: string;
}
