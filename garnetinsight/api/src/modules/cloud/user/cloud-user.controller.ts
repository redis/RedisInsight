import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RequestSessionMetadata } from 'src/common/decorators';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { CloudUser } from 'src/modules/cloud/user/models';
import { CloudUserApiService } from 'src/modules/cloud/user/cloud-user.api.service';
import { CloudRequestUtm } from 'src/modules/cloud/common/models';
import { SessionMetadata } from 'src/common/models';
import { CloudAuthService } from 'src/modules/cloud/auth/cloud-auth.service';

@ApiTags('Cloud User')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('cloud/me')
@UsePipes(new ValidationPipe({ transform: true }))
export class CloudUserController {
  constructor(
    private readonly service: CloudUserApiService,
    private readonly cloudAuthService: CloudAuthService,
  ) {}

  @Get('')
  @ApiEndpoint({
    description: 'Return user general info with accounts list',
    statusCode: 200,
    responses: [{ type: CloudUser }],
  })
  async me(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
    @Query() utm: CloudRequestUtm,
  ): Promise<CloudUser> {
    return this.service.me(sessionMetadata, false, utm);
  }

  @Put('/accounts/:id/current')
  @ApiEndpoint({
    description: 'Activate user account',
    statusCode: 200,
    responses: [{ type: CloudUser }],
  })
  @ApiParam({ name: 'id', type: String })
  async setCurrentAccount(
    @Param('id') id: string,
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
  ): Promise<CloudUser> {
    return this.service.setCurrentAccount(sessionMetadata, id);
  }

  @Get('logout')
  @ApiEndpoint({
    description: 'Logout user',
    statusCode: 200,
  })
  async logout(
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
  ): Promise<void> {
    return this.cloudAuthService.logout(sessionMetadata);
  }
}
