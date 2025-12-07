import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
  Render,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { CloudAuthService } from 'src/modules/cloud/auth/cloud-auth.service';

@ApiTags('Cloud Auth')
@Controller('cloud')
@UsePipes(new ValidationPipe({ transform: true }))
export class CloudAuthController {
  constructor(private readonly cloudAuthService: CloudAuthService) {}

  @Get('oauth/callback')
  @ApiEndpoint({
    description: 'OAuth callback',
    statusCode: 200,
  })
  @Render('cloud_oauth_callback')
  async callback(@Query() query) {
    return this.cloudAuthService.handleCallback(query);
  }
}
