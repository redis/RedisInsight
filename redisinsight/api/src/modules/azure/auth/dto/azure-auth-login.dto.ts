import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

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
    example: AzureOAuthPrompt.SelectAccount,
  })
  @IsOptional()
  @IsEnum(AzureOAuthPrompt, {
    message: `prompt must be a valid value. Valid values: ${Object.values(AzureOAuthPrompt).join(', ')}.`,
  })
  prompt?: AzureOAuthPrompt;
}
