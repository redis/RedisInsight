import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
  Render,
} from '@nestjs/common';
import { ApiTags, ApiQuery, ApiExtraModels } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { CloudAuthService } from 'src/modules/cloud/auth/cloud-auth.service';
import { CloudOauthCallbackQueryDto } from './dto/cloud-oauth-callback-query.dto';
import { CloudAuthResponse } from './models/cloud-auth-response';
import { CloudAuthRequestOptions } from './models';

@ApiTags('Cloud Auth')
@ApiExtraModels(CloudAuthRequestOptions)
@Controller('cloud/auth')
@UsePipes(new ValidationPipe({ transform: true }))
export class CloudAuthController {
  constructor(private readonly cloudAuthService: CloudAuthService) {}

  @Get('oauth/callback')
  @ApiEndpoint({
    description:
      'OAuth callback endpoint for handling OAuth authorization code flow',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'OAuth callback processed successfully',
        type: CloudAuthResponse,
      },
    ],
  })
  @ApiQuery({
    name: 'code',
    description: 'Authorization code from OAuth provider',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'state',
    description: 'State parameter to prevent CSRF attacks',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'error',
    description: 'Error code if OAuth flow failed',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'error_description',
    description: 'Human-readable error description',
    required: false,
    type: String,
  })
  @Render('cloud_oauth_callback')
  async callback(
    @Query() query: CloudOauthCallbackQueryDto,
  ): Promise<CloudAuthResponse> {
    return this.cloudAuthService.handleCallback(query);
  }
}
